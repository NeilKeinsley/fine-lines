<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fine Lines — storefront repo

**Neil's personal portfolio + learning project**: an editorial e-commerce clothing store built to demonstrate every e-commerce function done properly. NOT a real commerce business — payments stay in test mode permanently, the catalog is a designed fiction, and the audience is someone evaluating the craft. Part of the Rev-Box **Web Integrations** knowledge base — hub artifacts live in `D:\Work Files\Rev-Box\Web Integrations\clients\fine-lines\` (checklist, worklog, research, evidence; current roadmap: `beat-shopify-plan.md` v3, the "syllabus").

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 (`@theme inline` tokens in `src/app/globals.css`)
- `next-themes` (class strategy, `html.dark`) for light/dark; `zustand` + persist for the cart (`fine-lines-cart` in localStorage)
- No backend yet — products are static data in `src/lib/products.ts`

## Design system (do not drift from this)
- **Identity: "fine lines" literally** — hairline rules (`--line`), stroke-drawn garment SVGs (`src/components/garment-art.tsx`), line-draw underline hovers (`.link-line`), Fig. plate numbering (hero = Fig. 01, cards continue via `Catalog.figNumber`).
- Fonts: Fraunces (display, italic = brand voice) + Archivo (body). Accent: tailor's-chalk red (`--accent`, oklch).
- Animations: `.reveal` scroll entrances (staggered `--reveal-delay`), garment `draw` on hover / `garment-autodraw` on mount, the ProductTicker rail. Spring easing `--ease-spring: cubic-bezier(0.23,1,0.32,1)`; micro-transitions 150–300ms. All motion respects `prefers-reduced-motion`.
- **Anti-slop standard (binding)**: every copy/design change passes the tell list in hub `clients\fine-lines\evidence\ai-slop-field-guide-2026-07-23.md` + memory `ai-slop-tells.md`. Removed as codified AI tells — do NOT reintroduce: decorative text marquees, gradient text-shimmer, CTA shimmer sweeps, em-dashes in visible copy, fabricated specifics (invented numbers, fake sales badges), trust claims the code can't back (every stub declares itself honestly). The ProductTicker is the one sanctioned marquee: real catalog items, pauses on hover/focus, reduced-motion fallback.
- Tokens only — never hardcode colors; add to `:root`/`.dark` + `@theme inline`.
- Branding rule: "Created by Neil" appears in the header lockup and footer bottom bar — exactly there, nowhere else.

## Code structure (OOP domain layer — keep it)
- `src/lib/catalog.ts` — `Catalog` class owns ALL product reads (filtering, lookup, Fig. numbers). DB migration later touches only this file.
- `src/lib/bag.ts` — `Bag` class owns ALL cart math (count, subtotal, free-shipping progress; threshold constant lives here).
- Components render values; they never compute domain logic inline. Zustand (`src/lib/cart.ts`) is the thin state container only; cart lines are keyed by product+size (persist version 1).
- Mobile: interactions need a touch path, not just hover (size picker = tap artwork; nav = hamburger panel below `md`).

## Roadmap decisions (researched 2026-07-23 — full report in hub `research-payments-auth-security.md`)
- **Payments: PayMongo hosted Checkout Sessions** (cards + GCash + Maya + QR Ph; Stripe unavailable to PH merchants). Xendit is the fallback behind a provider abstraction. Confirm orders via signed webhook, never the return redirect. Hosted checkout keeps PCI at SAQ A.
- **Auth: Better Auth** (Lucia deprecated; Auth.js in maintenance). Guest checkout must always remain.
- Security baseline: server-side price recomputation, authz in every server action/route (middleware is not the boundary — CVE-2025-29927), Zod on all mutations, rate limits on auth/checkout, HSTS/CSP headers, secrets only in server env.

## Dev
```
npm run dev    # http://localhost:3000
npm run build
```
