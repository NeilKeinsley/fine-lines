"use client";

import { useState } from "react";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { catalog, type CategoryFilter } from "@/lib/catalog";

export function ProductGrid() {
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const shown = catalog.byCategory(filter);

  return (
    <section id="shop" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
              <span className="inline-block h-px w-10 bg-accent" />
              The collection
            </p>
            <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Pieces on the line.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All", ...catalog.categories()] as CategoryFilter[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-1.5 text-[12px] tracking-wide transition-all duration-300 cursor-pointer ${
                  filter === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-line text-muted hover:border-line-strong hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 90}>
            <ProductCard product={product} fig={catalog.figNumber(product)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
