# Adams Central Jets Swim & Dive: 2026-27 Team Apparel

**Final direction: Squadron**, across the tee, hoodie, crewneck and sweatpants, each in black, white and heather grey.
The two earlier directions (Lane Four, Aero Varsity) are kept for reference in `alternates/`.
Open **`mockup.html`** in a browser to see every piece on flat garments at true print size.

Every design ships as:

- **Vector SVG** (`<concept>/svg/`): real paths only, all type converted to outlines, artboard = exact print size (1 unit = 0.01 in), and inks knocked out of each other so nothing overprints.
- **300 DPI PNG** (`<concept>/png/`): transparent background, same size as the SVG.

One file per print per garment color. Files are named `<concept>_<print>_on-<garment>.svg|png`, e.g. `squadron_tee-back_on-heather.svg`.

## Ink colors

Every print uses **2 inks or fewer** (the brief allowed 3).

| Ink | Hex | Pantone / spec | Used on |
|---|---|---|---|
| Jets Red | `#C8102E` | PMS 186 C | All garments (accent) |
| White | `#FFFFFF` | Bright white, low-bleed | Black garments (main) |
| Black | `#101820` | PMS Black 6 C | White and heather grey garments (main) |

| Garment | Main ink | Accent ink |
|---|---|---|
| Black | White | Jets Red |
| White | Black | Jets Red |
| Heather Grey | Black | Jets Red |

Printer notes: red on black garments needs a white underbase (the printer may count it as a screen). Inks are knocked out, so no trapping or overprint is set in the files; the printer can add a hairline trap. Use a low-bleed / poly-blocking white on poly blends.

## Squadron

Aviation flight-tag system. Stencil tail-marking caps, flight data in mono, and the original double-delta jet. On the tee back the jet flies an overhead pool lane: its contrail becomes the lane line with the T at the wall, and the ropes carry red floats at each end like a real pool.

| Print | Print size (W x H) | 300 DPI PNG (px) | Inks | Files (`.svg` in `squadron/svg`, `.png` in `squadron/png`) |
|---|---|---|---|---|
| Tee, left chest | 3.29 x 1.18 in | 987 x 354 | 2 | `squadron_tee-chest_on-black`<br>`squadron_tee-chest_on-white`<br>`squadron_tee-chest_on-heather` |
| Tee, back | 9.00 x 13.21 in | 2700 x 3963 | 2 | `squadron_tee-back_on-black`<br>`squadron_tee-back_on-white`<br>`squadron_tee-back_on-heather` |
| Hoodie, front | 10.50 x 5.59 in | 3150 x 1677 | 2 | `squadron_hoodie-front_on-black`<br>`squadron_hoodie-front_on-white`<br>`squadron_hoodie-front_on-heather` |
| Hoodie, left sleeve | 1.01 x 10.88 in | 303 x 3264 | 2 | `squadron_hoodie-sleeve_on-black`<br>`squadron_hoodie-sleeve_on-white`<br>`squadron_hoodie-sleeve_on-heather` |
| Crewneck, front | 10.00 x 6.84 in | 3000 x 2052 | 2 | `squadron_crew-front_on-black`<br>`squadron_crew-front_on-white`<br>`squadron_crew-front_on-heather` |
| Sweatpants, hip | 1.60 x 2.69 in | 480 x 807 | 2 | `squadron_sweats-hip_on-black`<br>`squadron_sweats-hip_on-white`<br>`squadron_sweats-hip_on-heather` |
| Sweatpants, leg | 0.82 x 11.53 in | 246 x 3459 | 2 | `squadron_sweats-leg_on-black`<br>`squadron_sweats-leg_on-white`<br>`squadron_sweats-leg_on-heather` |

## Placement guide

Sizes above are for adult S-XXL. For youth sizes scale back and front prints to about 80%; chest, hip, sleeve and leg prints can stay at full size.

| Print | Where it goes |
|---|---|
| Tee, left chest | Left chest. Top of art ~3 in below the collar seam, centered ~4 in left of center front. |
| Tee, back | Centered on the back. Top of art 3-4 in below the collar seam (Lane Four sits high, ~3 in). |
| Hoodie, front | Centered on the chest, top of art ~3 in below the neckline. Must clear the pouch pocket. |
| Hoodie, left sleeve | Wearer's left sleeve, starting ~3 in below the shoulder seam, running toward the cuff, reading top to bottom. |
| Crewneck, front | Centered on the chest, top of art ~3 in below the collar. |
| Sweatpants, hip | Wearer's left front thigh/hip, ~3 in below the waistband, centered on the leg. |
| Sweatpants, leg | Wearer's right leg along the outer side seam, starting ~4 in below the waistband, reading top to bottom. |

## Fonts and the jet mark

- The jet is an original drawing (`source/marks.py`). It isn't traced from any existing logo. If the athletic department wants the official school mark instead, swap it in at the jet positions.
- Typefaces are all SIL Open Font License (free for apparel): Big Shoulders Stencil Display, Barlow Condensed, IBM Plex Mono (Squadron); Archivo and a Barlow Black Italic ampersand (Lane Four); Rokkitt (Aero Varsity). Because the type is outlined, the printer doesn't need any fonts.

## Rebuilding

Everything is generated from code in `source/`. Python 3 with `fonttools uharfbuzz skia-pathops pillow`, plus Node with Playwright for the PNGs.

```
cd source
python3 build.py            # all SVGs + 300 DPI PNGs + manifest.json
python3 build.py --preview  # quick review sheets in source/.preview/
python3 mockup.py           # mockup.html
python3 readme.py           # this README
```
