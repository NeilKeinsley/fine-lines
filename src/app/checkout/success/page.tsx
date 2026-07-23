import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { GarmentArt } from "@/components/garment-art";
import { Reveal } from "@/components/reveal";
import { ClearBag } from "@/components/clear-bag";

export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false }, // transactional page — never index
};

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  const orderRef = ref ?? "";

  return (
    <>
      <Header />
      <ClearBag orderRef={orderRef} />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8 lg:py-24">
          <Reveal>
            <figure className="relative mx-auto w-fit border border-line bg-card px-14 py-10">
              <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
              <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
              <GarmentArt type="coat" autodraw className="h-44 w-auto text-foreground" />
              <figcaption className="mt-4 border-t border-line pt-3 text-[10px] tracking-[0.2em] uppercase text-muted">
                Off the table, into the world
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="mt-10 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Order placed.
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <div className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              {orderRef && (
                <p className="mb-3 text-[11px] tracking-[0.22em] uppercase">
                  Reference · <span className="text-accent">{orderRef}</span>
                </p>
              )}
              <p>
                Your payment is going through now, and the order flips to paid
                the moment the bank confirms it, usually within seconds. The
                receipt lands in your inbox from PayMongo, and we&apos;ll
                follow with tracking once the parcel leaves the studio.
              </p>
            </div>
          </Reveal>
          <Reveal delay={370}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#shop"
                className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-sm text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)]"
              >
                Keep browsing
              </Link>
              <Link
                href="/#faq"
                className="link-line text-sm text-muted hover:text-foreground"
              >
                Shipping &amp; returns →
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
