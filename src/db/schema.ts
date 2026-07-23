import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * Order data model. Money columns are integer USD cents (display currency);
 * the PHP amount actually charged is recorded per order for reconciliation.
 */

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  referenceNumber: text("reference_number").notNull().unique(),
  /** Payment gateway that owns this order ("paymongo"; "xendit" later). */
  provider: text("provider").notNull(),
  /** The gateway's checkout-session id — how webhooks find the order. */
  providerRef: text("provider_ref").notNull().unique(),
  status: text("status", { enum: ["pending", "paid", "cancelled"] })
    .notNull()
    .default("pending"),
  /** Sum of items in USD cents (display currency). */
  subtotalUsdCents: integer("subtotal_usd_cents").notNull(),
  /** What PayMongo was asked to charge, in PHP centavos. */
  chargedPhpCentavos: integer("charged_php_centavos").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  qty: integer("qty").notNull(),
  unitUsdCents: integer("unit_usd_cents").notNull(),
});

/** Webhook idempotency ledger — PayMongo retries deliveries. */
export const processedEvents = pgTable("processed_events", {
  id: text("id").primaryKey(), // the gateway's event id
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});
