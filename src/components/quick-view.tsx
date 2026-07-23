"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GarmentArt } from "./garment-art";
import { PurchasePanel } from "./purchase-panel";
import { useQuickView } from "@/lib/quick-view";
import { catalog } from "@/lib/catalog";
import { money, type Product } from "@/lib/products";

/**
 * Quick-view modal: clicking a product card expands it here. Enter and exit
 * both animate (spring scale/fade, reversed on close); the backdrop, the X,
 * and Escape all close it. Mounted once per page, driven by useQuickView.
 */
export function QuickView() {
  const { product, close } = useQuickView();
  // `current` keeps the last product rendered through the exit animation.
  const [current, setCurrent] = useState<Product | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (product) {
      setCurrent(product);
      // Tick later, so the closed state paints first and the transition runs
      // (a timer, not rAF — rAF stalls in backgrounded/hidden tabs).
      const timer = setTimeout(() => setShown(true), 20);
      return () => clearTimeout(timer);
    }
    setShown(false);
    const timer = setTimeout(() => setCurrent(null), 400); // matches duration
    return () => clearTimeout(timer);
  }, [product]);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [current, close]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${current.name}`}
    >
      {/* backdrop — clicking it closes */}
      <div
        aria-hidden
        onClick={close}
        className={`absolute inset-0 bg-black/45 backdrop-blur-[3px] transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative w-full max-w-3xl overflow-hidden border border-line bg-background shadow-[0_40px_90px_-30px_rgb(0_0_0/0.5)] transition-all duration-[400ms] [transition-timing-function:var(--ease-spring)] ${
          shown
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.96] translate-y-4"
        }`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background hover:border-line-strong hover:rotate-90 transition-all duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="grid max-h-[85vh] overflow-y-auto md:grid-cols-[0.9fr_1.1fr]">
          {/* Plate */}
          <figure className="relative flex items-center justify-center border-b md:border-b-0 md:border-r border-line bg-card p-8">
            <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
            <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
            <GarmentArt
              type={current.garment}
              autodraw
              className="h-52 w-auto text-foreground sm:h-72"
            />
            {current.badge && (
              <span
                className={`absolute left-4 top-4 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase ${
                  current.badge === "Sale"
                    ? "bg-accent text-accent-contrast"
                    : "border border-line-strong text-muted"
                }`}
              >
                {current.badge}
              </span>
            )}
          </figure>

          {/* Details + choices */}
          <div className="p-6 sm:p-8">
            <p className="mb-2 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
              <span className="inline-block h-px w-8 bg-accent" />
              {current.category}
            </p>
            <h2 className="font-display text-3xl font-medium tracking-tight pr-10">
              {current.name}
            </h2>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="text-lg font-medium">{money(current.price)}</p>
              {current.compareAt && (
                <p className="text-sm text-muted line-through">
                  {money(current.compareAt)}
                </p>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {current.blurb}
            </p>

            <div className="my-6 h-px w-full bg-line" />

            <PurchasePanel product={current} onAdd={close} />

            <Link
              href={`/product/${current.id}`}
              onClick={close}
              className="link-line mt-6 inline-block text-sm text-muted hover:text-foreground"
            >
              View full details · Fig. {catalog.figNumber(current)} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
