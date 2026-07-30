import { NextResponse } from "next/server";
import { inventoryStore } from "@/lib/inventory";
import { catalog } from "@/lib/catalog";

/*
 * Public read of stock states, filtered to catalog products (test fixtures in
 * the inventory table never leak). Fresh on every request — this is how the
 * client corrects the hourly-ISR pages' advisory stock display.
 */
export const dynamic = "force-dynamic";

/* Stock is documented as advisory, so a short memo is free correctness:
   without it, every visitor (or a curl loop) is a full-table scan against
   the same Postgres that runs checkout and webhooks. */
const MEMO_MS = 5_000;
let memo: { body: Record<string, unknown>; at: number } | null = null;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
};

export async function GET() {
  if (memo && Date.now() - memo.at < MEMO_MS) {
    return NextResponse.json(memo.body, { headers: CACHE_HEADERS });
  }
  const levels = await inventoryStore.levels();
  if (!levels) {
    // No database (preview build): report nothing; UI treats it as untracked.
    return NextResponse.json({}, { headers: CACHE_HEADERS });
  }
  const catalogIds = new Set(catalog.all().map((p) => p.id));
  const filtered = Object.fromEntries(
    Object.entries(levels).filter(([productId]) => catalogIds.has(productId))
  );
  memo = { body: filtered, at: Date.now() };
  return NextResponse.json(filtered, { headers: CACHE_HEADERS });
}
