"""Build the Adams Central Jets 2026-27 apparel collection.

usage:
  python3 build.py                 # Squadron (final): SVG + 300 DPI PNG + manifest
  python3 build.py --all           # also rebuild the alternates under alternates/
  python3 build.py lane-four       # one concept
  python3 build.py --preview       # review sheets only (fast, no 300 DPI PNGs)
"""
import json
import math
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault("ACJ_FONT_DIR", os.path.join(HERE, ".fonts"))

import svgkit as K  # noqa: E402
from common import GARMENTS, INKS, PALETTES  # noqa: E402
import squadron  # noqa: E402

CONCEPTS = {m.SLUG: m for m in [squadron]}
try:
    import lanefour  # noqa: E402
    CONCEPTS[lanefour.SLUG] = lanefour
except ImportError:
    pass
try:
    import aerovarsity  # noqa: E402
    CONCEPTS[aerovarsity.SLUG] = aerovarsity
except ImportError:
    pass

OUT = os.path.dirname(HERE)
FINAL = "squadron"                              # the chosen direction
ALTERNATES = {"lane-four", "aero-varsity"}      # kept for reference under alternates/


def out_dir(slug):
    return os.path.join(OUT, "alternates", slug) if slug in ALTERNATES else os.path.join(OUT, slug)
PREVIEW_DIR = os.environ.get("ACJ_PREVIEW_DIR", os.path.join(HERE, ".preview"))


def colourway(art, garment):
    pal = PALETTES[garment]
    if hasattr(art, "palettes") and garment in art.palettes:
        pal = {**pal, **art.palettes[garment]}
    layers = [(pal[role], p) for role, p in art.layers]
    layers = K.knockout(layers)
    # normalise to a tight artboard
    allp = K.union(*[p for _, p in layers])
    x0, y0, x1, y1 = K.bounds(allp)
    layers = [(k, K.translate(p, -x0, -y0)) for k, p in layers]
    w_in = math.ceil(x1 - x0) / 100
    h_in = math.ceil(y1 - y0) / 100
    return layers, w_in, h_in


def svg_for(concept, art, garment, layers, w_in, h_in):
    inks = {k: (INKS[k][0], INKS[k][1]) for k in INKS}
    title = (f"Adams Central Jets Swim &amp; Dive 2026-27 / {concept.NAME} / {art.title} / "
             f"on {GARMENTS[garment][0]} garment")
    return K.svg_doc(layers, w_in, h_in, inks, title)


def build(concepts, png=True):
    manifest = []
    jobs = []
    for slug in concepts:
        c = CONCEPTS[slug]
        for fn in c.ARTS:
            art = fn()
            for g in GARMENTS:
                layers, w, h = colourway(art, g)
                name = f"{slug}_{art.key}_on-{g}"
                svg_path = os.path.join(out_dir(slug), "svg", name + ".svg")
                png_path = os.path.join(out_dir(slug), "png", name + ".png")
                os.makedirs(os.path.dirname(svg_path), exist_ok=True)
                with open(svg_path, "w") as f:
                    f.write(svg_for(c, art, g, layers, w, h))
                used = [k for k, p in layers if list(p.segments)]
                manifest.append({
                    "concept": slug, "concept_name": c.NAME, "art": art.key, "title": art.title,
                    "garment": g, "svg": os.path.relpath(svg_path, OUT),
                    "png": os.path.relpath(png_path, OUT), "width_in": w, "height_in": h,
                    "inks": [{"key": k, "name": INKS[k][0], "hex": INKS[k][1], "pms": INKS[k][2]} for k in used],
                    "placement": art.placement,
                })
                jobs.append({"svg": svg_path, "png": png_path, "dpi": 300})
    if png:
        run_render(jobs)
        from PIL import Image
        for j in jobs:
            im = Image.open(j["png"])
            im.save(j["png"], dpi=(300, 300), optimize=True)
    return manifest


def run_render(jobs):
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    jf = os.path.join(PREVIEW_DIR, "jobs.json")
    with open(jf, "w") as f:
        json.dump(jobs, f)
    env = {**os.environ, "NODE_PATH": os.environ.get("NODE_PATH", "/opt/node22/lib/node_modules")}
    subprocess.run(["node", os.path.join(HERE, "render.js"), jf], check=True, env=env)


def preview(slug, only=None, cell=4.0):
    """Contact sheet: one row per artwork, columns = garment colours."""
    c = CONCEPTS[slug]
    rows = []
    for fn in c.ARTS:
        art = fn()
        if only and art.key not in only:
            continue
        rows.append(art)
    cols = list(GARMENTS)
    U = 100
    parts = []
    for r, art in enumerate(rows):
        for ci, g in enumerate(cols):
            layers, w, h = colourway(art, g)
            ox, oy = ci * cell * U, r * cell * U
            parts.append(f'<rect x="{ox}" y="{oy}" width="{cell*U}" height="{cell*U}" fill="{GARMENTS[g][1]}"/>')
            pad = 0.12 * cell * U
            s = min((cell * U - 2 * pad) / (w * U), (cell * U - 2 * pad) / (h * U))
            tx = ox + (cell * U - w * U * s) / 2
            ty = oy + (cell * U - h * U * s) / 2
            g_paths = "".join(f'<path fill="{INKS[k][1]}" d="{K.path_d(p, 1)}"/>' for k, p in layers)
            parts.append(f'<g transform="translate({tx:.1f} {ty:.1f}) scale({s:.4f})">{g_paths}</g>')
            parts.append(f'<text x="{ox+10}" y="{oy+cell*U-10}" font-family="monospace" font-size="14" '
                         f'fill="#888">{art.key} {w:.2f}x{h:.2f}in</text>')
    W, H = len(cols) * cell, len(rows) * cell
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}in" height="{H}in" '
           f'viewBox="0 0 {W*U} {H*U}">{"".join(parts)}</svg>')
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    sp = os.path.join(PREVIEW_DIR, f"{slug}{'_' + '_'.join(only) if only else ''}.svg")
    with open(sp, "w") as f:
        f.write(svg)
    pp = sp[:-4] + ".png"
    run_render([{"svg": sp, "png": pp, "dpi": 96 if H > 20 else 110}])
    return pp


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    which = [a for a in args if a in CONCEPTS] or (list(CONCEPTS) if "--all" in sys.argv else [FINAL])
    only = [a for a in args if a not in CONCEPTS] or None
    if "--preview" in sys.argv:
        for s in which:
            print(preview(s, only))
    else:
        m = build(which, png="--no-png" not in sys.argv)
        mp = os.path.join(OUT, "manifest.json")
        old = []
        if os.path.exists(mp):
            old = [e for e in json.load(open(mp)) if e["concept"] not in which]
        json.dump(old + m, open(mp, "w"), indent=1, ensure_ascii=False)
        print(f"built {len(m)} files")
