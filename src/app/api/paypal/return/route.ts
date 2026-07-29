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
      return NextResponse.redirect(`${origin}/checkout/cancelled`);
    }
    const transitioned = await orderStore.markPaid(orderId);
    if (transitioned) {
      await inventoryStore.decrementForPaidOrder(orderId);
    }
    // If the webhook won the race, the transition already happened there —
    // still show the shopper their reference.
    const reference = transitioned ?? (await orderStore.referenceFor(orderId));
    return NextResponse.redirect(
      `${origin}/checkout/success${reference ? `?ref=${reference}` : ""}`
    );
  } catch (err) {
    console.error("paypal return capture failed:", err);
    return NextResponse.redirect(`${origin}/checkout/cancelled`);
  }
}
