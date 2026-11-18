# Invoice Pad

A free, client-side invoice generator and tax set-aside helper for freelancers, plus a paid 2027 tax and income organizer (Google Sheets, $19).

No account is required. Invoice and tax drafts stay in the browser. The tax helper produces estimates, not tax advice.

## Product pages

- `/` — home
- `/invoice.html` — free invoice generator (PDF/print)
- `/tax.html` — tax set-aside helper
- `/organizer.html` — 2027 Freelancer Tax & Income Organizer
- SEO landings for free invoice generator, freelance invoice template, 1099 tax organizer, and the 2027 self-employed spreadsheet
- `/about.html`, `/contact.html`, `/privacy.html`, `/terms.html`

## Stack

Vite + vanilla TypeScript, static multi-page build. See `docs/SYSTEM_DESIGN.md` and `docs/ARCHITECTURE.md`.

## Development

```bash
npm install
npm test
npm run dev
```

```bash
npm run build
npm start
```

`npm start` serves `dist/` on `PORT` (default 8080) and exposes `/health` for Node hosts.

## Configuration

Copy `.env.example` to `.env` if you need to change values:

- `VITE_SITE_URL` — canonical origin (default `https://invoicepad.shop`)
- `VITE_PAYMENT_URL` — off-site checkout link for the organizer; leave empty to keep the Buy button as a placeholder

## Contact

giganticjoshua@gmail.com
