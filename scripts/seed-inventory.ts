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

  let inserted = 0;
  for (const [pIdx, product] of PRODUCTS.entries()) {
    for (const [sIdx, size] of SIZES.entries()) {
      // Deterministic spread 0–12 with a few zeros and ones in the mix.
      const stock = ((pIdx * 5 + sIdx) * 7) % 13;
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
