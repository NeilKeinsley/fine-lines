"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useStock } from "@/lib/use-stock";
import { money, SIZES, type Product, type Size } from "@/lib/products";

interface PurchasePanelProps {
  product: Product;
  /** Called after a successful add — the quick-view modal closes itself. */
  onAdd?: () => void;
}

/** The interactive slice of a product page: size choice, bag, and saving. */
export function PurchasePanel({ product, onAdd }: PurchasePanelProps) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleSaved = useWishlist((s) => s.toggle);
  const savedIds = useWishlist((s) => s.ids);
  const stock = useStock()?.[product.id] ?? null; // null = untracked/loading

  const [size, setSize] = useState<Size | null>(null);
  const [needsSize, setNeedsSize] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = mounted && savedIds.includes(product.id);
  const sizeStock = (s: Size) => stock?.[s] ?? null;
  const soldOut = (s: Size) => sizeStock(s)?.n === 0;
  const allSoldOut = stock !== null && SIZES.every((s) => soldOut(s));
  const selectedLow = size ? sizeStock(size) : null;

  const handleAdd = () => {
    if (!size) {
      setNeedsSize(true);
      return;
    }
    add(product.id, size);
    onAdd?.();
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
            disabled={soldOut(s)}
            onClick={() => {
              setSize(s);
              setNeedsSize(false);
            }}
            className={`min-w-11 rounded-full border px-3 py-2 text-[13px] transition-colors duration-200 ${
              soldOut(s)
                ? "cursor-not-allowed border-line text-muted/50 line-through"
                : size === s
                  ? "cursor-pointer border-foreground bg-foreground text-background"
                  : "cursor-pointer border-line text-muted hover:border-line-strong hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {needsSize && <p className="mt-2 text-xs text-accent">Pick a size first.</p>}
      {selectedLow?.low && (
        <p className="mt-2 text-xs text-accent">
          Only {selectedLow.n} left in {size}.
        </p>
      )}
      {allSoldOut && (
        <p className="mt-2 text-xs text-muted">
          Sold out for now. Back-in-stock alerts are coming soon.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={allSoldOut}
          className="inline-flex h-12 items-center rounded-full bg-foreground px-8 text-sm text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {allSoldOut ? "Sold out" : `Add to bag · ${money(product.price)}`}
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
