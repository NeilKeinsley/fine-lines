import { NextResponse } from "next/server";
import { paymongo } from "@/lib/payments/paymongo";
import { orderStore } from "@/lib/orders";

/*
 * PayMongo webhook receiver — the ONLY place an order is confirmed paid
 * (the success redirect is untrusted; see hub research §2).
 * - Signature verified before the body is even parsed.
 * - Idempotent via the processed_events table: PayMongo retries deliveries.
 */

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature");

  if (!paymongo.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: {
    data?: {
      id?: string;
      attributes?: { type?: string; data?: { id?: string; attributes?: Record<string, unknown> } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const eventId = event.data?.id;
  const eventType = event.data?.attributes?.type;
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (await orderStore.alreadyProcessed(eventId)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (eventType) {
    case "checkout_session.payment.paid": {
      const sessionId = event.data?.attributes?.data?.id;
      if (sessionId) {
        const reference = await orderStore.markPaid(sessionId);
        console.log(
          reference
            ? `[webhook] order ${reference} paid (session ${sessionId})`
            : `[webhook] paid session ${sessionId} matched no order`
        );
      }
      break;
    }
    default:
      // Acknowledge unhandled event types so PayMongo stops retrying them.
      break;
  }

  // Record last so a handler crash lets PayMongo retry the event.
  await orderStore.recordEvent(eventId);

  return NextResponse.json({ received: true });
}
