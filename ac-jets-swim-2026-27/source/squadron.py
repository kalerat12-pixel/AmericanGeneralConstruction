"""Concept 1 - SQUADRON: aviation flight-tag system.

Original double-delta jet + stencil tail-marking caps + mono flight data.
Signature idea: seen from above, the jet is a swimmer in a lane. Its contrail
becomes the black lane line on the pool floor (with the T at the wall) and its
wingtip vortices become the lane ropes, red floats at the end like a real pool.
"""
import math

import svgkit as K
import marks as M
from common import Art, COORDS, fit_tracking, hrule, vrule, vary_stroke

STENCIL = "stencil"
LABEL = "cond700"
MONO = "mono"


def tee_chest():
    L = []
    jet, _ = M.jet_plan(118, 49, 0)
    L.append(("accent", jet))
    L.append(("main", vrule(122, -52, 52, 4)))
    top = K.text(STENCIL, "AC JETS", 50, 146, 8)
    b = K.bounds(top)
    w = b[2] - b[0]
    tr = fit_tracking(LABEL, "SWIM & DIVE", 17, w)
    sub = K.text(LABEL, "SWIM & DIVE", 17, b[0], 44, tracking=tr)
    L += [("main", top), ("main", sub)]
    return Art("tee-chest", "Tee - left chest", "Left chest, top of art ~3 in below the collar seam",
               "3.6 in wide", L)


def lane(cx, y_top, jet_len, y_wall, rope_w=10, dash=34, gap=12, red_floats=5, line_w=36, t_w=160):
    """Overhead lane: jet at top, contrail -> lane line with T, wingtip vortices -> ropes.
    Returns (jet_path, line_paths, rope_main_paths, rope_red_paths)."""
    jet, info = M.jet_plan(jet_len, cx, y_top + jet_len / 2)
    line = []
    # contrail -> lane line: a hairline just behind the tail that swells to full width
    y0 = info["tail"][1] + 16
    y_t = y_wall - 64            # the T sits short of the wall, like a real pool
    swell = 190
    pts, ws = [], []
    for i in range(41):
        t = i / 40
        pts.append((cx, y0 + t * swell))
        ws.append(1.5 + (line_w - 1.5) * (t ** 1.6))
    line.append(vary_stroke(pts, ws))
    line.append(K.rect(cx - line_w / 2, y0 + swell - 1, line_w, y_t - (y0 + swell) + 1))
    line.append(K.rect(cx - t_w / 2, y_t - line_w, t_w, line_w))
    ropes, reds = [], []
    for tx, ty in info["tips"]:
        ys = ty + 18
        vortex = 96
        pts, ws = [], []
        for i in range(31):
            t = i / 30
            pts.append((tx, ys + t * vortex))
            ws.append(1.2 + (rope_w - 1.2) * (t ** 1.4))
        ropes.append(vary_stroke(pts, ws))
        y = ys + vortex + gap
        floats = []
        while y + dash <= y_wall:
            floats.append(K.rect(tx - rope_w / 2, y, rope_w, dash))
            y += dash + gap
        # snap the last float to the wall
        for i, f in enumerate(floats):
            (reds if i >= len(floats) - red_floats else ropes).append(f)
    return jet, line, ropes, reds


def rope(x, y1, y2, rope_w=10, dash=34, gap=12, red=4):
    """A lane rope seen from above: floats, red for the last few at each wall."""
    fl = []
    y = y1
    while y + dash <= y2 + 0.01:
        fl.append(K.rect(x - rope_w / 2, y, rope_w, dash))
        y += dash + gap
    main = [f for i, f in enumerate(fl) if red <= i < len(fl) - red]
    reds = [f for i, f in enumerate(fl) if i < red or i >= len(fl) - red]
    return main, reds


def tee_back():
    W = 900
    L = []
    cap = K.fit_cap(STENCIL, "JETS", W)
    L.append(("main", K.text(STENCIL, "JETS", cap, 0, cap)))
    dash, gap = 32, 10
    n = 17
    y_top = cap + 100
    y_wall = y_top + n * (dash + gap) - gap
    lane_w = 600
    jet_len = 380
    jet, line, _, _ = lane(W / 2, y_top + 36, jet_len, y_wall)
    L += [("main", p) for p in line] + [("accent", jet)]
    for x in (W / 2 - lane_w / 2, W / 2 + lane_w / 2):
        m, r = rope(x, y_top, y_wall, dash=dash, gap=gap, red=3)
        L += [("main", p) for p in m] + [("accent", p) for p in r]
    # chart annotations outside the lane, reading bottom to top
    mid = (y_top + y_wall) / 2
    side = (W / 2 - lane_w / 2) / 2
    for txt, x in ((COORDS, side), ("ALLEN COUNTY ATHLETIC CONFERENCE", W - side)):
        t = K.text(MONO, txt, 20, 0, 10, tracking=80, anchor="middle")
        t = K.rotate(t, -90)
        L.append(("main", K.translate(t, x, mid)))
    # pool wall + footer
    L.append(("main", hrule(0, W, y_wall + 18, 5)))
    fy = y_wall + 18 + 36 + 30
    sq = K.text(MONO, "SQDN 26–27", 28, W, fy, tracking=40, anchor="end")
    room = K.bounds(sq)[0] - 70
    tr = min(200, fit_tracking(LABEL, "ADAMS CENTRAL SWIM & DIVE", 30, room))
    L.append(("main", K.text(LABEL, "ADAMS CENTRAL SWIM & DIVE", 30, 0, fy, tracking=tr)))
    L.append(("main", sq))
    return Art("tee-back", "Tee - full back", "Centered on back, top of art 3-4 in below the collar seam",
               "9 in wide", L)


def tail_flash(x0, y0, w, h, lean):
    """Parallelogram band like a squadron tail flash."""
    return K.poly([(x0 + lean, y0), (x0 + w, y0), (x0 + w - lean, y0 + h), (x0, y0 + h)])


def hoodie_front():
    W = 1050
    L = []
    band_h = 96
    band = tail_flash(0, 0, W, band_h, band_h)
    # knock out the name and a small jet flying right
    t1 = K.text(LABEL, "ADAMS CENTRAL", 38, 0, 0, tracking=300)
    t2 = K.text(LABEL, "SWIM & DIVE", 38, 0, 0, tracking=300)
    jet, _ = M.jet_plan(70, 0, 0, canopy=False)
    jet = K.rotate(jet, 90)
    w1 = K.bounds(t1)[2] - K.bounds(t1)[0]
    w2 = K.bounds(t2)[2] - K.bounds(t2)[0]
    gapw = 44
    jw = K.bounds(jet)[2] - K.bounds(jet)[0]
    avail = W - 2 * band_h - 70
    fixed = jw + 2 * gapw
    # solve tracking so both names + jet fill the band's straight section
    tcap = 40
    tr = 300
    for _ in range(3):
        a = K.text_width(LABEL, "ADAMS CENTRAL", tcap, tr) + K.text_width(LABEL, "SWIM & DIVE", tcap, tr)
        if a + fixed <= avail:
            break
        tr -= 60
    w1 = K.text_width(LABEL, "ADAMS CENTRAL", tcap, tr)
    w2 = K.text_width(LABEL, "SWIM & DIVE", tcap, tr)
    total = w1 + fixed + w2
    x = (W - total) / 2
    by = band_h / 2 + tcap / 2
    t1 = K.text(LABEL, "ADAMS CENTRAL", tcap, x, by, tracking=tr)
    jb = K.bounds(jet)
    jet = K.translate(jet, x + w1 + gapw - jb[0], band_h / 2 - (jb[1] + jb[3]) / 2)
    t2 = K.text(LABEL, "SWIM & DIVE", tcap, x + w1 + gapw + jw + gapw, by, tracking=tr)
    band = K.diff(band, K.union(t1, t2, jet))
    L.append(("accent", band))
    # tail code
    ac_cap = 400
    top = band_h + 58
    ac = K.text(STENCIL, "AC", ac_cap, 0, top + ac_cap, tracking=10)
    acb = K.bounds(ac)
    L.append(("main", ac))
    # flight data plate, right column, aligned to the tail code's cap height
    x1 = acb[2] + 70
    colw = W - x1
    L.append(("main", K.text(MONO, "SQUADRON", 26, x1, top + 26, tracking=120)))
    yr_cap = 150
    yr = K.text(STENCIL, "26–27", yr_cap, x1, top + 26 + 34 + yr_cap)
    L.append(("main", yr))
    y = top + 26 + 34 + yr_cap + 46
    L.append(("main", hrule(x1, W, y, 4)))
    L.append(("main", K.text(MONO, "40.7458° N", 26, x1, y + 26 + 34, tracking=40)))
    L.append(("main", K.text(MONO, "84.9428° W", 26, x1, y + 26 + 34 + 26 + 30, tracking=40)))
    L.append(("main", hrule(x1, W, top + ac_cap - 2, 4)))
    return Art("hoodie-front", "Hoodie - front", "Centered on chest, top of art ~3 in below the neckline; clears the pouch pocket",
               "10.5 in wide", L)


def hoodie_sleeve():
    L = []
    jet, _ = M.jet_plan(120, 0, 0)
    jet = K.rotate(jet, 90)
    jb = K.bounds(jet)
    jet = K.translate(jet, -jb[0], -(jb[1] + jb[3]) / 2)
    L.append(("accent", jet))
    x = K.bounds(jet)[2] + 46
    L.append(("main", K.text(MONO, COORDS, 46, x, 23, tracking=40)))
    L = [(r, K.rotate(p, 90)) for r, p in L]
    return Art("hoodie-sleeve", "Hoodie - left sleeve", "Left sleeve, running down from ~3 in below the shoulder seam, reading top to bottom",
               "1.2 in wide x ~11 in long", L)


def crew_front():
    L = []
    W = 1000
    R = 1500
    cap = 140
    tr = 60
    # size the arch so its chord is exactly W
    for _ in range(4):
        arch = K.arc_text("cond800", "ADAMS CENTRAL", cap, 0, R, R, tracking=tr)
        ab = K.bounds(arch)
        cap *= W / (ab[2] - ab[0])
    arch = K.arc_text("cond800", "ADAMS CENTRAL", cap, 0, R, R, tracking=tr)
    L.append(("main", arch))
    ab = K.bounds(arch)
    jet_len = 230
    jy = ab[3] + 70 + jet_len / 2
    jet, info = M.jet_plan(jet_len, 0, jy)
    L.append(("accent", jet))
    y = jy + jet_len / 2 + 70 + 62
    sd = K.text(LABEL, "SWIM & DIVE", 62, 0, y, tracking=380, anchor="middle")
    L.append(("main", sd))
    sb = K.bounds(sd)
    L.append(("main", K.text(MONO, COORDS, 24, 0, y + 40 + 24, tracking=90, anchor="middle")))
    return Art("crew-front", "Crewneck - front", "Centered on chest, top of arch ~3 in below the collar",
               "10 in wide", L)


def sweats_hip():
    L = []
    jet, _ = M.jet_plan(190, 0, 0)
    L.append(("accent", jet))
    L.append(("main", K.text(STENCIL, "JETS", 52, 0, 95 + 26 + 52, tracking=40, anchor="middle")))
    return Art("sweats-hip", "Sweatpants - hip", "Left front thigh/hip, ~3 in below the waistband, centered on the leg",
               "1.7 in wide", L)


def sweats_leg():
    L = []
    jet, _ = M.jet_plan(84, 0, 0, canopy=False)
    jet = K.rotate(jet, 90)
    jb = K.bounds(jet)
    jet = K.translate(jet, -jb[0], -(jb[1] + jb[3]) / 2)
    L.append(("accent", jet))
    x = K.bounds(jet)[2] + 40
    L.append(("main", K.text(LABEL, "AC SWIM & DIVE", 80, x, 40, tracking=260)))
    L = [(r, K.rotate(p, 90)) for r, p in L]
    return Art("sweats-leg", "Sweatpants - leg side", "Right leg, outer side seam, starting ~4 in below the waistband, reading top to bottom",
               "~1 in wide x ~10 in long", L)


ARTS = [tee_chest, tee_back, hoodie_front, hoodie_sleeve, crew_front, sweats_hip, sweats_leg]
NAME = "Squadron"
SLUG = "squadron"
TAGLINE = "Aviation flight-tag system: stencil tail markings, flight data, and a jet that flies the lane."
