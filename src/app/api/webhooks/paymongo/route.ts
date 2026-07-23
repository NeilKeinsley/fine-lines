import { NextResponse } from "next/server";
import { paymongo } from "@/lib/payments/paymongo";

/*
 * PayMongo webhook receiver — the ONLY place an order is confirmed paid
 * (the success redirect is untrusted; see hub research §2).
 * - Signature verified before the body is even parsed.
 * - Handlers must stay idempotent: PayMongo retries deliveries.
 */

// Scaffold idempotency guard. Serverless instances don't share memory —
// replace with a processed_events table when Railway Postgres lands.
const processedEvents = new Set<string>();

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

  if (processedEvents.has(eventId)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  processedEvents.add(eventId);

  switch (eventType) {
    case "checkout_session.payment.paid": {
      const sessionId = event.data?.attributes?.data?.id;
      // TODO(phase 2, DB): mark the order with providerRef === sessionId as
      // paid, decrement stock, and queue the confirmation email.
      console.log(`[webhook] checkout session paid: ${sessionId}`);
      break;
    }
    default:
      // Acknowledge unhandled event types so PayMongo stops retrying them.
      break;
  }

  return NextResponse.json({ received: true });
}
