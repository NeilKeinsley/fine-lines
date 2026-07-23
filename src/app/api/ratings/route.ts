import { NextResponse } from "next/server";
import { z } from "zod";
import { catalog } from "@/lib/catalog";

/*
 * Rating submissions are for registered users only. Auth (Better Auth) is
 * still deferred, so until sessions exist this endpoint rejects every write —
 * the schema, store, and UI are ready, and this is the only gate to open.
 */

const ratingSchema = z.object({
  productId: z.string().min(1).max(64),
  stars: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = ratingSchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!parsed.success || !catalog.find(parsed.data.productId)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // TODO(auth): resolve the Better Auth session here; on success call
  // ratingStore.rate(productId, session.user.id, stars). Until then:
  return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
}
