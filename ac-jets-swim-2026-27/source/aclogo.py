"""The team's AC logo: tall block AC letters in outline with a fighter jet flying
through them. Redrawn clean from the artwork the team supplied
(assets/ac-logo-original.png, 300 x 300 px):

  * the jet is redrawn by hand as clean vector (straight edges, smooth canopy and radome)
    on the original's pixel grid, so it sits exactly where the team's jet sits;
  * the letters are traced from the original with the jet lifted out, then every edge is
    straightened and near-horizontal / near-vertical edges are squared up;
  * the jet is keylined out of the letters by an even gap.

One ink: role "logo" (red on black, white and grey garments, white on red)."""
import math
import os

import cv2
import numpy as np
import pathops
from PIL import Image

import svgkit as K

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "ac-logo-original.png")
U = 8                       # raster upscale used for the letter trace
GAP_MIN = 0.045             # in: keyline between the jet and the letters


def cubic(p0, c1, c2, p3, n=16):
    pts = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        pts.append((u**3*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t**3*p3[0],
                    u**3*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t**3*p3[1]))
    return pts

def _jet(detail=True, small=False):
    """Clean redraw of the team's jet, in the original logo's pixel coordinates."""
    top = [(77.0, 142.6), (108.0, 139.4), (124.0, 143.0), (165.0, 143.7)]
    top += cubic((165.0, 143.7), (180.0, 137.5), (205.0, 133.0), (223.0, 143.6))      # canopy
    top += cubic((223.0, 143.6), (238.0, 146.0), (258.0, 151.0), (270.5, 157.5))      # radome
    bot = cubic((270.5, 157.5), (258.0, 159.6), (232.0, 160.2), (210.0, 160.2))
    bot += [(205.5, 160.2), (201.0, 165.0), (145.0, 166.2), (105.0, 165.0), (86.0, 163.8),
            (74.0, 169.8), (60.6, 169.8), (70.6, 160.2), (70.6, 150.0), (75.0, 147.6)]
    body = K.poly(top + bot)
    fin = K.poly([(61.5, 115.0), (79.0, 115.0), (108.5, 139.6), (77.0, 142.8)])
    # wing-tip missile above, on its rail
    lo = 137.6 if small else 137.1               # missile a touch fatter where it is printed small
    upper = K.poly([(121.5, 143.3), (125.6, 135.0), (160.5, 135.0), (166.5, 136.0 + (lo - 137.1) / 2),
                    (160.5, lo), (156.0, lo), (156.0, 143.6)])
    ufin = K.poly([(125.0, 135.5), (127.4, 132.3), (134.5, 132.3), (136.5, 135.2)])
    # pylon + missile below
    pylon = K.poly([(98.0, 165.0), (108.0, 165.0), (102.0, 174.6), (93.0, 174.6), (94.0, 171.0)])
    lower = K.poly([(93.0, 174.4), (133.5, 174.4), (138.5, 176.3), (133.5, 178.3), (93.0, 178.3)])
    lfin = K.poly([(90.6, 171.0), (98.6, 171.0), (99.8, 174.6), (99.8, 178.0), (98.6, 181.2), (92.0, 181.2),
                   (93.6, 176.3)])
    wing = K.poly([(105.0, 165.0), (147.0, 166.2), (141.0, 168.0), (128.0, 172.0), (133.5, 174.6), (104.0, 174.6)])
    j = K.union(body, fin, upper, ufin, pylon, lower, lfin, wing)
    if detail:
        # canopy glass: two panes inside the bubble, split by the frame bar
        bub = K.poly([(166.5, 143.6)] + cubic((166.5, 143.6), (180.5, 138.4), (205.0, 134.2), (221.5, 143.6)))
        glass = K.diff(bub, K.stroke(bub, 2.4, join="round"))
        glass = K.diff(glass, K.rect(194.6, 130, 1.8, 20))
        glass = K.inter(glass, K.rect(181.0, 130, 36.5, 12.4))  # blunt pane ends, above the canopy rail
        j = K.diff(j, glass)
    return j


def _snap(pts, tol_deg=4.0, rounds=3):
    """Square up near-horizontal and near-vertical edges of a closed polygon."""
    p = [list(v) for v in pts]
    t = math.tan(math.radians(tol_deg))
    for _ in range(rounds):
        n = len(p)
        for i in range(n):
            a, b = p[i], p[(i + 1) % n]
            dx, dy = b[0] - a[0], b[1] - a[1]
            if abs(dy) <= t * abs(dx):
                y = (a[1] + b[1]) / 2; a[1] = b[1] = y
            elif abs(dx) <= t * abs(dy):
                x = (a[0] + b[0]) / 2; a[0] = b[0] = x
    return [tuple(v) for v in p]


def _drop_short(pts, min_len=2.4):
    """Remove the tiny corner bevels the tracer leaves: an edge shorter than min_len is
    replaced by the meeting point of its two neighbouring edges."""
    p = [tuple(v) for v in pts]
    changed = True
    while changed and len(p) > 4:
        changed = False
        n = len(p)
        for i in range(n):
            a, b = p[i], p[(i + 1) % n]
            if math.dist(a, b) >= min_len:
                continue
            p0, p3 = p[(i - 1) % n], p[(i + 2) % n]
            d1 = (a[0] - p0[0], a[1] - p0[1]); d2 = (p3[0] - b[0], p3[1] - b[1])
            den = d1[0] * d2[1] - d1[1] * d2[0]
            if abs(den) < 1e-9:
                continue
            t = ((b[0] - p0[0]) * d2[1] - (b[1] - p0[1]) * d2[0]) / den
            x = (p0[0] + t * d1[0], p0[1] + t * d1[1])
            if math.dist(x, a) > 3 * min_len:
                continue
            j = (i + 1) % n
            p[i] = x
            del p[j]
            changed = True
            break
    return p


def _open(p, r):
    """Morphological opening: remove parts of p narrower than 2r, keep sharp corners."""
    er = K.diff(p, K.stroke(p, 2 * r, join="miter", miter=10))
    back = K.union(er, K.stroke(er, 2 * r, join="miter", miter=10))
    return K.inter(back, p)


def _letters(cut_px):
    """The AC letters, traced and straightened, with the area around the jet lifted out
    (in the original's pixel coordinates)."""
    a = np.array(Image.open(SRC).convert("RGBA")).astype(np.float32)[..., 3] / 255.0
    big = cv2.GaussianBlur(cv2.resize(a, None, fx=U, fy=U, interpolation=cv2.INTER_CUBIC), (0, 0), 2.0)
    m = (big > 0.5).astype(np.uint8)
    # lift the jet (and a keyline round it) out of the bitmap before tracing
    cut = K.union(_jet(False), K.stroke(_jet(False), 2 * cut_px, join="round"))
    hole = np.zeros_like(m)
    for contour in cut.contours:
        pts = []
        for seg, pp in contour:
            pts += [p for p in pp if p is not None]
        if pts:
            cv2.fillPoly(hole, [np.round(np.array(pts) * U).astype(np.int32)], 1)
    m = m & (1 - hole)
    cs, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = pathops.Path()
    for c in cs:
        if cv2.contourArea(c) < (2.5 * U) ** 2:
            continue
        p = cv2.approxPolyDP(c, 0.8 * U, True)[:, 0, :].astype(float) / U
        out = pathops.op(out, K.poly(_snap(_drop_short(_snap(p)))), pathops.PathOp.XOR, clockwise=True)
    return out


def ac_logo(height):
    """Logo `height` print units tall (1 unit = 0.01 in), top-left at (0, 0)."""
    ref_h = 262.0                                    # original logo height in pixels (approx.)
    px_in = height / 100.0 / ref_h                    # inches per original pixel at this size
    gap = max(1.1, GAP_MIN / px_in)                   # keyline, in original pixels
    detail = px_in >= 0.02                            # canopy glass only where it can print
    jet = _jet(detail, small=not detail)
    letters = K.diff(_letters(gap - 0.4), K.union(jet, K.stroke(jet, 2 * gap, join="round")))
    letters = _open(letters, 1.3)          # clear slivers of letter left between keylines
    logo = K.union(letters, jet)
    x0, y0, x1, y1 = K.bounds(logo)
    k = height / (y1 - y0)
    return K.scale(K.translate(logo, -x0, -y0), k)
