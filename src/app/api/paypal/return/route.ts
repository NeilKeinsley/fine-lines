import { NextResponse } from "next/server";
import { paypal } from "@/lib/payments/paypal";
import { orderStore } from "@/lib/orders";
import { inventoryStore } from "@/lib/inventory";

/*
 * PayPal sends the shopper here after approval (?token=<orderId>). The
 * capture happens server-to-server — PayPal's API response is the trusted
 * signal, not the redirect itself. The PAYMENT.CAPTURE.COMPLETED webhook
 * backs this up in case the shopper closes the tab mid-return.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("token");
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || url.origin;

  if (!orderId) {
    return NextResponse.redirect(`${origin}/checkout/cancelled`);
  }

  try {
    const captured = await paypal.captureOrder(orderId);
    if (!captured) {
      // The capture call can fail while the payment actually landed (timeout,
      // or the webhook already settled it) — never tell a paid customer
      // "cancelled" without checking our own record first.
      const paidRef = await orderStore.paidReferenceFor(orderId);
      if (paidRef) {
        return NextResponse.redirect(`${origin}/checkout/success?ref=${paidRef}`);
      }
      return NextResponse.redirect(`${origin}/checkout/cancelled`);
    }
    const transitioned = await orderStore.markPaid(orderId);
    await inventoryStore.decrementForPaidOrder(orderId); // self-gating, retry-safe
    const reference = transitioned ?? (await orderStore.referenceFor(orderId));
    return NextResponse.redirect(
      `${origin}/checkout/success${reference ? `?ref=${reference}` : ""}`
    );
  } catch (err) {
    console.error("paypal return capture failed:", err);
    return NextResponse.redirect(`${origin}/checkout/cancelled`);
  }
}
