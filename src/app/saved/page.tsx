"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { GarmentArt } from "@/components/garment-art";
import { useWishlist } from "@/lib/wishlist";
import { catalog } from "@/lib/catalog";

export default function SavedPage() {
  const ids = useWishlist((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = mounted
    ? ids.map((id) => catalog.find(id)).filter((p) => p !== undefined)
    : [];

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
            <span className="inline-block h-px w-10 bg-accent" />
            Saved pieces
          </p>
          <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Set aside, not forgotten.
          </h1>

          {mounted && saved.length === 0 ? (
            <div className="mt-14 flex flex-col items-center gap-4 border border-line bg-card py-16 text-center">
              <GarmentArt type="dress" className="h-28 w-auto text-line-strong" />
              <p className="font-display text-lg italic">Nothing saved yet.</p>
              <p className="max-w-xs text-sm text-muted">
                Tap the heart on any piece and it&apos;ll wait for you here.
              </p>
              <Link href="/#shop" className="link-line text-sm text-muted hover:text-foreground">
                Browse the collection →
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {saved.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  fig={catalog.figNumber(product)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
