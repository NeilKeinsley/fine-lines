<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fine Lines — storefront repo

Editorial e-commerce clothing store (placeholder catalog). Part of the Rev-Box **Web Integrations** knowledge base — hub artifacts live in `D:\Work Files\Rev-Box\Web Integrations\clients\fine-lines\` (checklist, worklog, research, evidence).

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 (`@theme inline` tokens in `src/app/globals.css`)
- `next-themes` (class strategy, `html.dark`) for light/dark; `zustand` + persist for the cart (`fine-lines-cart` in localStorage)
- No backend yet — products are static data in `src/lib/products.ts`

## Design system (do not drift from this)
- **Identity: "fine lines" literally** — hairline rules (`--line`), stroke-drawn garment SVGs (`src/components/garment-art.tsx`), line-draw underline hovers (`.link-line`).
- Fonts: Fraunces (display, italic = brand voice) + Archivo (body). Accent: tailor's-chalk red (`--accent`, oklch).
- Animations (21st.dev-derived): `.reveal` scroll entrances (staggered `--reveal-delay`), `.text-shimmer`, `.btn-shimmer`, garment `draw` on hover / `garment-autodraw` on mount, marquee ticker. Spring easing `--ease-spring: cubic-bezier(0.23,1,0.32,1)`; micro-transitions 150–300ms. All motion respects `prefers-reduced-motion`.
- Tokens only — never hardcode colors; add to `:root`/`.dark` + `@theme inline`.
- Branding rule: logo lockup and footer must keep the "Created by Neil" credit.

## Roadmap decisions (researched 2026-07-23 — full report in hub `research-payments-auth-security.md`)
- **Payments: PayMongo hosted Checkout Sessions** (cards + GCash + Maya + QR Ph; Stripe unavailable to PH merchants). Xendit is the fallback behind a provider abstraction. Confirm orders via signed webhook, never the return redirect. Hosted checkout keeps PCI at SAQ A.
- **Auth: Better Auth** (Lucia deprecated; Auth.js in maintenance). Guest checkout must always remain.
- Security baseline: server-side price recomputation, authz in every server action/route (middleware is not the boundary — CVE-2025-29927), Zod on all mutations, rate limits on auth/checkout, HSTS/CSP headers, secrets only in server env.

## Dev
```
npm run dev    # http://localhost:3000
npm run build
```
