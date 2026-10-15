"""Generate the HTML mockup / line sheet for the collection.

Every print is embedded once as an SVG <symbol> whose paths are coloured by
CSS variables, so each colourway is the exact production geometry with its inks
swapped. Garment flats are drawn in inches and prints are placed at true size.

usage: python3 mockup.py            -> ../mockup.html (standalone page)
       python3 mockup.py --fragment PATH   (same page without the document wrapper)
"""
import html
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault("ACJ_FONT_DIR", os.path.join(HERE, ".fonts"))

import svgkit as K  # noqa: E402
import build  # noqa: E402
from common import GARMENTS, INKS  # noqa: E402

CONCEPTS = [build.CONCEPTS["squadron"]]          # the chosen direction
ROOT = os.path.dirname(HERE)
AI_DIR = os.path.join(ROOT, "ai-exploration")
PREFIX = {"squadron": "sq", "lane-four": "lf", "aero-varsity": "av"}

STORY = {
    "squadron": ("ADAMS CENTRAL arched over a red fighter with a chevron and stencil JETS on every front, and the same jet flying a pool "
                 "lane on every back.",
                 "Both prints come from Figma AI frames the team picked (tee back, hip lockup right), redrawn as clean "
                 "2-ink vector. The crewneck and hoodie add SWIM & DIVE, a contrail line and the jet flying down the left "
                 "sleeve; the sweatpants carry the lockup small on the hip and AC SWIM & DIVE down the leg with the jet flying down below it."),
    "lane-four": ("Performance minimal: one expanded italic, the jet cut down to an arrowhead, lots of air.",
                  "Named for the center lane, where the top seed swims. A lane-rope band with red end floats runs through "
                  "every piece, and everything leans on the same 10° axis."),
    "aero-varsity": ("Vintage collegiate: slab lettering with a printed varsity outline on the hero words.",
                     "The jet’s twin contrails run straight, then ease into waves, used like the tail under an old "
                     "athletic script."),
}

GARMENT_FILL = {"black": "#1C1C1D", "white": "#F7F7F5", "heather": "#B9BBBD"}
GARMENT_LINE = {"black": "#3A3A3C", "white": "#CFCFCB", "heather": "#9C9EA1"}
GARMENT_SHADE = {"black": "#111112", "white": "#E4E4E0", "heather": "#A5A7AA"}
INK_MAIN = {"black": INKS["white"][1], "white": INKS["black"][1], "heather": INKS["black"][1]}
RED = INKS["red"][1]


# ------------------------------------------------------------------ artwork

def symbols():
    """<symbol> per artwork + {(slug, key): (w_in, h_in, title, placement)}."""
    out, dims = [], {}
    for c in CONCEPTS:
        for fn in c.ARTS:
            art = fn()
            layers, w, h = build.colourway(art, "black")  # white = main, red = accent
            sid = f"{PREFIX[c.SLUG]}-{art.key}"
            paths = []
            for ink, p in layers:
                var = "--a" if ink == "red" else "--m"
                paths.append(f'<path style="fill:var({var})" d="{K.path_d(p, 1)}"/>')
            out.append(f'<symbol id="{sid}" viewBox="0 0 {w * 100:g} {h * 100:g}">{"".join(paths)}</symbol>')
            dims[(c.SLUG, art.key)] = (w, h, art.title, art.placement)
    return "".join(out), dims


def place(sid, dims, slug, key, x, y, anchor="top-center", rot=0):
    w, h = dims[(slug, key)][:2]
    if anchor == "top-center":
        x0 = x - w / 2
    else:
        x0 = x
    use = f'<use href="#{sid}" x="{x0:.3f}" y="{y:.3f}" width="{w}" height="{h}"/>'
    if rot:
        use = f'<g transform="rotate({rot} {x:.3f} {y:.3f})">{use}</g>'
    return use


# ------------------------------------------------------------------ garments (inches)

TEE_FRONT = ("M16 3.4 Q19.4 3.3 19.7 1.1 L26.2 2.5 L30.8 8.6 L27.4 10.9 L26.3 9.3 L26.5 30.2 "
             "Q21 30.5 16 30.4 Q11 30.5 5.5 30.2 L5.7 9.3 L4.6 10.9 L1.2 8.6 L5.8 2.5 L12.3 1.1 "
             "Q12.6 3.3 16 3.4 Z")
TEE_BACK = ("M16 1.75 Q18.2 1.6 19.7 1.1 L26.2 2.5 L30.8 8.6 L27.4 10.9 L26.3 9.3 L26.5 30.2 "
            "Q21 30.5 16 30.4 Q11 30.5 5.5 30.2 L5.7 9.3 L4.6 10.9 L1.2 8.6 L5.8 2.5 L12.3 1.1 "
            "Q13.8 1.6 16 1.75 Z")
TEE_SEAMS_FRONT = ("M12.3 1.1 Q12.6 3.3 16 3.4 Q19.4 3.3 19.7 1.1 M12.95 1.25 Q13.3 4.05 16 4.15 "
                   "Q18.7 4.05 19.05 1.25 M5.5 29.4 Q11 29.7 16 29.6 Q21 29.7 26.5 29.4 "
                   "M1.55 8.1 L4.95 10.4 M30.45 8.1 L27.05 10.4")
TEE_SEAMS_BACK = ("M12.3 1.1 Q13.8 1.6 16 1.75 Q18.2 1.6 19.7 1.1 M5.5 29.4 Q11 29.7 16 29.6 "
                  "Q21 29.7 26.5 29.4 M1.55 8.1 L4.95 10.4 M30.45 8.1 L27.05 10.4")

HOODIE = ("M15.2 7.6 C14.6 3.2 16.6 0.6 20 0.6 C23.4 0.6 25.4 3.2 24.8 7.6 L30.4 9.0 L35.6 30.2 "
          "L35.9 32.6 L32.6 33.0 L32.3 30.6 L30.5 14.6 L30.6 31.0 L30.6 33.6 L9.4 33.6 L9.4 31.0 "
          "L9.5 14.6 L7.7 30.6 L7.4 33.0 L4.1 32.6 L4.4 30.2 L9.6 9.0 Z")
HOODIE_OPEN = ("M17.0 10.4 C16.4 6.4 17.6 3.0 20 3.0 C22.4 3.0 23.6 6.4 23.0 10.4 "
               "C22.0 11.4 21.0 11.8 20 11.9 C19 11.8 18 11.4 17.0 10.4 Z")
HOODIE_SEAMS = ("M9.4 31.0 L30.6 31.0 M4.4 30.2 L7.7 30.6 M35.6 30.2 L32.3 30.6 "
                "M14.6 22.4 L25.4 22.4 L27.4 30.6 L12.6 30.6 Z M14.6 22.4 Q13.6 26 12.6 30.6 "
                "M25.4 22.4 Q26.4 26 27.4 30.6")
HOODIE_STRINGS = "M18.7 11.5 L18.4 16.6 M21.3 11.5 L21.6 16.6"

CREW = ("M15.4 1.6 Q20 5.2 24.6 1.6 L30.4 3.2 L35.6 25.2 L35.9 27.6 L32.6 28.0 L32.3 25.6 "
        "L30.5 9.6 L30.6 26.0 L30.6 28.6 L9.4 28.6 L9.4 26.0 L9.5 9.6 L7.7 25.6 L7.4 28.0 "
        "L4.1 27.6 L4.4 25.2 L9.6 3.2 Z")
CREW_BACKNECK = "M15.4 1.6 Q20 2.6 24.6 1.6 Q20 5.2 15.4 1.6 Z"
CREW_SEAMS = ("M14.75 1.45 Q20 6.1 25.25 1.45 M9.4 26.0 L30.6 26.0 M4.4 25.2 L7.7 25.6 "
              "M35.6 25.2 L32.3 25.6 M9.6 3.2 L9.5 9.6 M30.4 3.2 L30.5 9.6")

SWEATS = ("M6.3 3.6 L21.7 3.6 C22.4 8 22.5 12 22.3 15 L21.2 40.0 L21.3 43.2 L16.3 43.2 L16.3 40.0 "
          "L14.5 15.6 Q14 14.4 13.5 15.6 L11.7 40.0 L11.7 43.2 L6.7 43.2 L6.8 40.0 L5.7 15 "
          "C5.5 12 5.6 8 6.3 3.6 Z")
SWEATS_BAND = "M6.4 1 L21.6 1 L21.7 3.6 L6.3 3.6 Z"
SWEATS_SEAMS = ("M6.8 40.0 L11.7 40.0 M16.3 40.0 L21.2 40.0 M6.6 4.4 L8.4 10.2 M21.4 4.4 L19.6 10.2 "
                "M14 3.6 L14 13.2")
SWEATS_STRINGS = "M13.3 3.6 L12.7 7.6 M14.7 3.6 L15.3 7.6"


def garment(d, g, extra=""):
    filt = ' filter="url(#heather)"' if g == "heather" else ""
    return f'<path d="{d}" fill="{GARMENT_FILL[g]}" stroke="{GARMENT_LINE[g]}" stroke-width="0.07" stroke-linejoin="round"{filt}/>{extra}'


def seams(d, g, w=0.05):
    return f'<path d="{d}" fill="none" stroke="{GARMENT_LINE[g]}" stroke-width="{w}" stroke-linecap="round"/>'


def svg_wrap(vb, inner, g, label):
    style = f"--m:{INK_MAIN[g]};--a:{RED}"
    return (f'<svg class="flat" viewBox="{vb}" style="{style}" role="img" aria-label="{html.escape(label)}">'
            f"{inner}</svg>")


def view_label(x, y, text):
    return f'<text x="{x}" y="{y}" class="vl" text-anchor="middle">{text}</text>'


CREW_BACK = CREW.replace("Q20 5.2 24.6", "Q20 2.6 24.6")
CREW_SEAMS_BACK = ("M14.75 1.45 Q20 3.3 25.25 1.45 M9.4 26.0 L30.6 26.0 M4.4 25.2 L7.7 25.6 "
                   "M35.6 25.2 L32.3 25.6 M9.6 3.2 L9.5 9.6 M30.4 3.2 L30.5 9.6")
HOODIE_SEAMS_BACK = ("M9.4 31.0 L30.6 31.0 M4.4 30.2 L7.7 30.6 M35.6 30.2 L32.3 30.6 M20 0.6 L20 8.9 "
                     "M15.2 7.6 Q17 9.2 20 9.3 Q23 9.2 24.8 7.6")


def two_views(front, back, w, h, label):
    return (f"<g>{front}{view_label(w / 2, h - 0.8, 'FRONT')}</g>"
            f'<g transform="translate({w + 1.5:g} 0)">{back}{view_label(w / 2, h - 0.8, "BACK")}</g>')


def tee(slug, g, dims):
    p = PREFIX[slug]
    front = garment(TEE_FRONT, g) + seams(TEE_SEAMS_FRONT, g)
    front += place(f"{p}-front", dims, slug, "front", 16, 6.2)
    back = garment(TEE_BACK, g) + seams(TEE_SEAMS_BACK, g)
    back += place(f"{p}-tee-back", dims, slug, "tee-back", 16, 4.8)
    inner = two_views(front, back, 32, 33.4, "Tee")
    return svg_wrap("0 0 65.5 33.4", inner, g, f"Tee, front and back, {GARMENTS[g][0]}")


def hoodie(slug, g, dims):
    p = PREFIX[slug]
    front = garment(HOODIE, g)
    front += f'<path d="{HOODIE_OPEN}" fill="{GARMENT_SHADE[g]}" stroke="{GARMENT_LINE[g]}" stroke-width="0.06"/>'
    front += seams(HOODIE_SEAMS, g)
    front += place(f"{p}-front", dims, slug, "front", 20, 12.3)
    front += place(f"{p}-sleeve", dims, slug, "sleeve", 31.35, 15.4, rot=-10)
    front += seams(HOODIE_STRINGS, g, 0.16)
    back = garment(HOODIE, g) + seams(HOODIE_SEAMS_BACK, g)
    back += place(f"{p}-back", dims, slug, "back", 20, 10.6)
    inner = two_views(front, back, 40, 35.6, "Hoodie")
    return svg_wrap("0 0 81.5 35.6", inner, g, f"Hoodie, front and back, {GARMENTS[g][0]}")


def crew(slug, g, dims):
    p = PREFIX[slug]
    front = garment(CREW, g)
    front += f'<path d="{CREW_BACKNECK}" fill="{GARMENT_SHADE[g]}"/>'
    front += seams(CREW_SEAMS, g)
    front += place(f"{p}-front", dims, slug, "front", 20, 7.4)
    front += place(f"{p}-sleeve", dims, slug, "sleeve", 31.35, 9.6, rot=-10)
    back = garment(CREW_BACK, g) + seams(CREW_SEAMS_BACK, g)
    back += place(f"{p}-back", dims, slug, "back", 20, 5.4)
    inner = two_views(front, back, 40, 30.6, "Crewneck")
    return svg_wrap("0 0 81.5 30.6", inner, g, f"Crewneck, front and back, {GARMENTS[g][0]}")


def sweats(slug, g, dims):
    p = PREFIX[slug]
    inner = garment(SWEATS, g)
    inner += garment(SWEATS_BAND, g)
    inner += seams(SWEATS_SEAMS, g) + seams(SWEATS_STRINGS, g, 0.14)
    inner += place(f"{p}-sweats-hip", dims, slug, "sweats-hip", 17.9, 6.6)
    inner += place(f"{p}-sweats-leg", dims, slug, "sweats-leg", 7.0, 8.4, rot=-2.5)
    return svg_wrap("0 0 28 44", inner, g, f"Sweatpants, front, {GARMENTS[g][0]}")


PIECES = [
    ("tee", "Tee", tee, ["front", "tee-back"]),
    ("hoodie", "Hoodie", hoodie, ["front", "back", "sleeve"]),
    ("crew", "Crewneck", crew, ["front", "back", "sleeve"]),
    ("sweats", "Sweatpants", sweats, ["sweats-hip", "sweats-leg"]),
]
PRINT_LABEL = {"front": "Front", "tee-back": "Full back", "back": "Full back", "sleeve": "Left sleeve", "sweats-hip": "Left hip", "sweats-leg": "Right leg"}


def ink_dots(g):
    main = "white" if g == "black" else "black"
    out = []
    for k in ("red", main):
        name, hexv, pms = INKS[k]
        out.append(f'<span class="ink"><i style="background:{hexv}"></i>{name}</span>')
    return "".join(out)


def specs(slug, keys, dims):
    rows = []
    for k in keys:
        w, h, title, placement = dims[(slug, k)]
        rows.append(f'<li><span class="pl">{PRINT_LABEL[k]}</span><span class="sz">{w:.2f} × {h:.2f} in</span>'
                    f'<span class="note">{html.escape(placement)}</span></li>')
    return f'<ul class="specs">{"".join(rows)}</ul>'


def concept_panel(c, dims):
    slug = c.SLUG
    lede, idea = STORY[slug]
    rows = []
    for pid, pname, fn, keys in PIECES:
        cards = []
        for g in GARMENTS:
            svg = fn(slug, g, dims)
            label = f"{c.NAME} {pname.lower()} on {GARMENTS[g][0].lower()}"
            cards.append(
                f'<figure class="card"><button class="stage" type="button" data-title="{html.escape(label)}" '
                f'aria-label="Enlarge {html.escape(label)}">{svg}</button>'
                f'<figcaption><span class="gname">{GARMENTS[g][0]}</span>{ink_dots(g)}</figcaption></figure>')
        rows.append(
            f'<section class="piece" id="{slug}-{pid}"><header class="piece-head"><h3>{pname}</h3>'
            f'{specs(slug, keys, dims)}</header><div class="cards">{"".join(cards)}</div></section>')
    mark = (f'<svg class="mark" viewBox="0 0 {dims[(slug, "front")][0] * 100:g} '
            f'{dims[(slug, "front")][1] * 100:g}" aria-hidden="true">'
            f'<use href="#{PREFIX[slug]}-front"/></svg>')
    return (f'<section class="panel" id="panel-{slug}" data-panel="{slug}">'
            f'<div class="concept-head"><div class="concept-copy"><p class="eyebrow">Final direction</p>'
            f'<h2>{c.NAME}</h2><p class="lede">{html.escape(lede)}</p><p class="idea">{html.escape(idea)}</p></div>'
            f'<div class="concept-mark">{mark}</div></div>{"".join(rows)}</section>')


def compare_panel(dims):
    rows = []
    for pid, pname, fn, keys in PIECES:
        cells = []
        for c in CONCEPTS:
            views = "".join(
                f'<div class="cv" data-g="{g}"{"" if g == "black" else " hidden"}>{fn(c.SLUG, g, dims)}</div>'
                for g in GARMENTS)
            label = f"{c.NAME} {pname.lower()}"
            cells.append(f'<figure class="card"><button class="stage" type="button" data-title="{html.escape(label)}" '
                         f'aria-label="Enlarge {html.escape(label)}">{views}</button>'
                         f'<figcaption><span class="gname">{c.NAME}</span></figcaption></figure>')
        rows.append(f'<section class="piece"><header class="piece-head"><h3>{pname}</h3></header>'
                    f'<div class="cards">{"".join(cells)}</div></section>')
    seg = "".join(
        f'<button type="button" class="seg-btn" id="cmp-{g}" data-g="{g}" aria-pressed="{"true" if g == "black" else "false"}">'
        f'<i style="background:{GARMENT_FILL[g]}"></i>{GARMENTS[g][0]}</button>' for g in GARMENTS)
    return (f'<section class="panel" id="panel-compare" role="tabpanel" aria-labelledby="tab-compare" data-panel="compare" hidden>'
            f'<div class="concept-head compare-head"><div class="concept-copy"><p class="eyebrow">Side by side</p>'
            f'<h2>Compare directions</h2><p class="lede">The same piece in all three directions. Pick a garment color.</p></div>'
            f'<div class="seg" role="group" aria-label="Garment color">{seg}</div></div>{"".join(rows)}</section>')


CSS = r"""
:root{
  /* Layout: line sheet. One collection, a garment x colourway grid with specs set like a production sheet, then the AI exploration. */
  --bg:#ECEFF1; --surface:#FFFFFF; --stage:#DCE1E5; --fg:#121518; --muted:#58626C; --line:#CBD2D8;
  --accent:#C8102E; --accent-fg:#FFFFFF; --focus:#1F6FEB;
  --display:"Barlow Condensed","Arial Narrow",Arial,sans-serif;
  --body:"Barlow",Arial,Helvetica,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#0F1113; --surface:#171A1D; --stage:#262B30; --fg:#E8EBED; --muted:#9AA4AE; --line:#2E343A;
  --accent:#E3344F; --accent-fg:#FFFFFF; --focus:#6EA8FF; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0F1113; --surface:#171A1D; --stage:#262B30; --fg:#E8EBED; --muted:#9AA4AE; --line:#2E343A;
  --accent:#E3344F; --accent-fg:#FFFFFF; --focus:#6EA8FF; color-scheme:dark}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:16px;line-height:1.5;margin:0}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.top{padding-block:40px 28px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px 48px;align-items:end}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
h1{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:clamp(40px,7vw,76px);line-height:.92;letter-spacing:.005em;margin:0;text-wrap:balance}
h1 em{font-style:normal;color:var(--accent)}
.intro{max-width:62ch;color:var(--muted);margin:14px 0 0}
.inks{display:flex;flex-direction:column;gap:8px;font-family:var(--mono);font-size:12px;color:var(--muted)}
.inks .row{display:flex;align-items:center;gap:10px}
.inks i{width:22px;height:22px;border-radius:50%;border:1px solid var(--line);flex:none}
.inks b{color:var(--fg);font-weight:500}
nav.tabs{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}
nav.tabs .wrap{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
.tab{appearance:none;background:none;border:0;border-bottom:3px solid transparent;color:var(--muted);font-family:var(--display);font-weight:700;
  font-size:20px;letter-spacing:.04em;text-transform:uppercase;padding:14px 14px 11px;cursor:pointer;white-space:nowrap}
.tab:hover{color:var(--fg)}
.tab[aria-selected="true"]{color:var(--fg);border-bottom-color:var(--accent)}
.tab:focus-visible,.stage:focus-visible,.seg-btn:focus-visible,.close:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.panel{padding-block:32px 56px;display:flex;flex-direction:column;gap:40px}
.concept-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,320px);gap:24px 48px;align-items:center}
.concept-copy{min-width:0}
h2{font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:clamp(34px,5vw,52px);line-height:.95;margin:0}
.lede{font-size:19px;margin:12px 0 6px;max-width:60ch;text-wrap:pretty}
.idea{color:var(--muted);margin:0;max-width:62ch;text-wrap:pretty}
.concept-mark{background:#161617;border-radius:6px;padding:28px 32px;display:flex;align-items:center;justify-content:center;--m:#FFFFFF;--a:#C8102E}
.mark{width:100%;max-width:240px;height:auto;display:block}
.compare-head{grid-template-columns:minmax(0,1fr) auto}
.piece{display:grid;grid-template-columns:220px minmax(0,1fr);gap:20px 32px;border-top:1px solid var(--line);padding-top:22px}
.piece-head{min-width:0}
h3{font-family:var(--display);font-weight:700;font-size:26px;text-transform:uppercase;letter-spacing:.03em;margin:0 0 10px}
.specs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.specs li{display:grid;grid-template-columns:auto 1fr;gap:0 10px;font-size:13px;line-height:1.4}
.specs .pl{font-weight:600}
.specs .sz{font-family:var(--mono);font-size:12px;color:var(--fg);text-align:right;font-variant-numeric:tabular-nums}
.specs .note{grid-column:1/-1;color:var(--muted)}
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.card{margin:0;min-width:0;display:flex;flex-direction:column;gap:8px}
.stage{appearance:none;border:1px solid var(--line);background:var(--stage);border-radius:6px;padding:14px;cursor:zoom-in;display:block;width:100%;color:inherit}
.stage:hover{border-color:var(--muted)}
.flat{display:block;width:100%;height:auto;max-width:100%}
.flat .vl{font-family:var(--mono);font-size:.62px;letter-spacing:.12px;fill:var(--muted)}
figcaption{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;font-size:13px;color:var(--muted)}
.gname{font-weight:600;color:var(--fg);margin-right:auto}
.ink{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:11px}
.ink i{width:11px;height:11px;border-radius:50%;border:1px solid var(--line);display:inline-block}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:var(--surface)}
.seg-btn{appearance:none;border:0;background:none;color:var(--fg);font:600 14px var(--body);padding:9px 14px;display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.seg-btn + .seg-btn{border-left:1px solid var(--line)}
.seg-btn[aria-pressed="true"]{background:var(--fg);color:var(--bg)}
.seg-btn i{width:14px;height:14px;border-radius:50%;border:1px solid var(--muted)}
a.tab{text-decoration:none;display:inline-block}
a.tab:hover,a.tab:focus-visible{color:var(--fg);border-bottom-color:var(--accent)}
.piece{scroll-margin-top:64px}
.ai-note{color:var(--muted);font-size:13px;margin:0;max-width:40ch}
.ai-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
figure.ai{margin:0;display:flex;flex-direction:column;gap:8px;min-width:0}
figure.ai img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;border-radius:6px;border:1px solid var(--line);background:#141414}
figure.ai figcaption{display:block;font-size:13px;color:var(--muted)}
figure.ai figcaption b{color:var(--fg);font-weight:600;margin-right:4px}
@media (max-width:640px){.ai-grid{grid-template-columns:minmax(0,1fr)}}
footer{border-top:1px solid var(--line);padding-block:24px 48px;color:var(--muted);font-size:13px}
footer p{margin:0 0 6px;max-width:80ch}
footer code{font-family:var(--mono);font-size:12px;color:var(--fg)}
dialog.zoom{border:0;padding:0;background:var(--surface);color:var(--fg);border-radius:8px;width:min(1100px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto}
dialog.zoom::backdrop{background:rgba(8,10,12,.72)}
.zoom-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--surface)}
.zoom-bar h4{margin:0;font-family:var(--display);font-size:22px;text-transform:uppercase;letter-spacing:.03em}
.close{appearance:none;border:1px solid var(--line);background:none;color:var(--fg);border-radius:6px;font:600 14px var(--body);padding:6px 12px;cursor:pointer}
.zoom-body{padding:16px;background:var(--stage)}
.zoom-body .flat{max-height:calc(100vh - 140px);width:auto;margin:0 auto}
@media (max-width:900px){
  .top,.concept-head,.compare-head{grid-template-columns:minmax(0,1fr)}
  .piece{grid-template-columns:minmax(0,1fr)}
  .specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
  .concept-mark{max-width:360px}
}
@media (max-width:640px){
  .cards{grid-template-columns:minmax(0,1fr)}
  .stage{padding:10px}
}
@media (prefers-reduced-motion:no-preference){.stage{transition:border-color .15s}}
"""

JS = r"""
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  function show(id, focus){
    var found = tabs.some(function(t){return t.dataset.panel === id;});
    if(!found){ id = tabs[0].dataset.panel; }
    tabs.forEach(function(t){
      var on = t.dataset.panel === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if(on && focus){ t.focus(); }
    });
    panels.forEach(function(p){ p.hidden = p.dataset.panel !== id; });
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){
      show(t.dataset.panel);
      try { history.replaceState(null, '', '#' + t.dataset.panel); } catch(e) {}
    });
    t.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if(!d){ return; }
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      show(n.dataset.panel, true);
    });
  });
  if(tabs.length){ show((location.hash || '').replace('#', '')); }

  var segs = Array.prototype.slice.call(document.querySelectorAll('.seg-btn'));
  segs.forEach(function(b){
    b.addEventListener('click', function(){
      var g = b.dataset.g;
      segs.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('#panel-compare .cv').forEach(function(v){ v.hidden = v.dataset.g !== g; });
    });
  });

  var dlg = document.getElementById('zoom');
  var body = document.getElementById('zoom-body');
  var title = document.getElementById('zoom-title');
  document.addEventListener('click', function(e){
    var s = e.target.closest ? e.target.closest('.stage') : null;
    if(!s){ return; }
    var svg = s.querySelector('.cv:not([hidden]) svg') || s.querySelector('svg');
    body.innerHTML = '';
    body.appendChild(svg.cloneNode(true));
    title.textContent = s.dataset.title || '';
    if(typeof dlg.showModal === 'function'){ dlg.showModal(); } else { dlg.setAttribute('open', ''); }
  });
  document.getElementById('zoom-close').addEventListener('click', function(){
    if(typeof dlg.close === 'function'){ dlg.close(); } else { dlg.removeAttribute('open'); }
  });
  dlg.addEventListener('click', function(e){ if(e.target === dlg && dlg.close){ dlg.close(); } });
})();
"""

FONT_CREDIT = "Saira, Archivo and Barlow Condensed"

HEATHER_FILTER = (
    '<filter id="heather" x="0" y="0" width="1" height="1">'
    '<feTurbulence type="fractalNoise" baseFrequency="3.2" numOctaves="2" seed="5" result="t"/>'
    '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.43  0 0 0 0 0.45  0 0 0 0.9 -0.32" result="s"/>'
    '<feComposite in="s" in2="SourceAlpha" operator="in" result="sm"/>'
    '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sm"/></feMerge></filter>')


def img_src(path, inline):
    """Relative link for the repo page; a compact JPEG data URI for the single-file artifact."""
    if not inline:
        return os.path.relpath(path, ROOT)
    import base64
    import io
    from PIL import Image
    im = Image.open(path).convert("RGB")
    im.thumbnail((1200, 1200))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=82, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def ai_section(inline):
    """Figma AI concept images used for art direction (ai-exploration/index.json)."""
    import json
    idx = os.path.join(AI_DIR, "index.json")
    if not os.path.exists(idx):
        return ""
    items = json.load(open(idx))
    figs = []
    for it in items:
        src = img_src(os.path.join(AI_DIR, it["file"]), inline)
        figs.append(f'<figure class="ai"><img src="{src}" alt="{html.escape(it["alt"])}">'
                    f'<figcaption><b>{html.escape(it["title"])}</b> {html.escape(it["note"])}</figcaption></figure>')
    return ('<section class="piece ai-sec" id="ai-exploration"><header class="piece-head"><h3>AI exploration</h3>'
            '<p class="ai-note">Concepts generated with Figma AI to push the Squadron direction. They were used for art '
            'direction only: the ideas that held up were redrawn as clean 2-ink vector art above. AI images are not print files.</p>'
            f'</header><div class="ai-grid">{"".join(figs)}</div></section>')


def page(fragment=False):
    syms, dims = symbols()
    tabs = "".join(f'<a class="tab" href="#squadron-{pid}">{pname}</a>' for pid, pname, _, _ in PIECES)
    ai = ai_section(inline=fragment)
    if ai:
        tabs += '<a class="tab" href="#ai-exploration">AI exploration</a>'
    panels = "".join(concept_panel(c, dims) for c in CONCEPTS)
    panels = panels[: panels.rfind("</section>")] + ai + "</section>"       # AI gallery closes the panel
    inks = "".join(
        f'<div class="row"><i style="background:{INKS[k][1]}"></i><span><b>{INKS[k][0]}</b> {INKS[k][2]} · {INKS[k][1]}</span></div>'
        for k in ("red", "white", "black"))
    head = ('<title>Jets Swim &amp; Dive 26–27</title>\n'
            '<meta name="claude:viewport-fit-sides" content="cover">\n'
            '<meta name="description" content="The Squadron apparel collection for the Adams Central Jets 2026–27 swim &amp; dive team.">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800'
            '&amp;family=Barlow:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@500&amp;display=swap">\n'
            f"<style>{CSS}</style>\n")
    body = (
        f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{HEATHER_FILTER}{syms}</defs></svg>'
        '<header class="wrap top"><div><p class="eyebrow">Adams Central Jets · Swim &amp; Dive · Monroe, Indiana</p>'
        '<h1>2026–27 <em>Squadron</em> Collection</h1>'
        '<p class="intro">The final team apparel set: tee, hoodie, crewneck and sweatpants in black, white and heather grey. '
        'Prints are shown at true size and placement on flat garments. Tap or click any garment to enlarge it.</p></div>'
        f'<div class="inks" aria-label="Ink colors"><p class="eyebrow">Inks · 2 per print max</p>{inks}</div></header>'
        f'<nav class="tabs" aria-label="Pieces"><div class="wrap">{tabs}</div></nav>'
        f'<main class="wrap">{panels}</main>'
        '<footer class="wrap"><p>Production art: vector SVG (all type outlined, inks knocked out) and 300 DPI transparent PNG for every '
        'print in every colorway, in <code>squadron/</code>. Ink specs and placement guide are in <code>README.md</code>. '
        'The two earlier directions are kept in <code>alternates/</code>.</p>'
        f'<p>The jet mark is an original vector drawing based on the AI frames the team picked. Type: {FONT_CREDIT}, all SIL Open Font License.</p></footer>'
        '<dialog class="zoom" id="zoom" aria-labelledby="zoom-title"><div class="zoom-bar"><h4 id="zoom-title"></h4>'
        '<button class="close" id="zoom-close" type="button">Close</button></div><div class="zoom-body" id="zoom-body"></div></dialog>'
        f"<script>{JS}</script>")
    if fragment:
        return head + body + "\n"
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + head + "</head>\n<body>\n" + body + "\n</body>\n</html>\n")


if __name__ == "__main__":
    out_full = os.path.join(os.path.dirname(HERE), "mockup.html")
    with open(out_full, "w") as f:
        f.write(page())
    print(out_full, os.path.getsize(out_full))
    if "--fragment" in sys.argv:
        p = sys.argv[sys.argv.index("--fragment") + 1]
        with open(p, "w") as f:
            f.write(page(fragment=True))
        print(p, os.path.getsize(p))
