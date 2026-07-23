import { desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { ratings } from "@/db/schema";

export interface RatingSummary {
  productId: string;
  average: number;
  count: number;
}

/**
 * RatingStore encapsulates all rating reads/writes (Catalog/Bag/OrderStore
 * pattern). Every read degrades to null without a database, so the site
 * renders fine in preview builds.
 */
export class RatingStore {
  /** The week's most-rated product — drives the hero's featured plate. */
  async topRatedThisWeek(): Promise<RatingSummary | null> {
    const db = getDb();
    if (!db) return null;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await db
      .select({
        productId: ratings.productId,
        average: sql<number>`round(avg(${ratings.stars})::numeric, 1)::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(ratings)
      .where(gte(ratings.createdAt, weekAgo))
      .groupBy(ratings.productId)
      .orderBy(desc(sql`avg(${ratings.stars})`), desc(sql`count(*)`))
      .limit(1);
    return rows[0] ?? null;
  }

  /** All-time summary for one product (product pages). */
  async summaryFor(productId: string): Promise<RatingSummary | null> {
    const db = getDb();
    if (!db) return null;
    const rows = await db
      .select({
        productId: ratings.productId,
        average: sql<number>`round(avg(${ratings.stars})::numeric, 1)::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(ratings)
      .where(eq(ratings.productId, productId))
      .groupBy(ratings.productId);
    return rows[0] ?? null;
  }

  /**
   * Write path. userId must be a verified session's user id — the API route
   * enforces that (and today no sessions exist, so it always rejects there).
   */
  async rate(productId: string, userId: string, stars: number): Promise<void> {
    const db = getDb();
    if (!db) throw new Error("ratings unavailable without a database");
    await db
      .insert(ratings)
      .values({ productId, userId, stars })
      .onConflictDoUpdate({
        target: [ratings.productId, ratings.userId],
        set: { stars, createdAt: new Date() },
      });
  }
}

/** Server-side singleton. */
export const ratingStore = new RatingStore();
