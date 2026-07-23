import { NextResponse } from "next/server";
import { z } from "zod";
import { catalog } from "@/lib/catalog";
import { SIZES } from "@/lib/products";
import { paymongo } from "@/lib/payments/paymongo";
import { orderStore } from "@/lib/orders";
import type { CheckoutItem } from "@/lib/payments/provider";

/*
 * Creates a hosted checkout session from the shopper's bag.
 * Security posture (see hub research §4):
 * - Prices are NEVER read from the request — only productId/size/qty come in;
 *   amounts are recomputed here from the catalog.
 * - Zod validates the boundary; unknown products 400.
 * - Orders are confirmed by the webhook, not this route's response.
 */

const checkoutSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().min(1).max(64),
        size: z.enum(SIZES),
        qty: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  if (!paymongo.isConfigured()) {
    return NextResponse.json(
      { error: "payments_not_configured" },
      { status: 503 }
    );
  }

  let parsed;
  try {
    parsed = checkoutSchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const items: CheckoutItem[] = [];
  for (const line of parsed.data.lines) {
    const product = catalog.find(line.productId);
    if (!product) {
      return NextResponse.json({ error: "unknown_product" }, { status: 400 });
    }
    items.push({
      productId: product.id,
      name: product.name,
      size: line.size,
      qty: line.qty,
      unitAmount: product.price * 100, // USD cents, from the catalog only
    });
  }

  const referenceNumber = `FL-${Date.now().toString(36).toUpperCase()}`;

  try {
    const session = await paymongo.createCheckoutSession(items, referenceNumber);
    await orderStore.createPending(
      session,
      referenceNumber,
      items,
      session.chargedAmount
    );
    return NextResponse.json({ url: session.redirectUrl });
  } catch (err) {
    console.error("checkout session failed:", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
