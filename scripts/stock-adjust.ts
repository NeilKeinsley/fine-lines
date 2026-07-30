/**
 * Operator restock/adjust CLI — the audit-preserving alternative to raw SQL.
 * Usage: npm run stock:adjust -- <productId> <size> <delta> [reason]
 *   e.g. npm run stock:adjust -- boxy-linen-shirt M 5 restock
 * Reasons: manual_adjust (default) | restock | refund_restock | oversell_correction
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { inventoryStore } from "../src/lib/inventory";

const REASONS = ["manual_adjust", "restock", "refund_restock", "oversell_correction"] as const;
type Reason = (typeof REASONS)[number];

async function main() {
  const [productId, size, deltaRaw, reasonRaw] = process.argv.slice(2);
  const delta = Number(deltaRaw);
  const reason = (reasonRaw ?? "manual_adjust") as Reason;
  if (!productId || !size || !Number.isInteger(delta) || !REASONS.includes(reason)) {
    console.error("usage: npm run stock:adjust -- <productId> <size> <delta:int> [reason]");
    process.exit(1);
  }
  await inventoryStore.adjust(productId, size, delta, reason);
  console.log(`adjusted ${productId}/${size} by ${delta} (${reason}) — movement recorded`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
