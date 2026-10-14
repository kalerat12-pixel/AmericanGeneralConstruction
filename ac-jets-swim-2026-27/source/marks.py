"""Original jet marks for the Adams Central Jets 2026-27 collection.

All marks are drawn on a nominal grid and returned as pathops Paths.
"""
import math

import svgkit as K


def _mirror(points):
    """Right-half outline (nose first, tail last) -> full symmetric polygon."""
    left = [(-x, y) for x, y in reversed(points) if x != 0]
    return points + left


def jet_plan(length=200.0, cx=0.0, cy=0.0, canopy=True, variant="A"):
    """Top-down (plan view) double-delta jet, nose pointing up. Original drawing.

    Built from straight lines only so it holds up as a mark at any size.
    Nominal drawing is 200 long x 168 span; (cx, cy) = centre of the bounding box.
    Returns (path, info) where info holds wingtip / tail positions for contrails.
    """
    if variant == "A":
        R = [(0, 0), (9, 64), (25, 100), (84, 160), (84, 172), (40, 168), (18, 184),
             (13, 200), (0, 194)]
    else:  # B: slimmer, longer nose
        R = [(0, 0), (8, 70), (22, 104), (84, 162), (84, 172), (40, 168), (18, 184),
             (13, 200), (0, 194)]
    pts = R + [(-x, y) for x, y in reversed(R[1:-1])]
    body = K.poly(pts)
    if canopy:
        cp = K.poly([(0, 46), (3.6, 62), (3.6, 80), (0, 90), (-3.6, 80), (-3.6, 62)])
        body = K.diff(body, cp)
    s = length / 200.0
    body = K.transformed(body, s, 0, 0, s, cx, cy - 100 * s)
    info = {
        "tips": [(cx + 84 * s, cy + (166 - 100) * s), (cx - 84 * s, cy + (166 - 100) * s)],
        "tip_te": [(cx + 84 * s, cy + 72 * s), (cx - 84 * s, cy + 72 * s)],
        "tail": (cx, cy + 100 * s),
        "nose": (cx, cy - 100 * s),
        "span": 168 * s,
        "scale": s,
    }
    return body, info


def arrowhead(height=100.0, x=0.0, y=0.0, slant=0.0):
    """Lane Four mark: a notched delta reduced to its essence, pointing right.

    `height` is the full height; the mark is ~1.18 x height wide.
    (x, y) = left edge, vertical centre. slant matches italic type.
    """
    h = height / 2
    w = height * 1.18
    notch = w * 0.34
    p = K.poly([(0, -h), (w, 0), (0, h), (notch, 0)])
    if slant:
        p = K.skew_x(p, slant)
    return K.translate(p, x, y)


def jet_profile(length=300.0, x=0.0, y=0.0):
    """Side-profile jet, nose pointing right. (x, y) = nose tip.
    Nominal length 300 (tail at x-300)."""
    p = K.new()
    # outline drawn tail -> nose along the top, back along the belly
    p.moveTo(-300, -8)
    p.lineTo(-262, -10)
    p.lineTo(-292, -64)       # fin trailing edge top
    p.lineTo(-266, -64)       # fin tip
    p.lineTo(-206, -14)       # fin leading edge
    p.cubicTo(-160, -18, -112, -20, -86, -22)
    p.cubicTo(-70, -36, -48, -40, -34, -32)   # canopy hump
    p.cubicTo(-22, -24, -10, -10, 0, 0)       # nose top
    p.cubicTo(-20, 6, -60, 12, -110, 14)      # chin / belly
    p.lineTo(-250, 12)
    p.lineTo(-300, 8)
    p.close()
    body = K.union(p)
    # wing (swept, seen edge-on as a sliver)
    wing = K.poly([(-112, 4), (-196, 8), (-226, 26), (-206, 26), (-150, 12)])
    body = K.union(body, wing)
    s = length / 300.0
    return K.transformed(body, s, 0, 0, s, x, y)
