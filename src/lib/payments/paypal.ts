import type {
  CheckoutItem,
  CheckoutSession,
  PaymentProvider,
} from "./provider";

/**
 * PayPal Checkout (Orders v2) — the international gateway beside PayMongo.
 * Flow differs from PayMongo's: the shopper approves on PayPal, returns to
 * /api/paypal/return, and WE capture server-to-server (that API response is
 * trusted — it's our own call to PayPal, not a client redirect). The
 * PAYMENT.CAPTURE.COMPLETED webhook is the redundant confirmation path.
 */
export class PayPalProvider implements PaymentProvider {
  readonly name = "paypal";

  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly webhookId: string | undefined;
  private readonly apiBase: string;
  private readonly origin: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.clientId = env.PAYPAL_CLIENT_ID || undefined;
    this.clientSecret = env.PAYPAL_CLIENT_SECRET || undefined;
    this.webhookId = env.PAYPAL_WEBHOOK_ID || undefined;
    this.apiBase =
      env.PAYPAL_ENV === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
    this.origin = env.NEXT_PUBLIC_SITE_ORIGIN || "http://localhost:3000";
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  private async accessToken(): Promise<string> {
    const res = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) throw new Error(`PayPal oauth ${res.status}`);
    const json = (await res.json()) as { access_token: string };
    return json.access_token;
  }

  async createCheckoutSession(
    items: CheckoutItem[],
    referenceNumber: string
  ): Promise<CheckoutSession> {
    if (!this.isConfigured()) {
      throw new Error("PayPal credentials are not configured");
    }

    const usd = (cents: number) => (cents / 100).toFixed(2);
    const itemTotal = items.reduce((n, i) => n + i.unitAmount * i.qty, 0);

    const token = await this.accessToken();
    const res = await fetch(`${this.apiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: referenceNumber,
            amount: {
              currency_code: "USD",
              value: usd(itemTotal),
              breakdown: {
                item_total: { currency_code: "USD", value: usd(itemTotal) },
              },
            },
            items: items.map((item) => ({
              name: `${item.name} (${item.size})`,
              quantity: String(item.qty),
              unit_amount: { currency_code: "USD", value: usd(item.unitAmount) },
            })),
          },
        ],
        application_context: {
          brand_name: "Fine Lines",
          user_action: "PAY_NOW",
          shipping_preference: "GET_FROM_FILE",
          return_url: `${this.origin}/api/paypal/return`,
          cancel_url: `${this.origin}/checkout/cancelled`,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`PayPal create order ${res.status}: ${body}`);
    }

    const json = (await res.json()) as {
      id: string;
      links: { rel: string; href: string }[];
    };
    const approve = json.links.find(
      (l) => l.rel === "approve" || l.rel === "payer-action"
    );
    if (!approve) throw new Error("PayPal order has no approval link");

    return {
      provider: this.name,
      providerRef: json.id,
      redirectUrl: approve.href,
      chargedAmount: itemTotal,
      chargedCurrency: "USD",
    };
  }

  /** Capture after shopper approval. True only when PayPal says COMPLETED. */
  async captureOrder(orderId: string): Promise<boolean> {
    const token = await this.accessToken();
    const res = await fetch(
      `${this.apiBase}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      const body = await res.text();
      // A refreshed/replayed return URL re-captures an already-captured
      // order — that's a success for our purposes, not a cancellation.
      if (body.includes("ORDER_ALREADY_CAPTURED")) return true;
      console.error(`PayPal capture ${orderId} failed: ${res.status}`);
      return false;
    }
    const json = (await res.json()) as { status?: string };
    return json.status === "COMPLETED";
  }

  /** Webhook verification via PayPal's verify-webhook-signature API. */
  async verifyWebhook(
    headers: Headers,
    rawBody: string
  ): Promise<boolean> {
    if (!this.webhookId) return false;
    const token = await this.accessToken();
    const res = await fetch(
      `${this.apiBase}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: headers.get("paypal-transmission-id"),
          transmission_time: headers.get("paypal-transmission-time"),
          cert_url: headers.get("paypal-cert-url"),
          auth_algo: headers.get("paypal-auth-algo"),
          transmission_sig: headers.get("paypal-transmission-sig"),
          webhook_id: this.webhookId,
          webhook_event: JSON.parse(rawBody),
        }),
      }
    );
    if (!res.ok) return false;
    const json = (await res.json()) as { verification_status?: string };
    return json.verification_status === "SUCCESS";
  }
}

/** Server-side singleton. */
export const paypal = new PayPalProvider();
