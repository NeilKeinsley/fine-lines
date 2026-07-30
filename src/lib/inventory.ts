import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { inventory, orders, orderItems, stockMovements } from "@/db/schema";
import type { CartLine } from "./cart";

export interface SizeStock {
  n: number;
  low: boolean;
}
export type ProductStock = Record<string, SizeStock>;
export type StockLevels = Record<string, ProductStock>;

export interface Shortfall {
  productId: string;
  size: string;
  have: number;
  want: number;
}

type Db = NonNullable<ReturnType<typeof getDb>>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Merge duplicate product+size lines — a split line must not split the check. */
type CheckLine = Pick<CartLine, "productId" | "size" | "qty">;
function aggregateLines(lines: CheckLine[]): CheckLine[] {
  const merged = new Map<string, CheckLine>();
  for (const line of lines) {
    const key = `${line.productId}|${line.size}`;
    const existing = merged.get(key);
    if (existing) existing.qty += line.qty;
    else merged.set(key, { ...line });
  }
  return [...merged.values()];
}

/**
 * InventoryStore owns all stock reads/writes (Catalog/Bag/OrderStore pattern).
 * Correctness model (panel-reviewed):
 * - Oversell: one atomic conditional UPDATE (`stock >= qty` in WHERE) — safe
 *   under READ COMMITTED per PostgreSQL semantics; CHECK(stock >= 0) backstops.
 * - Durability: counter update + ledger row always commit in ONE transaction.
 * - Idempotency: decrements claim `orders.stock_decremented_at` inside that
 *   same transaction — independent of the paid transition, so a crashed
 *   decrement rolls the claim back and the gateway's retry re-runs it.
 * Reads degrade gracefully without a database.
 */
export class InventoryStore {
  async levels(): Promise<StockLevels | null> {
    const db = getDb();
    if (!db) return null;
    const rows = await db.select().from(inventory);
    const out: StockLevels = {};
    for (const row of rows) {
      out[row.productId] ??= {};
      out[row.productId][row.size] = {
        n: row.stock,
        low: row.stock > 0 && row.stock <= row.lowStockThreshold,
      };
    }
    return out;
  }

  /**
   * Checkout courtesy check (duplicate lines aggregated first). Products
   * without an inventory row are untracked (unlimited) so adopting inventory
   * never bricks checkout. Webhook-time decrement remains the enforcement.
   */
  async checkAvailability(
    lines: Pick<CartLine, "productId" | "size" | "qty">[]
  ): Promise<{ ok: true } | { ok: false; insufficient: Shortfall[] }> {
    const db = getDb();
    if (!db) return { ok: true };
    const insufficient: Shortfall[] = [];
    for (const line of aggregateLines(lines)) {
      const row = await db.query.inventory.findFirst({
        where: and(
          eq(inventory.productId, line.productId),
          eq(inventory.size, line.size)
        ),
      });
      if (row && row.stock < line.qty) {
        insufficient.push({
          productId: line.productId,
          size: line.size,
          have: row.stock,
          want: line.qty,
        });
      }
    }
    return insufficient.length > 0 ? { ok: false, insufficient } : { ok: true };
  }

  /**
   * One line, inside the caller's transaction. Existence is checked FIRST so
   * a row deleted mid-flight reads as a lost race (flagged — the safe
   * direction), never as silent unlimited stock.
   */
  private async decrementLineTx(
    tx: Tx,
    productId: string,
    size: string,
    qty: number,
    orderRef: string | null
  ): Promise<boolean> {
    const existing = await tx
      .select({ stock: inventory.stock })
      .from(inventory)
      .where(and(eq(inventory.productId, productId), eq(inventory.size, size)))
      .limit(1);
    if (existing.length === 0) return true; // untracked product — allow

    const updated = await tx
      .update(inventory)
      .set({ stock: sql`${inventory.stock} - ${qty}`, updatedAt: new Date() })
      .where(
        and(
          eq(inventory.productId, productId),
          eq(inventory.size, size),
          sql`${inventory.stock} >= ${qty}`
        )
      )
      .returning({ stock: inventory.stock });
    if (updated.length === 0) return false; // lost the race

    await tx.insert(stockMovements).values({
      productId,
      size,
      delta: -qty,
      reason: "order_paid",
      orderRef,
    });
    return true;
  }

  /** Standalone single-line decrement (tests, future tooling) — own transaction. */
  async decrementLine(
    productId: string,
    size: string,
    qty: number,
    orderRef: string | null
  ): Promise<boolean> {
    const db = getDb();
    if (!db) return true;
    return db.transaction((tx) =>
      this.decrementLineTx(tx, productId, size, qty, orderRef)
    );
  }

  /**
   * Decrement every line of a paid order, exactly once, atomically with the
   * ledger. Self-gating: claims stock_decremented_at on a PAID order inside
   * the transaction — callers may invoke it unconditionally and repeatedly.
   * Throws on infrastructure errors so webhook routes 500 and the gateway
   * retries (the rolled-back claim makes the retry effective).
   */
  async decrementForPaidOrder(providerRef: string): Promise<void> {
    const db = getDb();
    if (!db) {
      console.warn(`[inventory] no DATABASE_URL — no decrement for ${providerRef}`);
      return;
    }
    await db.transaction(async (tx) => {
      const [claim] = await tx
        .update(orders)
        .set({ stockDecrementedAt: new Date() })
        .where(
          and(
            eq(orders.providerRef, providerRef),
            eq(orders.status, "paid"),
            isNull(orders.stockDecrementedAt)
          )
        )
        .returning({ id: orders.id, referenceNumber: orders.referenceNumber });
      if (!claim) return; // not paid yet, unknown, or already decremented

      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, claim.id));

      let shortfall = false;
      for (const item of items) {
        const ok = await this.decrementLineTx(
          tx,
          item.productId,
          item.size,
          item.qty,
          claim.referenceNumber
        );
        if (!ok) {
          shortfall = true;
          console.warn(
            `[inventory] OVERSOLD ${claim.referenceNumber}: ${item.productId}/${item.size} x${item.qty}`
          );
        }
      }
      if (shortfall) {
        await tx
          .update(orders)
          .set({ stockIssue: true })
          .where(eq(orders.id, claim.id));
      }
    });
  }

  /** Manual stock changes: seeding, restocks, refund adjustments. Atomic with ledger. */
  async adjust(
    productId: string,
    size: string,
    delta: number,
    reason: "seed" | "manual_adjust" | "restock" | "refund_restock" | "oversell_correction"
  ): Promise<void> {
    const db = getDb();
    if (!db) throw new Error("inventory unavailable without a database");
    await db.transaction(async (tx) => {
      await tx
        .insert(inventory)
        .values({ productId, size, stock: Math.max(0, delta) })
        .onConflictDoUpdate({
          target: [inventory.productId, inventory.size],
          set: {
            stock: sql`greatest(${inventory.stock} + ${delta}, 0)`,
            updatedAt: new Date(),
          },
        });
      await tx.insert(stockMovements).values({ productId, size, delta, reason });
    });
  }

  /** Rows at/below their threshold — for /admin and back-in-stock later. */
  async lowStock() {
    const db = getDb();
    if (!db) return [];
    return db
      .select()
      .from(inventory)
      .where(lte(inventory.stock, inventory.lowStockThreshold));
  }
}

/** Server-side singleton. */
export const inventoryStore = new InventoryStore();
