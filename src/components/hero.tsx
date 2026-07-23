import { GarmentArt } from "./garment-art";
import { Reveal } from "./reveal";

const STRIP = [
  "The Tailored Line, SS26",
  "Free shipping over ₱2,995",
  "GCash · Maya · QR Ph · Cards",
  "Sewn in small runs in Manila",
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
              Spring / Summer ’26 · The Tailored Line
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display text-[clamp(2.8rem,7vw,5.2rem)] font-medium leading-[1.02] tracking-tight">
              Every garment
              <br />
              starts as a <em className="font-semibold text-accent">line</em>.
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
              Most sketches never make it past the pattern table. The twelve
              pieces in this shop did.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#shop"
                className="inline-flex h-12 items-center rounded-full bg-foreground px-7 text-sm text-background hover:scale-105 transition-transform duration-300 [transition-timing-function:var(--ease-spring)]"
              >
                See all twelve
              </a>
              <a
                href="#craft"
                className="link-line text-sm tracking-wide text-muted hover:text-foreground transition-colors"
              >
                Why so few →
              </a>
            </div>
          </Reveal>
        </div>

        {/* Framed self-drawing coat */}
        <Reveal delay={280} className="hidden md:block">
          <figure className="group relative mx-auto w-full max-w-sm border border-line bg-card p-8">
            <span className="absolute -left-px -top-px h-5 w-5 border-l border-t border-accent" />
            <span className="absolute -bottom-px -right-px h-5 w-5 border-b border-r border-accent" />
            <GarmentArt type="coat" autodraw className="mx-auto h-80 w-auto text-foreground" />
            <figcaption className="mt-4 flex items-baseline justify-between border-t border-line pt-4 text-[11px] tracking-[0.18em] uppercase text-muted">
              <span>Fig. 01 · Duster Coat</span>
              <span className="text-accent">₱6,750</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {/* static USP strip on hairlines — deliberately not a marquee */}
      <div className="border-y border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-5 py-3 sm:justify-between sm:px-8">
          {STRIP.map((t) => (
            <span key={t} className="text-[11px] tracking-[0.2em] uppercase text-muted">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
