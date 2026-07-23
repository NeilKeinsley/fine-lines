"use client";

import { create } from "zustand";
import type { Product } from "./products";

/** Which product the quick-view modal is showing (null = closed). */
interface QuickViewState {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
}

export const useQuickView = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
