# LIFTING4GAINS — storefront

A luxury e-commerce storefront for a research peptide company, built with
Next.js 14 (App Router), TypeScript and Tailwind.

The commercial arm of the TikTok channel [@lifting4gains](https://www.tiktok.com/@lifting4gains).
The handle is the trust anchor; the design system deliberately stays coastal,
marble and calm. There is no lifting or gym imagery anywhere — that
association lives in the name and the founder section only.

> The previous American General Construction static site is preserved
> unchanged in [`legacy-site/`](./legacy-site).

---

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

| Script | What it does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm run gen:brand` | Rebuilds the logo lockups, favicon, apple-touch-icon and OG image |
| `npm run gen:assets` | Rebuilds the generated stone/light plates and product images |
| `npm run gen:blur` | Regenerates `lib/blur-data.ts` (next/image blur placeholders) |
| `npm run gen:coa` | Rebuilds the placeholder certificate PDFs |
| `npm run fetch:photos` | Downloads the real Unsplash photography — see [Images](#images) |
| `npm run audit:a11y` | axe-core sweep over every route at 1440px and 375px |
| `npm run audit:lighthouse` | Lighthouse accessibility / SEO / best-practices |
| `npm run audit:keyboard` | Age-gate focus trap, tab order, cart flow, reduced motion |

The audit scripts expect the site running on `localhost:3100`
(`npx next start -p 3100`) and Playwright's Chromium; set `CHROME_PATH` if
your browser lives somewhere non-standard.

Set `NEXT_PUBLIC_SITE_URL` in production — canonical URLs, OpenGraph, the
sitemap and JSON-LD all read from it (`lib/utils.ts`).

---

## Editing the catalogue

Everything lives in [`data/products.ts`](./data/products.ts). Add, remove or
reorder entries and the shop grid, product pages, COA archive, sitemap and
JSON-LD all follow. Categories (`Recovery`, `Metabolic`, `Cosmetic`,
`Cognitive`) are generic on purpose so a real catalogue can slot in.

Each product needs two images — the second is the card's hover swap — at 4:5,
around 1200×1500. Drop them in `/public/images` and run `npm run gen:blur`.

**Copy rules are compliance constraints, not style preferences.** Descriptions
stay factual and chemical: sequence, class, form, handling. No therapeutic,
medical, dosing or outcome claims anywhere.

---

## Compliance scaffolding

| Piece | Where |
| --- | --- |
| Age verification modal, gated on `localStorage`, first visit only | `components/compliance/age-gate.tsx` |
| "Research Use Only" bar, block and inline variants | `components/compliance/ruo-notice.tsx` |
| Full disclaimer block in the footer, on every page | `components/layout/footer.tsx` |
| RUO notice on every product page | `app/shop/[slug]/page.tsx` |
| Attestation checkbox on the order request | `components/cart/order-request-form.tsx` |
| Terms of Sale, Privacy, Shipping & Returns | `app/terms`, `app/privacy`, `app/shipping-returns` |

The age gate cannot be dismissed with Escape or an overlay click — only by
answering. Declining shows a stop message rather than closing.

---

## Cart and checkout

Cart state is Zustand with `persist` to `localStorage` (`lib/cart.ts`). The
store exposes a `hydrated` flag so the cart page renders a quiet placeholder
instead of flashing empty before rehydration.

**There is no backend.** Checkout is a "Request Order" flow: the form
assembles a payload, logs it, shows a reference number and clears the cart.
Swap the `submit` handler in `components/cart/order-request-form.tsx` for a
`fetch` when an endpoint exists — the `payload` shape is the contract. The
contact and newsletter forms are stubbed the same way.

---

## Design system

Tokens live in `tailwind.config.ts` and `app/globals.css`.

**Palette** — warm alabaster `#F7F4EF` and bone `#EDE7DE` as grounds;
charcoal `#1C1A17` and midnight `#14181F` for contrast; champagne `#C9A961`
for hairlines, thin rules and small-caps labels; pale sage `#A8B5A6` for tags.

Champagne at 11px on a light ground only reaches 2:1, so `.eyebrow` and badge
text resolve a `--gold-text` variable: a deeper cut (`#7A5F1C`, 5.5:1) on
light, and the full `#C9A961` (7.9:1) inside `.on-dark`. Use `.text-gold` and
`.hover-gold` for gold *text*; `text-champagne` stays for hairlines and
decorative icons.

**Type** — Cormorant Garamond Light (300) for display, Inter 400/500 for body
and UI, both self-hosted via `next/font`. Cormorant defaults to old-style
figures, which turn `TB-500` into `TB-5oo`; display type sets
`font-variant-numeric: lining-nums`. Pair `lining-nums` with `tabular-nums`
when both are needed — Tailwind's numeric utilities clear each other.

**Sections** — `.section` (120px desktop padding), `.container-content`
(1280px max), `Rule` for hairline dividers, `SectionHeading` for the
eyebrow → rule → display headline → lede pattern.

**Texture** — `.texture-marble`, `.texture-travertine` and `.texture-linen`
paint a generated stone tile at 7–11% behind light sections. Felt, not seen.

**Motion** — `FadeUp`, `Stagger`, `Parallax` in `components/motion.tsx`.
600ms, `cubic-bezier(0.22,1,0.36,1)`, once, no spring or bounce.

> These components never swap between a motion element and a plain one.
> `useReducedMotion()` resolves to `null` on the first render and to a boolean
> after; swapping element types across that flip leaves React reusing the DOM
> node while framer's imperative `style="opacity:0"` stays behind, and the
> content is invisible forever. Only the animation props change.

`cn()` in `lib/utils.ts` extends tailwind-merge so it knows `text-eyebrow` and
`text-display-*` are font sizes — without that it silently drops them when a
`text-<colour>` class follows in the same call.

---

## Brand assets

`scripts/generate-brand.ts` builds everything in `/public/brand` from the
Cormorant Garamond outlines, so the lockups carry no font dependency:

- `wordmark-{light,dark}.svg` — horizontal wordmark
- `stacked-{light,dark}.svg` — monogram over wordmark
- `monogram-{light,dark}.svg` — monogram alone, stationery padding
- `monogram-tight-{light,dark}.svg` — tight crop, used for the icons
- `og-default.png` — 1200×630
- `app/favicon.ico` (16/32/48), `app/icon.png`, `app/apple-icon.png`

The monogram is hand-drawn geometry: thin-stroke serif L, 4 and G on a shared
baseline, with a hairline champagne rule beneath. `components/brand/wordmark.tsx`
draws it inline so it inherits `currentColor`.

Two rendering notes, both learned the hard way: librsvg mis-parses several
glyph outlines concatenated into one `d` attribute, so each letter gets its own
`<path>`; and it drops hairlines when rasterising straight to a small size, so
every raster is rendered at 4× and resampled down.

---

## Images

Photography is specified as Unsplash. **The files currently in
`/public/images` and `/public/textures` are not Unsplash photographs** — the
environment this was built in had no network egress to `images.unsplash.com`
(or any other photo CDN), so `scripts/generate-assets.ts` synthesises them:
procedural marble, travertine, linen, coastal light and plaster-light plates
in the brand palette, plus the product vial plates.

To swap in the real frames, from a machine that can reach Unsplash:

```bash
npm run fetch:photos     # optionally: UNSPLASH_ACCESS_KEY=... npm run fetch:photos
npm run gen:blur
```

The script writes to the same filenames, so no component or data change is
needed. [`CREDITS.md`](./CREDITS.md) lists every shortlisted photograph with
its photographer and Unsplash URL, and flags what is generated rather than
sourced. The founder portrait at `/public/images/founder-portrait.jpg` is a
designed placeholder — replace it with a real portrait at 3:4.

---

## Quality

Verified on the production build:

- **Lighthouse accessibility 100** on `/`, `/shop`, a PDP, `/quality`,
  `/about`, `/faq`, `/contact`, `/cart` and `/terms`. SEO and best-practices
  100 on all of them except `/cart`, which is deliberately `noindex`.
- **Zero axe-core violations** (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`,
  `best-practice`) across 12 routes at 1440px and 375px.
- Keyboard-navigable throughout: skip link, visible champagne focus rings,
  the age gate traps focus, the product card's image swap fires on focus as
  well as hover.
- Responsive at 375 / 768 / 1440.
- Product and BreadcrumbList JSON-LD on every PDP, Organization on the home
  page, FAQPage on `/faq`. Per-page canonical, OpenGraph and Twitter tags.
- Certificates are placeholder PDFs generated by `npm run gen:coa`; replace
  the files in `/public/coa` with the real certificates as they are issued.
