# Lifting4Gains Research — Storefront

Ultra-premium, dark-mode storefront for a research-grade peptide line, built for
traffic arriving cold from the @Lifting4Gains TikTok link.

## Stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | Next.js 16 (App Router, React 19, Turbopack)        |
| Styling   | Tailwind CSS v4 — CSS-first config in `app/globals.css` |
| Icons     | `lucide-react` (+ three inlined brand glyphs)       |
| State     | React context + `localStorage` (`lib/cart.tsx`)     |

The whole page prerenders as static HTML — no runtime data fetching, no image
requests, no client-side router work on first paint.

## Commands

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## Structure

```
app/
  globals.css   Design system: @theme tokens, keyframes, @utility layer
  layout.tsx    Fonts, metadata/OG, CartProvider, chrome
  page.tsx      Section composition
components/
  site/         AnnouncementBar · Navbar · CartDrawer · Footer
  sections/     Hero · CredentialStrip · TikTokShowcase · Catalog · TrustCompliance
  product/      ProductCard (tabbed Benefits/Science)
  ui/           MagneticButton · Reveal · CountUp · VialRender · BrandIcons
lib/
  products.ts   Catalog data — single source of truth for the grid + cart
  cart.tsx      Cart context, persistence, drawer state
  utils.ts      cn / currency / compact-number helpers
```

## Design system

Everything visual is a token in `app/globals.css`, so the brand can be retuned
from one file:

- **Surfaces** `bg-obsidian` → `bg-carbon` → `bg-graphite` → `bg-steel` → `bg-ash`
- **Accents** `text-acid` (#00FF66), `text-cyber` (#00E5FF)
- **Utilities** `glass`, `glass-strong`, `border-gradient-acid`, `text-gradient`,
  `text-gradient-acid`, `eyebrow`, `aurora-acid`, `aurora-cyber`, `grid-lines`,
  `grain`, `shimmer`, `mask-edges`, `snap-rail`, `shell`
- **Animations** `animate-rise`, `animate-marquee`, `animate-pulse-glow`,
  `animate-float`, `animate-aurora`, `animate-scanline`, `animate-shimmer`

All motion is disabled under `prefers-reduced-motion`.

## Swapping in real assets

Two components are deliberate, styled stand-ins — replace their bodies and the
surrounding layout will not shift:

- `components/ui/VialRender.tsx` — marked `data-render-slot="product-3d"`.
  Drop in `next/image` renders, `<model-viewer>`, or an R3F canvas.
- Clip tiles in `components/sections/TikTokShowcase.tsx` — marked
  `data-render-slot="tiktok-clip"`. Replace the gradient background with a
  muted, looping `<video poster="…">` or a TikTok oEmbed.

## Wiring the commerce backend

The cart is fully functional client-side; two seams are left open on purpose:

- **Checkout** — `components/site/CartDrawer.tsx`, the *Secure Checkout* button.
  Post `lines` to a Stripe Checkout Session (or Shopify cart) route.
- **Newsletter** — `components/site/Footer.tsx`, the `submit` handler. Point it
  at Klaviyo / Resend / Beehiiv.

## Brand identity

`components/brand/Logo.tsx` holds the whole mark:

- `LogoMonogram` — the L4G glyph, one 16-unit stroke, accent on the 4
- `LogoMark` — the monogram in a hex badge (legible to ~28 px); also `app/icon.svg`
- `LogoLockup` — mark + wordmark + descriptor, used in nav, footer and COA header

`components/brand/VialLabel.tsx` puts that mark on the product. `LabelArtwork`
is the vial-front panel (used inside `VialRender`); `FlatVialLabel` is the full
wrap label as it would go to the label printer — handling data on the left,
brand face in the centre, lot and code block on the right.

## Compliance posture

Copy is written for a **research-use-only** supplier, which is the compliant
framing for these compounds in the US: no dosing guidance, no human-outcome
claims, and research language tied to published literature rather than to
product effects. Disclaimers appear in the announcement bar, under the catalog,
in the trust section, in the cart, and in the footer.

Amino acid sequences, molecular formulas, masses and CAS numbers are literature
values used to build the pages. Lot codes, purity figures, COA results, review
counts and view counts are realistic placeholders. **Replace every one of them
with your synthesizer's actual batch records before launch, and have the final
copy reviewed by counsel.**

GLP-1 analogs (Semaglutide, Tirzepatide) carry materially more regulatory
exposure than the rest of the catalog — they are approved drug substances, and
research-reagent framing is scrutinized far more closely there. Removing them is
a two-line edit in `lib/products.ts` if counsel advises it.
