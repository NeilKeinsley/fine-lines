/**
 * Proof suite for the inventory plan's race-safety claims. Run against the
 * real database: npm run test:inventory
 *
 * 1. Oversell race — N concurrent buyers, 1 unit: exactly one wins.
 * 2. Idempotency — pending→paid transition guard: double webhook, one decrement.
 * 3. Mixed basket — short line flagged, healthy line still decrements.
 *
 * Uses a fixture product id ("race-test") that isn't in the catalog, so it
 * never appears in /api/stock or the storefront.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { eq, and } from "drizzle-orm";
import { getDb } from "../src/db/client";
import { inventory, orders, orderItems, stockMovements } from "../src/db/schema";
import { inventoryStore } from "../src/lib/inventory";
import { orderStore } from "../src/lib/orders";

const FIXTURE = "race-test";

function assert(cond: boolean, label: string) {
  if (cond) console.log(`  PASS  ${label}`);
  else {
    console.error(`  FAIL  ${label}`);
    process.exitCode = 1;
  }
}

async function setStock(db: NonNullable<ReturnType<typeof getDb>>, size: string, n: number) {
  await db
    .insert(inventory)
    .values({ productId: FIXTURE, size, stock: n })
    .onConflictDoUpdate({
      target: [inventory.productId, inventory.size],
      set: { stock: n },
    });
}

async function stockOf(db: NonNullable<ReturnType<typeof getDb>>, size: string) {
  const row = await db.query.inventory.findFirst({
    where: and(eq(inventory.productId, FIXTURE), eq(inventory.size, size)),
  });
  return row?.stock ?? -999;
}

async function main() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set");

  console.log("1) Oversell race: 5 concurrent buyers, 1 unit");
  await setStock(db, "M", 1);
  const results = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      inventoryStore.decrementLine(FIXTURE, "M", 1, `RACE-${i}`)
    )
  );
  const wins = results.filter(Boolean).length;
  assert(wins === 1, `exactly one winner (got ${wins})`);
  assert((await stockOf(db, "M")) === 0, "stock ended at 0, never negative");

  console.log("2) Idempotency: double-delivered paid event");
  await setStock(db, "L", 5);
  const providerRef = `test_${Date.now()}`;
  await orderStore.createPending(
    {
      provider: "test",
      providerRef,
      redirectUrl: "",
      chargedAmount: 0,
      chargedCurrency: "PHP",
    },
    `FL-TEST-${Date.now().toString(36).toUpperCase()}`,
    [{ productId: FIXTURE, name: "Race Test", size: "L", qty: 1, unitAmount: 100 }],
    0
  );
  // Webhook pattern: markPaid + UNCONDITIONAL decrement, delivered twice.
  // The stock_decremented_at claim (not the transition) provides exactly-once.
  for (let delivery = 0; delivery < 2; delivery++) {
    await orderStore.markPaid(providerRef);
    await inventoryStore.decrementForPaidOrder(providerRef);
  }
  assert((await stockOf(db, "L")) === 4, "double delivery decremented exactly once");
  // Crash-recovery shape: a third call is also a no-op (claim held).
  await inventoryStore.decrementForPaidOrder(providerRef);
  assert((await stockOf(db, "L")) === 4, "third settlement call is a no-op");

  console.log("3) Mixed basket: one healthy line, one short line");
  await setStock(db, "S", 3);
  await setStock(db, "XL", 0);
  const providerRef2 = `test_${Date.now()}_mixed`;
  const ref2 = `FL-TEST-${Date.now().toString(36).toUpperCase()}M`;
  await orderStore.createPending(
    { provider: "test", providerRef: providerRef2, redirectUrl: "", chargedAmount: 0, chargedCurrency: "PHP" },
    ref2,
    [
      { productId: FIXTURE, name: "Race Test", size: "S", qty: 2, unitAmount: 100 },
      { productId: FIXTURE, name: "Race Test", size: "XL", qty: 1, unitAmount: 100 },
    ],
    0
  );
  const t = await orderStore.markPaid(providerRef2);
  if (t) await inventoryStore.decrementForPaidOrder(providerRef2);
  assert((await stockOf(db, "S")) === 1, "healthy line decremented (3 → 1)");
  assert((await stockOf(db, "XL")) === 0, "short line did not go negative");
  const flagged = await db.query.orders.findFirst({
    where: eq(orders.providerRef, providerRef2),
    columns: { stockIssue: true },
  });
  assert(flagged?.stockIssue === true, "order flagged with stock_issue");

  console.log("4) Duplicate cart lines cannot split the availability check");
  await setStock(db, "M", 5);
  const split = await inventoryStore.checkAvailability([
    { productId: FIXTURE, size: "M", qty: 3 },
    { productId: FIXTURE, size: "M", qty: 3 },
  ]);
  assert(split.ok === false, "two 3s against stock 5 rejected as an aggregate 6");

  console.log("5) adjust rejects below-zero instead of clamping (no ledger drift)");
  await setStock(db, "M", 5);
  await db.delete(stockMovements).where(eq(stockMovements.productId, FIXTURE));
  let rejected = false;
  try {
    await inventoryStore.adjust(FIXTURE, "M", -100, "manual_adjust");
  } catch {
    rejected = true;
  }
  assert(rejected, "adjust(-100) on stock 5 threw instead of clamping");
  assert((await stockOf(db, "M")) === 5, "stock unchanged after rejected adjust");
  const phantom = await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, FIXTURE));
  assert(phantom.length === 0, "no phantom -100 ledger row was written");
  // A valid restock records delta == applied.
  await inventoryStore.adjust(FIXTURE, "M", 3, "restock");
  assert((await stockOf(db, "M")) === 8, "valid restock applied (5 -> 8)");
  const moves = await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, FIXTURE));
  assert(
    moves.length === 1 && moves[0].delta === 3,
    "ledger delta equals the applied delta"
  );

  // Cleanup: test orders + movements (fixture inventory rows stay; harmless).
  const testOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.provider, "test"));
  for (const o of testOrders) {
    await db.delete(orderItems).where(eq(orderItems.orderId, o.id));
  }
  await db.delete(orders).where(eq(orders.provider, "test"));
  await db.delete(stockMovements).where(eq(stockMovements.productId, FIXTURE));

  console.log(process.exitCode === 1 ? "\nRESULT: FAILURES" : "\nRESULT: all green");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
