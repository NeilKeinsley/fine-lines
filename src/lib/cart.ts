"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Size } from "./products";

export interface CartLine {
  productId: string;
  size: Size;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string, size: Size) => void;
  remove: (productId: string, size: Size) => void;
  setQty: (productId: string, size: Size, qty: number) => void;
  clear: () => void;
}

const sameLine = (l: CartLine, productId: string, size: Size) =>
  l.productId === productId && l.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (productId, size) =>
        set((s) => {
          const existing = s.lines.find((l) => sameLine(l, productId, size));
          const lines = existing
            ? s.lines.map((l) =>
                sameLine(l, productId, size) ? { ...l, qty: l.qty + 1 } : l
              )
            : [...s.lines, { productId, size, qty: 1 }];
          return { lines };
        }),
      remove: (productId, size) =>
        set((s) => ({
          lines: s.lines.filter((l) => !sameLine(l, productId, size)),
        })),
      setQty: (productId, size, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !sameLine(l, productId, size))
              : s.lines.map((l) =>
                  sameLine(l, productId, size) ? { ...l, qty } : l
                ),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "fine-lines-cart",
      version: 1, // v0 lines had no size; drop them rather than guess one
      migrate: () => ({ lines: [] }),
      partialize: (s) => ({ lines: s.lines }),
    }
  )
);

/* Money/quantity math lives in Bag (src/lib/bag.ts) — construct one from
   `lines` instead of computing totals in components. */
