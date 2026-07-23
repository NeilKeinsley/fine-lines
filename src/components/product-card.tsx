"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GarmentArt } from "./garment-art";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { money, SIZES, type Product, type Size } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  /** Plate number in the site's "Fig. NN" system (from Catalog.figNumber). */
  fig: string;
}

export function ProductCard({ product, fig }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleSaved = useWishlist((s) => s.toggle);
  const savedIds = useWishlist((s) => s.ids);
  const [added, setAdded] = useState<Size | null>(null);
  // Hover reveals the size panel on desktop; on touch there is no hover, so
  // tapping the artwork toggles it instead.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const saved = mounted && savedIds.includes(product.id);

  const handleAdd = (size: Size) => {
    add(product.id, size);
    setAdded(size);
    openCart();
    setTimeout(() => setAdded(null), 1500);
  };

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
        <span className="absolute right-4 top-4 text-[10px] tracking-[0.18em] uppercase text-muted">
          Fig. {fig}
        </span>
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name} for later`}
          aria-pressed={saved}
          onClick={() => toggleSaved(product.id)}
          className={`absolute right-3 top-10 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 cursor-pointer ${
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
        <button
          type="button"
          aria-label={`Choose a size for ${product.name}`}
          onClick={() => setPickerOpen((v) => !v)}
          className="flex h-full w-full items-center justify-center cursor-pointer"
        >
          <GarmentArt
            type={product.garment}
            className="h-3/4 w-auto text-foreground transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:scale-[1.06]"
          />
        </button>
        {/* size picker: slides up on hover (desktop) or tap (touch) */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-foreground text-background transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:translate-y-0 focus-within:translate-y-0 ${
            pickerOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <p className="pt-2.5 text-center text-[10px] tracking-[0.2em] uppercase opacity-70">
            {added ? `In the bag, size ${added}` : "Pick a size"}
          </p>
          <div className="flex justify-center gap-1 px-3 pb-2.5 pt-1.5">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleAdd(size)}
                className="min-w-9 rounded-full border border-background/30 px-2 py-1.5 text-[12px] hover:bg-background hover:text-foreground transition-colors duration-200 cursor-pointer"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 border-t border-line p-4">
        <div>
          <h3 className="font-display text-[17px] leading-snug">
            <Link href={`/product/${product.id}`} className="link-line">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-muted">{product.blurb}</p>
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
