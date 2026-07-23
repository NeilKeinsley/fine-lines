"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GarmentArt } from "./garment-art";
import { useWishlist } from "@/lib/wishlist";
import { useQuickView } from "@/lib/quick-view";
import { money, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const toggleSaved = useWishlist((s) => s.toggle);
  const savedIds = useWishlist((s) => s.ids);
  const openQuickView = useQuickView((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const saved = mounted && savedIds.includes(product.id);

  return (
    <article className="group relative flex flex-col border border-line bg-card transition-all duration-300 [transition-timing-function:var(--ease-spring)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.25)]">
      {product.badge && (
        <span
          className={`absolute left-4 top-4 z-10 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase ${
            product.badge === "Sale"
              ? "bg-accent text-accent-contrast"
              : "border border-line-strong text-muted"
          }`}
        >
          {product.badge}
        </span>
      )}

      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name} for later`}
          aria-pressed={saved}
          onClick={() => toggleSaved(product.id)}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 cursor-pointer ${
            saved ? "border-accent text-accent" : "border-line text-muted hover:border-line-strong"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20.5 4.7 13a4.6 4.6 0 0 1 0-6.5 4.5 4.5 0 0 1 6.4 0l.9.9.9-.9a4.5 4.5 0 0 1 6.4 0 4.6 4.6 0 0 1 0 6.5Z" />
          </svg>
        </button>
        {/* clicking the piece expands it into the quick-view modal */}
        <button
          type="button"
          aria-label={`Quick view ${product.name}`}
          onClick={() => openQuickView(product)}
          className="flex h-full w-full items-center justify-center cursor-pointer"
        >
          <GarmentArt
            type={product.garment}
            className="h-3/4 w-auto text-foreground transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:scale-[1.06]"
          />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 border-t border-line p-4">
        <div>
          <h3 className="font-display text-[17px] leading-snug">
            <Link href={`/product/${product.id}`} className="link-line">
              {product.name}
            </Link>
          </h3>
          {/* Max two lines for card uniformity — the full blurb lives in the
              quick-view modal and on the product page. */}
          <p className="mt-1 min-h-8 text-xs text-muted line-clamp-2">{product.blurb}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{money(product.price)}</p>
          {product.compareAt && (
            <p className="text-xs text-muted line-through">{money(product.compareAt)}</p>
          )}
        </div>
      </div>
    </article>
  );
}
