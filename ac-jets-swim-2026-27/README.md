# Adams Central Jets Swim & Dive: 2026-27 Team Apparel

**Final direction: Squadron**, across the tee, hoodie, crewneck and sweatpants, each in black, white and heather grey.
The two earlier directions (Lane Four, Aero Varsity) are kept for reference in `alternates/`.
Open **`mockup.html`** in a browser to see every piece on flat garments at true print size.

Every design ships as:

- **Vector SVG** (`<concept>/svg/`): real paths only, all type converted to outlines, artboard = exact print size (1 unit = 0.01 in), and inks knocked out of each other so nothing overprints.
- **300 DPI PNG** (`<concept>/png/`): transparent background, same size as the SVG.

One file per print per garment color. Files are named `<concept>_<print>_on-<garment>.svg|png`, e.g. `squadron_back_on-heather.svg`. The `front` and `back` files are shared by the tee, crewneck and hoodie.

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

Red is used only on the jet: the whole jet on the front lockups and the leg, and the chevron band on the back. Red never touches the main ink; on the back a 0.06 in keyline of bare garment separates them.

Printer notes: red on black garments needs a white underbase (the printer may count it as a screen). Inks are knocked out, so no trapping or overprint is set in the files; the printer can add a hairline trap. Use a low-bleed / poly-blocking white on poly blends.

## Squadron

One jet, two ways. The front of the tee, crewneck and hoodie is the same lockup: a red twin-tail fighter with a chevron stripe knocked out along its wings, over a stencil JETS and a spaced 26-27. The back of all three is that fighter big, in the main ink with keyline panel cuts and a red chevron across the wings. The sweatpants carry the lockup small on the hip and the jet leading a contrail down the leg. Both prints come from the Figma AI frames the team picked, redrawn as clean symmetric vector.

| Print | Print size (W x H) | 300 DPI PNG (px) | Inks | Files (`.svg` in `squadron/svg`, `.png` in `squadron/png`) |
|---|---|---|---|---|
| Tee / crewneck / hoodie, front | 5.00 x 8.72 in | 1500 x 2616 | 2 | `squadron_front_on-black`<br>`squadron_front_on-white`<br>`squadron_front_on-heather` |
| Tee / crewneck / hoodie, back | 9.00 x 12.56 in | 2700 x 3768 | 2 | `squadron_back_on-black`<br>`squadron_back_on-white`<br>`squadron_back_on-heather` |
| Sweatpants, hip | 1.65 x 2.94 in | 495 x 882 | 2 | `squadron_sweats-hip_on-black`<br>`squadron_sweats-hip_on-white`<br>`squadron_sweats-hip_on-heather` |
| Sweatpants, leg | 0.82 x 11.79 in | 246 x 3537 | 2 | `squadron_sweats-leg_on-black`<br>`squadron_sweats-leg_on-white`<br>`squadron_sweats-leg_on-heather` |

## Placement guide

Sizes above are for adult S-XXL. For youth sizes scale the front and back prints to about 80%; the hip and leg prints can stay at full size.

| Print | Where it goes |
|---|---|
| Tee / crewneck / hoodie, front | Centered on the chest. Tee and crewneck: top of art (jet nose) ~3 in below the collar seam. Hoodie: top of art ~1 in below the hood seam at center front; the bottom of the art clears the pouch pocket by ~0.75 in on an adult M-L (check on S). |
| Tee / crewneck / hoodie, back | Centered on the back. Jet nose ~3 in below the collar seam (hoodie: ~1.5 in below the hood seam). |
| Sweatpants, hip | Wearer's left front thigh/hip, ~3 in below the waistband, centered on the leg. |
| Sweatpants, leg | Wearer's right leg on the outer leg panel. The jet sits ~3 in below the waistband, nose up; the text reads from the hem up toward the jet. |

Smallest type: the 26-27 on the hip lockup is 0.18 in cap in a heavy weight. On the hip, JETS is left without stencil cuts so it doesn't break up at 0.5 in cap. All keylines, stencil bridges and knockouts are 0.04 in or wider; every file passes `printcheck.py` (no ink under 0.025 in, no gap under 0.03 in).

## The jet mark and lettering

- The jet (`source/marks.py`, `fighter()`) is a top-down twin-tail fighter in the style of the Figma AI frames the team picked. It is rebuilt from a coordinate grid (span = 100 units, 45 degree wing leading edge), symmetric and straight-edged, never traced. Its detail steps down with size: canopy, chevron stripe and stabilizer cuts from 1.2 in span; no canopy from 1 in; a plain silhouette with stabilizer cuts below that (the leg strip). The back version adds keyline panel lines (spine, intakes, leading-edge flaps, stabilizer edges) and the tapered red chevron band.
- JETS is Saira Black (wide) with stencil cuts: a full-height gap at the E's stem, a horizontal cut under the T's bar and two cuts through the S on its center axis. 26-27 is Archivo Expanded, tracked wide.
- Typefaces, all SIL Open Font License (free for apparel): Saira, Archivo, Barlow Condensed (leg text). Because the type is outlined, the printer doesn't need any fonts.
- If the athletic department wants the official school mark instead, swap it in at the jet positions.

## How AI was used

The Squadron direction was pushed further with Figma AI (Canva's connector could not be reached from this environment). Five agents each generated concepts for one piece and compared them against the print art; a creative-director pass merged the ideas that survive 2-ink screen printing into one spec. The AI images were art direction only; every shape in the print files is rebuilt from coordinates or font outlines, never traced. The concepts that shaped the final art are in `ai-exploration/` and in the AI exploration section of `mockup.html`.

## Rebuilding

Everything is generated from code in `source/`. Python 3 with `fonttools uharfbuzz skia-pathops pillow` (plus `numpy scipy` for the print check), and Node with Playwright for the PNGs.

```
cd source
python3 build.py            # Squadron SVGs + 300 DPI PNGs + manifest.json
python3 printcheck.py       # flags ink under 0.025 in and gaps under 0.03 in
python3 build.py --preview  # quick review sheets in source/.preview/
python3 mockup.py           # mockup.html
python3 readme.py           # this README
```
