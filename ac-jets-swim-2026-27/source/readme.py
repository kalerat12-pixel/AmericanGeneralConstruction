"""Write ../README.md from manifest.json so every size in it matches the files."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

CONCEPTS = [
    ("squadron", "Squadron", "The front of the tee, crewneck and hoodie is one lockup: ADAMS CENTRAL arched over a red "
     "twin-tail fighter whose nose sits just under the arch without touching it, with a chevron stripe knocked out along its wings, over a "
     "stencil JETS and a spaced 26-27. The back of all three is the "
     "pool lane: stencil JETS over two lane ropes with red end zones, backstroke flags across the top, the red fighter "
     "flying the lane line toward the T at the wall, the school coordinates and ACAC down the sides, and a ruled "
     "footer. The crewneck and hoodie also have the jet, a contrail line and SWIM & DIVE down the left sleeve. The "
     "sweatpants carry the lockup small on the hip and the jet leading AC SWIM & DIVE down the leg. All of it comes "
     "from Figma AI frames the team picked, redrawn as clean symmetric vector."),
]
ORDER = ["front", "tee-back", "back", "sleeve", "sweats-hip", "sweats-leg"]
LABEL = {"front": "Tee / crewneck / hoodie, front", "tee-back": "Tee, back", "back": "Crewneck / hoodie, back", "sleeve": "Crewneck / hoodie, left sleeve",
         "sweats-hip": "Sweatpants, hip", "sweats-leg": "Sweatpants, leg"}
PLACE = {
    "front": "Centered on the chest. Tee and crewneck: top of the ADAMS CENTRAL arch ~3 in below the collar "
             "seam. Hoodie: top of the arch ~0.5 in below the hood opening at center front; the bottom of the art "
             "clears the pouch pocket by ~0.5 in on an adult M-L (check on S, or scale to 90%).",
    "tee-back": "Centered on the back. Top of JETS ~3 in below the collar seam; the lane ropes end ~4.5 in above the hem (adult L).",
    "back": "Centered on the back. Top of JETS ~3 in below the collar (hoodie: ~1.5 in below the hood seam); the lane ropes end ~4.5 in above the bottom band (adult L).",
    "sleeve": "Wearer's left sleeve on the sleeve center line (crewneck and hoodie only). The jet sits ~3 in below the shoulder seam, nose up; SWIM & DIVE reads from the cuff up toward the jet.",
    "sweats-hip": "Wearer's left front thigh/hip, ~3 in below the waistband, centered on the leg.",
    "sweats-leg": "Wearer's right leg on the outer leg panel. The jet sits ~3 in below the waistband, nose up; the line and AC SWIM & DIVE run down from it, reading from the waist toward the hem.",
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
      "e.g. `squadron_back_on-heather.svg`. The `front` file is shared by the tee, crewneck and "
      "hoodie. The back is the same pool-lane design in two lengths: `tee-back` for the tee and `back` for the "
      "crewneck and hoodie. `sleeve` is for the crewneck and hoodie only.")
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
    w("Red is used for the jet on every print, plus the backstroke flags and the rope end zones on the back. "
      "Red never touches the main ink.")
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
    w("The backs are oversize prints (about 21-22 in tall on the tee, 19 in on the crewneck and hoodie), so they "
      "need a jumbo/oversize screen and platen, or DTF/DTG. Only the lane is long; JETS and the jet are a normal size.")
    w("")
    w("Sizes above are for adult S-XXL. For youth sizes scale the front and back prints to about 80%; "
      "the hip and leg prints can stay at full size.")
    w("")
    w("| Print | Where it goes |")
    w("|---|---|")
    for key in ORDER:
        w(f"| {LABEL[key]} | {PLACE[key]} |")
    w("")
    w("Smallest type: the 26-27 on the hip lockup is 0.18 in cap in a heavy weight. On the hip, JETS is left "
      "without stencil cuts so it doesn't break up at 0.5 in cap. All keylines, stencil bridges and knockouts are "
      "0.04 in or wider; every file passes `printcheck.py` (no ink under 0.025 in, no gap under 0.03 in).")
    w("")
    w("## The jet mark and lettering")
    w("")
    w("- The jet (`source/marks.py`, `fighter()`) is a top-down twin-tail fighter in the style of the Figma AI "
      "frames the team picked. It is rebuilt from a coordinate grid (span = 100 units, 45 degree wing leading edge), "
      "symmetric and straight-edged, never traced. Its detail steps down with size: canopy, chevron stripe and "
      "stabilizer cuts from 1.2 in span; no canopy from 1 in; a plain silhouette with stabilizer cuts below that "
      "(the sleeve and leg strips).")
    w("- JETS and the ADAMS CENTRAL arch on the front are Saira Black (wide) with stencil cuts: a full-height gap at the E's stem, a horizontal cut under the "
      "T's bar and two cuts through the S on its center axis. 26-27 is Archivo Expanded, tracked wide.")
    w("- Typefaces, all SIL Open Font License (free for apparel): Saira, Archivo, Barlow Condensed (leg text). "
      "Because the type is outlined, the printer doesn't need any fonts.")
    w("- If the athletic department wants the official school mark instead, swap it in at the jet positions.")
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
