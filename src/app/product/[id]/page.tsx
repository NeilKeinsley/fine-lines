import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { GarmentArt } from "@/components/garment-art";
import { PurchasePanel } from "@/components/purchase-panel";
import { Reveal } from "@/components/reveal";
import { catalog } from "@/lib/catalog";
import { ratingStore } from "@/lib/ratings";
import { money } from "@/lib/products";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface PageProps {
  params: Promise<{ id: string }>;
}

/* Rating summaries change as users rate — refresh hourly. */
export const revalidate = 3600;

export function generateStaticParams() {
  return catalog.all().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = catalog.find(id);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.blurb} ${product.category} from ${SITE_NAME}, ${money(product.price)}. Drawn in Manila, sewn in short runs.`,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: product.blurb,
      type: "website",
      url: `${SITE_URL}/product/${product.id}`,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = catalog.find(id);
  if (!product) notFound();

  const related = catalog.related(product);
  const rating = await ratingStore.summaryFor(product.id);

  /* Product schema: price + PreOrder availability (the shop is in preview —
     the structured data stays honest too). */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.blurb,
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/product/${product.id}`,
    },
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
          <nav className="mb-8 text-[11px] tracking-[0.14em] uppercase text-muted">
            <Link href="/#shop" className="link-line hover:text-foreground">
              The collection
            </Link>
            <span className="mx-2 text-accent">·</span>
            <span>{product.category}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-start">
            {/* Plate */}
            <Reveal>
              <figure className="relative border border-line bg-card p-8 sm:p-12">
                <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
                <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
                {product.badge && (
                  <span
                    className={`absolute left-5 top-5 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase ${
                      product.badge === "Sale"
                        ? "bg-accent text-accent-contrast"
                        : "border border-line-strong text-muted"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                <GarmentArt
                  type={product.garment}
                  autodraw
                  className="mx-auto h-72 w-auto text-foreground sm:h-96"
                />
                <figcaption className="mt-6 flex items-baseline justify-between border-t border-line pt-4 text-[11px] tracking-[0.18em] uppercase text-muted">
                  <span>
                    Fig. {catalog.figNumber(product)} · {product.name}
                  </span>
                  <span>Pattern drawing — photos at launch</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* Details */}
            <Reveal delay={120}>
              <div>
                <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
                  <span className="inline-block h-px w-10 bg-accent" />
                  {product.category}
                </p>
                <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
                  {product.name}
                </h1>
                <div className="mt-3 flex items-baseline gap-3">
                  <p className="text-xl font-medium">{money(product.price)}</p>
                  {product.compareAt && (
                    <p className="text-sm text-muted line-through">
                      {money(product.compareAt)}
                    </p>
                  )}
                </div>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                  {product.blurb}
                </p>

                <p className="mt-4 text-sm text-muted">
                  {rating ? (
                    <>
                      <span className="text-accent" aria-hidden>
                        {"★".repeat(Math.round(rating.average))}
                        {"☆".repeat(5 - Math.round(rating.average))}
                      </span>{" "}
                      {rating.average} · {rating.count}{" "}
                      {rating.count === 1 ? "rating" : "ratings"} ·{" "}
                      <Link href="/login" className="link-line">
                        Sign in to rate
                      </Link>
                    </>
                  ) : (
                    <>
                      No ratings yet ·{" "}
                      <Link href="/login" className="link-line">
                        Sign in to be the first
                      </Link>
                    </>
                  )}
                </p>

                <div className="my-8 h-px w-full bg-line" />

                <PurchasePanel product={product} />

                <div className="my-8 h-px w-full bg-line" />

                <ul className="space-y-2 text-sm text-muted">
                  <li>Free shipping over $60 · returns within 30 days</li>
                  <li>Seams chain-stitched where they take strain; repairs for the life of the piece</li>
                  <li>Sewn in small runs in Manila</li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* More from the category */}
          {related.length > 0 && (
            <Reveal delay={100}>
              <section aria-label={`More ${product.category}`} className="mt-16 lg:mt-24">
                <h2 className="font-display text-2xl font-medium tracking-tight">
                  More {product.category.toLowerCase()} on the table
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  {related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/product/${rel.id}`}
                      className="group flex items-center gap-4 border border-line bg-card p-4 hover:border-line-strong transition-colors duration-300"
                    >
                      <GarmentArt type={rel.garment} className="h-16 w-auto shrink-0 text-foreground" />
                      <span>
                        <span className="block font-display text-[15px]">{rel.name}</span>
                        <span className="mt-0.5 block text-xs text-accent">{money(rel.price)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
