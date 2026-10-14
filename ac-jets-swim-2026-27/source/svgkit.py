"""Small vector toolkit for print-ready apparel art.

Everything is built as skia-pathops Paths so that:
  * all type is converted to real outlines (no live fonts in the SVGs),
  * overlapping shapes are merged (no stacked ink),
  * every ink layer is knocked out of the layers beneath it (no overprints).

Units: 1 unit = 0.01 inch. A 12in-wide print is 1200 units wide.
"""
import math
import os
import urllib.request

import pathops
import uharfbuzz as hb
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

UNITS_PER_INCH = 100
HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.environ.get("ACJ_FONT_DIR", os.path.join(HERE, ".fonts"))

# Google Fonts (SIL Open Font License) used by the collection.
FONT_SPECS = {
    "stencil": "Big+Shoulders+Stencil+Display:wght@900",
    "stencil800": "Big+Shoulders+Stencil+Display:wght@800",
    "cond600": "Barlow+Condensed:wght@600",
    "cond700": "Barlow+Condensed:wght@700",
    "cond800": "Barlow+Condensed:wght@800",
    "mono": "IBM+Plex+Mono:wght@500",
    "mono600": "IBM+Plex+Mono:wght@600",
    "wideitalic": "Archivo:ital,wdth,wght@1,125,900",
    "italic": "Archivo:ital,wdth,wght@1,100,900",
    "wide800": "Archivo:wdth,wght@125,800",
    "barlowi900": "Barlow:ital,wght@1,900",
    "barlowi800": "Barlow:ital,wght@1,800",
    "barlowi600": "Barlow:ital,wght@1,600",
    "graduate": "Graduate",
    "zilla": "Zilla+Slab:wght@700",
    "bitter": "Bitter:wght@800",
    "alfa": "Alfa+Slab+One",
    "caslon": "Libre+Caslon+Text:wght@700",
    "robotoslab": "Roboto+Slab:wght@800",
    "rokkitt": "Rokkitt:wght@800",
    "rokkitt900": "Rokkitt:wght@900",
    "wide900": "Archivo:wdth,wght@125,900",
    "saira": "Saira:ital,wdth,wght@1,125,900",
    "sairaxc900": "Saira+Extra+Condensed:wght@900",
    "sairaxc800": "Saira+Extra+Condensed:wght@800",
    "sairac800": "Saira+Condensed:wght@800",
    "sairac700": "Saira+Condensed:wght@700",
    "barlowc900": "Barlow+Condensed:wght@900",
}


def _download(spec, dest):
    css_url = "https://fonts.googleapis.com/css2?family=" + spec
    req = urllib.request.Request(css_url, headers={"User-Agent": "Mozilla/5.0"})
    css = urllib.request.urlopen(req).read().decode()
    start = css.index("https://fonts.gstatic.com")
    url = css[start:css.index(")", start)]
    with urllib.request.urlopen(url) as r, open(dest, "wb") as f:
        f.write(r.read())


_FONTS = {}


def font(name):
    if name not in _FONTS:
        os.makedirs(FONT_DIR, exist_ok=True)
        path = os.path.join(FONT_DIR, name + ".ttf")
        if not os.path.exists(path):
            _download(FONT_SPECS[name], path)
        _FONTS[name] = Font(path)
    return _FONTS[name]


class Font:
    def __init__(self, path):
        self.tt = TTFont(path)
        self.glyphset = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()
        self.upem = self.tt["head"].unitsPerEm
        os2 = self.tt["OS/2"]
        self.cap = getattr(os2, "sCapHeight", 0) or self._measure_cap()
        blob = hb.Blob.from_file_path(path)
        self.hb = hb.Font(hb.Face(blob))

    def _measure_cap(self):
        from fontTools.pens.boundsPen import BoundsPen
        bp = BoundsPen(self.glyphset)
        self.glyphset["H"].draw(bp)
        return bp.bounds[3]

    def shape(self, text, kern=True):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": kern, "liga": False})
        out = []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            out.append((self.order[info.codepoint], pos.x_advance, pos.x_offset, pos.y_offset))
        return out


# --------------------------------------------------------------------- paths

def new():
    return pathops.Path()


def union(*paths):
    paths = [p for p in paths if p is not None]
    if not paths:
        return new()
    out = new()
    for p in paths:
        out.addPath(p)
    return pathops.simplify(out, clockwise=True)


def diff(a, b):
    return pathops.op(a, b, pathops.PathOp.DIFFERENCE, clockwise=True)


def inter(a, b):
    return pathops.op(a, b, pathops.PathOp.INTERSECTION, clockwise=True)


def transformed(path, a, b, c, d, e, f):
    """Affine (SVG matrix order a b c d e f)."""
    return path.transform(a, b, c, d, e, f)


def translate(path, dx, dy):
    return path.transform(1, 0, 0, 1, dx, dy)


def scale(path, sx, sy=None, cx=0, cy=0):
    sy = sx if sy is None else sy
    return path.transform(sx, 0, 0, sy, cx - sx * cx, cy - sy * cy)


def rotate(path, deg, cx=0, cy=0):
    r = math.radians(deg)
    c, s = math.cos(r), math.sin(r)
    return path.transform(c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy)


def skew_x(path, slant, y0=0):
    """Shear so shapes lean right like italics (slant = tan(angle))."""
    return path.transform(1, 0, -slant, 1, slant * y0, 0)


def bounds(path):
    if not list(path.segments):
        return (0, 0, 0, 0)
    return path.bounds


def poly(points, closed=True):
    p = new()
    p.moveTo(*points[0])
    for pt in points[1:]:
        p.lineTo(*pt)
    if closed:
        p.close()
    return pathops.simplify(p, clockwise=True)


def rect(x, y, w, h):
    return poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])


def rrect(x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    k = 0.5523 * r
    p = new()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.cubicTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r)
    p.lineTo(x + w, y + h - r)
    p.cubicTo(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h)
    p.lineTo(x + r, y + h)
    p.cubicTo(x + r - k, y + h, x, y + h - r + k, x, y + h - r)
    p.lineTo(x, y + r)
    p.cubicTo(x, y + r - k, x + r - k, y, x + r, y)
    p.close()
    return pathops.simplify(p, clockwise=True)


def circle(cx, cy, r):
    k = 0.5523 * r
    p = new()
    p.moveTo(cx + r, cy)
    p.cubicTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
    p.cubicTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy)
    p.cubicTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
    p.cubicTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy)
    p.close()
    return pathops.simplify(p, clockwise=True)


def stroke(path, width, cap="butt", join="miter", miter=4.0):
    caps = {"butt": pathops.LineCap.BUTT_CAP, "round": pathops.LineCap.ROUND_CAP,
            "square": pathops.LineCap.SQUARE_CAP}
    joins = {"miter": pathops.LineJoin.MITER_JOIN, "round": pathops.LineJoin.ROUND_JOIN,
             "bevel": pathops.LineJoin.BEVEL_JOIN}
    p = new()
    p.addPath(path)
    p.stroke(width, caps[cap], joins[join], miter)
    p.convertConicsToQuads()
    return pathops.simplify(p, clockwise=True)


def line(x1, y1, x2, y2, width, cap="butt"):
    p = new()
    p.moveTo(x1, y1)
    p.lineTo(x2, y2)
    return stroke(p, width, cap)


def open_path(cmds):
    """cmds: list like [('M', x, y), ('C', x1, y1, x2, y2, x, y), ('L', x, y), ('Q', ...)]"""
    p = new()
    for c in cmds:
        if c[0] == "M":
            p.moveTo(*c[1:])
        elif c[0] == "L":
            p.lineTo(*c[1:])
        elif c[0] == "C":
            p.cubicTo(*c[1:])
        elif c[0] == "Q":
            p.quadTo(*c[1:])
        elif c[0] == "Z":
            p.close()
    return p


def closed(cmds):
    return pathops.simplify(open_path(cmds + [("Z",)]), clockwise=True)


# ---------------------------------------------------------------------- type

def _glyph_path(f, gname, xform):
    p = new()
    pen = TransformPen(p.getPen(glyphSet=f.glyphset), xform)
    f.glyphset[gname].draw(pen)
    return p


def text(fontname, s, cap, x=0, y=0, tracking=0.0, anchor="start", slant=0.0, kern=True,
         spaces=1.0):
    """Outline a line of text.

    cap       cap height in units (0.01in)
    y         baseline
    tracking  extra letterspacing in em/1000 (like design apps)
    anchor    start | middle | end   (aligned to the ink bounds)
    slant     extra synthetic oblique (tan of angle); 0 for none
    """
    f = font(fontname)
    sc = cap / f.cap
    track = tracking / 1000.0 * f.upem
    out = new()
    pen_x = 0.0
    glyphs = f.shape(s, kern)
    for i, (g, adv, xo, yo) in enumerate(glyphs):
        if g == "space":
            pen_x += adv * spaces + track
            continue
        gx = pen_x + xo
        xform = (sc, 0, slant * sc, -sc, gx * sc, -yo * sc)
        out.addPath(_glyph_path(f, g, xform))
        pen_x += adv + (track if i < len(glyphs) - 1 else 0)
    out = pathops.simplify(out, clockwise=True)
    x0, _, x1, _ = bounds(out)
    if anchor == "middle":
        dx = x - (x0 + x1) / 2
    elif anchor == "end":
        dx = x - x1
    else:
        dx = x - x0
    return translate(out, dx, y)


def text_mixed(runs, cap, x=0, y=0, tracking=0.0, anchor="start"):
    """Several fonts on one baseline at a common cap height.
    runs: [(fontname, string, extra_slant)]. Used to borrow a single glyph
    (e.g. a clearer ampersand) from a companion face."""
    out = new()
    pen = 0.0
    for fn, s, sl in runs:
        f = font(fn)
        sc = cap / f.cap
        track = tracking / 1000.0 * f.upem
        for g, adv, xo, yo in f.shape(s):
            if g != "space":
                xform = (sc, 0, sl * sc, -sc, pen + xo * sc, -yo * sc)
                out.addPath(_glyph_path(f, g, xform))
            pen += (adv + track) * sc
    out = pathops.simplify(out, clockwise=True)
    x0, _, x1, _ = bounds(out)
    dx = {"middle": x - (x0 + x1) / 2, "end": x - x1}.get(anchor, x - x0)
    return translate(out, dx, y)


def text_glyphs(fontname, s, cap, x=0, y=0, tracking=0.0, kern=True):
    """Like text() but returns [(char, glyph_path)] positioned on the baseline (anchor start at x).
    Used for per-letter work such as hand-placed stencil bridges."""
    f = font(fontname)
    sc = cap / f.cap
    track = tracking / 1000.0 * f.upem
    out = []
    pen_x = 0.0
    glyphs = f.shape(s, kern)
    for i, (g, adv, xo, yo) in enumerate(glyphs):
        if g != "space":
            xform = (sc, 0, 0, -sc, (pen_x + xo) * sc + x, -yo * sc + y)
            out.append((s[i] if i < len(s) else g, pathops.simplify(_glyph_path(f, g, xform), clockwise=True)))
        pen_x += adv + (track if i < len(glyphs) - 1 else 0)
    return out


def text_width(fontname, s, cap, tracking=0.0, slant=0.0):
    p = text(fontname, s, cap, tracking=tracking, slant=slant)
    b = bounds(p)
    return b[2] - b[0]


def fit_cap(fontname, s, width, tracking=0.0, slant=0.0):
    """Cap height that makes the text exactly `width` wide."""
    w = text_width(fontname, s, 100, tracking, slant)
    return 100 * width / w


def arc_text(fontname, s, cap, cx, cy, radius, tracking=0.0, kern=True, spaces=1.0, below=False):
    """Text set along a circular arc, each letter rotated to the tangent.

    (cx, cy) is the centre of the circle and `radius` is measured to the baseline.
    below=False: arch over the top, letters pointing outward (classic collegiate arch).
    below=True : along the bottom reading left to right, letter tops toward the centre.
    """
    f = font(fontname)
    sc = cap / f.cap
    track = tracking / 1000.0 * f.upem
    glyphs = f.shape(s, kern)
    items = []
    pen_x = 0.0
    for i, (g, adv, xo, yo) in enumerate(glyphs):
        a = adv * (spaces if g == "space" else 1)
        items.append((g, pen_x, a, xo))
        pen_x += a + (track if i < len(glyphs) - 1 else 0)
    total = pen_x * sc
    out = new()
    for g, px, a, xo in items:
        if g == "space":
            continue
        th = ((px + a / 2) * sc - total / 2) / radius
        c, s_ = math.cos(th), math.sin(th)
        off = (xo - a / 2) * sc
        if not below:
            bx, by = cx + radius * s_, cy - radius * c
            xform = (sc * c, sc * s_, sc * s_, -sc * c, bx + off * c, by + off * s_)
        else:
            bx, by = cx + radius * s_, cy + radius * c
            xform = (sc * c, -sc * s_, -sc * s_, -sc * c, bx + off * c, by - off * s_)
        out.addPath(_glyph_path(f, g, xform))
    return pathops.simplify(out, clockwise=True)


# ----------------------------------------------------------------------- SVG

def path_d(path, nd=2):
    from fontTools.pens.svgPathPen import SVGPathPen

    fmt = "%." + str(nd) + "f"

    def ntos(v):
        s = (fmt % v).rstrip("0").rstrip(".")
        return "0" if s in ("-0", "") else s

    pen = SVGPathPen(None, ntos=ntos)
    path.draw(pen)
    return pen.getCommands()


def knockout(layers):
    """layers: list of (ink_key, Path) bottom -> top. Returns the same list with
    every layer minus everything above it, so no two inks ever overlap."""
    out = []
    above = new()
    for key, p in reversed(layers):
        clean = diff(p, above) if list(above.segments) else pathops.simplify(p, clockwise=True)
        out.append((key, clean))
        above = union(above, p)
    out.reverse()
    # merge same-ink layers
    merged = {}
    order = []
    for key, p in out:
        if key not in merged:
            merged[key] = p
            order.append(key)
        else:
            merged[key] = union(merged[key], p)
    return [(k, merged[k]) for k in order]


def svg_doc(layers, width_in, height_in, inks, title, desc="", margin=0):
    """layers: [(ink_key, Path)] already knocked out. inks: {ink_key: (name, hex)}."""
    W, H = width_in * UNITS_PER_INCH, height_in * UNITS_PER_INCH
    parts = []
    used = []
    for key, p in layers:
        if not list(p.segments):
            continue
        name, hexv = inks[key]
        used.append(f"{name} {hexv}")
        parts.append(f'  <g id="ink-{name.lower().replace(" ", "-")}">\n'
                     f'    <path fill="{hexv}" fill-rule="nonzero" d="{path_d(p)}"/>\n  </g>')
    meta = (f"<!-- {title.replace('&amp;', '&')}\n     Print size: {width_in:g} x {height_in:g} in (1 unit = 0.01 in)\n"
            f"     Inks ({len(used)}): {', '.join(used)}\n"
            f"     All type converted to outlines; inks knocked out (no overprint). -->")
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n{meta}\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width_in:g}in" height="{height_in:g}in" '
            f'viewBox="0 0 {W:g} {H:g}">\n  <title>{title}</title>\n'
            + (f"  <desc>{desc}</desc>\n" if desc else "")
            + "\n".join(parts) + "\n</svg>\n")
