"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, type Product } from "./products";

export interface CartLine {
  productId: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (productId) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          const lines = existing
            ? s.lines.map((l) =>
                l.productId === productId ? { ...l, qty: l.qty + 1 } : l
              )
            : [...s.lines, { productId, qty: 1 }];
          return { lines };
        }),
      remove: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) =>
                  l.productId === productId ? { ...l, qty } : l
                ),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "fine-lines-cart",
      partialize: (s) => ({ lines: s.lines }),
    }
  )
);

export function cartProduct(line: CartLine): Product | undefined {
  return PRODUCTS.find((p) => p.id === line.productId);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((n, l) => {
    const p = cartProduct(l);
    return n + (p ? p.price * l.qty : 0);
  }, 0);
}
