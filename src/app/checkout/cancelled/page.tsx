import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { GarmentArt } from "@/components/garment-art";
import { Reveal } from "@/components/reveal";
import { OpenBagButton } from "@/components/open-bag-button";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false }, // transactional page — never index
};

export default function CheckoutCancelledPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8 lg:py-24">
          <Reveal>
            <GarmentArt type="tee" className="mx-auto h-36 w-auto text-line-strong" />
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-8 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              No harm done.
            </h1>
          </Reveal>
          <Reveal delay={230}>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Checkout was cancelled and nothing was charged. Your bag is
              exactly as you left it, whenever you&apos;re ready.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <OpenBagButton />
              <Link
                href="/#shop"
                className="link-line text-sm text-muted hover:text-foreground"
              >
                Back to the collection →
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
