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


def strip_grammar(head, head_len, rule_len, text, cap, font, tracking, width, text_font_fix=True, reads="up"):
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
    if reads == "up":
        t = K.translate(t, -tb[2], -(tb[1] + tb[3]) / 2)      # text end at origin
        t = K.rotate(t, -90)                                   # reads bottom to top
    else:
        t = K.translate(t, -tb[0], -(tb[1] + tb[3]) / 2)      # text start at origin
        t = K.rotate(t, 90)                                    # reads top to bottom
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


# ======================================================== final tops (client pick)
# The client picked two Figma AI frames: the "right" hip lockup (red jet with a chevron
# over stencil JETS and 26-27) for the front of the tee, crewneck and hoodie, and the
# single white jet with the red chevron for the back. Both are rebuilt in vector here.

HERO = "saira900"        # wide, chunky stencil JETS like the AI lockup
YEAR_FONT = "wide800"


def jets_lockup(W, cuts=True):
    """Red chevron jet over stencil JETS over a spaced 26-27, all W wide.
    Layers, top-left at (0, 0)."""
    span = 0.86 * W
    jet, info = M.fighter(span, W / 2, 0, "red")
    jet = K.translate(jet["accent"], 0, -info["nose_y"])
    cap = ST.fit_cap("JETS", W, font=HERO)
    y = info["length"] + 0.075 * W + cap
    word = ST.stencil_word("JETS", cap, W / 2, y, anchor="middle", font=HERO, counters_only=not cuts,
                            skip="J")
    ycap = max(0.072 * W, 18)
    y += 0.07 * W + ycap
    yw = 0.70 * W
    yfont = YEAR_FONT if W >= 300 else "wide900"
    track = fit_tracking(yfont, "26–27", ycap, yw)
    year = K.text(yfont, "26–27", ycap, W / 2, y, tracking=track, anchor="middle")
    return [("accent", jet), ("main", word), ("main", year)]


def front():
    W = 500
    L = jets_lockup(W)
    return Art("front", "Tee / crewneck / hoodie - front",
               "Centred on the chest, top of art ~3 in below the collar (hoodie: below the hood seam). "
               "Clears the hoodie pouch pocket.", f"{W / 100:.1f} in wide", L)


def mono_line(s, cap, tracking):
    """Mono text whose degree signs are drawn as print-safe rings (the font's ring is too fine
    at small sizes): 0.04 in stroke, 0.03 in hole minimum. Baseline at y = 0."""
    adv = K.text_width(MONO, "0", cap, tracking)
    out = K.new()
    x = 0.0
    for part in s.split("°"):
        if x > 0:                                        # a degree sign before this part
            r = max(0.24 * cap, 5.5)
            ring = K.diff(K.circle(x + adv / 2, -cap + r, r), K.circle(x + adv / 2, -cap + r, r - 4))
            out.addPath(ring)
            x += adv
        if part:
            # Plex Mono's W packs four strokes into one cell and its inner Vs close up below
            # 0.3 in cap, so the W comes from Archivo Expanded Bold, which has open notches
            for chunk in part.replace("W", "\0W\0").split("\0"):
                if chunk:
                    if chunk == "W":
                        g = K.text("wide700", "W", cap, x + 0.08 * cap, 0)
                    else:
                        lead = len(chunk) - len(chunk.lstrip(" "))     # K.text aligns on ink
                        x += lead * K.text_width(MONO, "0", cap, tracking)
                        chunk = chunk.lstrip(" ")
                        if not chunk:
                            continue
                        g = K.text(MONO, chunk, cap, x, 0, tracking=tracking)
                    out.addPath(g)
                    x += K.text_width(MONO, chunk, cap, tracking) + tracking * cap / 1000
    return K.union(out)


def pool_back(rope_end, key, title, placement):
    """The lane back from the Figma AI round (client pick), rebuilt in vector: stencil JETS,
    two lane ropes with red end zones, backstroke flags across the top, the red fighter
    flying the lane line toward the T, side annotations, and a ruled footer.
    rope_end: where the ropes stop, measured from the top of the art (print units). JETS and
    the jet keep their size; only the lane (ropes, line, side text) gets longer."""
    W = 860
    cap = ST.fit_cap("JETS", W, font=HERO)
    L = [("main", ST.stencil_word("JETS", cap, W / 2, cap, anchor="middle", font=HERO, skip="J"))]

    # lane ropes, inset like the AI frame; chunky floats, red end zones at both walls
    fw, fh, pitch, red_top, red_bot = 30, 15, 23.5, 5, 6
    xl = 0.085 * W
    xr = W - xl - fw
    y_rope = cap + 22
    n = int((rope_end - y_rope - fh) / pitch) + 1
    for x in (xl, xr):
        for i in range(n):
            role = "accent" if i < red_top or i >= n - red_bot else "main"
            L.append((role, K.rect(x, y_rope + i * pitch, fw, fh)))
    y_rope_end = y_rope + (n - 1) * pitch + fh

    # backstroke flags: a red line between the ropes with pennants hanging from it
    y_flag = y_rope + 22
    fx0, fx1 = xl + fw, xr
    L.append(("accent", K.rect(fx0, y_flag, fx1 - fx0, 5)))
    k = 11
    step = (fx1 - fx0) / k
    for j in range(k):
        cx = fx0 + step * (j + 0.5)
        L.append(("accent", K.poly([(cx - step * 0.30, y_flag + 4), (cx + step * 0.30, y_flag + 4),
                                    (cx, y_flag + 32)])))

    # the jet and the lane line with its T
    span = 0.50 * W
    jet, info = M.fighter(span, W / 2, 0, "red")
    jy = y_flag + 62 - info["nose_y"]
    L.append(("accent", K.translate(jet["accent"], 0, jy)))
    lw, tw, th = 20, 92, 22
    y_t = y_rope_end - 20 - th
    y0 = info["tail_y"] + jy - 4
    L.append(("main", K.rect(W / 2 - lw / 2, y0, lw, y_t - y0)))
    L.append(("main", K.rect(W / 2 - tw / 2, y_t, tw, th)))

    # side annotations: mono, reading toward the lane on both sides
    ann = 28
    mid = (y_rope + y_rope_end) / 2
    for txt, deg, x in ((COORDS, -90, xl - 36), ("ALLEN COUNTY ATHLETIC CONFERENCE", 90, xr + fw + 36)):
        t = mono_line(txt, ann, 100)
        tb = K.bounds(t)
        t = K.rotate(K.translate(t, -(tb[0] + tb[2]) / 2, -(tb[1] + tb[3]) / 2), deg)
        L.append(("main", K.translate(t, x, mid)))

    # footer: full-width rule, team line left, squadron serial right
    y_rule = y_rope_end + 14
    L.append(("main", K.rect(0, y_rule, W, 8)))
    fc = 34
    y_f = y_rule + 8 + 22 + fc
    serial = K.text(MONO, "SQDN 26–27", 26, W, y_f, tracking=60, anchor="end")
    team_w = K.bounds(serial)[0] - 60
    L.append(("main", K.text(LABEL, "ADAMS CENTRAL SWIM & DIVE", fc, 0, y_f,
                             tracking=solve_label(LABEL, "ADAMS CENTRAL SWIM & DIVE", fc, team_w))))
    L.append(("main", serial))
    return Art(key, title, placement, f"{W / 100:.1f} in wide", L)


# Ropes end ~4.5 in above the hem on an adult L (tee body 29 in, crewneck 27 in, hoodie
# 24.5 in below the hood seam); the footer sits under them.
def tee_back():
    return pool_back(2110, "tee-back", "Tee - back",
                     "Centred on the back, top of JETS ~3 in below the collar seam; the lane ropes end ~4.5 in above the hem.")


def back():
    return pool_back(1860, "back", "Crewneck / hoodie - back",
                     "Centred on the back, top of JETS ~3 in below the collar (hoodie: ~1.5 in below the hood seam); "
                     "the lane ropes end ~4.5 in above the bottom band.")


def sleeve():
    """Crewneck and hoodie left sleeve: the jet at the shoulder, its contrail line, then
    SWIM & DIVE reading from the cuff up toward the jet (same strip as the sweatpants leg)."""
    w = 82
    span = 82
    jet, info = M.fighter(span, w / 2, 0, "red")
    head = [("accent", K.translate(jet["accent"], 0, -info["nose_y"]))]
    L = strip_grammar(head, info["length"], 300, "SWIM & DIVE", 55, LABEL_HEAVY, 100, w)
    return Art("sleeve", "Crewneck / hoodie - left sleeve",
               "Wearer's left sleeve on the sleeve centre line, jet ~3 in below the shoulder seam, nose up; "
               "the text reads from the cuff toward the jet.", "0.8 in wide", L)


def sweats_hip():
    W = 165
    return Art("sweats-hip", "Sweatpants - hip", "Wearer's left front thigh/hip, ~3 in below the waistband.",
               f"{W / 100:.2f} in wide", jets_lockup(W, cuts=False))


def sweats_leg():
    """Reads waist to hem; the jet leads at the waistband end with its contrail behind it."""
    w = 82
    span = 82
    jet, info = M.fighter(span, w / 2, 0, "red")
    head = [("accent", K.translate(jet["accent"], 0, -info["nose_y"]))]
    L = strip_grammar(head, info["length"], 461, "AC SWIM & DIVE", 55, LABEL_HEAVY, 100, w, reads="down")
    return Art("sweats-leg", "Sweatpants - leg side",
               "Wearer's right leg on the outer leg panel, jet end ~3 in below the waistband, reading from the waist down to the hem.",
               "0.8 in wide", L)


ARTS = [front, tee_back, back, sleeve, sweats_hip, sweats_leg]
NAME = "Squadron"
SLUG = "squadron"
TAGLINE = "Red chevron jet over stencil JETS on the front; one big white fighter with a red chevron on the back."
