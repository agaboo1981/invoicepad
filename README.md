# InvoicePad

InvoicePad is a free invoice generator and free invoice maker for freelancers and small businesses. It runs as a Vite React app with static SEO landing pages and AdSense-compliance pages.

## Live Site
- Primary: https://invoicepad.shop
- Portfolio: https://joshuaadesina.vercel.com
- Contact: giganticjoshua@gmail.com

## Project Structure
- App entry: `/tmp/workspace/agaboo1981/invoicepad/index.html`
- React app: `/tmp/workspace/agaboo1981/invoicepad/src`
- Static pages: `/tmp/workspace/agaboo1981/invoicepad/*.html`
- Public assets: `/tmp/workspace/agaboo1981/invoicepad/public`

## Key Pages
### Product + SEO pages
- `/`
- `/freelancer-invoice-generator.html`
- `/consultant-invoice-template.html`
- `/invoice-generator-india.html`
- `/invoice-template-guide.html`
- `/invoice-generator-usa.html`
- `/invoice-generator-uk.html`
- `/invoice-generator-canada.html`
- `/self-employed-invoice-template.html`
- `/hourly-invoice-template.html`
- `/contractor-invoice-generator.html`

### Compliance + trust pages
- `/about.html`
- `/contact.html`
- `/privacy-policy.html`
- `/terms-of-service.html`

## SEO + Compliance Notes
- Canonical, Open Graph, and Twitter metadata are present on all pages.
- Shared OG image: `/og-image.svg`.
- Sitemap includes all product and legal pages: `/sitemap.xml`.
- Robots file references sitemap: `/robots.txt`.
- Footer on app and static pages links to About, Contact, Privacy Policy, Terms of Service, and portfolio.

## Development
```bash
cd /tmp/workspace/agaboo1981/invoicepad
npm install
npm run dev
```

## Validation
```bash
cd /tmp/workspace/agaboo1981/invoicepad
npm run lint
npm run build
```

## Production Deployment
```bash
cd /tmp/workspace/agaboo1981/invoicepad
npm install
npm run build
npm run start
```
The server serves `dist/` on `PORT` (default `8080`). Health check endpoint: `/health`.

## Post-Deploy Verification
1. Open key routes and confirm no 404s.
2. Confirm legal pages are one click away from the homepage footer.
3. Validate metadata with social preview tools (Open Graph + Twitter).
4. Submit `https://invoicepad.shop/sitemap.xml` in Google Search Console.
5. Run URL inspection for newly added legal pages.
6. Run Lighthouse on homepage and important landing pages and track scores over time.
