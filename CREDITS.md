# Image credits

## Status of the imagery in this repository

**The files currently in `/public/images` and `/public/textures` are not Unsplash
photographs.** They are generated in-repo by `scripts/generate-assets.ts` —
procedural marble, travertine, linen, coastal light and plaster-light plates
rendered in the brand palette, plus the product vial plates.

They were generated because the environment this site was built in had no
network egress to `images.unsplash.com` (the host is blocked by the egress
policy — every other photo CDN was blocked too). Rather than ship hotlinks that
would break, or empty boxes, the plates were synthesised to the same art
direction.

**To replace them with the real Unsplash frames**, from a machine that can reach
Unsplash:

```bash
npm run fetch:photos          # optionally: UNSPLASH_ACCESS_KEY=... npm run fetch:photos
npm run gen:blur              # regenerate the blur placeholders
```

The script writes to the same filenames, so no component or data file changes.
The photographs below are the ones it fetches — the shortlist chosen against the
brief's search terms. Verify each is still available and still licensed for
commercial use before publishing, and keep this table in sync with
`PHOTOS` in `scripts/fetch-unsplash.ts`.

---

## Shortlisted photographs

All Unsplash photographs are covered by the [Unsplash License](https://unsplash.com/license):
free for commercial and non-commercial use, no permission needed, attribution
appreciated but not required. This file provides that attribution.

| File | Mood / search term | Photographer | Photo |
| --- | --- | --- | --- |
| `images/hero-coast.jpg` | mediterranean coast | [Sven Wilhelm](https://unsplash.com/@sven_wilhelm) | https://unsplash.com/photos/ln5drpv_ImI |
| `images/hero-marble.jpg` | carrara marble | [Scott Webb](https://unsplash.com/@scottwebb) | https://unsplash.com/photos/wLiP1ZaCG7g |
| `images/calm-water.jpg` | calm water | [Silas Baisch](https://unsplash.com/@silasbaisch) | https://unsplash.com/photos/YFEWnPMFJDg |
| `images/sunlight-on-stone.jpg` | sunlight on stone | [Anthony DELANOIX](https://unsplash.com/@anthonydelanoix) | https://unsplash.com/photos/Wpnoqo2plFA |
| `images/spa-interior.jpg` | minimal spa interior | [Jason Wang](https://unsplash.com/@jasonw) | https://unsplash.com/photos/AQl-J19ocWE |
| `images/daylight-plaster.jpg` | minimal spa interior | [Karsten Winegeart](https://unsplash.com/@karsten116) | https://unsplash.com/photos/IYfp2Ixe9nM |
| `images/travertine-wall.jpg` | travertine | [Annie Spratt](https://unsplash.com/@anniespratt) | https://unsplash.com/photos/aQYgUYwnCsM |
| `images/marble-dark.jpg` | marble texture | [Dan Cristian Pădureț](https://unsplash.com/@dancristianpaduret) | https://unsplash.com/photos/Z6BEJnI4vOw |
| `images/linen-fold.jpg` | linen texture | [Nathan Dumlao](https://unsplash.com/@nate_dumlao) | https://unsplash.com/photos/eqW1MPinEV4 |
| `images/coast-band.jpg` | mediterranean coast | [Thomas Vimare](https://unsplash.com/@thomasvimare) | https://unsplash.com/photos/sMEMOkNsJDs |
| `textures/carrara-marble.jpg` | carrara marble | [Kelly Sikkema](https://unsplash.com/@kellysikkema) | https://unsplash.com/photos/gpKe3hMwSFI |
| `textures/travertine.jpg` | travertine | [Ricardo Gomez Angel](https://unsplash.com/@rgaleriacom) | https://unsplash.com/photos/p_9JZBmCSNM |
| `textures/linen.jpg` | linen texture | [Jeremy Bishop](https://unsplash.com/@jeremybishop) | https://unsplash.com/photos/gEXasgLNXvE |

---

## Not sourced from Unsplash

| File | Origin |
| --- | --- |
| `images/founder-portrait.jpg` | **Placeholder.** A generated portrait-orientation linen-and-light plate marking the founder photo slot on `/about`. Replace with a real portrait at 3:4, ~1200×1600. |
| `images/<slug>-01.jpg`, `images/<slug>-02.jpg` | **Rendered product stills**, drawn by `scripts/generate-product-plates.ts`. Each is a vial on a lit studio sweep with that product's own peptide backbone faint behind it, parsed from its `Sequence` field. Amber glass throughout except where the powder itself is coloured — GHK-Cu gets flint so its blue cake reads. **These are illustrations, not photographs of stock you hold**; see the note below. Replace with real product photography at 4:5, ~1200×1500, keeping two frames per product (the second is the card's hover swap). |
| `brand/*.svg`, `brand/og-default.png`, `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` | **Original brand assets**, drawn by `scripts/generate-brand.ts`. |

## A note on the product images

The vials on this site are **rendered, not photographed**. They depict a
generic amber crimp-sealed vial carrying a Lifting4Gains label — not
photographs of the stock you ship.

Before this site sells to the public, replace them with photographs of the
actual vials customers receive. Product images that do not depict the product
being sold are a consumer-protection problem in most jurisdictions, and in the
US the FTC treats a materially inaccurate product depiction as a deceptive
representation regardless of intent. The chain artwork behind each vial is
accurate to the peptide and can stay.

## Typefaces

| Family | Use | Licence |
| --- | --- | --- |
| [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) Light (300) | Display, wordmark | SIL Open Font License 1.1 |
| [Inter](https://fonts.google.com/specimen/Inter) 400/500 | Body, UI, eyebrow labels | SIL Open Font License 1.1 |

Both are served through `next/font/google`, self-hosted at build time — no
request leaves the visitor's browser for Google.
