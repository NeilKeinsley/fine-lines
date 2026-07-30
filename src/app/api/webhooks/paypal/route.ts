import { NextResponse } from "next/server";
import { paypal } from "@/lib/payments/paypal";
import { orderStore } from "@/lib/orders";
import { inventoryStore } from "@/lib/inventory";

/*
 * PayPal webhook — redundant confirmation path behind the return-capture.
 * Signature verified via PayPal's verify-webhook-signature API; idempotent
 * through the shared processed_events ledger.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!(await paypal.verifyWebhook(request.headers, rawBody))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: {
    id?: string;
    event_type?: string;
    resource?: {
      supplementary_data?: { related_ids?: { order_id?: string } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (!event.id || !event.event_type) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (await orderStore.alreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      const reference = await orderStore.markPaid(orderId);
      // Unconditional — self-gating, retry-safe (see PayMongo route).
      await inventoryStore.decrementForPaidOrder(orderId);
      console.log(
        reference
          ? `[paypal webhook] order ${reference} paid, stock settled`
          : `[paypal webhook] ${orderId}: re-delivery, stock settlement ensured`
      );
    }
  }

  await orderStore.recordEvent(event.id);
  return NextResponse.json({ received: true });
}
