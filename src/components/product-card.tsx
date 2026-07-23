"use client";

import { useState } from "react";
import { GarmentArt } from "./garment-art";
import { useCart } from "@/lib/cart";
import { peso, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
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
        <GarmentArt
          type={product.garment}
          className="h-3/4 w-auto text-foreground transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:scale-[1.06]"
        />
        {/* quick add slides up on hover */}
        <button
          type="button"
          onClick={() => {
            handleAdd();
            openCart();
          }}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground py-3 text-[12px] tracking-[0.18em] uppercase text-background transition-transform duration-300 [transition-timing-function:var(--ease-spring)] group-hover:translate-y-0 focus-visible:translate-y-0 cursor-pointer"
        >
          {added ? "Added ✓" : "Add to bag"}
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 border-t border-line p-4">
        <div>
          <h3 className="font-display text-[17px] leading-snug">{product.name}</h3>
          <p className="mt-1 text-xs text-muted line-clamp-1">{product.blurb}</p>
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
