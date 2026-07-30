ALTER TYPE "public"."movement_reason" ADD VALUE 'refund_restock';--> statement-breakpoint
ALTER TYPE "public"."movement_reason" ADD VALUE 'oversell_correction';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stock_decremented_at" timestamp with time zone;