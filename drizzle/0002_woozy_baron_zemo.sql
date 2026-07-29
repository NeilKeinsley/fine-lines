CREATE TYPE "public"."movement_reason" AS ENUM('seed', 'order_paid', 'manual_adjust', 'restock');--> statement-breakpoint
CREATE TABLE "inventory" (
	"product_id" text NOT NULL,
	"size" text NOT NULL,
	"stock" integer NOT NULL,
	"low_stock_threshold" integer DEFAULT 3 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_product_id_size_pk" PRIMARY KEY("product_id","size"),
	CONSTRAINT "stock_non_negative" CHECK ("inventory"."stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"size" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" "movement_reason" NOT NULL,
	"order_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stock_issue" boolean DEFAULT false NOT NULL;