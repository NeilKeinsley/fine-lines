import { Reveal } from "./reveal";

const POINTS = [
  {
    n: "01",
    title: "Drawn first",
    body: "Every silhouette starts on the pattern table. If the line isn't right on paper, it never reaches cloth.",
  },
  {
    n: "02",
    title: "Paid your way",
    body: "Cards, GCash, Maya, and QR Ph — processed by a PCI-compliant gateway. Your card details never touch our servers.",
  },
  {
    n: "03",
    title: "Kept for good",
    body: "30-day returns, free over ₱2,995, and repairs on seams for life. Buy once, wear long.",
  },
];

export function Craft() {
  return (
    <section id="craft" className="border-y border-line bg-card/60">
      <div className="mx-auto grid max-w-7xl md:grid-cols-3">
        {POINTS.map((p, i) => (
          <Reveal
            key={p.n}
            delay={i * 140}
            className={`px-8 py-12 ${i > 0 ? "border-t md:border-t-0 md:border-l border-line" : ""}`}
          >
            <div>
              <p className="font-display text-4xl italic text-accent">{p.n}</p>
              <div className="my-4 h-px w-10 bg-line-strong" />
              <h3 className="font-display text-xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
