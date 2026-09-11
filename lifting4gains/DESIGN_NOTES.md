# Design decisions & assumptions

Everything here was a judgement call. Where a call could reasonably have gone
the other way, the reasoning is stated so you can overrule it.

---

## The one accent colour

**Ember amber `#e2a03f`.** Chosen over the oxblood and steel-blue options
because the audience skews young and the base is near-black — a warm accent
reads as energy without needing the neon gradients the brief rules out, and it
clears 8.6:1 contrast on the base, which oxblood could not have done at a
readable weight.

It appears on: primary CTAs, the accent word in each headline, rank numerals,
the "knock" rule on rankings, active filter chips, subscriber savings, and
hover states. That's roughly 3–4% of painted surface. Nothing else is coloured.

Supporting tokens — all verified, not eyeballed:

| Token | Hex | On base |
|---|---|---|
| `bone` (body text) | `#f4f2ee` | 17.4:1 |
| `ash` (secondary) | `#9b9690` | 6.6:1 |
| `ash-dim` (tertiary, legal) | `#85817a` | 5.0:1 |
| `ember` (accent) | `#e2a03f` | 8.6:1 |
| `line-input` (interactive borders) | `#656570` | 3.4:1 |

`ash-dim` started at `#6c6862` and measured 3.5:1 — below AA for the footer
legal text it was used on. It was lightened until it passed. `line-input`
exists because the decorative hairline (`#232327`, 1.2:1) is right for dividing
panels but fails WCAG 1.4.11 on form fields and buttons, which need 3:1.

### Per-flavor can tones

The cans carry a duotone, which is the one place colour varies. Every tone is
deliberately dark and desaturated, and `CanImage` applies `saturate(0.78)` on
top. Citrus, Tropical Mango and Orange Cream were re-toned during the build
because their original ambers read as brand colour and diluted the accent.

## Typography

**Archivo** for headlines, **Inter** for body. Archivo is a tight grotesk that
holds up at `-0.04em` tracking in the very large sizes the brief asks for;
Inter does the reading work. Both self-hosted via `next/font` — no
render-blocking request, no layout shift. Poppins and Montserrat avoided as
instructed.

The hero scale was initially `clamp(3.25rem, 13vw, 11rem)`. On a 1440px screen
that pushed the CTAs and stat row below the fold and the composition stopped
reading as one thing. It was pulled back to `clamp(2.75rem, 9vw, 7.5rem)` —
still very large, now with the whole hero legible in one screen at both 390px
and 1440px.

## Motion

One effect: a 700ms fade-and-rise on scroll via IntersectionObserver, plus
smooth colour and border transitions on hover. No parallax, no counters, no
bounce. Disabled in CSS *and* in JavaScript under `prefers-reduced-motion`.

The one exception is the community marquee, which is a continuous CSS
translation. It also stops entirely under reduced motion.

---

## Photography — the biggest compromise

**The brief asked for gritty Unsplash gym photography. This session's network
policy blocks `unsplash.com` and `images.unsplash.com`, so there was no
licensed photo source available.**

Rather than fabricate photography or hotlink something we don't have rights to,
the site ships with generated duotone editorial plates — barbell, plates, rack
uprights, chalk dust — authored as SVG with film grain and a key light. They
read as intentional art direction rather than missing images, and they hold the
full-bleed sections the layout needs.

They are built to be thrown away. `EditorialImage` takes an `ext` prop; drop a
real `.jpg` in `public/editorial/` and pass `ext="jpg"`. `public/editorial/README.md`
carries the shot list, with the direction for each slot.

**This is the first thing to replace before launch.** Real photography will lift
this site more than any other single change.

## Product imagery

Deliberately a clearly-labelled placeholder, per the brief. A generic can —
no Ghost trade dress, no attempt to imitate their design — with the word
`PLACEHOLDER` set across the label in the accent colour, and the flavor name,
volume, caffeine and sugar on it so the card still communicates. The PDP states
in plain text that the image is a placeholder and that we don't reproduce
Ghost's photography.

---

## Commerce architecture

**One switch, read in one file.** `COMMERCE_MODE` lives in `src/lib/config.ts`
and every component asks `commerce.isAffiliate` / `commerce.takesPayment`.
Nothing else reads the env var. Flipping to real inventory is a config change
and a rebuild.

The decision worth flagging: **the cart works in both modes.** The obvious
affiliate build is "every button is an outbound link, no cart" — but that
throws away the bundle builder, which is the most distinctive thing on the
site, and it makes the eventual switch to inventory a rewrite. So the cart and
the bundle builder are always real; only the *final step* differs. In affiliate
mode checkout records the order and returns tagged outbound links; in inventory
mode the identical cart goes to Stripe.

Other calls:

- **Prices are always recomputed server-side** in `src/lib/orders.ts` from the catalog. A price posted by the browser is ignored.
- **Orders are marked paid by the Stripe webhook**, never the success redirect, which anyone can navigate to.
- **Referral use is counted on payment**, not at checkout start, so abandoned carts don't credit a gym.
- **No Stripe key in inventory mode simulates checkout** rather than erroring, so the flow is demonstrable on a fresh clone. The success page says so, visibly.
- **Bundle lines enter the cart as single cans at the quoted tier price**, so the builder and the cart can never disagree about the total.
- **Affiliate links are retailer *search* URLs**, not guessed deep links. A search URL can't 404; an invented product path can. Replace with real deep links via `NEXT_PUBLIC_AFFILIATE_BASE_URL`.

## Account and order history

Built without forcing account creation. `/account` reads orders recorded in the
browser's own storage, and the schema supports `auth.users` with RLS for when
you add Supabase Auth. Guest order lookup is by reference through support.

Assumption: for a TikTok-driven shop, a mandatory sign-up before checkout costs
more conversions than it's worth. Easy to change — the orders table already has
a `user_id` column and policies.

---

## Content

**No lorem ipsum anywhere.** Every product page, ranking entry, review, FAQ
answer and legal paragraph is written for lifters.

Deliberate choices in the copy:

- **Every ranking entry has a "knock"** — the honest downside, including for the top-ranked flavor. A ranking where everything is great is an ad.
- **Two of the 16 ranked flavors sit in the bottom tier and we sell both.** Stated on the About page as the proof that placement isn't for sale.
- **Seeded reviews include 2- and 3-star entries** with specific complaints. An all-five-star product page reads as fake and converts worse.
- **Reviews carry training context** ("Powerlifting, 6 yrs") rather than just a name, because that's what makes a take credible to this audience.
- **The FAQ answers the caffeine-stacking question honestly**, including the arithmetic that gets people over 500mg.

The nutrition panel lists functional ingredients **by name with no milligram
counts**, because those numbers couldn't be verified. Caffeine, sugar and
calories are stated; everything else is named only. Each panel says
formulations change and to read the can.

## Assumptions made

1. **Prices are invented but plausible** — $3.79 a single, $34.99 a 12-pack, $2.71/can at 24, wholesale $2.49 down to $1.89. Replace with real numbers before launch. They live in `src/lib/data/products.ts` and `src/lib/pricing.ts`.
2. **Business details are placeholders** — "Fort Wayne garage gym", the 2023–2026 timeline, `crew@lifting4gains.com`, "Marcus" as the ranking author. All in `src/lib/config.ts` and the About page.
3. **US-only shipping, 2–4 day delivery, 14-day returns, $50 free-shipping threshold.** Stated as policy across FAQ, terms and the shipping page — change all three together.
4. **The Hydration line is the least certain data in the catalog.** It's included because the brief asked for a caffeine filter, and a filter needs real range — every energy SKU is 200mg. Verify those three SKUs, or delete them and drop the caffeine filter to a single value.
5. **Legal pages are written to be readable, not to be filed.** They're a solid starting draft and they're honest, but they are not legal advice and should be reviewed by someone qualified before you take money.
6. **The rankings' authority is asserted, not earned yet.** The method section describes a process ("three sessions minimum, drunk cold, in a gym"). Make sure that's actually what you do.

## Not built

- **Supabase Auth** — schema, RLS policies and `user_id` are in place; no sign-in UI. `/account` works from browser storage instead.
- **A Vercel deployment** — the Vercel connector needed an interactive OAuth that couldn't run in this session. The app is deploy-ready; `vercel --prod` is the whole step.
- **A live Supabase project** — none existed on the account and creating one provisions billable infrastructure, which isn't a call to make unasked. Migrations and generated seed are ready to push.
- **Review submission UI** — the API and the `approved` moderation flag exist; the form points at contact for now.
