"use client";

import { GarmentArt } from "./garment-art";
import { useQuickView } from "@/lib/quick-view";
import { money, type Product } from "@/lib/products";
import type { RatingSummary } from "@/lib/ratings";

/**
 * The hero's showcased piece. Driven by the week's top-rated product when
 * rating data exists (server decides); clicking it opens the quick-view
 * modal, exactly like a shop card.
 */
export function FeaturedPlate({
  product,
  fig,
  rating,
}: {
  product: Product;
  fig: string;
  rating: RatingSummary | null;
}) {
  const openQuickView = useQuickView((s) => s.open);

  return (
    <button
      type="button"
      onClick={() => openQuickView(product)}
      aria-label={`Quick view ${product.name}`}
      className="group relative mx-auto block w-full max-w-sm border border-line bg-card p-8 text-left transition-all duration-300 [transition-timing-function:var(--ease-spring)] hover:-translate-y-1 hover:border-line-strong cursor-pointer"
    >
      <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
      <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
      {rating && (
        <span className="absolute left-5 top-4 text-[10px] tracking-[0.2em] uppercase text-muted">
          This week&apos;s most rated · ★ {rating.average} ({rating.count})
        </span>
      )}
      <GarmentArt
        type={product.garment}
        autodraw
        className="mx-auto h-80 w-auto text-foreground"
      />
      <span className="mt-4 flex items-baseline justify-between border-t border-line pt-4 text-[11px] tracking-[0.18em] uppercase text-muted">
        <span>
          Fig. {fig} · {product.name}
        </span>
        <span className="text-accent">{money(product.price)}</span>
      </span>
    </button>
  );
}
