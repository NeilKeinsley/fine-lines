import { GarmentArt } from "./garment-art";
import { Reveal } from "./reveal";

const TICKER = [
  "The Tailored Line — SS26",
  "Free shipping over ₱2,995",
  "GCash · Maya · QR Ph · Cards",
  "Drawn, cut, and sewn to last",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* faint pattern-table grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-14 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pt-20 lg:pb-24">
        <div>
          <Reveal delay={0}>
            <p className="mb-5 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
              <span className="inline-block h-px w-10 bg-accent" />
              Spring / Summer ’26 — The Tailored Line
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display text-[clamp(2.8rem,7vw,5.2rem)] font-medium leading-[1.02] tracking-tight">
              Clothing cut
              <br />
              with <em className="text-shimmer not-italic font-semibold italic">intention</em>.
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
              Every piece begins as a line on paper. We keep the ones worth
              keeping — precise silhouettes, honest cloth, seams that outlive
              seasons.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#shop"
                className="btn-shimmer inline-flex h-12 items-center rounded-full bg-foreground px-7 text-sm text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)]"
              >
                Shop the collection
              </a>
              <a
                href="#craft"
                className="link-line text-sm tracking-wide text-muted hover:text-foreground transition-colors"
              >
                Our craft →
              </a>
            </div>
          </Reveal>
        </div>

        {/* Framed self-drawing coat — the brand moment */}
        <Reveal delay={280} className="hidden md:block">
          <figure className="group relative mx-auto w-full max-w-sm border border-line bg-card p-8">
            <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
            <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
            <GarmentArt type="coat" autodraw className="mx-auto h-80 w-auto text-foreground" />
            <figcaption className="mt-4 flex items-baseline justify-between border-t border-line pt-4 text-[11px] tracking-[0.18em] uppercase text-muted">
              <span>Fig. 01 — Duster Coat</span>
              <span className="text-accent">₱6,750</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {/* marquee ticker on hairlines */}
      <div className="relative border-y border-line py-3 overflow-hidden">
        <div className="marquee-track flex w-max animate-marquee gap-0 whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
              {TICKER.map((t) => (
                <span
                  key={`${dup}-${t}`}
                  className="mx-8 text-[11px] tracking-[0.24em] uppercase text-muted"
                >
                  {t} <span className="ml-8 text-accent">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
