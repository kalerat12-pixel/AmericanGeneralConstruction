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

Red is used only on the jet, on the red shapes that carry a knocked-out jet (hoodie fin flash, sleeve flash) and on the red end-zone floats of the tee-back lane ropes. Red never touches the main ink.

Printer notes: red on black garments needs a white underbase (the printer may count it as a screen). Inks are knocked out, so no trapping or overprint is set in the files; the printer can add a hairline trap. Use a low-bleed / poly-blocking white on poly blends.

## Squadron

Aviation flight-tag system: custom stencil tail-marking caps, Barlow Condensed labels, IBM Plex Mono flight data, and one original double-delta jet. On the tee back the jet flies an overhead pool lane toward the line on the pool floor and the T at the wall, and the ropes carry red floats at both walls, like a real pool. The hoodie carries a drawn AC tail code whose swept-fin A lines up with the red fin flash.

| Print | Print size (W x H) | 300 DPI PNG (px) | Inks | Files (`.svg` in `squadron/svg`, `.png` in `squadron/png`) |
|---|---|---|---|---|
| Tee, left chest | 3.10 x 0.98 in | 930 x 294 | 2 | `squadron_tee-chest_on-black`<br>`squadron_tee-chest_on-white`<br>`squadron_tee-chest_on-heather` |
| Tee, back | 9.01 x 13.27 in | 2703 x 3981 | 2 | `squadron_tee-back_on-black`<br>`squadron_tee-back_on-white`<br>`squadron_tee-back_on-heather` |
| Hoodie, front | 9.05 x 5.48 in | 2715 x 1644 | 2 | `squadron_hoodie-front_on-black`<br>`squadron_hoodie-front_on-white`<br>`squadron_hoodie-front_on-heather` |
| Hoodie, left sleeve | 0.90 x 10.75 in | 270 x 3225 | 2 | `squadron_hoodie-sleeve_on-black`<br>`squadron_hoodie-sleeve_on-white`<br>`squadron_hoodie-sleeve_on-heather` |
| Crewneck, front | 9.85 x 5.43 in | 2955 x 1629 | 2 | `squadron_crew-front_on-black`<br>`squadron_crew-front_on-white`<br>`squadron_crew-front_on-heather` |
| Sweatpants, hip | 1.51 x 2.59 in | 453 x 777 | 2 | `squadron_sweats-hip_on-black`<br>`squadron_sweats-hip_on-white`<br>`squadron_sweats-hip_on-heather` |
| Sweatpants, leg | 0.78 x 11.51 in | 234 x 3453 | 2 | `squadron_sweats-leg_on-black`<br>`squadron_sweats-leg_on-white`<br>`squadron_sweats-leg_on-heather` |

## Placement guide

Sizes above are for adult S-XXL. For youth sizes scale back and front prints to about 80%; chest, hip, sleeve and leg prints can stay at full size.

| Print | Where it goes |
|---|---|
| Tee, left chest | Left chest. Top of art ~3 in below the collar seam, centered ~4 in left of center front. |
| Tee, back | Centered on the back. Top of art 3-4 in below the collar seam. |
| Hoodie, front | Centered on the chest, top of art ~3 in below the neckline. Must clear the pouch pocket. |
| Hoodie, left sleeve | Wearer's left sleeve on the sleeve center line. The red flash sits ~3 in below the shoulder seam; the coordinates read from the cuff up toward the jet. |
| Crewneck, front | Centered on the chest, top of art ~3 in below the collar. |
| Sweatpants, hip | Wearer's left front thigh/hip, ~3 in below the waistband, centered on the leg. |
| Sweatpants, leg | Wearer's right leg on the outer leg panel. The jet end sits ~3 in below the waistband, nose up; the text reads from the hem up toward the jet. |

Smallest type: the data lines (SQDN 26-27, coordinates, the tee-back lane notes) are 0.20-0.24 in cap. They print cleanly on jersey and fleece with a standard 156-180 mesh; ask the printer to flag anything they would rather enlarge. All stencil bridges and knockouts are 0.04 in or wider, and every M has a small ink trap cut into its notch so it doesn't plug.

## The jet mark and lettering

- The jet is an original drawing (`source/marks.py`): a straight-line double delta seen from above with a W tail. It isn't traced from any existing logo or aircraft. Its detail changes automatically with print size: a cut down the spine above 2.5 in wingspan (tee back), a canopy cut from 1.25 in (crewneck, hip), solid below that, and the tail notch closes below 0.75 in (hoodie band and sleeve flash). If the athletic department wants the official school mark instead, swap it in at the jet positions.
- Hero words (JETS, AC JETS, ADAMS CENTRAL) use a custom stencil built on Saira Extra Condensed Black: bridges only vertical or horizontal, placed by one rule set, and a split-delta A whose slit echoes the jet's spine. The hoodie AC is a drawn tail code (swept-fin A at 45 degrees plus a chamfered C).
- Typefaces, all SIL Open Font License (free for apparel): Saira Extra Condensed, Barlow Condensed, IBM Plex Mono. Because the type is outlined, the printer doesn't need any fonts.

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
