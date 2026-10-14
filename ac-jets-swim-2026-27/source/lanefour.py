"""Concept 2 - LANE FOUR: performance minimal.

Heavy expanded italic grotesk, the jet reduced to a notched arrowhead, and a
lane-rope band (red floats at both ends, like a real competition rope) that
carries through every piece. Everything leans on the same 10-degree italic axis.
"""
import svgkit as K
import marks as M
from common import Art, ITALIC, fit_tracking

HERO = "wideitalic"   # Archivo Expanded Black Italic
SUB = "italic"        # Archivo Black Italic
ARCH = "wide900"      # Archivo Expanded Black (upright, for the arch)
AMP = "barlowi900"    # Barlow Black Italic: borrowed for a clearer ampersand


def txt(fontname, s, cap, x=0, y=0, tracking=0.0, anchor="start"):
    """Text with Archivo's 'Et' ampersand swapped for a conventional one."""
    if "&" not in s:
        return K.text(fontname, s, cap, x, y, tracking=tracking, anchor=anchor)
    a, b = s.split("&", 1)
    extra = ITALIC - 0.1228  # Barlow italic is 7 degrees; lean it to 10
    return K.text_mixed([(fontname, a, 0), (AMP, "&", extra), (fontname, b, 0)], cap, x, y,
                        tracking=tracking, anchor=anchor)


def band(x, y, width, h, n, red_ends=3, gap=None, slant=ITALIC):
    """Lane-rope band: n slanted floats, `red_ends` red at each end.
    (x, y) = bottom-left corner of the first float; floats rise to y - h."""
    gap = h * 0.36 if gap is None else gap
    seg = (width - (n - 1) * gap) / n
    main, red = [], []
    for i in range(n):
        x0 = x + i * (seg + gap)
        p = K.poly([(x0 + h * slant, y - h), (x0 + seg + h * slant, y - h), (x0 + seg, y), (x0, y)])
        (red if i < red_ends or i >= n - red_ends else main).append(p)
    return main, red


def arrow(cap, x, base):
    """Arrowhead sized to sit on a cap height, leaning with the italic."""
    p = M.arrowhead(cap, 0, 0)
    p = K.skew_x(p, ITALIC)
    b = K.bounds(p)
    # put its bottom-left on (x, base)
    return K.translate(p, x - b[0] - cap * ITALIC * 0, base - b[3])


def at(x, y, y_ref):
    """Shift an upright-grid x along the italic axis to height y."""
    return x - (y - y_ref) * ITALIC


def tee_chest():
    L = []
    cap = 56
    t = txt(HERO, "JETS", cap, 0, cap)
    tb = K.bounds(t)
    L.append(("main", t))
    a = arrow(cap, tb[2] + 16, cap)
    L.append(("accent", a))
    ab = K.bounds(a)
    by = cap + 30
    m, r = band(at(0, by, cap), by, ab[2] - cap * ITALIC - at(0, by, cap), 14, 10, red_ends=2)
    L += [("main", p) for p in m] + [("accent", p) for p in r]
    return Art("tee-chest", "Tee - left chest", "Left chest, top of art ~3 in below the collar seam", "3.6 in wide", L)


def tee_back():
    W = 1100
    L = []
    cap = K.fit_cap(HERO, "JETS", W)
    base = cap
    jets = txt(HERO, "JETS", cap, 0, base)
    L.append(("main", jets))
    jb = K.bounds(jets)
    # band: from the J's foot to the S's right edge at baseline level
    by = base + 70
    x_left = at(jb[0], by, base)
    x_right = at(jb[2], by, base - cap)  # right edge of the slanted S, carried down
    m, r = band(x_left, by, x_right - x_left - 34 * ITALIC, 34, 24, red_ends=4)
    L += [("main", p) for p in m] + [("accent", p) for p in r]
    ty = by + 48 + 30
    L.append(("main", txt(SUB, "ADAMS CENTRAL SWIM & DIVE", 30, at(jb[0], ty, base), ty, tracking=60)))
    L.append(("main", txt(SUB, "26–27", 30, at(x_right, ty, by) - 34 * ITALIC, ty, tracking=60, anchor="end")))
    return Art("tee-back", "Tee - full back", "Upper back, top of art ~3 in below the collar seam (Nike-style high placement)",
               "11 in wide", L)


def hoodie_front():
    W = 1000
    L = []
    gapx = 0.30
    # size so CENTRAL + arrow spans W
    w_c = K.text_width(HERO, "CENTRAL", 100)
    cap = W / (w_c / 100 + gapx + 1.18 + ITALIC)
    lead = cap * 1.28
    b1 = cap
    b2 = cap + lead
    t1 = txt(HERO, "ADAMS", cap, 0, b1)
    t2 = txt(HERO, "CENTRAL", cap, 0, b2)
    # align left edges on the italic axis
    x1 = K.bounds(t1)[0]
    x2 = K.bounds(t2)[0]
    t1 = K.translate(t1, (at(0, b1, b2)) - x1, 0)
    t2 = K.translate(t2, -x2, 0)
    L += [("main", t1), ("main", t2)]
    a = arrow(cap, K.bounds(t2)[2] + cap * gapx, b2)
    L.append(("accent", a))
    right = K.bounds(a)[2] - cap * ITALIC
    by = b2 + 64
    m, r = band(at(0, by, b2), by, right - at(0, by, b2), 30, 22, red_ends=3)
    L += [("main", p) for p in m] + [("accent", p) for p in r]
    ty = by + 46 + 34
    L.append(("main", txt(SUB, "SWIM & DIVE", 34, at(0, ty, b2), ty, tracking=80)))
    L.append(("main", txt(SUB, "26–27", 34, at(right, ty, by) - 30 * ITALIC, ty, tracking=80, anchor="end")))
    return Art("hoodie-front", "Hoodie - front", "Centered on chest, top of art ~3 in below the neckline; clears the pouch pocket",
               "10 in wide", L)


def hoodie_sleeve():
    L = []
    cap = 78
    t = txt(HERO, "ACAC", cap, 0, cap, tracking=20)
    L.append(("main", t))
    tb = K.bounds(t)
    m, r = band(tb[2] + 40, cap, 360, cap * 0.42, 7, red_ends=2)
    # vertically centre the band on the cap height
    dy = -(cap - cap * 0.42) / 2
    L += [("main", K.translate(p, 0, dy)) for p in m] + [("accent", K.translate(p, 0, dy)) for p in r]
    L = [(rr, K.rotate(p, 90)) for rr, p in L]
    return Art("hoodie-sleeve", "Hoodie - left sleeve", "Left sleeve, running down from ~3 in below the shoulder seam, reading top to bottom",
               "~0.9 in wide x ~8.5 in long", L)


def crew_front():
    L = []
    W = 1000
    R = 1700
    cap = 120
    for _ in range(4):
        arch = K.arc_text(ARCH, "ADAMS CENTRAL", cap, 0, R, R, tracking=30)
        ab = K.bounds(arch)
        cap *= W / (ab[2] - ab[0])
    arch = K.arc_text(ARCH, "ADAMS CENTRAL", cap, 0, R, R, tracking=30)
    L.append(("main", arch))
    ab = K.bounds(arch)
    y = ab[3] + 64 + 58
    sd = txt(HERO, "SWIM & DIVE", 58, 0, y, anchor="middle", tracking=30)
    L.append(("accent", sd))
    sb = K.bounds(sd)
    by = y + 46
    bw = 380
    m, r = band(-bw / 2 - 9 * ITALIC, by, bw, 22, 11, red_ends=2)
    L += [("main", p) for p in m] + [("accent", p) for p in r]
    return Art("crew-front", "Crewneck - front", "Centered on chest, top of arch ~3 in below the collar", "10 in wide", L)


def sweats_hip():
    L = []
    cap = 92
    t = txt(HERO, "AC", cap, 0, cap, tracking=10)
    L.append(("main", t))
    tb = K.bounds(t)
    by = cap + 34
    x0 = at(tb[0], by, cap)
    m, r = band(x0, by, tb[2] - cap * ITALIC - x0, 20, 6, red_ends=1)
    L += [("main", p) for p in m] + [("accent", p) for p in r]
    return Art("sweats-hip", "Sweatpants - hip", "Left front thigh/hip, ~3 in below the waistband", "2.5 in wide", L)


def sweats_leg():
    L = []
    cap = 54
    t = txt(HERO, "AC SWIM & DIVE", cap, 0, cap, tracking=20)
    L.append(("main", t))
    tb = K.bounds(t)
    bh = cap * 0.42
    m, r = band(tb[2] + 40, cap - (cap - bh) / 2, 300, bh, 6, red_ends=2)
    L += [("main", p) for p in m] + [("accent", p) for p in r]
    L = [(rr, K.rotate(p, 90)) for rr, p in L]
    return Art("sweats-leg", "Sweatpants - leg side", "Right leg, outer side seam, starting ~4 in below the waistband, reading top to bottom",
               "~0.7 in wide x ~12 in long", L)


ARTS = [tee_chest, tee_back, hoodie_front, hoodie_sleeve, crew_front, sweats_hip, sweats_leg]
NAME = "Lane Four"
SLUG = "lane-four"
TAGLINE = "Performance minimal: expanded italic type, an arrowhead jet, and a lane-rope band on one 10-degree axis."
