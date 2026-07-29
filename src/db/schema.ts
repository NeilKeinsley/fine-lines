import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
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
  /** Set when a paid order lost the stock race — needs manual resolution. */
  stockIssue: boolean("stock_issue").notNull().default(false),
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

/** Per-size stock. The CHECK constraint is the last line of oversell defense. */
export const inventory = pgTable(
  "inventory",
  {
    productId: text("product_id").notNull(),
    size: text("size").notNull(),
    stock: integer("stock").notNull(),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(3),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.size] }),
    check("stock_non_negative", sql`${t.stock} >= 0`),
  ]
);

export const movementReason = pgEnum("movement_reason", [
  "seed",
  "order_paid",
  "manual_adjust",
  "restock",
]);

/** Audit ledger: every unit of stock change is accounted for. */
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: text("product_id").notNull(),
  size: text("size").notNull(),
  delta: integer("delta").notNull(), // negative = sold
  reason: movementReason("reason").notNull(),
  orderRef: text("order_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Product ratings — registered users only (one rating per user per product).
 * userId will hold Better Auth ids once auth ships; until then the write API
 * rejects everything, so rows can only be seeded deliberately.
 */
export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: text("product_id").notNull(),
    userId: text("user_id").notNull(),
    stars: integer("stars").notNull(), // 1–5
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("ratings_product_user").on(t.productId, t.userId)]
);
