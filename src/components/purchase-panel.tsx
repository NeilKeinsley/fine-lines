"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { money, SIZES, type Product, type Size } from "@/lib/products";

/** The interactive slice of a product page: size choice, bag, and saving. */
export function PurchasePanel({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleSaved = useWishlist((s) => s.toggle);
  const savedIds = useWishlist((s) => s.ids);

  const [size, setSize] = useState<Size | null>(null);
  const [needsSize, setNeedsSize] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = mounted && savedIds.includes(product.id);

  const handleAdd = () => {
    if (!size) {
      setNeedsSize(true);
      return;
    }
    add(product.id, size);
    openCart();
  };

  return (
    <div>
      <p className="mb-2 text-[11px] tracking-[0.18em] uppercase text-muted">Size</p>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSize(s);
              setNeedsSize(false);
            }}
            className={`min-w-11 rounded-full border px-3 py-2 text-[13px] transition-colors duration-200 cursor-pointer ${
              size === s
                ? "border-foreground bg-foreground text-background"
                : "border-line text-muted hover:border-line-strong hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {needsSize && (
        <p className="mt-2 text-xs text-accent">Pick a size first.</p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-12 items-center rounded-full bg-foreground px-8 text-sm text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer"
        >
          Add to bag · {money(product.price)}
        </button>
        <button
          type="button"
          onClick={() => toggleSaved(product.id)}
          aria-pressed={saved}
          className={`inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm transition-colors duration-300 cursor-pointer ${
            saved
              ? "border-accent text-accent"
              : "border-line text-muted hover:border-line-strong hover:text-foreground"
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
          {saved ? "Saved" : "Save for later"}
        </button>
      </div>
    </div>
  );
}
