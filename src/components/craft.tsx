import { Reveal } from "./reveal";

export function Craft() {
  return (
    <section id="craft" className="border-y border-line bg-card/60">
      <div className="mx-auto grid max-w-7xl md:grid-cols-[1.5fr_1fr]">
        {/* Left: the long note */}
        <Reveal className="border-b md:border-b-0 md:border-r border-line px-8 py-14">
          <div>
            <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
              <span className="inline-block h-px w-10 bg-accent" />
              From the pattern table
            </p>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              We throw away most of our drawings.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
              A silhouette has to earn its way off the paper. If the line
              wobbles, the cloth will wobble worse, so we redraw until it
              doesn&apos;t. What you see in the shop is the short stack that
              survived. The Duster Coat took eleven drafts. The Meridian Tee
              took two, and we&apos;re still a little smug about that.
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
              Seams are chain-stitched where they take strain. If one ever
              gives out, post it to us and we&apos;ll repair it. That offer
              doesn&apos;t expire.
            </p>
          </div>
        </Reveal>

        {/* Right: two short, unequal notes */}
        <div className="flex flex-col">
          <Reveal delay={150} className="flex-1 border-b border-line px-8 py-10">
            <div>
              <p className="font-display text-2xl italic text-accent">Paying is your call</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Cards, GCash, Maya, QR Ph. The payment page is hosted by a
                PCI-compliant gateway, so card numbers never reach us. Good.
                We didn&apos;t want them.
              </p>
            </div>
          </Reveal>
          <Reveal delay={280} className="flex-1 px-8 py-10">
            <div>
              <p className="font-display text-2xl italic text-accent">₱2,995 ships free</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Under that, shipping is at cost. Returns get 30 days.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
