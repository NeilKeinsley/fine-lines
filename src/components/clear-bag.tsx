"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/**
 * Empties the bag once per completed order. The per-ref guard means a
 * revisit/refresh of the success page never wipes a future bag.
 */
export function ClearBag({ orderRef }: { orderRef: string }) {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    if (!orderRef) return;
    const key = `fine-lines-cleared-${orderRef}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    clear();
  }, [orderRef, clear]);

  return null;
}
