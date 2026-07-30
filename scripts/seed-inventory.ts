/**
 * Seeds per-size stock for the whole catalog with varied levels so every
 * storefront state is visible immediately: some sold out (0), some low (1–2),
 * most healthy. Deterministic and idempotent (skips rows that already exist).
 * Run: npm run db:seed
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { getDb } from "../src/db/client";
import { inventory, stockMovements } from "../src/db/schema";
import { PRODUCTS, SIZES } from "../src/lib/products";

async function main() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set");

  // Curated-looking spread (panel note: a third of the matrix sold-out/low
  // reads as clearance, not curation): 3 zeros and 6 lows across 60 pairs.
  const PATTERN = [8, 12, 6, 9, 0, 7, 10, 5, 2, 11, 9, 6, 1, 8, 12, 7, 4, 10, 0, 9];
  let inserted = 0;
  for (const [pIdx, product] of PRODUCTS.entries()) {
    for (const [sIdx, size] of SIZES.entries()) {
      const stock = PATTERN[(pIdx * 5 + sIdx) % PATTERN.length];
      const result = await db
        .insert(inventory)
        .values({ productId: product.id, size, stock })
        .onConflictDoNothing()
        .returning({ productId: inventory.productId });
      if (result.length > 0) {
        await db.insert(stockMovements).values({
          productId: product.id,
          size,
          delta: stock,
          reason: "seed",
        });
        inserted++;
      }
    }
  }
  console.log(`seeded ${inserted} inventory rows (existing rows untouched)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
