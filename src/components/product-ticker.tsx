"use client";

import { GarmentArt } from "./garment-art";
import { catalog } from "@/lib/catalog";
import { useQuickView } from "@/lib/quick-view";
import { money } from "@/lib/products";

/**
 * ProductTicker: the collection drifting right-to-left as a preview rail.
 * This is a content marquee, not a decorative one — clicking any item opens
 * its quick-view modal, same as a shop card. Pauses on hover/focus and falls
 * back to a plain swipeable strip when the visitor prefers reduced motion.
 */
export function ProductTicker() {
  const items = catalog.all();
  const openQuickView = useQuickView((s) => s.open);

  return (
    <section aria-label="Collection preview" className="ticker-viewport border-y border-line">
      <div className="ticker flex w-max">
        {/* Track is rendered twice for a seamless loop; the copy is aria-hidden. */}
        {[0, 1].map((dup) => (
          <ul key={dup} aria-hidden={dup === 1} className="flex shrink-0 items-stretch">
            {items.map((product) => (
              <li key={`${dup}-${product.id}`} className="border-r border-line">
                <button
                  type="button"
                  tabIndex={dup === 1 ? -1 : 0}
                  onClick={() => openQuickView(product)}
                  aria-label={`Quick view ${product.name}`}
                  className="group flex h-full items-center gap-4 px-6 py-3 hover:bg-card transition-colors duration-300 cursor-pointer"
                >
                  <GarmentArt
                    type={product.garment}
                    className="h-14 w-auto shrink-0 text-foreground"
                  />
                  <span className="flex flex-col text-left leading-tight">
                    <span className="text-[9px] tracking-[0.18em] uppercase text-muted">
                      Fig. {catalog.figNumber(product)}
                    </span>
                    <span className="font-display text-sm whitespace-nowrap">
                      {product.name}
                    </span>
                    <span className="mt-0.5 text-xs text-accent">
                      {money(product.price)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
