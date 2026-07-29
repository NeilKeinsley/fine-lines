"use client";

import { useEffect, useState } from "react";
import type { StockLevels } from "./inventory";

/*
 * Client stock snapshot. One fetch per page load, shared module-wide (cards,
 * quick-view, and purchase panels all read the same promise). Null while
 * loading or when stock is untracked — callers treat null as "don't gate".
 */
let shared: Promise<StockLevels> | null = null;

export function useStock(): StockLevels | null {
  const [levels, setLevels] = useState<StockLevels | null>(null);

  useEffect(() => {
    shared ??= fetch("/api/stock").then((r) => r.json());
    let cancelled = false;
    shared
      .then((data) => {
        if (!cancelled) setLevels(data);
      })
      .catch(() => {
        shared = null; // allow retry on next mount
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return levels;
}
