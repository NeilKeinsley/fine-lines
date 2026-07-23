import { Reveal } from "./reveal";

/* Neil's mark, drawn with the same stroke system as the garments. */
function Signature() {
  return (
    <svg
      viewBox="0 0 150 52"
      className="garment-autodraw h-12 w-auto text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Neil's signature"
    >
      <path d="M14 42 V14 M14 14 L36 42 M36 42 V14" pathLength={1} style={{ ["--draw-index" as string]: 0 }} />
      <path d="M50 34 Q60 32 58 26 Q56 20 48 26 Q42 33 48 39 Q55 43 63 36" pathLength={1} style={{ ["--draw-index" as string]: 1 }} />
      <path d="M74 26 Q73 34 74 40" pathLength={1} style={{ ["--draw-index" as string]: 2 }} />
      <circle cx={74} cy={17} r={0.8} pathLength={1} style={{ ["--draw-index" as string]: 3 }} />
      <path d="M88 10 Q92 28 87 40 Q85 44 83 41" pathLength={1} style={{ ["--draw-index" as string]: 4 }} />
      <path d="M96 44 Q120 40 142 42" pathLength={1} style={{ ["--draw-index" as string]: 5 }} />
    </svg>
  );
}

export function FounderNote() {
  return (
    <section aria-label="A note from Neil" className="border-t border-line">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
        <Reveal>
          <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
            <span className="inline-block h-px w-10 bg-accent" />
            A note from the table
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="font-display text-2xl leading-relaxed tracking-tight sm:text-[28px]">
            I started Fine Lines because I kept a sketchbook of clothes nobody
            was making. This shop is that sketchbook, sewn. It&apos;s small on
            purpose, and it&apos;s in preview while I wire up the register.
            Look around, bag what you like, and it&apos;ll be waiting when the
            doors open.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-8">
            <Signature />
            <p className="mt-2 text-[11px] tracking-[0.22em] uppercase text-muted">
              Neil · Fine Lines, Manila
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
