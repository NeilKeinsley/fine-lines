"use client";

import { useEffect } from "react";
import { GarmentArt } from "./garment-art";
import {
  useCart,
  cartProduct,
  cartSubtotal,
  cartCount,
} from "@/lib/cart";
import { peso } from "@/lib/products";

const FREE_SHIP_AT = 2995;

export function CartDrawer() {
  const { lines, isOpen, close, setQty, remove } = useCart();
  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);
  const toFree = Math.max(0, FREE_SHIP_AT - subtotal);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-background transition-transform duration-500 [transition-timing-function:var(--ease-spring)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl italic">
            Your bag{" "}
            <span className="not-italic text-sm text-muted">({count})</span>
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close bag"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-line-strong hover:rotate-90 transition-all duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {/* free-shipping meter — a literal fine line */}
        <div className="border-b border-line px-6 py-3">
          <p className="text-[11px] tracking-[0.14em] uppercase text-muted">
            {toFree > 0
              ? `${peso(toFree)} more and shipping's on us`
              : "Shipping's on us ✓"}
          </p>
          <div className="mt-2 h-px w-full bg-line">
            <div
              className="h-px bg-accent transition-all duration-700 [transition-timing-function:var(--ease-spring)]"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIP_AT) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <GarmentArt type="tee" className="h-28 w-auto text-line-strong" />
              <p className="font-display text-lg italic">Your bag is empty.</p>
              <button
                type="button"
                onClick={close}
                className="link-line text-sm text-muted hover:text-foreground cursor-pointer"
              >
                Keep browsing →
              </button>
            </div>
          ) : (
            <ul>
              {lines.map((line) => {
                const p = cartProduct(line);
                if (!p) return null;
                return (
                  <li
                    key={line.productId}
                    className="flex gap-4 border-b border-line py-5"
                  >
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center border border-line bg-card">
                      <GarmentArt type={p.garment} className="h-16 w-auto text-foreground" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-[15px] leading-snug">{p.name}</h3>
                        <p className="text-sm">{peso(p.price * line.qty)}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{p.category}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            className="px-2.5 py-1 text-sm hover:bg-card transition-colors cursor-pointer"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm">{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            className="px-2.5 py-1 text-sm hover:bg-card transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.productId)}
                          className="link-line text-xs text-muted hover:text-accent cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-line px-6 py-5">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">{peso(subtotal)}</span>
            </div>
            <p className="mb-4 text-[11px] text-muted">
              Shipping &amp; taxes calculated at checkout.
            </p>
            <button
              type="button"
              className="btn-shimmer w-full rounded-full bg-foreground py-3.5 text-sm text-background hover:scale-[1.02] transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer"
              onClick={() =>
                alert(
                  "Checkout opens soon. We're wiring up cards, GCash, Maya, and QR Ph right now."
                )
              }
            >
              Checkout · {peso(subtotal)}
            </button>
            <p className="mt-3 text-center text-[10px] tracking-[0.14em] uppercase text-muted">
              Visa · Mastercard · GCash · Maya · QR Ph
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}
