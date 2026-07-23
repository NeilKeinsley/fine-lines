# Fine Lines

*Clothing cut with intention. — Created by Neil*

An editorial e-commerce storefront built with Next.js 16, Tailwind v4, and a design language where the brand name is taken literally: hairline rules, self-drawing garment line art, and underline animations that draw themselves.

## Features
- 🌗 Light/dark theme changer (class-based, system-aware, animated toggle)
- 🧵 Stroke-drawn SVG product art that redraws in accent color on hover
- 🛍️ Persistent shopping bag (zustand + localStorage) with slide-in drawer, quantity controls, and a free-shipping progress line
- 🏷️ Category-filtered product grid with staggered scroll reveals
- 🔐 Sign in / create account UI (Better Auth wiring planned; guest checkout stays)
- 💳 Payments roadmap: PayMongo hosted checkout — cards, GCash, Maya, QR Ph

## Run
```
npm install
npm run dev
```

Design/animation references: 21st.dev (motion system), Zalora PH (e-commerce IA).
Research + project docs live in the Web Integrations hub (`clients/fine-lines/`).
