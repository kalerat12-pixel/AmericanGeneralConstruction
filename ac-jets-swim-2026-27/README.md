# Adams Central Jets Swim & Dive: 2026-27 Team Apparel

**Final direction: Squadron**, across the tee, hoodie, crewneck and sweatpants, each in black, white and heather grey.
The two earlier directions (Lane Four, Aero Varsity) are kept for reference in `alternates/`.
Open **`mockup.html`** in a browser to see every piece on flat garments at true print size.

Every design ships as:

- **Vector SVG** (`<concept>/svg/`): real paths only, all type converted to outlines, artboard = exact print size (1 unit = 0.01 in), and inks knocked out of each other so nothing overprints.
- **300 DPI PNG** (`<concept>/png/`): transparent background, same size as the SVG.

One file per print per garment color. Files are named `<concept>_<print>_on-<garment>.svg|png`, e.g. `squadron_back_on-heather.svg`. The `front` file is shared by the tee, crewneck and hoodie. The back is the same pool-lane design in two lengths: `tee-back` for the tee and `back` for the crewneck and hoodie. `sleeve` is for the crewneck and hoodie only.

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

Red is used for the jet on every print, plus the backstroke flags and the rope end zones on the back. Red never touches the main ink.

Printer notes: red on black garments needs a white underbase (the printer may count it as a screen). Inks are knocked out, so no trapping or overprint is set in the files; the printer can add a hairline trap. Use a low-bleed / poly-blocking white on poly blends.

## Squadron

The front of the tee, crewneck and hoodie is one lockup: ADAMS CENTRAL arched over a red twin-tail fighter whose nose just touches the arch, with a chevron stripe knocked out along its wings, over a stencil JETS and a spaced 26-27. The back of all three is the pool lane: stencil JETS over two lane ropes with red end zones, backstroke flags across the top, the red fighter flying the lane line toward the T at the wall, the school coordinates and ACAC down the sides, and a ruled footer. The crewneck and hoodie also have the jet, a contrail line and SWIM & DIVE down the left sleeve. The sweatpants carry the lockup small on the hip and the jet leading AC SWIM & DIVE down the leg. All of it comes from Figma AI frames the team picked, redrawn as clean symmetric vector.

| Print | Print size (W x H) | 300 DPI PNG (px) | Inks | Files (`.svg` in `squadron/svg`, `.png` in `squadron/png`) |
|---|---|---|---|---|
| Tee / crewneck / hoodie, front | 5.00 x 8.99 in | 1500 x 2697 | 2 | `squadron_front_on-black`<br>`squadron_front_on-white`<br>`squadron_front_on-heather` |
| Tee, back | 8.60 x 21.92 in | 2580 x 6576 | 2 | `squadron_tee-back_on-black`<br>`squadron_tee-back_on-white`<br>`squadron_tee-back_on-heather` |
| Crewneck / hoodie, back | 8.60 x 19.34 in | 2580 x 5802 | 2 | `squadron_back_on-black`<br>`squadron_back_on-white`<br>`squadron_back_on-heather` |
| Crewneck / hoodie, left sleeve | 0.82 x 9.03 in | 246 x 2709 | 2 | `squadron_sleeve_on-black`<br>`squadron_sleeve_on-white`<br>`squadron_sleeve_on-heather` |
| Sweatpants, hip | 1.65 x 2.94 in | 495 x 882 | 2 | `squadron_sweats-hip_on-black`<br>`squadron_sweats-hip_on-white`<br>`squadron_sweats-hip_on-heather` |
| Sweatpants, leg | 0.82 x 11.79 in | 246 x 3537 | 2 | `squadron_sweats-leg_on-black`<br>`squadron_sweats-leg_on-white`<br>`squadron_sweats-leg_on-heather` |

## Placement guide

The backs are oversize prints (about 21-22 in tall on the tee, 19 in on the crewneck and hoodie), so they need a jumbo/oversize screen and platen, or DTF/DTG. Only the lane is long; JETS and the jet are a normal size.

Sizes above are for adult S-XXL. For youth sizes scale the front and back prints to about 80%; the hip and leg prints can stay at full size.

| Print | Where it goes |
|---|---|
| Tee / crewneck / hoodie, front | Centered on the chest. Tee and crewneck: top of art (jet nose) ~3 in below the collar seam. Hoodie: top of art ~1 in below the hood seam at center front; the bottom of the art clears the pouch pocket by ~0.75 in on an adult M-L (check on S). |
| Tee, back | Centered on the back. Top of JETS ~3 in below the collar seam; the lane ropes end ~4.5 in above the hem (adult L). |
| Crewneck / hoodie, back | Centered on the back. Top of JETS ~3 in below the collar (hoodie: ~1.5 in below the hood seam); the lane ropes end ~4.5 in above the bottom band (adult L). |
| Crewneck / hoodie, left sleeve | Wearer's left sleeve on the sleeve center line (crewneck and hoodie only). The jet sits ~3 in below the shoulder seam, nose up; SWIM & DIVE reads from the cuff up toward the jet. |
| Sweatpants, hip | Wearer's left front thigh/hip, ~3 in below the waistband, centered on the leg. |
| Sweatpants, leg | Wearer's right leg on the outer leg panel. The jet sits ~3 in below the waistband, nose up; the line and AC SWIM & DIVE run down from it, reading from the waist toward the hem. |

Smallest type: the 26-27 on the hip lockup is 0.18 in cap in a heavy weight. On the hip, JETS is left without stencil cuts so it doesn't break up at 0.5 in cap. All keylines, stencil bridges and knockouts are 0.04 in or wider; every file passes `printcheck.py` (no ink under 0.025 in, no gap under 0.03 in).

## The jet mark and lettering

- The jet (`source/marks.py`, `fighter()`) is a top-down twin-tail fighter in the style of the Figma AI frames the team picked. It is rebuilt from a coordinate grid (span = 100 units, 45 degree wing leading edge), symmetric and straight-edged, never traced. Its detail steps down with size: canopy, chevron stripe and stabilizer cuts from 1.2 in span; no canopy from 1 in; a plain silhouette with stabilizer cuts below that (the sleeve and leg strips).
- JETS and the ADAMS CENTRAL arch on the front are Saira Black (wide) with stencil cuts: a full-height gap at the E's stem, a horizontal cut under the T's bar and two cuts through the S on its center axis. 26-27 is Archivo Expanded, tracked wide.
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
