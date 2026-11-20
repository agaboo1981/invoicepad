# Deploy Invoice Pad

Canonical site: `https://invoicepad.shop`

Do not merge `rebuild` into `main`, and do not change the live `invoicepad.pxxl.click` deploy, until the Gumroad link is set and you have approved the merge.

## Set the Gumroad checkout link

The Buy button on `/organizer.html` is controlled by one Vite environment variable, read in `src/config.ts`:

- `VITE_PAYMENT_URL` — the public Gumroad product URL (for example `https://yourname.gumroad.com/l/your-product`).
- Leave it empty to keep the button in a “Coming soon” state. No checkout starts on Invoice Pad itself.

Because this is a `VITE_` variable, it is baked into the static build. Changing the link later means setting the variable, running `npm run build`, and redeploying.

Locally:

```bash
cp .env.example .env
# Edit .env:
# VITE_SITE_URL=https://invoicepad.shop
# VITE_PAYMENT_URL=https://YOUR-GUMROAD-PRODUCT-URL
npm run build
```

On the host, set the same two variables in the project’s environment, then build. Do not commit `.env` (it is gitignored). `.env.example` documents the names only.

Also keep:

- `VITE_SITE_URL=https://invoicepad.shop` (no trailing slash). This is used for canonical URLs, Open Graph tags, `sitemap.xml`, and `robots.txt`.

## Deploy to Cloudflare Pages (recommended, free)

1. In Cloudflare: Workers & Pages → Create → Pages → Connect to Git, and select `agaboo1981/invoicepad`.
2. Build settings:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main` (use this only after the merge is approved)
   - For a temporary preview, you can build the `rebuild` branch, but do not attach `invoicepad.shop` until production is on the approved branch.
3. Environment variables (Production, also Preview if you test checkout there):
   - `VITE_SITE_URL` = `https://invoicepad.shop`
   - `VITE_PAYMENT_URL` = your Gumroad product URL
4. After the first Pages deploy, Cloudflare will give a `*.pages.dev` URL. Use that to confirm the Buy button opens Gumroad.

### DNS for invoicepad.shop

In the Pages project, add a custom domain: `invoicepad.shop`, and optionally `www.invoicepad.shop`. Then add the records Cloudflare shows in the dashboard — do not invent IP addresses.

Typical setup when the domain’s DNS is on Cloudflare:

- Apex (`invoicepad.shop`): a flattened CNAME to `<project>.pages.dev`
- `www`: a CNAME to `<project>.pages.dev`
- Redirect `www` to the apex (or the other way around) so the live hostname matches the canonical URL `https://invoicepad.shop`

If DNS is still at another registrar, either move the nameservers to Cloudflare, or add the exact CNAME / ALIAS / A / AAAA records the Pages custom-domain screen lists. Then wait for SSL to become active.

Cloudflare Pages will serve `404.html` for unknown paths.

## Alternative hosts

`npm run build` produces a static site in `dist/`. Any static host can serve that folder.

For a Node host (including the current Pxxl site): `npm run build` then `npm start`. That serves `dist/` on `PORT` (default 8080) and exposes `/health`. After `invoicepad.shop` is live, you can leave or later redirect `invoicepad.pxxl.click`.

## Checklist before the public launch

- [ ] Gumroad product is published at $19, with the `.xlsx` file attached
- [ ] `VITE_PAYMENT_URL` is set to that Gumroad URL, the site is rebuilt, and Buy opens checkout
- [ ] `rebuild` is merged to `main` only after you approve it
- [ ] `invoicepad.shop` DNS points at the new host and HTTPS works
- [ ] Canonical URLs on the live site still say `https://invoicepad.shop`
