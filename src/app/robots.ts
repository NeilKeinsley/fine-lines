import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
 * PREVIEW gate: while true, every crawler is blocked, so an accidental early
 * deploy can never index a half-finished store. Flip to false at launch —
 * and ONLY with Neil's named go-ahead: robots changes on a live domain are a
 * high-risk action per the Web Integrations operating guide.
 */
const PREVIEW = true;

export default function robots(): MetadataRoute.Robots {
  if (PREVIEW) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
