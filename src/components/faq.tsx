import { Reveal } from "./reveal";

const QA = [
  {
    q: "How do I pay?",
    a: "We accept Visa and Mastercard, GCash, Maya, and QR Ph bank transfers. Payments run through a hosted, PCI-compliant checkout — your card details never touch our servers, and card payments are protected with 3-D Secure.",
  },
  {
    q: "Do I need an account to order?",
    a: "No — guest checkout is always available. An account simply keeps your order history, saved details, and bookmarked pieces in one place.",
  },
  {
    q: "What about shipping?",
    a: "Free nationwide shipping on orders over ₱2,995. Metro Manila arrives in 1–3 days; provincial orders in 3–7. Tracking lands in your inbox the moment your parcel leaves the studio.",
  },
  {
    q: "Returns and exchanges?",
    a: "30 days, no drama. Unworn pieces with tags can be returned or exchanged — start it from your order email and we'll arrange the pickup.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
      <Reveal>
        <p className="mb-3 flex items-center gap-3 text-[11px] tracking-[0.24em] uppercase text-muted">
          <span className="inline-block h-px w-10 bg-accent" />
          Questions, answered
        </p>
        <h2 className="font-display text-4xl font-medium tracking-tight">
          The fine print, in plain lines.
        </h2>
      </Reveal>
      <div className="mt-10">
        {QA.map((item, i) => (
          <Reveal key={item.q} delay={i * 90}>
            <details className="faq group/faq border-b border-line">
              <summary className="flex cursor-pointer items-baseline gap-5 py-5 list-none">
                <span className="font-display text-sm italic text-accent">
                  0{i + 1}
                </span>
                <span className="flex-1 font-display text-lg">{item.q}</span>
                <span className="faq-icon text-xl text-muted">+</span>
              </summary>
              <p className="pb-6 pl-10 pr-8 text-sm leading-relaxed text-muted">
                {item.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
