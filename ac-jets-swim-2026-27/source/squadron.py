"""SQUADRON v2 - the final Adams Central Jets 2026-27 collection.

Aviation flight-tag system, sharpened after a Figma AI exploration round
(5 explorer agents + a creative-director synthesis; AI images were art direction
only, every shape here is rebuilt from coordinates or font outlines):

  * ONE HERO PER PRINT; the collection hero is the tee back (JETS + the pool lane)
  * one original jet (marks.jet): W-tail double delta with automatic size masters
    L = canopy + stencil spine, M = canopy, S = solid + V notch, XS = solid
  * three type voices: Saira Extra Condensed Black with Squadron stencil cuts for
    hero words, Barlow Condensed for labels, IBM Plex Mono for data
  * straight lines only; 45 deg for motion (jet wing, tail chamfer, fin-A, flashes),
    0/90 deg for structure; no tapers anywhere
  * ink roles: main ink for type, rules, floats and structure; Jets Red only on the
    jet, on shapes that carry a knocked-out jet, and on the rope end-zone floats
  * print floors: gaps and lines >= 0.04 in on fleece, >= 0.03 in on jersey;
    M/W notches get a reverse ink trap (svgkit.notch_fix)

Tee back idea: seen from above, the jet is the swimmer. Its stencil spine runs
down its centreline toward the lane line on the pool floor, which ends in the T at
the wall; the lane ropes carry red floats at both walls, like a real pool.
"""
import math

import svgkit as K
import marks as M
import stencil as ST
from common import Art, fit_tracking

LABEL = "cond700"
LABEL_HEAVY = "cond800"
MONO = "mono700"          # small data (< 0.23 in cap): the bold cut keeps strokes printable
COORDS = "40.7458° N  84.9428° W"
SWEEP = 45.0


def label(fontname, s, cap, x=0, y=0, tracking=0.0, anchor="start"):
    """A label line with the reverse-ink-trap notch fix applied at 0.30 in cap and up."""
    p = K.text(fontname, s, cap, x, y, tracking=tracking, anchor=anchor)
    return K.notch_fix(p) if cap >= 30 else p


def solve_label(fontname, s, cap, width):
    """Tracking that makes a label exactly `width` wide."""
    return fit_tracking(fontname, s, cap, width)


# ======================================================================== tee

def tee_chest():
    """Jet | rule | AC JETS over SWIM & DIVE on one cap line and one baseline."""
    cap, gap, sub_cap = 56, 15, 20
    top = 6                                       # the nose overshoots the cap line by 0.06 in
    base = top + cap + gap + sub_cap              # shared baseline
    jl = base                                     # jet nose at y 0, tail feet on the baseline
    span = jl / (M.JET_LEN / 100)
    jet, info = M.jet(span, span / 2, jl / 2)     # S master by size
    rx = span + 18
    tx = rx + 4 + 18
    word = ST.stencil_word("AC JETS", cap, tx, top + cap)
    wb = K.bounds(word)
    sub = label(LABEL_HEAVY, "SWIM & DIVE", sub_cap, wb[0], base,
                tracking=solve_label(LABEL_HEAVY, "SWIM & DIVE", sub_cap, wb[2] - wb[0]))
    L = [("accent", jet), ("main", K.rect(rx, top, 4, base - top)), ("main", word), ("main", sub)]
    return Art("tee-chest", "Tee - left chest",
               "Left chest. Top of art ~3 in below the collar seam, centred ~4 in left of centre front.",
               "3.1 in wide", L)


def tee_back():
    W = 900
    H = ST.fit_cap("JETS", W)                     # JETS ink spans exactly 9.00 in
    b = ST.bridge_width(H)                        # one cut dimension for the whole print
    L = [("main", ST.stencil_word("JETS", H, 0, H))]

    # lane ropes on the outer edges, 26 square floats, red end zones at both walls
    n, pitch, fw, fh, red = 26, 26.4, 22, 16, 5
    y_rope = H + 30
    for x in (0, W - fw):
        for i in range(n):
            f = K.rect(x, y_rope + i * pitch, fw, fh)
            L.append(("accent" if i < red or i >= n - red else "main", f))
    y_rope_end = y_rope + (n - 1) * pitch + fh

    # the jet: L master, span = 20 x b so canopy, canopy bridge and spine all equal b
    span = 20 * b
    jl = M.JET_LEN * span / 100
    jet, info = M.jet(span, W / 2, y_rope + 50 + jl / 2, master="L", spine=b)
    L.append(("accent", jet))

    # lane line on the pool floor (2b wide, constant) and the T at the wall
    y_wall = y_rope_end + 10
    lw, t_w = 2 * b, 10 * b
    y_t = y_wall - 40 - lw
    y0 = info["tail_y"] + 30
    L.append(("main", K.rect(W / 2 - lw / 2, y0, lw, y_t - y0)))
    L.append(("main", K.rect(W / 2 - t_w / 2, y_t, t_w, lw)))

    # matched annotations, centred on the white float run, baselines facing the lane
    run_top = y_rope + red * pitch
    run_bot = y_rope + (n - red - 1) * pitch + fh
    mid = (run_top + run_bot) / 2
    ann_cap = 20
    texts = [COORDS + "  MONROE IN", "ALLEN COUNTY ATHLETIC CONFERENCE"]
    length = min(run_bot - run_top, max(K.text_width(LABEL, t, ann_cap, 120) for t in texts))
    near = fw + 20
    for txt, deg, x in ((texts[0], -90, near + ann_cap / 2), (texts[1], 90, W - near - ann_cap / 2)):
        t = K.text(LABEL, txt, ann_cap, 0, 0, tracking=solve_label(LABEL, txt, ann_cap, length))
        tb = K.bounds(t)
        t = K.rotate(K.translate(t, -(tb[0] + tb[2]) / 2, -(tb[1] + tb[3]) / 2), deg)
        L.append(("main", K.translate(t, x, mid)))

    # pool wall + two-tier footer
    L.append(("main", K.rect(0, y_wall, W, 8)))
    c2 = 62
    y2 = y_wall + 8 + 22 + c2
    L.append(("main", label(LABEL_HEAVY, "ADAMS CENTRAL", c2, 0, y2,
                            tracking=solve_label(LABEL_HEAVY, "ADAMS CENTRAL", c2, W))))
    y3 = y2 + 18 + 20
    L.append(("main", label(LABEL, "SWIM & DIVE", 20, 0, y3, tracking=250)))
    L.append(("main", K.text(MONO, "SQDN 26–27", 20, W, y3, tracking=60, anchor="end")))
    return Art("tee-back", "Tee - full back", "Centred on the back. Top of art 3-4 in below the collar seam.",
               "9.0 in wide", L)


# ===================================================================== hoodie

def tail_code_ac(H, b):
    """Constructed AC tail code, straight lines only.
    A = a swept tail fin: 45 deg leading edge, 12 deg trailing edge, flat tip, apex slit,
        and one cut separating the crossbar from the leading-edge leg.
    C = a squared ring with 45 deg chamfers, cut flush against its stem top and bottom.
    Baseline y = 0, cap top y = -H, left edge x = 0. Returns (path, leading-edge x(height))."""
    le = math.tan(math.radians(SWEEP))
    te = math.tan(math.radians(12))
    tip = 0.28 * H
    s = 0.24 * H
    A_w = H * le + tip + H * te
    outer = K.poly([(0, 0), (H * le, -H), (H * le + tip, -H), (A_w, 0)])
    sl = s / math.cos(math.radians(SWEEP))
    st = s / math.cos(math.radians(12))

    def x_le(ya):
        return ya * le + sl

    def x_te(ya):
        return H * le + tip + (H - ya) * te - st
    cb0, cb1 = 0.25 * H, 0.44 * H
    lower = K.poly([(x_le(0), 2), (x_le(cb0), -cb0), (x_te(cb0), -cb0), (x_te(0), 2)])
    ya_meet = (H * le + tip + H * te - st - sl) / (le + te)
    upper = K.poly([(x_le(cb1), -cb1), (x_te(cb1), -cb1), (x_le(ya_meet), -ya_meet)])
    A = K.diff(outer, K.union(lower, upper))
    cx_apex = x_le(ya_meet)
    cuts = [K.rect(cx_apex - b / 2, -H - 2, b, H - ya_meet + 2 + 0.02 * H),
            K.rect(x_le(cb1), -cb1 - 1, b, cb1 - cb0 + 2)]
    A = K.diff(A, K.union(*cuts))

    gap = 0.07 * H
    cx0 = A_w + gap
    Cw = 0.85 * H
    sv, sh = 0.24 * H, 0.21 * H
    ch_o, ch_i = 0.14 * H, 0.053 * H

    def chamfer_rect(x, y, w, h, c):
        return K.poly([(x + c, y), (x + w - c, y), (x + w, y + c), (x + w, y + h - c), (x + w - c, y + h),
                       (x + c, y + h), (x, y + h - c), (x, y + c)])
    ring = K.diff(chamfer_rect(cx0, -H, Cw, H, ch_o),
                  chamfer_rect(cx0 + sv, -H + sh, Cw - 2 * sv, H - 2 * sh, ch_i))
    ap = 0.40 * H
    C = K.diff(ring, K.rect(cx0 + Cw - sv - 2, -H / 2 - ap / 2, sv + 4, ap))
    xs = cx0 + sv
    C = K.diff(C, K.union(K.rect(xs, -H - 2, b, sh + 4), K.rect(xs, -sh - 2, b, sh + 4)))
    return K.union(A, C), (lambda ya: ya * le)


def hoodie_front():
    H = 375
    b = 12
    ac, le_line = tail_code_ac(H, b)
    W = K.bounds(ac)[2]
    band_h, gap1 = 62, 32
    top_ac = band_h + gap1
    L = [("main", K.translate(ac, 0, top_ac + H))]

    # red fin flash: its left end lies on the A's 45 deg leading edge, extended upward
    xb, xt = le_line(H + gap1), le_line(H + gap1 + band_h)
    band = K.poly([(xt, 0), (W, 0), (W, band_h), (xb, band_h)])
    run0, run1 = xt + 24, W - 24
    jet_span = 46
    jet_len = M.JET_LEN * jet_span / 100
    cap, g = 28, 26
    tr = solve_label(LABEL, "ADAMS CENTRAL", cap, (run1 - run0) - g - jet_len)
    t1 = K.text(LABEL, "ADAMS CENTRAL", cap, run0, band_h / 2 + cap / 2, tracking=tr)
    jet, _ = M.jet(jet_span, run1 - jet_len / 2, band_h / 2, rotate=90)     # XS by size
    L.append(("accent", K.diff(band, K.union(t1, jet))))

    # rule + serial line (the coordinates live on the sleeve)
    y_rule = top_ac + H + 26
    L.append(("main", K.rect(0, y_rule, W, 6)))
    ys = y_rule + 6 + 16 + 24
    L.append(("main", label(LABEL, "SWIM & DIVE", 24, 0, ys, tracking=220)))
    L.append(("main", K.text("mono600", "SQDN 26–27", 24, W, ys, tracking=100, anchor="end")))
    return Art("hoodie-front", "Hoodie - front",
               "Centred on the chest, top of art ~3 in below the neckline. Clears the pouch pocket.",
               f"{W / 100:.1f} in wide", L)


def strip_grammar(head, head_len, rule_len, text, cap, font, tracking, width, text_font_fix=True):
    """Vertical strip shared by the sleeve and the leg: the jet unit at the top,
    a 0.25 in gap, a 0.06 in main-ink contrail rule, a 0.25 in gap, then the text
    rotated 90 deg counter-clockwise so it reads toward the jet. Centred on the axis."""
    axis = width / 2
    L = list(head)
    y = head_len + 25
    L.append(("main", K.rect(axis - 3, y, 6, rule_len)))
    y += rule_len + 25
    t = K.text(font, text, cap, 0, 0, tracking=tracking)
    if text_font_fix and cap >= 30:
        t = K.notch_fix(t)
    tb = K.bounds(t)
    t = K.translate(t, -tb[2], -(tb[1] + tb[3]) / 2)          # text end at origin
    t = K.rotate(t, -90)                                       # reads bottom to top
    L.append(("main", K.translate(t, axis, y)))
    return L


def hoodie_sleeve():
    w = 90
    flash = K.poly([(0, w), (w, 0), (w, 160), (0, 160 + w)])
    jet, _ = M.jet(62, w / 2, 125)                            # XS by size, nose up
    head = [("accent", K.diff(flash, jet))]
    L = strip_grammar(head, 160 + w, 300, COORDS, 24, MONO, 30, w)
    return Art("hoodie-sleeve", "Hoodie - left sleeve",
               "Left sleeve centre line, flash ~3 in below the shoulder seam; the text reads from the cuff toward the jet.",
               "0.9 in wide", L)


# =================================================================== crewneck

def arc_glyphs(items, cx, cy, R, track):
    """Place [(char, path, advance)] along the top of a circle (centre cx, cy; baseline radius R)."""
    total = sum(a for _, _, a in items) + track * (len(items) - 1)
    out = K.new()
    s = -total / 2
    for ch, p, adv in items:
        if p is not None:
            th = (s + adv / 2) / R
            c, sn = math.cos(th), math.sin(th)
            q = K.translate(p, -adv / 2, 0)
            q = q.transform(c, sn, -sn, c, cx + R * sn, cy - R * c)
            out.addPath(q)
        s += adv + track
    return K.union(out)


def crew_front():
    cap, R = 122, 800
    items = ST.stencil_glyph_paths("ADAMS CENTRAL", cap, counters_only=True)
    items = [(ch, (K.notch_fix(p) if p is not None and ch in "MW" else p), adv + (14 if ch == " " else 0))
             for ch, p, adv in items]
    arch = arc_glyphs(items, 0, R, R, 4)
    L = [("main", arch)]
    ab = K.bounds(arch)
    chord = min(-ab[0], ab[2]) - 6

    span = 230
    jl = M.JET_LEN * span / 100
    jet, info = M.jet(span, 0, 32 + jl / 2)                   # M by size
    L.append(("accent", jet))
    te = info["trailing_edge_y"]                              # the wing line continues the trailing edge
    for sx in (1, -1):
        x_in, x_out = span / 2 + 15, chord
        L.append(("main", K.rect(min(sx * x_in, sx * x_out), te, abs(x_out - x_in), 6)))

    sd_cap = 56
    y = info["tail_y"] + 30 + sd_cap
    L.append(("main", label(LABEL_HEAVY, "SWIM & DIVE", sd_cap, 0, y, tracking=150, anchor="middle")))
    L.append(("main", K.text(MONO, COORDS, 24, 0, y + 24 + 24, tracking=0, anchor="middle")))
    return Art("crew-front", "Crewneck - front", "Centred on the chest, top of the arch ~3 in below the collar.",
               "9.9 in wide", L)


# ================================================================ sweatpants

def sweats_hip():
    """Width-locked lockup: JETS spans exactly wingtip to wingtip."""
    span = 150
    jet, info = M.jet(span, 0, 0)                             # M by size
    cap = ST.fit_cap("JETS", span)
    y = info["tail_y"] + 14 + cap
    word = ST.stencil_word("JETS", cap, 0, y, anchor="middle")
    return Art("sweats-hip", "Sweatpants - hip", "Wearer's left front thigh/hip, ~3 in below the waistband.",
               "1.5 in wide", [("accent", jet), ("main", word)])


def sweats_leg():
    """Reads hem to waist; the jet leads at the waistband end with its contrail behind it."""
    w = 82
    span = 78
    jl = M.JET_LEN * span / 100
    jet, _ = M.jet(span, w / 2, jl / 2)                       # S by size, nose up
    L = strip_grammar([("accent", jet)], jl, 461, "AC SWIM & DIVE", 55, LABEL_HEAVY, 100, w)
    return Art("sweats-leg", "Sweatpants - leg side",
               "Wearer's right leg on the outer leg panel, jet end ~3 in below the waistband, reading hem to waist.",
               "0.8 in wide", L)


ARTS = [tee_chest, tee_back, hoodie_front, hoodie_sleeve, crew_front, sweats_hip, sweats_leg]
NAME = "Squadron"
SLUG = "squadron"
TAGLINE = "Aviation flight-tag system: stencil tail markings, flight data, and a jet that flies the lane."
