"""Write ../README.md from manifest.json so every size in it matches the files."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

CONCEPTS = [
    ("squadron", "Squadron", "Aviation flight-tag system: custom stencil tail-marking caps, Barlow Condensed labels, "
     "IBM Plex Mono flight data, and one original double-delta jet. On the tee back the jet flies an overhead pool "
     "lane toward the line on the pool floor and the T at the wall, and the ropes carry red floats at both walls, "
     "like a real pool. The hoodie carries a drawn AC tail code whose swept-fin A lines up with the red fin flash."),
]
ORDER = ["tee-chest", "tee-back", "hoodie-front", "hoodie-sleeve", "crew-front", "sweats-hip", "sweats-leg"]
LABEL = {"tee-chest": "Tee, left chest", "tee-back": "Tee, back", "hoodie-front": "Hoodie, front",
         "hoodie-sleeve": "Hoodie, left sleeve", "crew-front": "Crewneck, front", "sweats-hip": "Sweatpants, hip",
         "sweats-leg": "Sweatpants, leg"}
PLACE = {
    "tee-chest": "Left chest. Top of art ~3 in below the collar seam, centered ~4 in left of center front.",
    "tee-back": "Centered on the back. Top of art 3-4 in below the collar seam.",
    "hoodie-front": "Centered on the chest, top of art ~3 in below the neckline. Must clear the pouch pocket.",
    "hoodie-sleeve": "Wearer's left sleeve on the sleeve center line. The red flash sits ~3 in below the shoulder seam; the coordinates read from the cuff up toward the jet.",
    "crew-front": "Centered on the chest, top of art ~3 in below the collar.",
    "sweats-hip": "Wearer's left front thigh/hip, ~3 in below the waistband, centered on the leg.",
    "sweats-leg": "Wearer's right leg on the outer leg panel. The jet end sits ~3 in below the waistband, nose up; the text reads from the hem up toward the jet.",
}


def main():
    m = json.load(open(os.path.join(ROOT, "manifest.json")))
    by = {(e["concept"], e["art"], e["garment"]): e for e in m}
    out = []
    w = out.append
    w("# Adams Central Jets Swim & Dive: 2026-27 Team Apparel")
    w("")
    w("**Final direction: Squadron**, across the tee, hoodie, crewneck and sweatpants, each in black, white and heather grey.")
    w("The two earlier directions (Lane Four, Aero Varsity) are kept for reference in `alternates/`.")
    w("Open **`mockup.html`** in a browser to see every piece on flat garments at true print size.")
    w("")
    w("Every design ships as:")
    w("")
    w("- **Vector SVG** (`<concept>/svg/`): real paths only, all type converted to outlines, artboard = exact print size "
      "(1 unit = 0.01 in), and inks knocked out of each other so nothing overprints.")
    w("- **300 DPI PNG** (`<concept>/png/`): transparent background, same size as the SVG.")
    w("")
    w("One file per print per garment color. Files are named `<concept>_<print>_on-<garment>.svg|png`, "
      "e.g. `squadron_tee-back_on-heather.svg`.")
    w("")
    w("## Ink colors")
    w("")
    w("Every print uses **2 inks or fewer** (the brief allowed 3).")
    w("")
    w("| Ink | Hex | Pantone / spec | Used on |")
    w("|---|---|---|---|")
    w("| Jets Red | `#C8102E` | PMS 186 C | All garments (accent) |")
    w("| White | `#FFFFFF` | Bright white, low-bleed | Black garments (main) |")
    w("| Black | `#101820` | PMS Black 6 C | White and heather grey garments (main) |")
    w("")
    w("| Garment | Main ink | Accent ink |")
    w("|---|---|---|")
    w("| Black | White | Jets Red |")
    w("| White | Black | Jets Red |")
    w("| Heather Grey | Black | Jets Red |")
    w("")
    w("Red is used only on the jet, on the red shapes that carry a knocked-out jet (hoodie fin flash, sleeve flash) "
      "and on the red end-zone floats of the tee-back lane ropes. Red never touches the main ink.")
    w("")
    w("Printer notes: red on black garments needs a white underbase (the printer may count it as a screen). "
      "Inks are knocked out, so no trapping or overprint is set in the files; the printer can add a hairline trap. "
      "Use a low-bleed / poly-blocking white on poly blends.")
    w("")
    for slug, name, blurb in CONCEPTS:
        w(f"## {name}")
        w("")
        w(blurb)
        w("")
        w("| Print | Print size (W x H) | 300 DPI PNG (px) | Inks | Files (`.svg` in `" + slug + "/svg`, `.png` in `" + slug + "/png`) |")
        w("|---|---|---|---|---|")
        for key in ORDER:
            e = by[(slug, key, "black")]
            px = f"{round(e['width_in'] * 300)} x {round(e['height_in'] * 300)}"
            files = "<br>".join(f"`{slug}_{key}_on-{g}`" for g in ("black", "white", "heather"))
            n = max(len(by[(slug, key, g)]["inks"]) for g in ("black", "white", "heather"))
            w(f"| {LABEL[key]} | {e['width_in']:.2f} x {e['height_in']:.2f} in | {px} | {n} | {files} |")
        w("")
    w("## Placement guide")
    w("")
    w("Sizes above are for adult S-XXL. For youth sizes scale back and front prints to about 80%; "
      "chest, hip, sleeve and leg prints can stay at full size.")
    w("")
    w("| Print | Where it goes |")
    w("|---|---|")
    for key in ORDER:
        w(f"| {LABEL[key]} | {PLACE[key]} |")
    w("")
    w("Smallest type: the data lines (SQDN 26-27, coordinates, the tee-back lane notes) are 0.20-0.24 in cap. "
      "They print cleanly on jersey and fleece with a standard 156-180 mesh; ask the printer to flag anything they "
      "would rather enlarge. All stencil bridges and knockouts are 0.04 in or wider, and every M has a small ink trap "
      "cut into its notch so it doesn't plug.")
    w("")
    w("## The jet mark and lettering")
    w("")
    w("- The jet is an original drawing (`source/marks.py`): a straight-line double delta seen from above with a W "
      "tail. It isn't traced from any existing logo or aircraft. Its detail changes automatically with print size: "
      "a cut down the spine above 2.5 in wingspan (tee back), a canopy cut from 1.25 in (crewneck, hip), solid below "
      "that, and the tail notch closes below 0.75 in (hoodie band and sleeve flash). If the athletic department wants "
      "the official school mark instead, swap it in at the jet positions.")
    w("- Hero words (JETS, AC JETS, ADAMS CENTRAL) use a custom stencil built on Saira Extra Condensed Black: "
      "bridges only vertical or horizontal, placed by one rule set, and a split-delta A whose slit echoes the jet's "
      "spine. The hoodie AC is a drawn tail code (swept-fin A at 45 degrees plus a chamfered C).")
    w("- Typefaces, all SIL Open Font License (free for apparel): Saira Extra Condensed, Barlow Condensed, IBM Plex "
      "Mono. Because the type is outlined, the printer doesn't need any fonts.")
    w("")
    w("## How AI was used")
    w("")
    w("The Squadron direction was pushed further with Figma AI (Canva's connector could not be reached from this "
      "environment). Five agents each generated concepts for one piece and compared them against the print art; a "
      "creative-director pass merged the ideas that survive 2-ink screen printing into one spec. The AI images were "
      "art direction only; every shape in the print files is rebuilt from coordinates or font outlines, never traced. "
      "The concepts that shaped the final art are in `ai-exploration/` and in the AI exploration section of "
      "`mockup.html`.")
    w("")
    w("## Rebuilding")
    w("")
    w("Everything is generated from code in `source/`. Python 3 with `fonttools uharfbuzz skia-pathops pillow` "
      "(plus `numpy scipy` for the print check), and Node with Playwright for the PNGs.")
    w("")
    w("```")
    w("cd source")
    w("python3 build.py            # Squadron SVGs + 300 DPI PNGs + manifest.json")
    w("python3 printcheck.py       # flags ink under 0.025 in and gaps under 0.03 in")
    w("python3 build.py --preview  # quick review sheets in source/.preview/")
    w("python3 mockup.py           # mockup.html")
    w("python3 readme.py           # this README")
    w("```")
    w("")
    with open(os.path.join(ROOT, "README.md"), "w") as f:
        f.write("\n".join(out))


if __name__ == "__main__":
    main()
