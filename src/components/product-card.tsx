"use client";

import { useState } from "react";
import { GarmentArt } from "./garment-art";
import { useCart } from "@/lib/cart";
import { peso, SIZES, type Product, type Size } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  /** Plate number in the site's "Fig. NN" system (from Catalog.figNumber). */
  fig: string;
}

export function ProductCard({ product, fig }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const [added, setAdded] = useState<Size | null>(null);
  // Hover reveals the size panel on desktop; on touch there is no hover, so
  // tapping the artwork toggles it instead.
  const [pickerOpen, setPickerOpen] = useState(false);

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
          <h3 className="font-display text-[17px] leading-snug">{product.name}</h3>
          <p className="mt-1 text-xs text-muted">{product.blurb}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{peso(product.price)}</p>
          {product.compareAt && (
            <p className="text-xs text-muted line-through">{peso(product.compareAt)}</p>
          )}
        </div>
      </div>
    </article>
  );
}
