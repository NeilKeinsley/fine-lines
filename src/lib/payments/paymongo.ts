import crypto from "node:crypto";
import type {
  CheckoutItem,
  CheckoutSession,
  PaymentProvider,
} from "./provider";

const API_BASE = "https://api.paymongo.com/v1";

/**
 * PayMongo hosted Checkout Sessions (the SAQ A path — card data never touches
 * this server; the shopper pays on PayMongo's page and we confirm via signed
 * webhook, never the return redirect).
 */
export class PayMongoProvider implements PaymentProvider {
  readonly name = "paymongo";

  private readonly secretKey: string | undefined;
  private readonly webhookSecret: string | undefined;
  private readonly origin: string;
  /** Store prices are USD; PayMongo settles PHP only, so we convert. */
  private readonly phpPerUsd: number;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.secretKey = env.PAYMONGO_SECRET_KEY || undefined;
    this.webhookSecret = env.PAYMONGO_WEBHOOK_SECRET || undefined;
    this.origin = env.NEXT_PUBLIC_SITE_ORIGIN || "http://localhost:3000";
    this.phpPerUsd = Number(env.PHP_PER_USD) || 58;
  }

  isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  async createCheckoutSession(
    items: CheckoutItem[],
    referenceNumber: string
  ): Promise<CheckoutSession> {
    if (!this.secretKey) {
      throw new Error("PayMongo secret key is not configured");
    }

    const response = await fetch(`${API_BASE}/checkout_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: items.map((item) => ({
              name: `${item.name} (${item.size})`,
              // USD cents → PHP centavos at the configured rate.
              amount: Math.round(item.unitAmount * this.phpPerUsd),
              currency: "PHP",
              quantity: item.qty,
            })),
            // Trim to what the account has activated if a type errors.
            payment_method_types: ["card", "gcash", "paymaya", "qrph"],
            reference_number: referenceNumber,
            success_url: `${this.origin}/checkout/success?ref=${referenceNumber}`,
            cancel_url: `${this.origin}/checkout/cancelled`,
            send_email_receipt: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`PayMongo checkout_sessions ${response.status}: ${body}`);
    }

    const json = (await response.json()) as {
      data: { id: string; attributes: { checkout_url: string } };
    };

    const chargedAmount = items.reduce(
      (sum, item) => sum + Math.round(item.unitAmount * this.phpPerUsd) * item.qty,
      0
    );

    return {
      provider: this.name,
      providerRef: json.data.id,
      redirectUrl: json.data.attributes.checkout_url,
      chargedAmount,
      chargedCurrency: "PHP",
    };
  }

  /**
   * Verify the Paymongo-Signature header: `t=<ts>,te=<test sig>,li=<live sig>`,
   * where the signature is HMAC-SHA256 of `${t}.${rawBody}` keyed with the
   * webhook secret. Returns false (never throws) on any malformed input.
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;

    const parts = new Map(
      signatureHeader.split(",").map((p) => p.split("=", 2) as [string, string])
    );
    const timestamp = parts.get("t");
    const signature = parts.get("te") || parts.get("li");
    if (!timestamp || !signature) return false;

    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(signature, "hex")
      );
    } catch {
      return false;
    }
  }
}

/** Server-side singleton — route handlers import this. */
export const paymongo = new PayMongoProvider();
