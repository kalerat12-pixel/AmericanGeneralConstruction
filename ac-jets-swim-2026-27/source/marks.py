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


# ---------------------------------------------------------------- Fighter mark (final)
# Top-down twin-tail fighter in the style the client picked from the Figma AI round,
# redrawn as clean symmetric vector from measured proportions (not traced).
# Span S = 100U, nose at (0, 0), y aft. Wing leading edge at 45 deg.
F_BODY = [(0, 0), (4, 20), (7, 34), (8, 40), (10, 43.5), (17, 60), (17, 65), (15.5, 67),
          (18.5, 70), (47.5, 99), (50, 105), (50, 114.5), (24, 114.5), (34, 132), (34, 139.5),
          (16, 131.5), (12, 131.5), (11, 139.5), (4, 139.5), (3.2, 134), (0, 134)]
F_LEN = 139.5
F_CANOPY = [(0, 21), (2.4, 25), (3.4, 31), (3.4, 40), (2.2, 45), (0, 47)]
STAB_SLOPE = (34 - 24) / (132 - 114.5)            # stab leading edge, dx per dy


def _sym(right):
    return K.poly(right + [(-x, y) for x, y in reversed(right[1:-1])])


def _band(top, top_slope, bot, bot_slope, reach=60):
    """Symmetric chevron band between two V lines y = top + top_slope*|x| and y = bot + bot_slope*|x|."""
    return K.poly([(0, top), (reach, top + reach * top_slope), (reach, bot + reach * bot_slope), (0, bot),
                   (-reach, bot + reach * bot_slope), (-reach, top + reach * top_slope)])


def fighter(span, cx=0.0, cy=0.0, style="red", gap=None, detail=None):
    """Twin-tail fighter, nose up, centred on (cx, cy).

    style "red":   one accent shape: canopy and a chevron stripe parallel to the wing leading
                   edge knocked out, stabilisers cut free (front lockups, leg strip).
    style "white": body in main ink with panel keylines knocked out and a tapered red chevron
                   band across the wings, keylined from the body (the big back print).
    gap:    keyline width in print units (0.01 in); never below 0.04 in.
    detail: "full", "simple" (no canopy, spans under 1.2 in) or "mini" (silhouette and stabiliser
            cuts only, spans under 1 in); picked from span when None.
    Returns ({role: path}, info)."""
    u = span / 100.0
    k = max(gap or 4.0, 4.0) / u                       # keyline width in U
    if detail is None:
        detail = "full" if span >= 120 else "simple" if span >= 100 else "mini"
    body = _sym(F_BODY)
    canopy = _sym(F_CANOPY)
    # stabiliser leading edge continued through the wing, and the fuselage side line
    sy0 = 114.5 - (24 - 13.9) / STAB_SLOPE
    stab_cuts = []
    for sx in (1, -1):
        stab_cuts.append(K.line(sx * 13.9, sy0, sx * 24.3, 114.5 + 0.3 / STAB_SLOPE, k))
        stab_cuts.append(K.rect(sx * 13.9 - k / 2, sy0, k, 131.5 - sy0 + 1))
    out = {}
    if style == "red":
        cuts = list(stab_cuts)
        if detail != "mini":
            cuts.append(K.inter(_band(56, 1.0, 61.5, 1.0), body))
        if detail == "full":
            cuts.append(canopy)
        out["accent"] = K.diff(body, K.union(*cuts))
    else:
        top, ts, bot, bs = 71.0, 0.73, 84.5, 0.62
        lines = [K.rect(-k / 2, 47 + k, k, 134 - 47)] + stab_cuts           # spine
        for sx in (1, -1):
            lines.append(K.line(sx * 6.6, 42.5, sx * 13.2, 63.5, k))           # intake / LERX line
            lines.append(K.line(sx * 16.4, 72.1, sx * 45.4, 101.1, k))         # leading-edge flap
        band = K.diff(K.inter(_band(top, ts, bot, bs), body), K.union(*lines))
        keyed = K.union(K.inter(_band(top - k, ts, bot + k, bs), body), canopy, *lines)
        out["main"] = K.diff(body, keyed)
        out["accent"] = band
    T = lambda p: K.translate(K.transformed(p, u, 0, 0, u, 0, 0), cx, cy - F_LEN * u / 2)
    out = {r: T(p) for r, p in out.items()}
    info = {"span": span, "length": F_LEN * u, "u": u, "nose_y": cy - F_LEN * u / 2,
            "tail_y": cy + F_LEN * u / 2, "silhouette": T(body)}
    return out, info
