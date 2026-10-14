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


def jet_v2(length=200.0, cx=0.0, cy=0.0, detail="auto", canopy=True, min_line=3.2):
    """Squadron v2 jet, nose up. Original drawing, straight lines only.

    Needle nose with chines, leading-edge root extensions, cranked delta wing,
    separate swept stabilisers and twin nozzles. Nominal 200 long x 172 span;
    (cx, cy) = centre of the bounding box.

    detail: "simple" silhouette, "panel" adds panel-line knockouts (spine, wing roots,
    leading-edge flaps), "auto" picks panel lines when the jet is >= 2 in long.
    min_line: thinnest knockout allowed in print units (0.01 in), so panel lines
    never drop below ~0.032 in on the garment.
    """
    R = [(0, 0), (7.5, 58), (13, 80), (26, 100), (86, 156), (86, 168), (44, 164),
         (30, 172), (44, 188), (44, 196), (20, 194), (13, 194), (12, 202), (3, 202), (2.5, 196), (0, 196)]
    pts = R + [(-x, y) for x, y in reversed(R[1:-1])]
    body = K.poly(pts)
    s = length / 202.0
    if detail == "auto":
        detail = "panel" if length >= 200 else "simple"
    w = max(1.7, min_line / s)
    cuts = []
    if canopy:
        cuts.append(K.poly([(0, 44), (4.0, 58), (4.0, 78), (0, 88), (-4.0, 78), (-4.0, 58)]))
    if detail == "panel":
        cuts.append(K.rect(-w / 2, 98, w, 86))                     # spine
        for sx in (1, -1):
            cuts.append(K.rect(sx * 17 - (w if sx < 0 else 0), 106, w, 58))   # wing root
            cuts.append(K.line(sx * 34.5, 113, sx * 79, 155.5, w))            # leading-edge flap
    if cuts:
        body = K.diff(body, K.union(*cuts))
    body = K.transformed(body, s, 0, 0, s, cx, cy - 101 * s)
    info = {
        "tips": [(cx + 86 * s, cy + (162 - 101) * s), (cx - 86 * s, cy + (162 - 101) * s)],
        "tail": (cx, cy + 101 * s),
        "nose": (cx, cy - 101 * s),
        "span": 172 * s,
        "scale": s,
    }
    return body, info


# ---------------------------------------------------------------- Squadron v3 mark
# Right half of the planform in span units (U): span S = 100U, nose at (0, 0), y aft.
# Angle family: 12.2 deg nose chine, 25.3 deg strake, 45 deg wing / tail chamfer / V notch, 90 deg.
# The W tail = wingtip trailing corners, a 45 deg step in, two square tail feet and a 90 deg centre V.
JET_R = [(0, 0), (6.5, 30), (15, 48), (50, 83), (50, 92), (20, 92), (12, 100),
         (12, 110), (6, 110), (0, 104)]
JET_LEN = 110.0      # nose to tail feet, in U


def jet_master(span_in):
    """Size master picked from the printed wingspan (inches), never by hand."""
    if span_in >= 2.5:
        return "L"      # canopy + stencil spine
    if span_in >= 1.25:
        return "M"      # canopy only
    if span_in >= 0.75:
        return "S"      # solid with the V notch
    if span_in >= 0.45:
        return "XS"     # solid, notch closed
    raise ValueError("jet below 0.45 in span is not allowed")


def jet(span, cx=0.0, cy=0.0, master=None, spine=None, rotate=0):
    """Squadron jet mark v3, nose up (rotate=90 points it right).

    span    printed wingspan in units (0.01 in)
    master  "L" / "M" / "S"; picked from the span when None
    spine   width of the L-master spine knockout in units; defaults to 5U and is
            normally set equal to the hero word's stencil bridge width
    (cx, cy) is the centre of the bounding box. Returns (path, info).
    """
    u = span / 100.0
    if master is None:
        master = jet_master(span / 100.0)
    right = JET_R if master != "XS" else JET_R[:-2] + [(0, 110)]
    pts = right + [(-x, y) for x, y in reversed(right[1:-1])]
    body = K.poly(pts)
    cuts = []
    if master in ("L", "M"):
        cuts.append(K.poly([(0, 20), (2.5, 27), (2.5, 34), (-2.5, 34), (-2.5, 27)]))
    if master == "L":
        sw = (spine / u) if spine else 5.0
        cuts.append(K.rect(-sw / 2, 34 + sw, sw, JET_LEN))     # canopy bridge = spine width; runs into the V
    if cuts:
        body = K.diff(body, K.union(*cuts))
    body = K.transformed(body, u, 0, 0, u, -0.0, -JET_LEN * u / 2)   # centred on (0, 0)
    if rotate:
        body = K.rotate(body, rotate)
    body = K.translate(body, cx, cy)
    info = {"span": span, "length": JET_LEN * u, "master": master, "u": u,
            "tail_y": cy + JET_LEN * u / 2, "nose_y": cy - JET_LEN * u / 2,
            "tip_trailing": [(cx + 50 * u, cy + (92 - JET_LEN / 2) * u), (cx - 50 * u, cy + (92 - JET_LEN / 2) * u)],
            "trailing_edge_y": cy + (92 - JET_LEN / 2) * u}
    return body, info
