import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProductTicker } from "@/components/product-ticker";
import { ProductGrid } from "@/components/product-grid";
import { Craft } from "@/components/craft";
import { Faq } from "@/components/faq";
import { FounderNote } from "@/components/founder-note";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { QuickView } from "@/components/quick-view";

/* Hero queries the week's top-rated product — refresh hourly. */
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductTicker />
        <ProductGrid />
        <Craft />
        <Faq />
        <FounderNote />
      </main>
      <Footer />
      <CartDrawer />
      <QuickView />
    </>
  );
}
