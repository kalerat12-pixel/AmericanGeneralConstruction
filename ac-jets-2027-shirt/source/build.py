"""Build concept SVGs, flat-art proof sheets and the mockup preview page.

    python3 source/build.py            # concepts + preview.html
    python3 source/build.py final B    # print-ready files for a picked concept
"""
import html
import os
import sys

import cairosvg

sys.path.insert(0, os.path.dirname(__file__))
import vec  # noqa: E402
from concepts import CONCEPTS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UNITS_PER_IN = 100

RED = "#C8102E"  # ~ PMS 186 C
SHIRTS = [
    {"key": "black", "label": "Black", "shirt": "#18181a",
     "inks": [("red", RED, "R"), ("white", "#FFFFFF", "K")]},
    {"key": "white", "label": "White", "shirt": "#f6f6f4",
     "inks": [("red", RED, "R"), ("black", "#111111", "K")]},
    {"key": "heather", "label": "Heather Grey", "shirt": "#b4b5b3",
     "inks": [("red", RED, "R"), ("black", "#111111", "K")]},
]


def art(concept, side):
    D = concept[side]()
    inks = D.inks()
    x0, y0, x1, y1 = vec.union(*inks.values()).bounds
    inks = {k: vec.move(v, -x0, -y0) for k, v in inks.items()}
    return inks, x1 - x0, y1 - y0


def print_svg(inks, w, h, shirt, title, prec=2):
    groups = []
    for name, hexc, role in shirt["inks"]:
        p = inks.get(role)
        if p is None:
            continue
        groups.append(f'  <g id="ink-{name}" fill="{hexc}">\n    <path d="{vec.d(p, prec)}"/>\n  </g>')
    ink_desc = " + ".join(f"{n} {c}" for n, c, _ in shirt["inks"])
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w / UNITS_PER_IN:.3f}in" '
            f'height="{h / UNITS_PER_IN:.3f}in" viewBox="0 0 {w:.2f} {h:.2f}">\n'
            f'  <title>{html.escape(title)}</title>\n'
            f'  <desc>Screen print, {len(shirt["inks"])} spot inks on {shirt["label"]} shirt: '
            f'{ink_desc}. All text converted to outlines. Inks knock out (no overlaps). '
            f'Transparent background.</desc>\n'
            + "\n".join(groups) + "\n</svg>\n")


def proof_sheet(inks, w, h, path):
    pad = 60
    cw, ch = w + 2 * pad, h + 2 * pad
    parts = []
    for i, s in enumerate(SHIRTS):
        cols = {role: c for _, c, role in s["inks"]}
        parts.append(f'<rect x="{i * cw}" width="{cw}" height="{ch}" fill="{s["shirt"]}"/>'
                     f'<g transform="translate({i * cw + pad},{pad})">'
                     f'<path fill="{cols["K"]}" d="{vec.d(inks["K"], 1)}"/>'
                     f'<path fill="{cols["R"]}" d="{vec.d(inks["R"], 1)}"/></g>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{3 * cw}" height="{ch}">'
           + "".join(parts) + "</svg>")
    cairosvg.svg2png(bytestring=svg.encode(), write_to=path, output_width=2400)


# ------------------------------------------------------------------ mockup
SHIRT_FRONT = ("M405 92C440 150 560 150 595 92L770 128C830 175 900 270 950 350L838 448"
               "C815 420 795 395 782 372C788 600 790 800 792 1030C600 1044 400 1044 208 1030"
               "C210 800 212 600 218 372C205 395 185 420 162 448L50 350C100 270 170 175 230 128Z")
SHIRT_BACK = SHIRT_FRONT.replace("M405 92C440 150 560 150 595 92", "M405 92C440 114 560 114 595 92")
PX_PER_IN = 26.5  # mockup units per inch (shirt chest ~21.5in)


def mock_defs():
    return f'''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
  <path id="shirt-front" d="{SHIRT_FRONT}"/>
  <path id="shirt-back" d="{SHIRT_BACK}"/>
  <clipPath id="clip-front"><use href="#shirt-front"/></clipPath>
  <clipPath id="clip-back"><use href="#shirt-back"/></clipPath>
  <linearGradient id="g-sides" x1="0" x2="1">
    <stop offset="0.17" stop-color="#000" stop-opacity=".28"/>
    <stop offset="0.3" stop-color="#000" stop-opacity="0"/>
    <stop offset="0.7" stop-color="#000" stop-opacity="0"/>
    <stop offset="0.83" stop-color="#000" stop-opacity=".28"/>
  </linearGradient>
  <radialGradient id="g-light" cx="0.5" cy="0.32" r="0.55">
    <stop offset="0" stop-color="#fff" stop-opacity=".10"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="g-hem" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.85" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".22"/>
  </linearGradient>
  <filter id="f-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="f-noise" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.12"/></feComponentTransfer>
  </filter>
  <filter id="f-heather" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.6 0.45" numOctaves="2" seed="9"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.55"/></feComponentTransfer>
  </filter>
  <g id="shade">
    <rect width="1000" height="1100" fill="url(#g-sides)"/>
    <rect width="1000" height="1100" fill="url(#g-light)"/>
    <rect width="1000" height="1100" fill="url(#g-hem)"/>
    <g filter="url(#f-blur)" fill="none" stroke-linecap="round">
      <path d="M262 470C300 560 290 700 330 860" stroke="#000" stroke-opacity=".16" stroke-width="22"/>
      <path d="M740 430C700 560 720 720 680 900" stroke="#000" stroke-opacity=".14" stroke-width="20"/>
      <path d="M300 980C420 950 560 960 700 990" stroke="#000" stroke-opacity=".12" stroke-width="26"/>
      <path d="M282 520C320 610 310 720 350 850" stroke="#fff" stroke-opacity=".07" stroke-width="16"/>
      <path d="M215 380C190 360 150 330 110 330" stroke="#000" stroke-opacity=".18" stroke-width="26"/>
      <path d="M785 380C810 360 850 330 890 330" stroke="#000" stroke-opacity=".18" stroke-width="26"/>
    </g>
    <g fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2.2">
      <path d="M230 128C226 210 222 300 218 372"/>
      <path d="M770 128C774 210 778 300 782 372"/>
    </g>
    <g fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.6" stroke-dasharray="6 5">
      <path d="M210 1006C400 1018 600 1018 790 1006"/>
      <path d="M68 334L170 426"/>
      <path d="M932 334L830 426"/>
    </g>
  </g>
  <g id="neck-front">
    <path d="M405 92C440 112 560 112 595 92C560 150 440 150 405 92Z" fill="#000" fill-opacity=".38"/>
    <path d="M405 92C440 150 560 150 595 92L608 98C569 168 431 168 392 98Z" fill="#000" fill-opacity=".10"/>
    <path d="M396 99C434 160 566 160 604 99" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.5" stroke-dasharray="5 4"/>
  </g>
  <g id="neck-back">
    <path d="M405 92C440 114 560 114 595 92L608 98C566 132 434 132 392 98Z" fill="#000" fill-opacity=".10"/>
    <path d="M397 100C436 126 564 126 603 100" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.5" stroke-dasharray="5 4"/>
  </g>
  <rect id="noise-rect" width="1000" height="1100" filter="url(#f-noise)"/>
  <rect id="heather-rect" width="1000" height="1100" filter="url(#f-heather)"/>
</defs>
</svg>'''


def art_symbol(sym_id, inks, w, h):
    return (f'<symbol id="{sym_id}" viewBox="0 0 {w:.1f} {h:.1f}">'
            f'<path style="fill:var(--k)" d="{vec.d(inks["K"], 1)}"/>'
            f'<path style="fill:var(--r)" d="{vec.d(inks["R"], 1)}"/></symbol>')


def shirt_svg(side, sym_id, w, h, shirt, label):
    win = w / UNITS_PER_IN * PX_PER_IN
    hin = h / UNITS_PER_IN * PX_PER_IN
    if side == "back":
        x, y = 500 - win / 2, 112 + 3 * PX_PER_IN
    else:  # wearer's left chest = viewer's right
        x, y = 600 - win / 2, 196
    heather = '<use href="#heather-rect"/>' if shirt["key"] == "heather" else ""
    return (f'<svg class="shirt" viewBox="0 20 1000 1050" role="img" aria-label="{html.escape(label)}">'
            f'<g clip-path="url(#clip-{side})">'
            f'<use href="#shirt-{side}" style="fill:var(--shirt)"/>{heather}'
            f'<use href="#{sym_id}" x="{x:.1f}" y="{y:.1f}" width="{win:.1f}" height="{hin:.1f}"/>'
            f'<use href="#noise-rect"/><use href="#shade"/></g>'
            f'<use href="#neck-{side}"/></svg>')


def build_concepts():
    symbols, sections = [], []
    for c in CONCEPTS:
        folder = os.path.join(ROOT, "concepts", f'{c["id"]}-{c["slug"]}')
        os.makedirs(folder, exist_ok=True)
        arts = {}
        for side in ("front", "back"):
            inks, w, h = art(c, side)
            arts[side] = (inks, w, h)
            symbols.append(art_symbol(f'art-{c["id"]}-{side}', inks, w, h))
            for s in SHIRTS:
                name = f'{c["id"]}-{c["slug"]}_{side}_{s["key"]}-shirt.svg'
                title = f'AC Jets Class of 2027, Concept {c["id"]} {c["name"]}, {side}, {s["label"]} shirt'
                with open(os.path.join(folder, name), "w") as f:
                    f.write(print_svg(inks, w, h, s, title))
            proof_sheet(inks, w, h, os.path.join(folder, f'{c["id"]}-{c["slug"]}_{side}_proof.png'))
            print(f'  {c["id"]} {side}: {w / 100:.2f} x {h / 100:.2f} in')
        sections.append(section_html(c, arts))
    page = PAGE.replace("{{DEFS}}", mock_defs()).replace(
        "{{SYMBOLS}}", '<svg width="0" height="0" style="position:absolute" aria-hidden="true">'
        + "".join(symbols) + "</svg>").replace("{{SECTIONS}}", "\n".join(sections))
    out = os.path.join(ROOT, "preview.html")
    with open(out, "w") as f:
        f.write(page)
    print("preview:", out, f"{os.path.getsize(out) / 1024:.0f} KB")


def section_html(c, arts):
    cards = []
    for s in SHIRTS:
        r = dict((role, hexc) for _, hexc, role in s["inks"])
        ink_names = " + ".join(n.title() for n, _, _ in s["inks"])
        style = f'--shirt:{s["shirt"]};--r:{r["R"]};--k:{r["K"]}'
        views = []
        for side in ("front", "back"):
            _, w, h = arts[side]
            lab = f'Concept {c["id"]} {c["name"]}, {s["label"]} shirt, {side}'
            views.append(f'<figure class="view"><button class="zoom" type="button" '
                         f'aria-label="Enlarge {html.escape(lab)}">'
                         f'{shirt_svg(side, "art-" + c["id"] + "-" + side, w, h, s, lab)}</button>'
                         f'<figcaption>{side.title()}</figcaption></figure>')
        cards.append(f'<article class="card" data-shirt="{s["key"]}" style="{style}">'
                     f'<header class="card-head"><span class="swatch"></span>'
                     f'<h3>{s["label"]}</h3><span class="inks">{ink_names} ink</span></header>'
                     f'<div class="pair">{"".join(views)}</div></article>')
    fw, fh = arts["front"][1] / 100, arts["front"][2] / 100
    bw, bh = arts["back"][1] / 100, arts["back"][2] / 100
    return f'''<section class="concept" id="concept-{c["id"].lower()}">
  <div class="concept-head">
    <p class="tag">Concept {c["id"]}</p>
    <h2>{c["name"]}</h2>
    <p class="blurb">{html.escape(c["blurb"])}</p>
    <dl class="spec">
      <div><dt>Type</dt><dd>{c["fonts"]}</dd></div>
      <div><dt>Back print</dt><dd>{bw:.1f} × {bh:.1f} in</dd></div>
      <div><dt>Chest print</dt><dd>{fw:.1f} × {fh:.1f} in</dd></div>
      <div><dt>Inks</dt><dd>2 per shirt</dd></div>
    </dl>
  </div>
  <div class="cards">{"".join(cards)}</div>
</section>'''


PAGE = r'''<title>AC Jets Class of 2027 Shirt</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Stencil+Display:wght@800&family=Chakra+Petch:wght@500;600;700&family=Barlow:wght@400;500&display=swap">
<style>
/* Layout: flight-ops pick sheet. Concept header strip, then a row of three shirt-colour cards, each with front + back mockups side by side. */
:root {
  --bg: #e4e6e8;
  --panel: #f2f3f4;
  --line: #c3c7cc;
  --fg: #16181b;
  --muted: #5a6068;
  --red: #c8102e;
  --chip: #d5d9dd;
  --shadow: rgba(20, 24, 30, .22);
  --font-display: "Big Shoulders Stencil Display", "Chakra Petch", system-ui, sans-serif;
  --font-tech: "Chakra Petch", ui-monospace, "SFMono-Regular", monospace;
  --font-body: "Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0e1013; --panel: #171a1e; --line: #2c3138; --fg: #eceef0;
    --muted: #98a0aa; --red: #e2223f; --chip: #242930; --shadow: rgba(0, 0, 0, .55); color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0e1013; --panel: #171a1e; --line: #2c3138; --fg: #eceef0;
  --muted: #98a0aa; --red: #e2223f; --chip: #242930; --shadow: rgba(0, 0, 0, .55); color-scheme: dark;
}
* { box-sizing: border-box; }
body {
  background: var(--bg); color: var(--fg); font-family: var(--font-body);
  font-size: 1rem; line-height: 1.5;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-block: 0 4rem;
}
.wrap { max-width: 1320px; margin: 0 auto; }
.masthead { display: grid; gap: 1rem; padding-block: 2.5rem 1.5rem; border-bottom: 2px solid var(--fg); }
.eyebrow { font-family: var(--font-tech); font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
  font-size: .78rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: .4rem 1.4rem; margin: 0; }
.eyebrow b { color: var(--red); font-weight: 700; }
h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.6rem, 7vw, 5rem);
  line-height: .9; margin: 0; letter-spacing: .01em; text-wrap: balance; text-transform: uppercase; }
h1 span { color: var(--red); }
.lede { max-width: 62ch; margin: 0; color: var(--muted); }
.controls { display: flex; flex-wrap: wrap; gap: .75rem 1.5rem; align-items: center; padding-block: 1.25rem;
  position: sticky; top: env(safe-area-inset-top, 0px); background: var(--bg); z-index: 5; border-bottom: 1px solid var(--line); }
.controls .lbl { font-family: var(--font-tech); font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.seg { display: inline-flex; flex-wrap: wrap; gap: .35rem; }
.seg button, .jump a {
  font-family: var(--font-tech); font-weight: 600; font-size: .82rem; letter-spacing: .08em; text-transform: uppercase;
  border: 1px solid var(--line); background: var(--panel); color: var(--fg); padding: .4rem .75rem; border-radius: 2px;
  cursor: pointer; text-decoration: none;
}
.seg button[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.seg button:focus-visible, .jump a:focus-visible, .zoom:focus-visible, .close:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }
.jump { display: inline-flex; gap: .35rem; margin-left: auto; }
.concept { padding-block: 3rem 1rem; border-bottom: 1px solid var(--line); scroll-margin-top: 5rem; }
.concept-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: .5rem 3rem; align-items: end; margin-bottom: 1.5rem; }
.tag { font-family: var(--font-tech); font-weight: 700; color: var(--red); letter-spacing: .2em; text-transform: uppercase; font-size: .8rem; margin: 0; grid-column: 1; }
h2 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: clamp(2.2rem, 5vw, 3.6rem);
  line-height: .9; margin: 0; grid-column: 1; text-wrap: balance; }
.blurb { margin: 0; grid-column: 2; grid-row: 1 / span 2; max-width: 58ch; color: var(--muted); }
.spec { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: .4rem 2rem; margin: .75rem 0 0; }
.spec div { display: flex; gap: .5rem; align-items: baseline; }
.spec dt { font-family: var(--font-tech); font-size: .7rem; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.spec dd { margin: 0; font-family: var(--font-tech); font-weight: 600; font-size: .9rem; font-variant-numeric: tabular-nums; }
.cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.card { background: var(--panel); border: 1px solid var(--line); padding: .9rem .9rem .6rem; min-width: 0; }
.card-head { display: flex; align-items: center; gap: .6rem; margin-bottom: .4rem; }
.card-head h3 { margin: 0; font-family: var(--font-tech); font-weight: 700; font-size: .95rem; letter-spacing: .1em; text-transform: uppercase; }
.swatch { width: .9rem; height: .9rem; border-radius: 50%; background: var(--shirt); border: 1px solid var(--line); }
.inks { margin-left: auto; font-family: var(--font-tech); font-size: .74rem; color: var(--muted); letter-spacing: .06em; text-transform: uppercase; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: .25rem; }
.view { margin: 0; min-width: 0; }
.view figcaption { text-align: center; font-family: var(--font-tech); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.zoom { all: unset; display: block; width: 100%; cursor: zoom-in; border-radius: 2px; }
.shirt { display: block; width: 100%; height: auto; max-width: 100%; filter: drop-shadow(0 6px 9px var(--shadow)); }
body[data-only] .card { display: none; }
body[data-only="black"] .card[data-shirt="black"],
body[data-only="white"] .card[data-shirt="white"],
body[data-only="heather"] .card[data-shirt="heather"] { display: block; }
body[data-only] .cards { grid-template-columns: minmax(0, 760px); justify-content: center; }
.notes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 1.5rem; padding-block: 2.5rem 0; }
.notes h4 { font-family: var(--font-tech); letter-spacing: .14em; text-transform: uppercase; font-size: .8rem; margin: 0 0 .4rem; color: var(--red); }
.notes p { margin: 0; color: var(--muted); max-width: 60ch; }
dialog { border: 0; padding: 0; background: var(--panel); color: var(--fg); width: min(92vw, 900px); max-height: 92vh; }
dialog::backdrop { background: rgba(8, 9, 11, .82); }
.dlg { display: grid; gap: .5rem; padding: 1rem; }
.dlg-head { display: flex; align-items: center; gap: 1rem; }
.dlg-head p { margin: 0; font-family: var(--font-tech); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; font-size: .85rem; }
.close { margin-left: auto; font-family: var(--font-tech); font-weight: 700; background: var(--fg); color: var(--bg); border: 0; padding: .45rem .8rem; cursor: pointer; letter-spacing: .1em; text-transform: uppercase; }
.dlg-body { overflow: auto; max-height: calc(92vh - 5rem); }
.dlg-body .shirt { width: 100%; }
@media (max-width: 980px) {
  .cards { grid-template-columns: minmax(0, 1fr); }
  .concept-head { grid-template-columns: minmax(0, 1fr); }
  .blurb { grid-column: 1; grid-row: auto; }
  .jump { margin-left: 0; }
}
@media (prefers-reduced-motion: no-preference) {
  .zoom .shirt { transition: transform .25s ease; }
  .zoom:hover .shirt { transform: translateY(-3px); }
}
</style>
{{DEFS}}
{{SYMBOLS}}
<div class="wrap">
  <header class="masthead">
    <p class="eyebrow"><span>Adams Central Flying Jets</span><span>Monroe, IN</span><span>40°44′50″N 84°56′27″W</span><b>Senior shirt · concepts</b></p>
    <h1>Class of <span>2027</span></h1>
    <p class="lede">Three concepts, each shown front and back on black, white and heather grey shirts. Every version uses two spot inks: red plus white on black shirts, and red plus black on white and heather. Click any shirt to see it larger, then reply with the concept letter you want finalized.</p>
  </header>
  <nav class="controls" aria-label="Filter">
    <span class="lbl">Shirt</span>
    <div class="seg" role="group" aria-label="Shirt color">
      <button type="button" id="f-all" data-f="" aria-pressed="true">All</button>
      <button type="button" id="f-black" data-f="black" aria-pressed="false">Black</button>
      <button type="button" id="f-white" data-f="white" aria-pressed="false">White</button>
      <button type="button" id="f-heather" data-f="heather" aria-pressed="false">Heather</button>
    </div>
    <div class="jump"><a href="#concept-a">A</a><a href="#concept-b">B</a><a href="#concept-c">C</a></div>
  </nav>
  {{SECTIONS}}
  <section class="notes" aria-label="Print notes">
    <div><h4>Ink</h4><p>The red is matched to PMS 186 C. Black shirts need a white underbase under the red so it stays bright, which counts as a screen at most shops. White and heather shirts print red and black directly.</p></div>
    <div><h4>Files</h4><p>All type is converted to outlines and every ink sits in its own layer. Inks knock out of each other instead of overlapping. Back art is 12 in wide and the chest hit is 3.5 in wide.</p></div>
    <div><h4>The jet</h4><p>The jet is an original twin-tail fighter, modelled in 3D and drawn from scratch for this shirt. It is not traced from the school logo.</p></div>
  </section>
</div>
<dialog id="dlg" aria-label="Enlarged mockup">
  <div class="dlg">
    <div class="dlg-head"><p id="dlg-title"></p><button class="close" type="button" id="dlg-close">Close</button></div>
    <div class="dlg-body" id="dlg-body"></div>
  </div>
</dialog>
<script>
(function () {
  var body = document.body;
  var btns = document.querySelectorAll('.seg button');
  function setFilter(f) {
    if (f) body.setAttribute('data-only', f); else body.removeAttribute('data-only');
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
    try { localStorage.setItem('acjets-filter', f); } catch (e) {}
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { setFilter(b.dataset.f); }); });
  try { var saved = localStorage.getItem('acjets-filter'); if (saved) setFilter(saved); } catch (e) {}

  var dlg = document.getElementById('dlg');
  var dBody = document.getElementById('dlg-body');
  var dTitle = document.getElementById('dlg-title');
  document.querySelectorAll('.zoom').forEach(function (z) {
    z.addEventListener('click', function () {
      var card = z.closest('.card');
      dBody.innerHTML = '';
      dBody.setAttribute('style', card.getAttribute('style'));
      dBody.appendChild(z.querySelector('svg').cloneNode(true));
      dTitle.textContent = z.getAttribute('aria-label').replace('Enlarge ', '');
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    });
  });
  document.getElementById('dlg-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();
</script>
'''


def build_final(cid):
    c = next(x for x in CONCEPTS if x["id"] == cid.upper())
    folder = os.path.join(ROOT, "final")
    os.makedirs(folder, exist_ok=True)
    for side in ("front", "back"):
        inks, w, h = art(c, side)
        for s in SHIRTS:
            base = f'ac-jets-2027_{c["slug"]}_{side}_{s["key"]}-shirt'
            title = f'AC Jets Class of 2027, {c["name"]}, {side}, {s["label"]} shirt'
            svg = print_svg(inks, w, h, s, title, prec=3)
            with open(os.path.join(folder, base + ".svg"), "w") as f:
                f.write(svg)
            px_w = round(w / UNITS_PER_IN * 300)
            cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(folder, base + "_300dpi.png"),
                             output_width=px_w, dpi=300)
            print(" ", base, f"{px_w}px wide")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "final":
        build_final(sys.argv[2])
    else:
        build_concepts()
