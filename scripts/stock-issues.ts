/**
 * Operator health report — the "how do I find out at 9pm" answer until /admin.
 * Usage: npm run stock:issues
 * Prints: flagged (oversold) orders with their lines, low/zero stock, and a
 * ledger reconciliation (stock vs. sum of movements) that proves the audit
 * trail — or exposes drift.
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { eq } from "drizzle-orm";
import { getDb } from "../src/db/client";
import { orders, orderItems } from "../src/db/schema";
import { inventoryStore } from "../src/lib/inventory";

async function main() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set");

  console.log("== Orders flagged stock_issue (paid but short) ==");
  const flagged = await db.select().from(orders).where(eq(orders.stockIssue, true));
  if (flagged.length === 0) console.log("  none");
  for (const order of flagged) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    console.log(
      `  ${order.referenceNumber} (${order.provider}, paid ${order.paidAt?.toISOString() ?? "?"})`
    );
    for (const i of items) console.log(`    - ${i.productId}/${i.size} x${i.qty}`);
    console.log("    playbook: refund in the gateway dashboard, then stock:adjust with reason oversell_correction if units were found");
  }

  console.log("\n== Low / zero stock ==");
  for (const row of await inventoryStore.lowStock()) {
    console.log(`  ${row.productId}/${row.size}: ${row.stock}`);
  }

  console.log("\n== Ledger reconciliation (stock - SUM(movements) per row) ==");
  const drift = await db.execute(
    `select i.product_id, i.size, i.stock,
            coalesce(sum(m.delta), 0)::int as ledger_sum,
            i.stock - coalesce(sum(m.delta), 0)::int as drift
     from inventory i
     left join stock_movements m on m.product_id = i.product_id and m.size = i.size
     group by i.product_id, i.size, i.stock
     having i.stock - coalesce(sum(m.delta), 0)::int <> 0
     order by 1, 2`
  );
  const rows = drift as unknown as { product_id: string; size: string; stock: number; ledger_sum: number; drift: number }[];
  if (rows.length === 0) console.log("  clean — every unit accounted for");
  else {
    console.log("  DRIFT DETECTED (stock changed outside the ledger?):");
    for (const r of rows) console.log(`  ${r.product_id}/${r.size}: stock ${r.stock}, ledger ${r.ledger_sum}, drift ${r.drift}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
