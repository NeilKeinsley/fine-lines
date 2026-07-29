import { NextResponse } from "next/server";
import { inventoryStore } from "@/lib/inventory";
import { catalog } from "@/lib/catalog";

/*
 * Public read of stock states, filtered to catalog products (test fixtures in
 * the inventory table never leak). Fresh on every request — this is how the
 * client corrects the hourly-ISR pages' advisory stock display.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const levels = await inventoryStore.levels();
  if (!levels) {
    // No database (preview build): report nothing; UI treats it as untracked.
    return NextResponse.json({});
  }
  const catalogIds = new Set(catalog.all().map((p) => p.id));
  const filtered = Object.fromEntries(
    Object.entries(levels).filter(([productId]) => catalogIds.has(productId))
  );
  return NextResponse.json(filtered);
}
