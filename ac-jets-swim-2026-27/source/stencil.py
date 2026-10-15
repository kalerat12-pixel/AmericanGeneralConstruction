"""Custom stencil lettering for the Squadron hero words (v2).

Base: Saira Extra Condensed Black, outlined. Bridges are boolean cuts placed by
measuring each glyph's own strokes, so every hero word shares one rhythm:

  bridge width  b = max(3% of cap height, 0.04 in)    (never thinner than fleece allows)
  words of 5+ letters (counters_only=True) stay solid except the split-A slits
  E             one full-height vertical gap flush against the stem's inner edge
  J             one vertical gap flush against the stem, through the bottom bar only
  T, 7          one horizontal gap directly under the top bar
  C G          two vertical gaps flush against the stem: through the top and bottom bars
  S 2 6 O      two vertical gaps on the glyph's centre axis: through the top and bottom strokes
  A             rebuilt as a pointed split-A: a sharp delta whose apex is split by one slit,
                echoing the jet's nose and canopy cut
Bridges are only ever vertical or horizontal. Letters not listed stay whole.
"""
import svgkit as K

BASE = "sairaxc900"
MIN_BRIDGE = 4.0            # 0.04 in, in print units (0.01 in) - fleece-safe


def bridge_width(cap):
    return max(0.03 * cap, MIN_BRIDGE)


def slit_width(cap):
    """The split-A slit is the A's counter, so it is sized from the cap, not the bridges."""
    return max(0.07 * cap, MIN_BRIDGE)


# ------------------------------------------------------------- measuring

def _runs(p, fixed, a0, a1, horizontal, step=0.2):
    """Ink intervals along a horizontal (y fixed) or vertical (x fixed) scanline."""
    runs, inside, start = [], False, None
    n = int((a1 - a0) / step) + 1
    for i in range(n + 1):
        a = a0 + i * step
        pt = (a, fixed) if horizontal else (fixed, a)
        c = p.contains(pt)
        if c and not inside:
            inside, start = True, a
        elif not c and inside:
            inside = False
            runs.append((start, a))
    if inside:
        runs.append((start, a1))
    return runs


def _hruns(p, y):
    x0, _, x1, _ = K.bounds(p)
    return _runs(p, y, x0 - 1, x1 + 1, True)


def _vruns(p, x):
    _, y0, _, y1 = K.bounds(p)
    return _runs(p, x, y0 - 1, y1 + 1, False)


def _stem_inner_edge(p, side="left"):
    """Inner edge of the vertical stem: the shortest first ink run across the
    letter's middle band (that is where there are no arms)."""
    x0, y0, x1, y1 = K.bounds(p)
    h = y1 - y0
    best = None
    for f in [i / 40 for i in range(6, 35)]:
        r = _hruns(p, y0 + f * h)
        if not r:
            continue
        run = r[0] if side == "left" else r[-1]
        width = run[1] - run[0]
        if best is None or width < best[0]:
            best = (width, run)
    width, run = best
    return run[1] if side == "left" else run[0]


# ------------------------------------------------------------- the split A

def split_a(cap, b):
    """Split-delta A, baseline y=0, left edge x=0 (svg y-down: cap top at -cap).
    Straight legs rise to a narrow flat tip at cap height. One slit of width b runs
    from the crossbar up through the tip, leaving MIN_BRIDGE of ink on each side, so
    the tip never thins below the print floor and the A stays full cap height."""
    H = cap
    w = 0.56 * H
    leg = 0.20 * H
    tw = b + 2 * MIN_BRIDGE                         # flat tip width
    k = ((w - tw) / 2) / H                          # horizontal run per unit height
    outer = K.poly([(0, 0), ((w - tw) / 2, -H), ((w + tw) / 2, -H), (w, 0)])
    yo = 0.18 * H                                   # lower opening up to the crossbar
    lower = K.poly([(leg, 1), (leg + k * yo, -yo), (w - leg - k * yo, -yo), (w - leg, 1)])
    a = K.diff(outer, lower)
    a = K.diff(a, K.rect(w / 2 - b / 2, -H - 2, b, H + 2 - 0.33 * H))
    return a


# ------------------------------------------------------------- bridges

def _cut_glyph(ch, p, b, counters_only=False):
    x0, y0, x1, y1 = K.bounds(p)
    w, h = x1 - x0, y1 - y0
    o = 2.0  # overshoot past the ink so cuts are clean
    cuts = []
    up = ch.upper()

    def axis_cuts(ax, top=True, bottom=True):
        r = _vruns(p, ax)
        if not r:
            return
        if top:
            cuts.append(K.rect(ax - b / 2, r[0][0] - o, b, (r[0][1] - r[0][0]) + o))
        if bottom and len(r) > 1:
            cuts.append(K.rect(ax - b / 2, r[-1][0], b, (r[-1][1] - r[-1][0]) + o))

    if up == "E" and not counters_only:
        e = _stem_inner_edge(p)
        cuts.append(K.rect(e, y0 - o, b, h + 2 * o))
    elif up == "F" and not counters_only:
        e = _stem_inner_edge(p)
        cuts.append(K.rect(e, y0 - o, b, 0.62 * h + o))
    elif up == "J" and not counters_only:
        s = _stem_inner_edge(p, side="right")
        r = _vruns(p, s - b / 2)
        if r:
            cuts.append(K.rect(s - b, r[-1][0] - o, b, (r[-1][1] - r[-1][0]) + 2 * o))
    elif up in ("T", "7") and not counters_only:
        r = _vruns(p, x0 + 0.12 * w)
        bar_bottom = r[0][1] if r else y0 + 0.2 * h
        cuts.append(K.rect(x0 - o, bar_bottom, w + 2 * o, b))
    elif up in ("C", "G") and not counters_only:
        axis_cuts(_stem_inner_edge(p) + b / 2)          # flush against the stem
    elif up in ("S", "2", "6") and not counters_only:
        axis_cuts(x0 + w / 2)
    elif up in ("O", "0", "Q", "8") and not counters_only:
        axis_cuts(x0 + w / 2, bottom=(up != "Q"))
    if cuts:
        p = K.diff(p, K.union(*cuts))
    return p


def stencil_word(s, cap, x=0, y=0, tracking=60.0, anchor="start", font=BASE, counters_only=False,
                 split_a_glyph=True, bridge=None, ink_gap=0.06, word_gap=0.30, skip=""):
    """Outline `s` as a stencil hero word.

    Letters are spaced ink-to-ink: ink_gap x cap between letters, word_gap x cap
    between words (set ink_gap=None to fall back to font tracking)."""
    b = bridge if bridge is not None else bridge_width(cap)
    glyphs = K.text_glyphs(font, s, cap, 0, 0, tracking=tracking)
    out = K.new()
    shift = 0.0
    pen = None
    space_pending = False
    for ch, p in glyphs:
        if p is None:
            space_pending = True
            continue
        if ch.upper() == "A" and split_a_glyph:
            p = split_a(cap, slit_width(cap))
        elif ch.upper() not in skip:
            p = _cut_glyph(ch, p, b, counters_only)
        if ink_gap is not None:
            x0 = K.bounds(p)[0]
            start = 0 if pen is None else pen + (word_gap if space_pending else ink_gap) * cap
            p = K.translate(p, start - x0, 0)
            pen = K.bounds(p)[2]
            space_pending = False
        else:
            p = K.translate(p, shift, 0)
        out.addPath(p)
    out = K.union(out)
    bx0, _, bx1, _ = K.bounds(out)
    dx = {"middle": x - (bx0 + bx1) / 2, "end": x - bx1}.get(anchor, x - bx0)
    return K.translate(out, dx, y)


def stencil_glyph_paths(s, cap, tracking=60.0, font=BASE, counters_only=False, split_a_glyph=True):
    """Per-glyph stencil outlines (for arcs): [(char, path_at_origin, advance_width)]."""
    b = bridge_width(cap)
    out = []
    for ch in s:
        if ch == " ":
            out.append((" ", None, K.font(font).shape(" ")[0][1] * cap / K.font(font).cap))
            continue
        g = K.text_glyphs(font, ch, cap, 0, 0)[0][1]
        if ch.upper() == "A" and split_a_glyph:
            g = split_a(cap, slit_width(cap))
        else:
            g = _cut_glyph(ch, g, b, counters_only)
        adv = K.font(font).shape(ch)[0][1] * cap / K.font(font).cap
        if ch.upper() == "A" and split_a_glyph:
            adv = K.bounds(g)[2] + 0.06 * cap
        out.append((ch, g, adv))
    return out


def fit_cap(s, width, tracking=60.0, font=BASE):
    bx = K.bounds(stencil_word(s, 100, tracking=tracking, font=font))
    # bridges have a fixed floor, so re-solve once at the fitted size
    cap = 100 * width / (bx[2] - bx[0])
    bx = K.bounds(stencil_word(s, cap, tracking=tracking, font=font))
    return cap * width / (bx[2] - bx[0])
