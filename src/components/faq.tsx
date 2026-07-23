import { Reveal } from "./reveal";

const QA = [
  {
    q: "When do orders open?",
    a: "Soon. The shop is in preview while payments get wired up. Leave your email in the footer and you'll hear the day the register opens.",
  },
  {
    q: "How will I pay?",
    a: "Visa, Mastercard, PayPal, or a QR Ph bank transfer, all through a hosted PCI-compliant payment page, so your card details never touch our servers. Cash on delivery for Metro Manila is on the list too.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. Guest checkout is always open. An account just keeps your order history and saved details in one place if you want that.",
  },
  {
    q: "What about shipping?",
    a: "Free over $60, anywhere in the Philippines. Metro Manila usually lands in 1 to 3 days, provincial in 3 to 7. You get a tracking link the moment the parcel leaves the studio.",
  },
  {
    q: "Returns and exchanges?",
    a: "You have 30 days. If it's unworn with tags still on, send it back or swap the size. Start from your order email and we'll book the pickup.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
      <Reveal>
        <h2 className="font-display text-4xl font-medium tracking-tight">
          The fine print.
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
