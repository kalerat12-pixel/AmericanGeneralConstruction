"""Concept 3 - AERO VARSITY: vintage collegiate heritage.

Collegiate slab serif with a printed varsity outline, and the master jet whose
contrail starts straight and slowly turns into a wave, used like the classic
'tail' underline on an old athletic script.
"""
import math

import svgkit as K
import marks as M
from common import Art, COORDS, fit_tracking, hrule, outline_ring, vary_stroke

SLAB = "rokkitt900"   # Rokkitt Black
SMALL = "rokkitt"     # Rokkitt ExtraBold


def jet_wave(x_nose, y, length, jet_len, amp, w, waves=2.5, straight=0.4, sep=None):
    """Jet flying right; its twin contrails run straight, then ease into parallel
    waves (the water symbol). Returns (jet_path, trails_path)."""
    jet, info = M.jet_plan(jet_len, 0, 0, canopy=True)
    jet = K.rotate(jet, 90)
    jb = K.bounds(jet)
    jet = K.translate(jet, x_nose - jb[2], y - (jb[1] + jb[3]) / 2)
    tail_x = K.bounds(jet)[0] - jet_len * 0.10
    sep = jet_len * 0.13 if sep is None else sep
    trails = []
    N = 360
    for off in (-sep, sep):
        pts, ws = [], []
        for i in range(N + 1):
            t = i / N               # 0 at the jet, 1 at the far end
            x = tail_x - t * length
            if t <= straight:
                dy = 0
            else:
                u = (t - straight) / (1 - straight)
                dy = -amp * min(1.0, u * 1.8) * math.sin(2 * math.pi * waves * u)
            pts.append((x, y + off + dy))
            ws.append(w * (0.45 + 0.55 * min(1.0, t / 0.12)))
        trails.append(vary_stroke(pts, ws))
    return jet, K.union(*trails)


def varsity(path, gap, weight):
    """Hero lettering: solid letters (accent) + separated outline ring (main)."""
    return [("main", outline_ring(path, gap, weight)), ("accent", path)]


def tee_chest():
    L = []
    cap = 104
    ac = K.text(SLAB, "AC", cap, 0, cap, tracking=20)
    L.append(("accent", ac))
    b = K.bounds(ac)
    w = b[2] - b[0]
    tr = fit_tracking(SMALL, "SWIM & DIVE", 17, w)
    L.append(("main", K.text(SMALL, "SWIM & DIVE", 17, b[0], cap + 30 + 17, tracking=tr)))
    return Art("tee-chest", "Tee - left chest", "Left chest, top of art ~3 in below the collar seam", "2.6 in wide", L)


def tee_back():
    W = 1000
    L = []
    t1cap = 62
    top = K.text(SLAB, "ADAMS CENTRAL", t1cap, 0, t1cap, tracking=fit_tracking(SLAB, "ADAMS CENTRAL", t1cap, W))
    L.append(("main", top))
    cap = K.fit_cap(SLAB, "JETS", W, tracking=30)
    base = t1cap + 70 + cap
    jets = K.text(SLAB, "JETS", cap, W / 2, base, tracking=30, anchor="middle")
    L += varsity(jets, 9, 10)
    jy = base + 128
    jet, trail = jet_wave(W, jy, W - 170, 170, 16, 9)
    L += [("main", trail), ("accent", jet)]
    sy = jy + 84 + 56
    L.append(("main", K.text(SLAB, "SWIM & DIVE", 56, W / 2, sy, tracking=fit_tracking(SLAB, "SWIM & DIVE", 56, W * 0.62), anchor="middle")))
    L.append(("main", K.text(SMALL, "MONROE, INDIANA  ·  " + COORDS, 22, W / 2, sy + 40 + 22, tracking=160, anchor="middle")))
    return Art("tee-back", "Tee - full back", "Centered on back, top of art 3-4 in below the collar seam", "10 in wide", L)


def hoodie_front():
    W = 960
    L = []
    cap = K.fit_cap(SLAB, "AC", W * 0.62, tracking=30)
    ac = K.text(SLAB, "AC", cap, W / 2, cap, tracking=30, anchor="middle")
    L += varsity(ac, 9, 11)
    jy = cap + 118
    jet, trail = jet_wave(W, jy, W - 160, 160, 15, 9)
    L += [("main", trail), ("accent", jet)]
    sy = jy + 76 + 62
    L.append(("main", K.text(SLAB, "SWIM & DIVE", 62, W / 2, sy, tracking=fit_tracking(SLAB, "SWIM & DIVE", 62, W * 0.74), anchor="middle")))
    return Art("hoodie-front", "Hoodie - front", "Centered on chest, top of art ~3 in below the neckline; clears the pouch pocket",
               "9.6 in wide", L)


def hoodie_sleeve():
    L = []
    cap = 80
    L.append(("accent", K.text(SLAB, "26–27", cap, 0, cap, tracking=60)))
    L = [(r, K.rotate(p, 90)) for r, p in L]
    return Art("hoodie-sleeve", "Hoodie - left sleeve", "Left sleeve, running down from ~3 in below the shoulder seam, reading top to bottom",
               "0.8 in wide x ~4 in long", L)


def crew_front():
    L = []
    W = 1000
    R = 1250
    cap = 150
    tr = 35
    for _ in range(4):
        arch = K.arc_text(SLAB, "ADAMS CENTRAL", cap, 0, R, R, tracking=tr)
        ab = K.bounds(arch)
        cap *= W / (ab[2] - ab[0])
    arch = K.arc_text(SLAB, "ADAMS CENTRAL", cap, 0, R, R, tracking=tr)
    L.append(("accent", arch))
    ab = K.bounds(arch)
    y = ab[3] + 50 + 60
    sd = K.text(SLAB, "SWIM & DIVE", 58, 0, y, tracking=110, anchor="middle")
    L.append(("main", sd))
    sb = K.bounds(sd)
    rl = min(110, (W / 2 - sb[2]) - 40)
    L.append(("main", hrule(sb[0] - 36 - rl, sb[0] - 36, y - 30, 6)))
    L.append(("main", hrule(sb[2] + 36, sb[2] + 36 + rl, y - 30, 6)))
    jet, trail = jet_wave(200, y + 96, 400, 92, 9, 6)
    L += [("main", trail), ("accent", jet)]
    return Art("crew-front", "Crewneck - front", "Centered on chest, top of arch ~3 in below the collar", "10 in wide", L)


def sweats_hip():
    L = []
    cap = 100
    ac = K.text(SLAB, "AC", cap, 0, cap, tracking=20)
    L.append(("accent", ac))
    b = K.bounds(ac)
    jet, trail = jet_wave(b[2], cap + 48, b[2] - b[0] - 60, 60, 6, 5, waves=1.5)
    L += [("main", trail), ("main", jet)]
    return Art("sweats-hip", "Sweatpants - hip", "Left front thigh/hip, ~3 in below the waistband", "2.5 in wide", L)


def sweats_leg():
    L = []
    cap = 66
    L.append(("main", K.text(SLAB, "AC SWIM & DIVE", cap, 0, cap, tracking=160)))
    L = [(r, K.rotate(p, 90)) for r, p in L]
    return Art("sweats-leg", "Sweatpants - leg side", "Right leg, outer side seam, starting ~4 in below the waistband, reading top to bottom",
               "~0.7 in wide x ~10 in long", L)


ARTS = [tee_chest, tee_back, hoodie_front, hoodie_sleeve, crew_front, sweats_hip, sweats_leg]
NAME = "Aero Varsity"
SLUG = "aero-varsity"
TAGLINE = "Vintage collegiate: varsity-outlined slab lettering and a jet whose contrail turns into a wave."
