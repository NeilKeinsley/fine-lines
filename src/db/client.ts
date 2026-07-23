import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy database handle. Null when DATABASE_URL is absent, so local dev and
 * preview builds run without a database — callers must handle null (the
 * OrderStore does; nothing else should touch this directly).
 */
let cached: ReturnType<typeof drizzle<typeof schema>> | null | undefined;

export function getDb() {
  if (cached !== undefined) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    cached = null;
    return cached;
  }
  // prepare:false keeps this compatible with connection poolers.
  const client = postgres(url, { prepare: false, max: 5 });
  cached = drizzle(client, { schema });
  return cached;
}
