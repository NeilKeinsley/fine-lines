"use client";

import { useCart } from "@/lib/cart";

/** CTA that reopens the bag drawer (used on the cancelled-checkout page). */
export function OpenBagButton() {
  const open = useCart((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-sm text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)] cursor-pointer"
    >
      Reopen my bag
    </button>
  );
}
