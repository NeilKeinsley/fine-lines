"use client";

import { useEffect, useState } from "react";
import type { StockLevels } from "./inventory";

/*
 * Client stock snapshot, shared module-wide with a 30s TTL — soft navigations
 * in the App Router keep the module alive for the whole tab session, so a
 * time-based refresh (not "once per load") is what actually keeps the
 * advisory ISR pages corrected. Failed responses are never cached.
 */
const TTL_MS = 30_000;
let shared: { promise: Promise<StockLevels>; at: number } | null = null;

export function useStock(): StockLevels | null {
  const [levels, setLevels] = useState<StockLevels | null>(null);

  useEffect(() => {
    if (!shared || Date.now() - shared.at > TTL_MS) {
      shared = {
        at: Date.now(),
        promise: fetch("/api/stock").then((r) => {
          if (!r.ok) throw new Error(`stock fetch ${r.status}`);
          return r.json();
        }),
      };
    }
    let cancelled = false;
    shared.promise
      .then((data) => {
        if (!cancelled) setLevels(data);
      })
      .catch(() => {
        shared = null; // never cache an error; retry on next mount
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return levels;
}
