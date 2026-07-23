import { Reveal } from "./reveal";

const COLS: { title: string; links: string[] }[] = [
  { title: "Shop", links: ["New In", "Tops", "Outerwear", "Dresses", "Bottoms", "Knitwear"] },
  { title: "Help", links: ["Shipping", "Returns & exchanges", "Size guide", "Payment methods", "Contact"] },
  { title: "Company", links: ["Our craft", "Journal", "Stockists", "Privacy", "Terms"] },
];

export function Footer() {
  return (
    <footer id="footer" className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_repeat(3,0.8fr)]">
        <Reveal>
          <div>
            <p className="font-display text-2xl font-semibold italic tracking-tight">Fine Lines</p>
            <p className="mt-1 text-[10px] tracking-[0.22em] uppercase text-muted">Created by Neil</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              A small clothing label out of Manila. Drawn on paper first,
              sewn in short runs.
            </p>
            <form className="mt-6 flex max-w-xs items-center border-b border-line-strong focus-within:border-accent transition-colors duration-300">
              <input
                type="email"
                placeholder="Email for the lookbook"
                aria-label="Email for the lookbook"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="p-2 text-muted hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer"
              >
                →
              </button>
            </form>
          </div>
        </Reveal>
        {COLS.map((col, i) => (
          <Reveal key={col.title} delay={120 + i * 100}>
            <div>
              <h3 className="mb-4 text-[11px] tracking-[0.22em] uppercase text-muted">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="link-line text-sm text-foreground/80 hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[11px] tracking-[0.14em] uppercase text-muted sm:px-8">
          <p>
            © 2026 Fine Lines · <span className="text-accent">Created by Neil</span>
          </p>
          <p>Visa · Mastercard · GCash · Maya · QR Ph</p>
        </div>
      </div>
    </footer>
  );
}
