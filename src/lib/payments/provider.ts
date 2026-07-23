import type { Size } from "../products";

/**
 * Payment abstraction. Orders store `provider` + `providerRef`, so a second
 * gateway (Xendit is the researched fallback) slots in behind this interface
 * without touching checkout code.
 */

export interface CheckoutItem {
  productId: string;
  name: string;
  size: Size;
  qty: number;
  /** Unit price in USD cents, recomputed server-side from the catalog. */
  unitAmount: number;
}

export interface CheckoutSession {
  provider: string;
  /** Provider's session id — stored as the order's providerRef. */
  providerRef: string;
  /** Hosted payment page the shopper is redirected to. */
  redirectUrl: string;
  /** What the gateway was actually asked to charge (settlement currency). */
  chargedAmount: number;
  chargedCurrency: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** False until API keys are present in the environment. */
  isConfigured(): boolean;
  createCheckoutSession(
    items: CheckoutItem[],
    referenceNumber: string
  ): Promise<CheckoutSession>;
}
