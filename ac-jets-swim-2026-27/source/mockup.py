"""Generate the HTML mockup / line sheet for the collection.

Every print is embedded once as an SVG <symbol> whose paths are coloured by
CSS variables, so each colourway is the exact production geometry with its inks
swapped. Garment flats are drawn in inches and prints are placed at true size.

usage: python3 mockup.py            -> ../mockup.html (standalone page)
       python3 mockup.py --fragment PATH   (same page without the document wrapper)
"""
import html
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ.setdefault("ACJ_FONT_DIR", os.path.join(HERE, ".fonts"))

import svgkit as K  # noqa: E402
import garmentart as GA  # noqa: E402
import build  # noqa: E402
from common import GARMENTS, INKS, PALETTES  # noqa: E402

CONCEPTS = [build.CONCEPTS["squadron"]]          # the chosen direction
ROOT = os.path.dirname(HERE)
AI_DIR = os.path.join(ROOT, "ai-exploration")
PREFIX = {"squadron": "sq", "lane-four": "lf", "aero-varsity": "av"}

STORY = {
    "squadron": ("The team's AC logo over 26-27 on every front, and the red jet flying a pool lane on every back.",
                 "The AC logo is the team's own artwork, redrawn clean as 1-ink vector. The back comes from Figma AI frames "
                 "the team picked, redrawn as 2-ink vector. The crewneck and hoodie add SWIM & DIVE, a contrail line and the jet "
                 "flying down the left sleeve; the sweatpants carry the AC logo and 26-27 small on the hip and AC SWIM & DIVE down the leg "
                 "with the jet flying down below it."),
    "lane-four": ("Performance minimal: one expanded italic, the jet cut down to an arrowhead, lots of air.",
                  "Named for the center lane, where the top seed swims. A lane-rope band with red end floats runs through "
                  "every piece, and everything leans on the same 10° axis."),
    "aero-varsity": ("Vintage collegiate: slab lettering with a printed varsity outline on the hero words.",
                     "The jet’s twin contrails run straight, then ease into waves, used like the tail under an old "
                     "athletic script."),
}

INK_MAIN = {g: INKS[PALETTES[g]["main"]][1] for g in GARMENTS}
RED = INKS["red"][1]


# ------------------------------------------------------------------ artwork

def symbols():
    """<symbol> per artwork + {(slug, key): (w_in, h_in, title, placement)}."""
    out, dims = [], {}
    for c in CONCEPTS:
        for fn in c.ARTS:
            art = fn()
            # build with one ink key per role so the page can recolour each garment:
            # white = main, red = accent, black = outline
            pal = {"main": "white", "accent": "red", "detail": "white", "outline": "black", "logo": "logo"}
            lay = K.knockout([(pal[r], p) for r, p in art.layers])
            allp = K.union(*[p for _, p in lay])
            bx = K.bounds(allp)
            layers = [(k, K.translate(p, -bx[0], -bx[1])) for k, p in lay]
            w, h = math.ceil(bx[2] - bx[0]) / 100, math.ceil(bx[3] - bx[1]) / 100
            sid = f"{PREFIX[c.SLUG]}-{art.key}"
            paths = []
            for ink, p in layers:
                var = {"red": "--a", "black": "--o", "logo": "--l"}.get(ink, "--m")
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


# ------------------------------------------------------------------ garments (see garmentart.py)

def svg_wrap(vb, inner, g, label):
    o = PALETTES[g].get("outline")
    outline = INKS[o][1] if o else "transparent"
    style = f"--m:{INK_MAIN[g]};--a:{INKS[PALETTES[g]['accent']][1]};--o:{outline};--l:{INKS[PALETTES[g]['logo']][1]}"
    return (f'<svg class="flat" viewBox="{vb}" style="{style}" role="img" aria-label="{html.escape(label)}">'
            f"{inner}</svg>")


def view_label(x, y, text):
    return f'<text x="{x}" y="{y}" class="vl" text-anchor="middle">{text}</text>'


def two_views(front, back, w, h, label):
    return (f"<g>{front}{view_label(w / 2, h - 0.8, 'FRONT')}</g>"
            f'<g transform="translate({w + 1.5:g} 0)">{back}{view_label(w / 2, h - 0.8, "BACK")}</g>')


def tee(slug, g, dims):
    p = PREFIX[slug]
    front = GA.tee_view(g, place(f"{p}-front", dims, slug, "front", 16, 6.2), front=True)
    back = GA.tee_view(g, place(f"{p}-tee-back", dims, slug, "tee-back", 16, 4.8), front=False)
    inner = two_views(front, back, 32, 33.4, "Tee")
    return svg_wrap("0 0 65.5 33.4", inner, g, f"Tee, front and back, {GARMENTS[g][0]}")


def hoodie(slug, g, dims):
    p = PREFIX[slug]
    prints = (place(f"{p}-front", dims, slug, "front", 20, 12.0)
              + place(f"{p}-sleeve", dims, slug, "sleeve", 31.35, 15.4, rot=-10))
    front = GA.hoodie_view(g, prints, front=True, strings=GA.drawstrings(g))
    back = GA.hoodie_view(g, place(f"{p}-back", dims, slug, "back", 20, 10.6), front=False)
    inner = two_views(front, back, 40, 35.6, "Hoodie")
    return svg_wrap("0 0 81.5 35.6", inner, g, f"Hoodie, front and back, {GARMENTS[g][0]}")


def crew(slug, g, dims):
    p = PREFIX[slug]
    prints = (place(f"{p}-front", dims, slug, "front", 20, 7.4)
              + place(f"{p}-sleeve", dims, slug, "sleeve", 31.35, 9.6, rot=-10))
    front = GA.crew_view(g, prints, front=True)
    back = GA.crew_view(g, place(f"{p}-back", dims, slug, "back", 20, 5.4), front=False)
    inner = two_views(front, back, 40, 30.6, "Crewneck")
    return svg_wrap("0 0 81.5 30.6", inner, g, f"Crewneck, front and back, {GARMENTS[g][0]}")


def sweats(slug, g, dims):
    p = PREFIX[slug]
    prints = (place(f"{p}-sweats-hip", dims, slug, "sweats-hip", 17.9, 6.6)
              + place(f"{p}-sweats-leg", dims, slug, "sweats-leg", 7.0, 8.4, rot=-2.5))
    inner = GA.sweats_view(g, prints)
    return svg_wrap("0 0 28 44", inner, g, f"Sweatpants, front, {GARMENTS[g][0]}")


PIECES = [
    ("tee", "Tee", tee, ["front", "tee-back"]),
    ("hoodie", "Hoodie", hoodie, ["front", "back", "sleeve"]),
    ("crew", "Crewneck", crew, ["front", "back", "sleeve"]),
    ("sweats", "Sweatpants", sweats, ["sweats-hip", "sweats-leg"]),
]
PRINT_LABEL = {"front": "Front", "tee-back": "Full back", "back": "Full back", "sleeve": "Left sleeve", "sweats-hip": "Left hip", "sweats-leg": "Right leg"}


def ink_dots(g):
    pal = PALETTES[g]
    out = []
    keys = [pal["accent"], pal["main"]] + ([pal["outline"]] if pal.get("outline") and pal["outline"] not in (pal["main"], pal["accent"]) else [])
    for k in keys:
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
        f'<i style="background:{GA.FILL[g]}"></i>{GARMENTS[g][0]}</button>' for g in GARMENTS)
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
nav.tabs{position:relative;z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}
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
.concept-mark{background:#161617;border-radius:6px;padding:28px 32px;display:flex;align-items:center;justify-content:center;--m:#FFFFFF;--a:#C8102E;--o:transparent}
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
.piece{scroll-margin-top:16px}
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

FONT_CREDIT = "Saira Black throughout"

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
        f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{HEATHER_FILTER}{GA.DEFS}{syms}</defs></svg>'
        '<header class="wrap top"><div><p class="eyebrow">Adams Central Jets · Swim &amp; Dive · Monroe, Indiana</p>'
        '<h1>2026–27 <em>Squadron</em> Collection</h1>'
        '<p class="intro">The final team apparel set: tee, hoodie, crewneck and sweatpants in black, white, dark heather grey and red (white print). '
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
