# Invoice Pad architecture

## Tech choice

**Vite + vanilla TypeScript, multi-page static build.**

React is not used. The previous app was a template SPA; this product is forms, money math, and content pages. Vanilla TS keeps the bundle small, the document in HTML for SEO, and the dependency list short. Vite provides a fast dev server and a static `dist/` with one HTML entry per route. Vitest covers calculation modules. Playwright covers real UI and responsive screenshots.

Alternatives rejected: keeping React (heavier, encourages a SPA), a meta-framework (unnecessary backend and cost), and raw static HTML without a bundler (worse TS, tests, and shared CSS).

## Folder structure

```
docs/                  system design and this file
partials/              shared HTML (head, header, footer) inlined at build
public/                robots.txt, sitemap.xml, favicon, og image
src/
  config.ts            site URL, payment placeholder, product price
  lib/                 pure modules: money, invoice, tax, storage, id — no DOM
  ui/                  header/footer enhancement, invoice app, tax app
  styles/              design tokens, base, layout, invoice paper, print
  pages/               thin entry scripts per tool page
tests/                 Vitest unit tests for lib/
scripts/               Playwright screenshot and smoke script
server.js              optional static + /health server for Node hosts
*.html                 one document per public URL
```

## Module boundaries

- `src/lib` must not import `document`, `window` (except storage, which receives a `Storage`-like object), or CSS. This is the tested core.
- `src/ui` binds the DOM to lib functions. It does not reimplement tax or invoice math.
- `src/pages` only boots a page (query the root, call a mount function).
- `src/config.ts` is the only place for site URL, price, and payment href.
- Partials are the only shared chrome. Do not copy header markup by hand into pages.
- The optional `server.js` may only serve files and `/health`. No redirects that collapse content URLs.

## Coding standards

- TypeScript `strict`, `noUncheckedIndexedAccess`, no `any`, named exports
- Money is integer minor units (cents). Convert at the UI edge. Never accumulate floats.
- Prefer small, pure functions with explicit types over classes
- localStorage keys are prefixed `invoicepad:` and values are versioned
- Accessibility is required, not polished later: labels, skip link, visible focus, keyboard, `prefers-reduced-motion`, contrast
- Copy is sentence case, specific, and honest. No fake social proof
- Comments only for non-obvious intent (rounding rules, tax disclaimer placement)

## Testing strategy

1. **Unit (Vitest, first):** invoice totals (empty, discount, exclusive/inclusive tax, fractional quantities, rounding) and tax set-aside (profit, loss, rate clamp, quarterly and two-instalment splits). Write the failing test before the implementation.
2. **Typecheck:** `tsc --noEmit`.
3. **UI (Playwright):** load home, invoice, tax, and organizer; smoke the invoice total and tax estimate on screen; screenshots at 375px, 768px, and 1280px to `/workspace/bond/invoicepad-shots/`.
4. **Build:** `npm run build` produces the static site with unique titles and a valid sitemap.

## Accessibility

- Semantic landmarks, one `h1` per page, skip-to-content
- Every input has a visible label; errors and totals use `aria-live` where values change
- Focus ring uses the brand teal on a light ground; do not remove outlines
- Hit targets at least 44px on primary actions; forms usable on a phone
- Color is not the only signal (loss state, required fields)
- `prefers-reduced-motion: reduce` disables non-essential motion

## Performance budget

- Invoice and tax tool JS: under 40 KB gzipped per page (no React, no jsPDF)
- At most two font families, `font-display: swap`, preconnect
- No JS on legal/SEO pages beyond a tiny shared CSS (and no tracker)
- LCP is the page heading or the paper invoice, not a banner ad or web font flash
- Images: SVG brand/OG only unless a user-supplied logo is in localStorage

## Responsive breakpoints

- **Base (≤639px / verify at 375):** single column, form first, paper preview below, sticky action bar for Print and totals
- **Tablet (640–1023 / verify at 768):** wider form, preview still stacked or modest two-up if space allows
- **Desktop (≥1024 / verify at 1280):** form and live paper side by side; paper stays in view while editing

## Design tokens (frontend-design)

Visual idea: a carbon-copy invoice pad on a cool office desk — a teal stub and paper form, not a SaaS card grid.

| Token    | Hex     | Role                          |
|----------|---------|-------------------------------|
| desk     | `#E6EBEF` | page background             |
| paper    | `#FBFCFC` | documents, surfaces         |
| ink      | `#1C3A52` | primary text                |
| ink-soft | `#4A6576` | secondary text              |
| stub     | `#0E5C63` | brand spine, primary buttons|
| rule     | `#D3DCE1` | lines and borders           |
| wash     | `#E7F1F0` | totals highlight            |
| rust     | `#9A3412` | tax set-aside emphasis      |

- Type: **Syne** (wordmark and display) + **Atkinson Hyperlegible** (UI, body, and figures)
- Layout is left-aligned. The memorable object is the paper invoice itself
- Avoid generic AI-template tells (cream + terracotta, acid-green on black, identical rounded cards, all-caps eyebrows, middle-dot meta rows)

## Deployment note

Build output is static (`dist/`). `npm start` can serve it for a Node host. Do not change production settings on `main`; this architecture ships on the `rebuild` branch until the owner decides the domain and host.
