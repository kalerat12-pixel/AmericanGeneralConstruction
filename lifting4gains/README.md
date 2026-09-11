# Lifting4Gains

A lifter-run storefront for Ghost Energy. Flavor rankings, build-your-own
variety packs, and wholesale pricing for gym owners — the home base for the
`@lifting4gains` audience.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase · Stripe

---

## Run it

```bash
npm install && npm run dev
```

That's the whole setup. No environment variables, no database, no API keys —
the app ships with its full catalog bundled as TypeScript and runs in
**affiliate mode** by default. Open http://localhost:3000.

To rebuild the generated artwork and the SQL seed after editing the catalog:

```bash
npm run setup     # install + regenerate can art + regenerate seed.sql
```

### Checks

```bash
npm run check       # typecheck + lint + production build
npm run check:a11y  # axe-core (WCAG 2.1 AA) across all 15 routes
npm run check:e2e   # cart, subscribe-and-save, bundle pricing, checkout, forms
```

Both check scripts need the app running (`npm run build && npm start`) and use
the Chromium that Playwright already has installed.

---

## The two business models

The whole store is built to run as an **affiliate shop now** and flip to
**real inventory later by changing one variable** — not by rewriting the app.

```bash
NEXT_PUBLIC_COMMERCE_MODE=affiliate   # default
NEXT_PUBLIC_COMMERCE_MODE=inventory
```

| | `affiliate` | `inventory` |
|---|---|---|
| Cart & bundle builder | Work normally | Work normally |
| Product page CTA | Add to cart **+** "Buy direct at retailer" | Add to cart |
| Checkout | Records the order, hands back tagged outbound links | Stripe Checkout (payment or subscription) |
| Shipping | "At retailer" | Free over $50, else $6.99 |
| Disclosure | Affiliate notice in footer, cart and PDP | Hidden |
| Outbound links | `rel="nofollow sponsored"`, `?ref=` tag | — |

Everything downstream reads `commerce.isAffiliate` / `commerce.takesPayment`
from [`src/lib/config.ts`](src/lib/config.ts). No component branches on the raw
env var, so adding a third model later is a change in one file.

**`NEXT_PUBLIC_*` variables are inlined at build time.** After changing the mode
you must restart `npm run dev` or re-run `npm run build`. If you change it and
nothing happens, that's why.

### Switching to inventory for real

1. Set `NEXT_PUBLIC_COMMERCE_MODE=inventory`.
2. Add `STRIPE_SECRET_KEY` (test mode: `sk_test_…`) and `STRIPE_WEBHOOK_SECRET`.
3. Point `NEXT_PUBLIC_SITE_URL` at your real origin — Stripe redirects back to it.
4. Rebuild.

Without a Stripe key, inventory mode **simulates** checkout end to end (order
recorded, success page shown with a visible "simulated" notice) so the flow
stays demonstrable. Prices are always recomputed server-side from the catalog;
a total posted by the browser is never trusted.

Webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Orders are marked `paid` by the webhook, never by the success redirect — a
shopper can reach that URL without paying.

---

## Environment variables

Every variable is optional. See [`.env.example`](.env.example) for the
annotated list.

| Variable | Default | What it does |
|---|---|---|
| `NEXT_PUBLIC_COMMERCE_MODE` | `affiliate` | The business-model switch above |
| `NEXT_PUBLIC_AFFILIATE_TAG` | `lifting4gains` | `?ref=` value on outbound links |
| `NEXT_PUBLIC_AFFILIATE_BASE_URL` | retailer search URL | Where outbound links point |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URL, sitemap, Stripe redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | — | Enables database-backed catalog |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | Public reads (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Server-only writes. Bypasses RLS |
| `STRIPE_SECRET_KEY` | — | Real Stripe Checkout in inventory mode |
| `STRIPE_WEBHOOK_SECRET` | — | Verifies webhook signatures |

---

## Data

The catalog lives in [`src/lib/data/`](src/lib/data/) as typed TypeScript —
19 products (16 Ghost Energy flavors + 3 caffeine-free Hydration), 70 pack
variants, 16 ranked entries and 30 reviews, all with written copy.

Every read goes through [`src/lib/repository.ts`](src/lib/repository.ts), which
returns Supabase rows when configured and the bundled catalog otherwise. Both
paths return identical shapes, so the site behaves the same either way.

### Setting up Supabase

```bash
supabase db push                            # applies supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/seed.sql   # or paste into the SQL editor
```

`supabase/seed.sql` is **generated** from the TypeScript catalog by
`npm run db:seed-sql`, so the database and the zero-config local data can't
drift apart. Don't hand-edit it — edit `src/lib/data/*.ts` and regenerate.

RLS is enabled on all ten tables:

- **Catalog** (flavors, products, variants, rankings) — public read, service-role write.
- **Reviews** — only `approved = true` rows are public; anyone may submit, unapproved. Stops the product pages becoming a spam target the day a video lands.
- **Newsletter signups, partner leads** — insert-only from the client, never publicly readable.
- **Orders and order items** — a signed-in customer sees only their own rows. Guest orders are reachable only via the service role.
- **Referral codes** — active codes are readable so checkout can validate one.

### Verify the flavor lineup before launch

Flavor **names** are real Ghost products; everything else (tasting notes,
rankings, pairings, reviews) is this shop's own editorial. Nutrition is limited
to figures we're confident in (200mg caffeine, zero sugar, 10 cal) — functional
ingredients are listed by name with **no invented milligram counts**.

Ghost's lineup rotates. Re-check it against the manufacturer's current range
before going live, particularly the three Hydration SKUs, which are the least
certain entries in the catalog.

---

## Imagery

There is no third-party photography in this repo. Nothing is hotlinked and
none of Ghost's product photography is reproduced.

- **Cans** (`public/cans/*.svg`) — generated, generic vessel, no Ghost trade dress, the word `PLACEHOLDER` across the label.
- **Editorial plates** (`public/editorial/*.svg`) — generated duotone gym silhouettes with film grain.

Both are produced by `npm run art` and both are swappable for real assets
without touching a component — see
[`public/editorial/README.md`](public/editorial/README.md) for the shot list.

---

## Deploying to Vercel

```bash
vercel            # link the project
vercel --prod
```

Set the environment variables above in the Vercel dashboard, then point the
Stripe webhook endpoint at `https://<your-domain>/api/webhooks/stripe` and put
its signing secret in `STRIPE_WEBHOOK_SECRET`.

The root directory is `lifting4gains/` if you're deploying from the repo root.

---

## Legal position

This is an **independent retailer**. Nothing on the site implies a partnership,
sponsorship or endorsement by Ghost. That position is enforced in three places:

- A trademark and independence notice in the site footer (`src/lib/config.ts`).
- A direct "Are you sponsored by Ghost?" answer on the About page.
- A caffeine advisory on every product page — 200mg per can, the 400mg daily
  guidance, who shouldn't drink it, and a warning to check your pre-workout
  label before stacking. Caffeine-free products get their own version.

Affiliate disclosure appears in the footer, on product pages and in the cart
whenever affiliate mode is on, and every outbound link is
`rel="nofollow sponsored"`.

---

## Accessibility & performance

`npm run check:a11y` reports zero axe violations (WCAG 2.1 A + AA) across all
15 routes at both 390px and 1440px. Specifically:

- Palette contrast is verified, not assumed: body text 17.4:1, secondary 6.6:1,
  tertiary 5.0:1, accent 8.6:1. Interactive borders use a dedicated
  `--color-line-input` token at 3.4:1 to satisfy WCAG 1.4.11.
- Semantic landmarks, a skip link, visible focus rings, `aria-current` on nav,
  labelled form controls with `aria-describedby` hints, and live regions on the
  cart count, filter results and bundle total.
- Star ratings and taste meters are SVG with real text labels, not icon fonts
  or emoji.
- All motion is a single fade-and-rise, fully disabled under
  `prefers-reduced-motion`.

Performance: 42 of 44 routes prerender as static HTML. Fonts are self-hosted by
`next/font`. Images are `next/image` with explicit `sizes`, lazy below the fold.
No client-side data fetching on any page, and no JavaScript on the fully static
pages beyond the header and cart.

---

## Project layout

```
src/
  app/                     routes (App Router)
    api/                   checkout, newsletter, partners, stripe webhook
    product/[slug]/        19 prerendered product pages
  components/
    site/                  header, footer, email capture, legal shell
    product/               card, buy box, reviews, caffeine advisory, can image
    shop/ bundles/ cart/ partners/
    ui/                    reveal, stars, meter, eyebrow, editorial image
  lib/
    config.ts              ← the commerce-mode switch
    data/                  catalog, rankings, reviews, FAQ
    repository.ts          Supabase-or-bundled reads
    pricing.ts             cart totals, bundle tiers, wholesale tiers
    cart/CartContext.tsx   localStorage cart
    orders.ts              server-side re-pricing and order recording
supabase/
  migrations/0001_init.sql schema + RLS
  seed.sql                 GENERATED — npm run db:seed-sql
scripts/
  generate-art.ts          all imagery
  generate-seed-sql.ts     TypeScript catalog → SQL
  checks/                  a11y and e2e suites
```

See [`DESIGN_NOTES.md`](DESIGN_NOTES.md) for the design decisions and the
assumptions made while building this.
