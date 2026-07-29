import { and, eq, lte, sql } from "drizzle-orm";
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

/**
 * InventoryStore owns all stock reads/writes (Catalog/Bag/OrderStore pattern).
 * Oversell safety is ONE atomic conditional UPDATE per line — the database
 * refuses the losing side of a race; a CHECK constraint backstops everything.
 * Reads degrade gracefully without a database (preview builds keep working).
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
   * Checkout courtesy check. Products without an inventory row are treated as
   * untracked (unlimited) so adopting inventory never bricks checkout.
   * The webhook-time decrement remains the enforcement point.
   */
  async checkAvailability(
    lines: Pick<CartLine, "productId" | "size" | "qty">[]
  ): Promise<{ ok: true } | { ok: false; insufficient: Shortfall[] }> {
    const db = getDb();
    if (!db) return { ok: true };
    const insufficient: Shortfall[] = [];
    for (const line of lines) {
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
   * The core primitive: atomically take `qty` units, or take nothing.
   * `stock >= qty` in the WHERE clause means a lost race matches zero rows —
   * stock can never go negative, no explicit locking needed.
   */
  async decrementLine(
    productId: string,
    size: string,
    qty: number,
    orderRef: string | null
  ): Promise<boolean> {
    const db = getDb();
    if (!db) return true; // untracked environment — nothing to decrement
    const updated = await db
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
    if (updated.length === 0) {
      // Distinguish "untracked product" (no row at all) from a lost race.
      const row = await db.query.inventory.findFirst({
        where: and(eq(inventory.productId, productId), eq(inventory.size, size)),
      });
      if (!row) return true; // untracked — allow
      return false;
    }
    await db.insert(stockMovements).values({
      productId,
      size,
      delta: -qty,
      reason: "order_paid",
      orderRef,
    });
    return true;
  }

  /**
   * Decrement every line of a just-paid order. Per-line atomicity is
   * deliberate (a short line gets flagged; the rest still decrement) — the
   * caller guarantees pending→paid ran exactly once, so this is idempotent.
   */
  async decrementForPaidOrder(providerRef: string): Promise<void> {
    const db = getDb();
    if (!db) {
      console.warn(`[inventory] no DATABASE_URL — no decrement for ${providerRef}`);
      return;
    }
    const [order] = await db
      .select({ id: orders.id, referenceNumber: orders.referenceNumber })
      .from(orders)
      .where(eq(orders.providerRef, providerRef));
    if (!order) {
      console.warn(`[inventory] paid order ${providerRef} not found`);
      return;
    }
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    let shortfall = false;
    for (const item of items) {
      const ok = await this.decrementLine(
        item.productId,
        item.size,
        item.qty,
        order.referenceNumber
      );
      if (!ok) {
        shortfall = true;
        console.warn(
          `[inventory] OVERSOLD ${order.referenceNumber}: ${item.productId}/${item.size} x${item.qty}`
        );
      }
    }
    if (shortfall) {
      await db
        .update(orders)
        .set({ stockIssue: true })
        .where(eq(orders.id, order.id));
    }
  }

  /** Manual stock changes: seeding, restocks, refund adjustments. */
  async adjust(
    productId: string,
    size: string,
    delta: number,
    reason: "seed" | "manual_adjust" | "restock"
  ): Promise<void> {
    const db = getDb();
    if (!db) throw new Error("inventory unavailable without a database");
    await db
      .insert(inventory)
      .values({ productId, size, stock: Math.max(0, delta) })
      .onConflictDoUpdate({
        target: [inventory.productId, inventory.size],
        set: {
          stock: sql`greatest(${inventory.stock} + ${delta}, 0)`,
          updatedAt: new Date(),
        },
      });
    await db.insert(stockMovements).values({ productId, size, delta, reason });
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
