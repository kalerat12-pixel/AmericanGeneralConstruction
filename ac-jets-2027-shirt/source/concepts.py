"""The three design concepts. Units: 100 = 1 inch.

Each art function returns a Design whose layers use two ink roles:
  R = red (constant across shirts)
  K = contrast ink (white on black shirts, black on white/heather)
Knockouts are real holes, so the final files are pure filled paths with
no overlapping inks (clean spot-colour separations).
"""
import math

import vec
from jet import Jet
from vec import text

# fonts
STENCIL = "BigShouldersStencilDisplay-900"
TECH = "ChakraPetch-600"
TECH_B = "ChakraPetch-700"
MONO = "RubikMonoOne-400"
SAIRA = "SairaStencilOne-400"
TEKO = "Teko-600"

LAT = "40°44′50″N"
LON = "84°56′27″W"


class Design:
    def __init__(self, name, width):
        self.name = name
        self.width = width
        self.layers = []  # (role, path)

    def add(self, role, *paths):
        for p in paths:
            self.layers.append((role, p))
        return self

    def knock(self, *paths):
        """Cut holes through everything added so far."""
        cut = vec.union(*paths)
        self.layers = [(r, vec.diff(p, cut)) for r, p in self.layers]
        return self

    def inks(self):
        """{role: path} with upper layers knocking out lower ones."""
        out = {}
        above = vec.union()
        for role, p in reversed(self.layers):
            p = vec.diff(p, above) if role != "_" else p
            out[role] = vec.union(out[role], p) if role in out else p
            above = vec.union(above, p)
        return out

    def bbox(self):
        u = vec.union(*[p for _, p in self.layers])
        return u.bounds


def fit_text(font, txt, x, y, width, anchor="start", tracking=0.0):
    """Text scaled so its *ink* width is exactly `width` (cap-aligned at y)."""
    t = text(font, txt, 100, 0, 0, tracking=tracking)
    x0, y0, x1, y1 = t.bounds
    s = width / (x1 - x0)
    t = vec.xform(t, s, 0, 0, s, -x0 * s, -y0 * s)
    w = (x1 - x0) * s
    if anchor == "middle":
        x -= w / 2
    elif anchor == "end":
        x -= w
    return vec.move(t, x, y), (y1 - y0) * s


def label(txt, x, y, size, anchor="start", font=TECH, tracking=0.12):
    return text(font, txt, size, x, y, anchor=anchor, tracking=tracking)


def contrails(jet, size, cx, cy, length, w0, w1, angle_deg=None, gap_from=0):
    """Two tapered trails from the nozzles, opposite the heading."""
    (ax, ay), (bx, by) = jet.nozzles(size)
    h = jet.h if angle_deg is None else math.radians(angle_deg)
    dx, dy = -math.sin(h), math.cos(h)  # backwards along heading
    out = []
    for x, y in ((ax, ay), (bx, by)):
        x0, y0 = cx + x + dx * gap_from, cy + y + dy * gap_from
        out.append(vec.taper(x0, y0, x0 + dx * length, y0 + dy * length, w0, w1))
    return out


def barcode(x, y, w, h, seed=27, unit=4.0):
    import random
    rnd = random.Random(seed)
    bars = []
    cx = x
    while cx < x + w - unit * 3:
        bw = unit * rnd.choice([1, 1, 1, 2, 2, 3])
        bars.append(vec.rect(cx, y, bw, h))
        cx += bw + unit * rnd.choice([1, 1, 2])
    return vec.union(*bars)


# =====================================================================
# CONCEPT A - "TAIL NUMBER"  (motorsport livery / stencil tail art)
# =====================================================================
def a_back():
    D = Design("A-back", 1200)
    W = 1200
    # header strip
    D.add("K", label("ADAMS CENTRAL FLYING JETS", 0, 34, 34, tracking=0.16))
    D.add("K", label("MONROE · INDIANA", W, 34, 34, anchor="end", tracking=0.16))
    D.add("K", vec.rect(0, 54, W, 4))
    D.add("R", vec.rect(0, 54, 140, 4))
    # tail number: AC [jet] 27  -- the jet is the hyphen
    top = 104
    ac = text(STENCIL, "AC", 100, 0, 0, tracking=0.01)
    n27 = text(STENCIL, "27", 100, 0, 0, tracking=0.01)
    gap = 300
    wa = ac.bounds[2] - ac.bounds[0]
    wb = n27.bounds[2] - n27.bounds[0]
    s = (W - gap) / (wa + wb)
    ac, bh = fit_text(STENCIL, "AC", 0, top, wa * s, tracking=0.01)
    n27, _ = fit_text(STENCIL, "27", W, top, wb * s, anchor="end", tracking=0.01)
    D.add("K", ac, n27)
    # FLIGHT 2027 + data block
    y2 = top + bh + 40
    fl, fh = fit_text(STENCIL, "FLIGHT 2027", 0, y2, 770, tracking=0.03)
    D.add("R", fl)
    dx = 810
    D.add("K", vec.rect(dx, y2, 4, fh))
    rows = [("LAT", LAT), ("LON", LON), ("ELEV", "824 FT"), ("HDG", "027°")]
    rh = fh / 4
    for i, (k, v) in enumerate(rows):
        by = y2 + rh * i + rh * 0.72
        D.add("R", label(k, dx + 26, by, 26, font=TECH_B))
        D.add("K", label(v, W, by, 30, anchor="end", font=TECH_B, tracking=0.06))
    # footer
    fy = y2 + fh + 40
    D.add("K", vec.rect(0, fy, W, 4))
    D.add("K", label("SENIOR CLASS", 0, fy + 44, 28, tracking=0.2))
    D.add("K", label("EST. 1949", W, fy + 44, 28, anchor="end", tracking=0.2))
    for i in range(8):
        D.add("K", vec.rect(W / 2 - 230 + i * 60, fy + 18, 34, 30))

    # hero jet climbing between AC and 27
    j = Jet(roll=-26, pitch=24, heading=30)
    js = 1.1
    ax1 = ac.bounds[2]
    jx, jy = ax1 + gap / 2 + 6, top + bh * 0.42
    art = j.render(size=js, gap=3.0)
    body = vec.move(art["body"], jx, jy)
    canopy = vec.move(art["canopy"], jx, jy)
    trails = contrails(j, js, jx, jy, 300, 13, 2, gap_from=8)
    trails = [vec.inter(t, vec.rect(-50, 0, W + 100, y2 - 22)) for t in trails]
    D.knock(vec.dilate(vec.union(body, *trails), 11))
    D.add("R", *trails)
    D.add("R", body)
    D.add("K", canopy)
    return D


def a_front():
    D = Design("A-front", 350)
    W = 350
    ac, h = fit_text(STENCIL, "AC", 0, 40, 150)
    D.add("K", ac)
    D.add("R", vec.rect(166, 40, 5, h))
    n27, _ = fit_text(STENCIL, "27", 188, 40, 162)
    # make 27 the same height as AC
    x0, y0, x1, y1 = n27.bounds
    n27 = vec.scale(n27, 1, h / (y1 - y0), 0, 40)
    D.add("R", n27)
    D.add("K", vec.rect(0, 40 + h + 14, W, 3))
    D.add("K", label("FLIGHT 2027", 0, 40 + h + 44, 22, font=TECH_B, tracking=0.18))
    D.add("K", label("MONROE IN", W, 40 + h + 44, 22, anchor="end", font=TECH_B, tracking=0.18))
    # small jet over the top-right
    j = Jet(roll=-20, pitch=15, heading=40)
    art = j.render(size=0.2, detail=False, gap=1.6)
    body = vec.move(art["body"], 300, 18)
    D.knock(vec.dilate(body, 4))
    D.add("R", body)
    D.add("K", vec.move(art["canopy"], 300, 18))
    return D


def apos27(x_right, y, height):
    """’27 in Rubik Mono with the apostrophe kerned tight (mono font)."""
    n = text(MONO, "27", 100, 0, 0)
    a = text(MONO, "’", 100, 0, 0)
    nx0, ny0, nx1, ny1 = n.bounds
    s = height / (ny1 - ny0)
    n = vec.xform(n, s, 0, 0, s, x_right - nx1 * s, y - ny0 * s)
    ax0, ay0, ax1, ay1 = a.bounds
    left = n.bounds[0]
    a = vec.xform(a, s, 0, 0, s, left - height * 0.07 - ax1 * s, y - ay0 * s)
    return vec.union(n, a)


# =====================================================================
# CONCEPT B - "BOARDING PASS"  (flight manifest layout)
# =====================================================================
def b_back():
    D = Design("B-back", 1200)
    W = 1200
    top = 380           # pass top
    H = 780             # pass height
    stub = 880          # perforation x
    bw = 6              # border weight
    frame = vec.diff(vec.rrect(0, top, W, H, 34), vec.rrect(bw, top + bw, W - 2 * bw, H - 2 * bw, 28))
    D.add("K", frame)
    # header bar
    D.add("K", vec.inter(vec.rect(0, top, W, 92), vec.rrect(0, top, W, H, 34)))
    D.knock(label("BOARDING PASS", 44, top + 62, 36, font=MONO, tracking=0.04))
    D.knock(label("SENIOR CLASS", W - 44, top + 58, 26, anchor="end",
                  font=TECH_B, tracking=0.16))
    # perforation: notches + dashes
    D.knock(vec.circle(stub, top, 26), vec.circle(stub, top + H, 26))
    for yy in range(top + 110, top + H - 40, 26):
        D.add("K", vec.rect(stub - 2, yy, 4, 13))

    # FROM / TO
    py = top + 140
    D.add("R", label("FROM", 44, py + 20, 24, font=TECH_B, tracking=0.2))
    D.add("R", label("TO", stub - 44, py + 20, 24, anchor="end", font=TECH_B, tracking=0.2))
    acj, ch = fit_text(MONO, "ACJ", 44, py + 40, 300)
    D.add("K", acj)
    to = apos27(stub - 44, py + 40, ch)
    D.add("K", to)
    D.add("K", label("MONROE, IN", 44, py + 40 + ch + 40, 26, font=TECH_B, tracking=0.14))
    D.add("K", label("CLASS OF 2027", stub - 44, py + 40 + ch + 40, 26, anchor="end",
                     font=TECH_B, tracking=0.14))
    # route line with mini jet
    my = py + 40 + ch / 2
    lx0, lx1 = 44 + 300 + 30, to.bounds[0] - 30
    for xx in range(int(lx0), int(lx1) - 10, 22):
        D.add("R", vec.rect(xx, my - 2, 11, 4))
    mj = Jet(heading=90).render(size=0.17, detail=False, gap=1.5)
    mjb = vec.move(mj["body"], (lx0 + lx1) / 2, my)
    D.knock(vec.dilate(mjb, 8))
    D.add("R", mjb)

    # data grid
    gy = py + 40 + ch + 90
    D.add("K", vec.rect(44, gy, stub - 88, 3))
    cols = [44, 330, 560, 720]
    row1 = [("PASSENGER", "SENIORS"), ("FLIGHT", "AC 2027"), ("GATE", "27"), ("SEAT", "SR")]
    row2 = [("BOARDING", "AUG 2023"), ("DEPARTS", "MAY 2027"), ("GROUP", "04"), ("CLASS", "1ST")]
    for r, row in enumerate((row1, row2)):
        yy = gy + 46 + r * 110
        for (k, v), cx in zip(row, cols):
            D.add("R", label(k, cx, yy, 20, font=TECH_B, tracking=0.2))
            D.add("K", label(v, cx, yy + 52, 42, font=TECH_B, tracking=0.04))
    # barcode
    D.add("K", barcode(44, top + H - 96, 440, 56, unit=4.5))
    D.add("K", label(f"{LAT}  {LON}", stub - 44, top + H - 54, 20, anchor="end",
                     font=TECH_B, tracking=0.1))
    D.add("K", label("EST. 1949", stub - 44, top + H - 82, 20, anchor="end",
                     font=TECH_B, tracking=0.2))

    # stub
    sx = stub + 40
    sw = W - 40 - sx
    rowsS = [("FLIGHT", "AC27"), ("SEAT", "SR"), ("DEPARTS", "05.27")]
    for i, (k, v) in enumerate(rowsS):
        yy = top + 150 + i * 130
        D.add("R", label(k, sx, yy, 20, font=TECH_B, tracking=0.2))
        t, _ = fit_text(MONO, v, sx, yy + 18, sw if len(v) > 3 else sw * 0.45)
        D.add("K", t)
    D.add("K", barcode(sx, top + H - 96, sw, 56, seed=7, unit=4.5))

    # hero jet bursting out of the top edge
    j = Jet(roll=-26, pitch=24, heading=28)
    js = 1.22
    jx, jy = 655, top - 95
    art = j.render(size=js, gap=3.0)
    body = vec.move(art["body"], jx, jy)
    trails = contrails(j, js, jx, jy, 300, 14, 2, gap_from=6)
    trails = [vec.inter(t, vec.rect(-50, -50, W + 100, top - 2)) for t in trails]
    D.knock(vec.dilate(vec.union(body, *trails), 12))
    D.add("R", *trails)
    D.add("R", body)
    D.add("K", vec.move(art["canopy"], jx, jy))
    return D


def b_front():
    D = Design("B-front", 350)
    W = 350
    pad = 18
    H = 170
    frame = vec.diff(vec.rrect(0, 0, W, H, 14), vec.rrect(3.5, 3.5, W - 7, H - 7, 11))
    D.add("K", frame)
    D.add("K", vec.inter(vec.rect(0, 0, W, 34), vec.rrect(0, 0, W, H, 14)))
    D.knock(label("BOARDING PASS", pad, 24, 15, font=MONO, tracking=0.04))
    D.knock(label("AC2027", W - pad, 23, 14, anchor="end", font=TECH_B, tracking=0.16))
    acj, ch = fit_text(MONO, "ACJ", pad, 56, 104)
    D.add("K", acj)
    D.add("K", apos27(W - pad, 56, ch))
    my = 56 + ch / 2
    mj = Jet(heading=90).render(size=0.085, detail=False, gap=1)
    D.add("R", vec.move(mj["body"], W / 2 - 4, my))
    D.add("R", label("SEAT SR", pad, 56 + ch + 30, 15, font=TECH_B, tracking=0.2))
    D.add("R", label("GATE 27", W - pad, 56 + ch + 30, 15, anchor="end", font=TECH_B, tracking=0.2))
    D.add("K", barcode(pad, H - 44, W - 2 * pad, 22, seed=3, unit=2.6))
    return D


# =====================================================================
# CONCEPT C - "SQUADRON"  (mil-spec patch + HUD heading tape)
# =====================================================================
def heading_tape(D, cx, y, width, hdg=27, px_per_deg=9.0, size=1.0):
    half = width / 2
    lo = hdg - half / px_per_deg
    hi = hdg + half / px_per_deg
    a = math.ceil(lo / 5) * 5
    while a <= hi:
        x = cx + (a - hdg) * px_per_deg
        major = a % 10 == 0
        D.add("K", vec.rect(x - 2 * size, y + (0 if major else 14 * size), 4 * size,
                            (34 if major else 20) * size))
        if major:
            n = (a % 360) // 10
            s = {0: "N", 9: "E", 18: "S", 27: "W"}.get(n, f"{n:02d}")
            D.add("K", text(TEKO, s, 44 * size, x, y + 80 * size, anchor="middle"))
        a += 5
    D.add("K", vec.rect(cx - half, y + 34 * size, width, 3 * size))
    # caret + readout box
    D.add("R", vec.poly([(cx, y - 6 * size), (cx - 16 * size, y - 30 * size),
                         (cx + 16 * size, y - 30 * size)]))
    bw, bh = 120 * size, 50 * size
    box = vec.diff(vec.rect(cx - bw / 2, y - 30 * size - bh - 6 * size, bw, bh),
                   vec.rect(cx - bw / 2 + 4 * size, y - 30 * size - bh - 2 * size,
                            bw - 8 * size, bh - 8 * size))
    D.add("R", box)
    D.add("R", text(TEKO, f"{hdg:03d}", 50 * size, cx, y - 46 * size, anchor="middle",
                    tracking=0.06))


def patch(D, cx, cy, R, top_txt, bot_txt, size_txt, jet_size, detail=True, stars=True,
          band=None, stripes=7):
    band = band or R * 0.17
    r_in = R - band
    D.add("K", vec.ring(cx, cy, R, r_in))
    rmid = (R + r_in) / 2
    D.knock(vec.text_on_arc(TEKO, top_txt, size_txt, cx, cy, rmid, 0, tracking=0.14, top=True))
    D.knock(vec.text_on_arc(TEKO, bot_txt, size_txt, cx, cy, rmid, 180, tracking=0.14, top=False))
    if stars:
        for ang in (90, 270):
            a = math.radians(ang)
            D.knock(vec.star(cx + rmid * math.sin(a), cy - rmid * math.cos(a), band * 0.3))
    # inner keyline
    gap = R * 0.035
    D.add("K", vec.ring(cx, cy, r_in - gap, r_in - gap - max(R * 0.012, 3)))
    inner = vec.circle(cx, cy, r_in - gap * 2.4)
    # banked horizon stripes (HUD attitude), thinning toward the horizon
    bank = -14
    st = []
    y = cy + R * 0.02
    th = R * 0.1
    for i in range(stripes):
        st.append(vec.rect(cx - R, y, 2 * R, th))
        y += th + R * 0.035
        th *= 0.82
    # reverse so thick bars are at the bottom: mirror the stack downward
    stripes_p = vec.union(*st)
    x0, y0, x1, y1 = stripes_p.bounds
    stripes_p = vec.xform(stripes_p, 1, 0, 0, -1, 0, y0 + y1)
    stripes_p = vec.rotate(stripes_p, bank, cx, cy)
    D.add("R", vec.inter(stripes_p, inner))
    # jet climbing out of the horizon
    j = Jet(roll=-28, pitch=26, heading=24)
    art = j.render(size=jet_size, detail=detail, gap=3.0 if detail else 1.4)
    body = vec.move(art["body"], cx + R * 0.04, cy - R * 0.08)
    canopy = vec.move(art["canopy"], cx + R * 0.04, cy - R * 0.08)
    D.knock(vec.dilate(body, R * 0.025))
    D.add("K", body)
    D.add("R", canopy)
    return body


def c_back():
    D = Design("C-back", 1200)
    W = 1200
    heading_tape(D, W / 2, 80, 1000)
    R = 470
    cy = 190 + R
    patch(D, W / 2, cy, R, "ADAMS CENTRAL · FLYING JETS", "SENIOR CLASS · 2027", 70, 1.75)
    # bottom block
    by = cy + R + 60
    t, th = fit_text(SAIRA, "AC-27", W / 2, by, 560, anchor="middle", tracking=0.04)
    D.add("R", t)
    D.add("K", vec.rect(0, by + th / 2 - 2, 260, 4), vec.rect(W - 260, by + th / 2 - 2, 260, 4))
    D.add("K", label(f"{LAT} · {LON} · ELEV 824 FT · EST. 1949", W / 2, by + th + 52, 26,
                     anchor="middle", font=TECH_B, tracking=0.16))
    return D


def c_front():
    D = Design("C-front", 350)
    R = 175
    patch(D, 175, 175, R, "AC · FLYING JETS", "CLASS OF 2027", 27, 0.62, detail=False,
          band=R * 0.22, stripes=5)
    return D


CONCEPTS = [
    {"id": "A", "slug": "tail-number", "name": "Tail Number",
     "blurb": "Motorsport-livery stencil. A huge AC-27 tail number, with an original "
              "twin-tail fighter climbing straight through it, plus contrails and "
              "Monroe's real coordinates in a flight-data block.",
     "fonts": "Big Shoulders Stencil Display Black + Chakra Petch",
     "front": a_front, "back": a_back},
    {"id": "B", "slug": "boarding-pass", "name": "Boarding Pass",
     "blurb": "A full flight-manifest layout from ACJ to ’27, boarding Aug 2023 and "
              "departing May 2027, with gate 27 and seat SR. The jet punches out "
              "through the top of the pass.",
     "fonts": "Rubik Mono One + Chakra Petch",
     "front": b_front, "back": b_back},
    {"id": "C", "slug": "squadron", "name": "Squadron",
     "blurb": "A mil-spec squadron patch with a HUD heading tape locked on 027°. "
              "The jet climbs out of a banked horizon, and a stencil AC-27 sits below.",
     "fonts": "Saira Stencil One + Teko + Chakra Petch",
     "front": c_front, "back": c_back},
]
