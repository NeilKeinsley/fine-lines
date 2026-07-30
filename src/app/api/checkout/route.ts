import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { catalog } from "@/lib/catalog";
import { SIZES } from "@/lib/products";
import { paymongo } from "@/lib/payments/paymongo";
import { paypal } from "@/lib/payments/paypal";
import { orderStore } from "@/lib/orders";
import { inventoryStore } from "@/lib/inventory";
import { RateLimiter, clientKey } from "@/lib/rate-limit";
import type { CheckoutItem, PaymentProvider } from "@/lib/payments/provider";

/** Gateways the shopper can pick in the bag drawer. */
const PROVIDERS: Record<string, PaymentProvider> = { paymongo, paypal };

/* 10 checkout attempts per IP per 5 minutes — generous for a real shopper,
   hostile to session-spam (each request creates a PayMongo session). */
const limiter = new RateLimiter(10, 5 * 60 * 1000);

/*
 * Creates a hosted checkout session from the shopper's bag.
 * Security posture (see hub research §4):
 * - Prices are NEVER read from the request — only productId/size/qty come in;
 *   amounts are recomputed here from the catalog.
 * - Zod validates the boundary; unknown products 400.
 * - Orders are confirmed by the webhook, not this route's response.
 */

const checkoutSchema = z.object({
  provider: z.enum(["paymongo", "paypal"]).default("paymongo"),
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
  const rate = limiter.check(clientKey(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
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

  const provider = PROVIDERS[parsed.data.provider];
  if (!provider.isConfigured()) {
    return NextResponse.json(
      { error: "payments_not_configured" },
      { status: 503 }
    );
  }

  // Merge duplicate product+size lines: a split line must not split the
  // availability check (two half-quantities could each pass individually).
  const mergedLines = new Map<string, { productId: string; size: (typeof SIZES)[number]; qty: number }>();
  for (const line of parsed.data.lines) {
    const key = `${line.productId}|${line.size}`;
    const existing = mergedLines.get(key);
    if (existing) existing.qty += line.qty;
    else mergedLines.set(key, { ...line });
  }
  const lines = [...mergedLines.values()];

  const items: CheckoutItem[] = [];
  for (const line of lines) {
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

  // Courtesy stock check — fail fast with details. The webhook-time atomic
  // decrement remains the real enforcement.
  const availability = await inventoryStore.checkAvailability(lines);
  if (!availability.ok) {
    return NextResponse.json(
      { error: "insufficient_stock", details: availability.insufficient },
      { status: 409 }
    );
  }

  // Entropy suffix: Date.now() alone collides for same-millisecond checkouts.
  const referenceNumber = `FL-${Date.now().toString(36).toUpperCase()}${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;

  try {
    const session = await provider.createCheckoutSession(items, referenceNumber);
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
