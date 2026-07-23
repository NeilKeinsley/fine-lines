"use client";

import { useState } from "react";
import { Reveal } from "./reveal";

/* Only links that resolve somewhere real. Dead placeholder links read as
   generation residue (see the anti-slop field guide) — add rows here only
   when the page behind them exists. */
const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "The collection", href: "#shop" },
      { label: "From the pattern table", href: "#craft" },
      { label: "The fine print", href: "#faq" },
    ],
  },
  {
    title: "Reach us",
    links: [
      { label: "hello@finelines.ph", href: "mailto:hello@finelines.ph" },
      { label: "@finelines.mnl on Instagram", href: "https://instagram.com/finelines.mnl" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer id="footer" className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <Reveal>
          <div>
            <p className="font-display text-2xl font-semibold italic tracking-tight">Fine Lines</p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              A small clothing label out of Manila. Drawn on paper first,
              sewn in short runs.
            </p>
            <form
              className="mt-6 flex max-w-xs items-center border-b border-line-strong focus-within:border-accent transition-colors duration-300"
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                placeholder="Email for the launch"
                aria-label="Email for the launch"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="p-2 text-muted hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer"
              >
                →
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-xs text-muted">
                The list opens with the register. Nothing was stored yet, but
                it will be at launch.
              </p>
            )}
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
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="link-line text-sm text-foreground/80 hover:text-foreground"
                    >
                      {l.label}
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
          <p>Visa · Mastercard · PayPal · Stripe · QR Ph</p>
        </div>
      </div>
    </footer>
  );
}
