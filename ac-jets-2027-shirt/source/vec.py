"""Vector toolkit: outlined text, shapes, boolean ops, SVG output.

Every shape is a pathops.Path in artboard units (y down). Text is shaped
with HarfBuzz (real kerning) and converted to outlines, so the exported
SVGs never depend on installed fonts.
"""
import math
import os

import pathops
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")
K = 0.5522847498  # cubic circle constant


# --------------------------------------------------------------- fonts / text
class Font:
    _cache = {}

    def __new__(cls, name):
        if name not in cls._cache:
            obj = super().__new__(cls)
            path = os.path.join(FONT_DIR, name + ".ttf")
            obj.tt = TTFont(path)
            obj.glyphs = obj.tt.getGlyphSet()
            obj.upem = obj.tt["head"].unitsPerEm
            blob = hb.Blob.from_file_path(path)
            obj.hbfont = hb.Font(hb.Face(blob))
            obj.cap = getattr(obj.tt["OS/2"], "sCapHeight", 0) or obj.upem * 0.7
            cls._cache[name] = obj
        return cls._cache[name]


def _shape(font, text):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font.hbfont, buf, {"kern": True, "liga": False})
    order = font.tt.getGlyphOrder()
    return [(order[i.codepoint], p.x_advance, p.x_offset, p.y_offset)
            for i, p in zip(buf.glyph_infos, buf.glyph_positions)]


def text_width(font, text, size, tracking=0.0):
    s = size / font.upem
    glyphs = _shape(font, text)
    return sum(a for _, a, _, _ in glyphs) * s + tracking * size * (len(glyphs) - 1)


def text(fontname, txt, size, x, y, anchor="start", tracking=0.0, width=None):
    """Outlined text. `size` = em size; (x, y) = baseline point.
    tracking is in em. If `width` is given the text is scaled horizontally
    to exactly that width (for tight lock-ups)."""
    font = Font(fontname)
    s = size / font.upem
    glyphs = _shape(font, txt)
    w = text_width(font, txt, size, tracking)
    sx = 1.0
    if width:
        sx = width / w
        w = width
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    out = pathops.Path()
    pen = out.getPen(glyphSet=font.glyphs)
    cx = 0.0
    for name, adv, xo, yo in glyphs:
        gx = x + (cx + xo * s) * sx
        t = TransformPen(pen, (s * sx, 0, 0, -s, gx, y - yo * s))
        font.glyphs[name].draw(t)
        cx += adv * s + tracking * size
    return simplify(out)


def cap_height(fontname, size):
    f = Font(fontname)
    return f.cap / f.upem * size


def text_on_arc(fontname, txt, size, cx, cy, r, center_deg, tracking=0.0, top=True):
    """Text along a circle whose cap-height centre sits on radius r.
    center_deg: angle (0 = up, clockwise) of the string's middle.
    top=True reads clockwise over the top; top=False reads upright
    along the bottom."""
    font = Font(fontname)
    s = size / font.upem
    glyphs = _shape(font, txt)
    advs = [a * s + tracking * size for _, a, _, _ in glyphs]
    total = sum(advs) - tracking * size
    capc = font.cap / font.upem * size / 2
    rr = r - capc if top else r + capc  # baseline radius
    out = pathops.Path()
    pen = out.getPen(glyphSet=font.glyphs)
    dist = -total / 2
    for (name, adv, xo, yo), a in zip(glyphs, advs):
        hx = adv * s / 2
        ang = (dist + hx) / rr
        theta = math.radians(center_deg) + (ang if top else -ang)
        bx = cx + rr * math.sin(theta)
        by = cy - rr * math.cos(theta)
        rot = theta if top else theta + math.pi
        c, sn = math.cos(rot), math.sin(rot)
        t = TransformPen(pen, (c * s, sn * s, sn * s, -c * s, bx - c * hx, by - sn * hx))
        font.glyphs[name].draw(t)
        dist += a
    return simplify(out)


# ------------------------------------------------------------------- shapes
def poly(pts, closed=True):
    p = pathops.Path()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    if closed:
        p.close()
    return p


def rect(x, y, w, h):
    return poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])


def rrect(x, y, w, h, r):
    p = pathops.Path()
    k = r * (1 - K)
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.cubicTo(x + w - k, y, x + w, y + k, x + w, y + r)
    p.lineTo(x + w, y + h - r)
    p.cubicTo(x + w, y + h - k, x + w - k, y + h, x + w - r, y + h)
    p.lineTo(x + r, y + h)
    p.cubicTo(x + k, y + h, x, y + h - k, x, y + h - r)
    p.lineTo(x, y + r)
    p.cubicTo(x, y + k, x + k, y, x + r, y)
    p.close()
    return p


def circle(cx, cy, r):
    p = pathops.Path()
    k = r * K
    p.moveTo(cx, cy - r)
    p.cubicTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy)
    p.cubicTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
    p.cubicTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy)
    p.cubicTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
    p.close()
    return p


def ring(cx, cy, r_out, r_in):
    return diff(circle(cx, cy, r_out), circle(cx, cy, r_in))


def line(x1, y1, x2, y2, w, cap="butt"):
    p = pathops.Path()
    p.moveTo(x1, y1)
    p.lineTo(x2, y2)
    caps = {"butt": pathops.LineCap.BUTT_CAP, "round": pathops.LineCap.ROUND_CAP,
            "square": pathops.LineCap.SQUARE_CAP}
    p.stroke(w, caps[cap], pathops.LineJoin.MITER_JOIN, 4)
    return simplify(p)


def polyline(pts, w, join="miter", closed=False):
    p = poly(pts, closed=closed)
    joins = {"miter": pathops.LineJoin.MITER_JOIN, "round": pathops.LineJoin.ROUND_JOIN,
             "bevel": pathops.LineJoin.BEVEL_JOIN}
    p.stroke(w, pathops.LineCap.BUTT_CAP, joins[join], 6)
    return simplify(p)


def outline(path, w):
    """Stroke an existing path's contours (centered) -> filled outline."""
    p = pathops.Path()
    path.draw(p.getPen())
    p.stroke(w, pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN, 4)
    return simplify(p)


def arc_band(cx, cy, r_out, r_in, a0, a1, steps=64):
    """Annular sector between angles a0..a1 (deg, 0 = up, clockwise)."""
    pts = []
    for i in range(steps + 1):
        a = math.radians(a0 + (a1 - a0) * i / steps)
        pts.append((cx + r_out * math.sin(a), cy - r_out * math.cos(a)))
    for i in range(steps, -1, -1):
        a = math.radians(a0 + (a1 - a0) * i / steps)
        pts.append((cx + r_in * math.sin(a), cy - r_in * math.cos(a)))
    return poly(pts)


def taper(x1, y1, x2, y2, w1, w2):
    """Tapered streak (contrail) from (x1,y1) width w1 to (x2,y2) width w2."""
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    nx, ny = -dy / L, dx / L
    return poly([(x1 + nx * w1 / 2, y1 + ny * w1 / 2), (x2 + nx * w2 / 2, y2 + ny * w2 / 2),
                 (x2 - nx * w2 / 2, y2 - ny * w2 / 2), (x1 - nx * w1 / 2, y1 - ny * w1 / 2)])


def star(cx, cy, r, inner=0.382, n=5, rot=0):
    pts = []
    for i in range(n * 2):
        rr = r if i % 2 == 0 else r * inner
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + rr * math.sin(a), cy - rr * math.cos(a)))
    return poly(pts)


# -------------------------------------------------------------- operations
def simplify(p):
    return pathops.simplify(p, fix_winding=True, keep_starting_points=False, clockwise=False)


def union(*paths):
    paths = [p for p in _flat(paths) if p is not None]
    if not paths:
        return pathops.Path()
    out = pathops.Path()
    pathops.union(paths, out.getPen())
    return out


def diff(a, *b):
    b = [p for p in _flat(b) if p is not None]
    if not b:
        return a
    out = pathops.Path()
    pathops.difference([a], b, out.getPen())
    return out


def inter(a, b):
    out = pathops.Path()
    pathops.intersection([a], [b], out.getPen())
    return out


def _flat(items):
    for it in items:
        if isinstance(it, (list, tuple)):
            yield from _flat(it)
        else:
            yield it


def xform(p, a=1, b=0, c=0, d=1, e=0, f=0):
    """Affine transform, SVG matrix(a b c d e f) convention."""
    out = pathops.Path()
    p.draw(TransformPen(out.getPen(), (a, b, c, d, e, f)))
    return out


def move(p, dx, dy):
    return xform(p, 1, 0, 0, 1, dx, dy)


def scale(p, sx, sy=None, cx=0, cy=0):
    sy = sx if sy is None else sy
    return xform(p, sx, 0, 0, sy, cx - sx * cx, cy - sy * cy)


def rotate(p, deg, cx=0, cy=0):
    r = math.radians(deg)
    c, s = math.cos(r), math.sin(r)
    return xform(p, c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy)


def dilate(p, r, n=24):
    """Approximate outward offset (Minkowski sum with a disc)."""
    copies = [p] + [move(p, r * math.cos(2 * math.pi * i / n), r * math.sin(2 * math.pi * i / n))
                    for i in range(n)]
    return union(copies)


def bounds(p):
    return p.bounds  # (xmin, ymin, xmax, ymax)


def fit(p, x, y, w=None, h=None, anchor="tl"):
    """Scale uniformly to width w (or height h), placing bbox at x, y."""
    x0, y0, x1, y1 = p.bounds
    s = (w / (x1 - x0)) if w else (h / (y1 - y0))
    q = xform(p, s, 0, 0, s, -x0 * s, -y0 * s)
    bw, bh = (x1 - x0) * s, (y1 - y0) * s
    ox = {"tl": 0, "tc": -bw / 2, "cc": -bw / 2}[anchor]
    oy = {"tl": 0, "tc": 0, "cc": -bh / 2}[anchor]
    return move(q, x + ox, y + oy)


def d(p, prec=2):
    pen = SVGPathPen(None, ntos=lambda v: f"{round(v, prec):g}")
    p.draw(pen)
    return pen.getCommands()
