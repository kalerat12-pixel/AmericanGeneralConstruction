"""Original twin-tail fighter jet, modelled in 3D and projected to 2D.

The airframe is a generic stealth-era twin-engine fighter drawn from
scratch (no tracing). Model space: nose toward -y, right wing +x,
up +z, length ~410 units. `render()` banks/pitches it, applies a light
perspective and returns filled vector paths ready for printing.
"""
import math

import vec

# right half of the planform (x >= 0), nose -> tail
PLAN_R = [
    (0, -212), (4, -200), (9, -180), (14, -156), (18, -132), (21, -112),
    (27, -92), (36, -70), (46, -46), (54, -24),          # chine / LERX
    (164, 62), (168, 67), (167, 80),                     # wing tip
    (94, 84), (74, 88), (62, 97),                        # trailing edge
    (64, 104), (134, 150), (136, 156), (134, 170),       # stabilator
    (66, 166), (42, 168),
    (40, 176), (36, 198), (21, 200), (18, 190), (0, 190),  # nozzles
]

CANOPY_R = [(0, -150), (6, -142), (10.5, -126), (12, -108), (10.5, -92), (7, -80), (0, -72)]

# twin canted fins: (x, y, z) root LE, root TE, tip TE, tip LE  (right fin)
CANT = math.radians(26)
FIN_R = [(31, 92, 0), (33, 166, 0), (33 + 74 * math.sin(CANT), 178, 74 * math.cos(CANT)),
         (33 + 74 * math.sin(CANT), 146, 74 * math.cos(CANT))]

# detail / panel lines (pairs of 3D points), knocked out of the airframe
def _mirror_line(a, b):
    return [(a, b), ((-a[0], a[1], a[2]), (-b[0], b[1], b[2]))]


DETAIL_LINES = (
    _mirror_line((54, -24, 0), (60, 62, 0))            # wing root
    + _mirror_line((98, 83, 0), (154, 70, 0))         # flaperon hinge
    + _mirror_line((22, -112, 0), (30, -56, 0))        # intake edge
)


def _full(right):
    left = [(-x, y) for x, y in reversed(right) if x != 0]
    return right + left


def _rot(p, roll, pitch, yaw):
    x, y, z = p
    # roll about longitudinal (y) axis
    cr, sr = math.cos(roll), math.sin(roll)
    x, z = x * cr - z * sr, x * sr + z * cr
    # pitch about lateral (x) axis: nose up toward viewer
    cp, sp = math.cos(pitch), math.sin(pitch)
    y, z = y * cp - z * sp, y * sp + z * cp
    # yaw: heading on the page (deg clockwise from up)
    cy, sy = math.cos(yaw), math.sin(yaw)
    x, y = x * cy - y * sy, x * sy + y * cy
    return x, y, z


class Jet:
    def __init__(self, roll=0, pitch=0, heading=0, persp=1100.0):
        self.r = math.radians(roll)
        self.p = math.radians(pitch)
        self.h = math.radians(heading)
        self.persp = persp

    def pt(self, p):
        x, y, z = _rot(p, self.r, self.p, self.h)
        k = self.persp / (self.persp - z) if self.persp else 1.0
        return (x * k, y * k)

    def poly3(self, pts3):
        return vec.poly([self.pt(p) for p in pts3])

    def render(self, size=1.0, detail=True, gap=3.0):
        """Returns dict: body (silhouette), canopy, lines (knockouts),
        all scaled by `size` around the origin."""
        plan = self.poly3([(x, y, 0) for x, y in _full(PLAN_R)])
        # fuselage spine raised a touch so the body reads in perspective
        spine = self.poly3([(x * 0.9, y, 10) for x, y in _full(
            [(0, -205), (14, -150), (20, -110), (24, -40), (26, 120), (22, 190), (0, 192)])])
        fins = [self.poly3(FIN_R),
                self.poly3([(-x, y, z) for x, y, z in FIN_R])]
        body = vec.union(plan, spine, *fins)

        knock = []
        # separate the fins visually from the wing/body with a thin gap
        for f in fins:
            knock.append(vec.outline(f, gap * 1.2))
        canopy_pts = [(x, y, 16 - abs(x) * 0.3) for x, y in _full(CANOPY_R)]
        canopy = self.poly3(canopy_pts)
        if detail:
            for a, b in DETAIL_LINES:
                pa, pb = self.pt(a), self.pt(b)
                knock.append(vec.line(pa[0], pa[1], pb[0], pb[1], gap * 0.8))
            knock.append(vec.outline(canopy, gap))
        body = vec.diff(body, knock)
        # keep fins solid on top of the knocked gap lines
        fin_fill = [vec.diff(f, vec.outline(f, gap * 1.2)) for f in fins]
        # front-most fin (closer to viewer) should sit over the body gap
        body = vec.union(body, *fin_fill)
        body = vec.diff(body, [vec.outline(f, gap * 1.0) for f in fins[:0]])
        canopy_in = vec.diff(canopy, vec.outline(canopy, gap * 2.2))
        out = {"body": vec.diff(body, canopy), "canopy": canopy_in}
        if size != 1.0:
            out = {k: vec.scale(v, size) for k, v in out.items()}
        return out

    def wingtips(self, size=1.0):
        """Screen positions of the wing tips' trailing corners (for contrails)."""
        r = self.pt((167, 80, 0))
        l = self.pt((-167, 80, 0))
        return (r[0] * size, r[1] * size), (l[0] * size, l[1] * size)

    def nozzles(self, size=1.0):
        a = self.pt((28, 200, 0))
        b = self.pt((-28, 200, 0))
        return (a[0] * size, a[1] * size), (b[0] * size, b[1] * size)
