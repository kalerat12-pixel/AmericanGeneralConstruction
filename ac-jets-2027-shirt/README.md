# AC Jets: Class of 2027 Senior Shirt

Adams Central Flying Jets, Monroe, Indiana. Senior class shirt concepts.

## Open first

- `preview.html`: realistic front and back mockups of every concept on black, white and heather grey shirts. Click a shirt to enlarge it.
- `concepts/<concept>/*_proof.png`: flat art on all three shirt colors.

## Concepts

| | Name | Back | Chest | Type |
|---|---|---|---|---|
| A | Tail Number | 12.0 × 7.5 in | 3.5 × 2.3 in | Big Shoulders Stencil Display + Chakra Petch |
| B | Boarding Pass | 12.0 × 10.7 in | 3.5 × 1.7 in | Rubik Mono One + Chakra Petch |
| C | Squadron | 12.0 × 13.8 in | 3.5 × 3.5 in | Saira Stencil One + Teko + Chakra Petch |

## Ink plan (2 spot colors per shirt)

| Shirt | Inks |
|---|---|
| Black | Red (≈ PMS 186 C, `#C8102E`) + White. Red needs a white underbase. |
| White | Red + Black |
| Heather grey | Red + Black. Black reads stronger than white on heather. |

## File naming

`concepts/A-tail-number/A-tail-number_back_black-shirt.svg` follows the pattern `<concept>_<front|back>_<shirt color>-shirt.svg`.

Every SVG is:
- sized in real inches (`width="12in"`)
- text converted to outlines, so no fonts are needed
- one `<g id="ink-…">` group per spot color
- knocked out, with no overlapping inks
- on a transparent background

Final print files for the chosen concept go in `final/` (SVG + 300 DPI transparent PNG per shirt color).

## Rebuilding

```
pip install fonttools uharfbuzz skia-pathops cairosvg
python3 source/build.py            # concepts + preview.html
python3 source/build.py final B    # print-ready files for concept B
```

- `source/jet.py`: the original twin-tail fighter, modelled in 3D and drawn from scratch (not traced from the school logo).
- `source/concepts.py`: the three layouts.
- `source/vec.py`: outlined text and boolean path tools.
- `source/fonts/`: Google Fonts under the SIL Open Font License.
