import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, orderItems, processedEvents } from "@/db/schema";
import type { CheckoutItem, CheckoutSession } from "./payments/provider";

/**
 * OrderStore encapsulates all order/webhook persistence, mirroring the
 * Catalog/Bag pattern: routes call methods, never touch tables.
 * Without DATABASE_URL every method degrades gracefully (logged no-op with an
 * in-memory idempotency fallback) so the preview site keeps working.
 */
export class OrderStore {
  private memoryEvents = new Set<string>();

  async createPending(
    session: CheckoutSession,
    referenceNumber: string,
    items: CheckoutItem[],
    chargedPhpCentavos: number
  ): Promise<void> {
    const db = getDb();
    if (!db) {
      console.warn("[orders] no DATABASE_URL — pending order not persisted");
      return;
    }
    const subtotalUsdCents = items.reduce((n, i) => n + i.unitAmount * i.qty, 0);
    const [order] = await db
      .insert(orders)
      .values({
        referenceNumber,
        provider: session.provider,
        providerRef: session.providerRef,
        subtotalUsdCents,
        chargedPhpCentavos,
      })
      .returning({ id: orders.id });

    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        size: item.size,
        qty: item.qty,
        unitUsdCents: item.unitAmount,
      }))
    );
  }

  /**
   * Marks the pending→paid TRANSITION only: returns the reference exactly
   * once per order (null on re-delivery or unknown ref). Callers gate the
   * inventory decrement on this, which makes it naturally idempotent.
   */
  async markPaid(providerRef: string): Promise<string | null> {
    const db = getDb();
    if (!db) {
      console.warn(`[orders] no DATABASE_URL — cannot mark ${providerRef} paid`);
      return null;
    }
    const [updated] = await db
      .update(orders)
      .set({ status: "paid", paidAt: new Date() })
      .where(and(eq(orders.providerRef, providerRef), eq(orders.status, "pending")))
      .returning({ referenceNumber: orders.referenceNumber });
    return updated?.referenceNumber ?? null;
  }

  /** Reference lookup regardless of status (e.g. redirect after a webhook won). */
  async referenceFor(providerRef: string): Promise<string | null> {
    const db = getDb();
    if (!db) return null;
    const row = await db.query.orders.findFirst({
      where: eq(orders.providerRef, providerRef),
      columns: { referenceNumber: true },
    });
    return row?.referenceNumber ?? null;
  }

  /** True if this webhook event was already handled (DB ledger, memory fallback). */
  async alreadyProcessed(eventId: string): Promise<boolean> {
    const db = getDb();
    if (!db) return this.memoryEvents.has(eventId);
    const existing = await db.query.processedEvents.findFirst({
      where: eq(processedEvents.id, eventId),
    });
    return Boolean(existing);
  }

  async recordEvent(eventId: string): Promise<void> {
    const db = getDb();
    if (!db) {
      this.memoryEvents.add(eventId);
      return;
    }
    await db.insert(processedEvents).values({ id: eventId }).onConflictDoNothing();
  }
}

/** Server-side singleton — route handlers import this. */
export const orderStore = new OrderStore();
