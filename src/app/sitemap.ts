import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

/* Generated from the catalog, so new products index themselves. Inert until
   the site is hosted on the real domain (see src/lib/site.ts). */
export default function sitemap(): MetadataRoute.Sitemap {
  const products = catalog.all().map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/saved`, changeFrequency: "monthly", priority: 0.3 },
    ...products,
  ];
}
