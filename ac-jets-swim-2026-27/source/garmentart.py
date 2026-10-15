"""Realistic flat-lay garments for the lookbook (inches, adult L proportions).

Each garment view is built in layers so the print sits *in* the fabric:
  drop shadow > inside of the garment (back neck, hood lining) > base fabric
  > rib knit on collars / cuffs / bands > print > body shading (gradient over the
  print too, the way ink follows the shape of the body) > soft folds > seams and
  cover-stitching > knit texture over everything > a fine edge line.

Shapes keep the coordinates the print placements were measured against, so every
print stays at its true size and position.
"""
import itertools

_ids = itertools.count()

# fabric colours (preview only, never printed)
FILL = {"black": "#1D1D1F", "white": "#F6F6F3", "heather": "#55575B"}
EDGE = {"black": "#0C0C0D", "white": "#C9C9C4", "heather": "#3C3E41"}
INSIDE = {"black": "#0E0E0F", "white": "#DEDED9", "heather": "#404245"}
STITCH = {"black": "#3A3A3D", "white": "#BDBDB7", "heather": "#6E7075"}
KNIT = {"black": "f-knit-dark", "white": "f-knit-light", "heather": "f-knit-heather"}
KNIT_OPACITY = {"black": ".10", "white": ".12", "heather": ".16"}

DEFS = (
    # body shading: darker toward the sides, a soft highlight down the middle
    '<linearGradient id="g-shade" x1="0" x2="1" y1="0" y2="0">'
    '<stop offset="0" stop-color="#000" stop-opacity=".34"/>'
    '<stop offset=".14" stop-color="#000" stop-opacity=".10"/>'
    '<stop offset=".42" stop-color="#fff" stop-opacity=".07"/>'
    '<stop offset=".58" stop-color="#fff" stop-opacity=".07"/>'
    '<stop offset=".86" stop-color="#000" stop-opacity=".10"/>'
    '<stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>'
    # light from above: a little brighter at the shoulders, a little darker at the hem
    '<linearGradient id="g-top" x1="0" x2="0" y1="0" y2="1">'
    '<stop offset="0" stop-color="#fff" stop-opacity=".07"/>'
    '<stop offset=".5" stop-color="#fff" stop-opacity="0"/>'
    '<stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>'
    '<radialGradient id="g-hood" cx=".5" cy=".75" r=".75">'
    '<stop offset="0" stop-color="#000" stop-opacity=".55"/>'
    '<stop offset="1" stop-color="#000" stop-opacity=".15"/></radialGradient>'
    '<filter id="f-shadow" x="-10%" y="-10%" width="120%" height="125%"><feGaussianBlur stdDeviation=".35"/></filter>'
    '<filter id="f-fold" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".16"/></filter>'
    # jersey / fleece texture: fine vertical knit noise
    '<filter id="f-knit-light" x="0" y="0" width="1" height="1">'
    '<feTurbulence type="fractalNoise" baseFrequency="14 5" numOctaves="1" seed="4"/>'
    '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.9 .52"/></filter>'
    '<filter id="f-knit-dark" x="0" y="0" width="1" height="1">'
    '<feTurbulence type="fractalNoise" baseFrequency="14 5" numOctaves="1" seed="4"/>'
    '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -.7 .40"/></filter>'
    # heather: light and dark fibres mixed through the knit
    '<filter id="f-knit-heather" x="0" y="0" width="1" height="1">'
    '<feTurbulence type="fractalNoise" baseFrequency="18 7" numOctaves="2" seed="9" result="n"/>'
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 .86  0 0 0 0 .87  0 0 0 0 .89  1.6 0 0 0 -.78" result="lt"/>'
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .11  -1.6 0 0 0 .70" result="dk"/>'
    '<feMerge><feMergeNode in="lt"/><feMergeNode in="dk"/></feMerge></filter>'
    # rib knit for collars, cuffs and waistbands
    '<pattern id="p-rib" patternUnits="userSpaceOnUse" width=".16" height="4">'
    '<rect width=".06" height="4" fill="#000" fill-opacity=".22"/>'
    '<rect x=".08" width=".03" height="4" fill="#fff" fill-opacity=".06"/></pattern>'
    '<pattern id="p-rib-h" patternUnits="userSpaceOnUse" width="4" height=".16">'
    '<rect width="4" height=".06" fill="#000" fill-opacity=".22"/></pattern>'
)


def _p(d, **a):
    attrs = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in a.items())
    return f'<path d="{d}" {attrs}/>'


def dress(shape, g, prints="", inside="", ribs=(), ribs_h=(), folds=(), stitches=(), seams=(),
          hood=None, extra_top=""):
    """One garment view. All path strings in inches."""
    uid = f"gc{next(_ids)}"
    out = [f'<defs><clipPath id="{uid}"><path d="{shape}"/></clipPath></defs>']
    out.append(f'<path d="{shape}" fill="#000" opacity=".22" filter="url(#f-shadow)" transform="translate(.18 .42)"/>')
    if inside:
        out.append(_p(inside, fill=INSIDE[g]))
        out.append(_p(inside, fill="url(#g-top)"))
    out.append(_p(shape, fill=FILL[g]))
    if hood:
        out.append(_p(hood, fill=INSIDE[g]) + _p(hood, fill="url(#g-hood)"))
    body = [_p(r, fill="url(#p-rib)") for r in ribs] + [_p(r, fill="url(#p-rib-h)") for r in ribs_h]
    body.append(prints)
    # shading over the print as well, so the ink sits in the fabric
    body.append(f'<rect x="-2" y="-2" width="90" height="60" fill="url(#g-top)"/>')
    for d in folds:
        body.append(_p(d, fill="none", stroke="#000", stroke_opacity=".16", stroke_width=".34",
                       stroke_linecap="round", filter="url(#f-fold)"))
        body.append(f'<g transform="translate(.16 -.08)">'
                    + _p(d, fill="none", stroke="#fff", stroke_opacity=".07", stroke_width=".22",
                         stroke_linecap="round", filter="url(#f-fold)") + "</g>")
    for d in seams:
        body.append(_p(d, fill="none", stroke=EDGE[g], stroke_width=".045", stroke_linecap="round"))
    for d in stitches:
        body.append(_p(d, fill="none", stroke=STITCH[g], stroke_width=".035", stroke_dasharray=".16 .1",
                       stroke_linecap="round"))
    body.append(extra_top)
    body.append(f'<rect x="-2" y="-2" width="90" height="60" filter="url(#{KNIT[g]})" opacity="{KNIT_OPACITY[g]}"/>')
    out.append(f'<g clip-path="url(#{uid})">{"".join(body)}</g>')
    out.append(_p(shape, fill="none", stroke=EDGE[g], stroke_width=".06", stroke_linejoin="round"))
    return "".join(out)


def shade_rect(x0, x1, y0, y1):
    """Side-to-side body shading limited to the torso (sleeves get their own)."""
    return f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="url(#g-shade)"/>'


# ------------------------------------------------------------------ tee
TEE_FRONT = ("M12.3 1.1 Q12.7 3.35 16 3.45 Q19.3 3.35 19.7 1.1 C21.8 1.5 24.3 2.0 26.1 2.6 "
             "C27.6 4.2 29.4 6.6 30.9 8.5 L27.5 10.95 C27.1 10.4 26.7 9.9 26.35 9.5 "
             "C26.1 14 26.0 18 26.15 22 C26.3 26 26.45 28.5 26.5 30.2 C21 30.55 11 30.55 5.5 30.2 "
             "C5.55 28.5 5.7 26 5.85 22 C6.0 18 5.9 14 5.65 9.5 C5.3 9.9 4.9 10.4 4.5 10.95 "
             "L1.1 8.5 C2.6 6.6 4.4 4.2 5.9 2.6 C7.7 2.0 10.2 1.5 12.3 1.1 Z")
TEE_BACK = TEE_FRONT.replace("M12.3 1.1 Q12.7 3.35 16 3.45 Q19.3 3.35 19.7 1.1",
                             "M12.3 1.1 Q12.9 1.68 16 1.78 Q19.1 1.68 19.7 1.1")
TEE_INSIDE_FRONT = "M12.3 1.1 Q13.8 1.62 16 1.75 Q18.2 1.62 19.7 1.1 Q19.3 3.35 16 3.45 Q12.7 3.35 12.3 1.1 Z"
TEE_COLLAR_FRONT = ("M12.3 1.1 Q12.7 3.35 16 3.45 Q19.3 3.35 19.7 1.1 L19.05 1.22 "
                    "Q18.75 4.05 16 4.17 Q13.25 4.05 12.95 1.22 Z")
TEE_COLLAR_BACK = ("M12.3 1.1 Q12.9 1.68 16 1.78 Q19.1 1.68 19.7 1.1 L19.1 1.2 "
                   "Q18.8 2.32 16 2.42 Q13.2 2.32 12.9 1.2 Z")
TEE_STITCH = ["M5.56 29.55 C11 29.9 21 29.9 26.44 29.55",
              "M1.6 8.05 L4.95 10.45", "M30.4 8.05 L27.05 10.45"]
TEE_SEAMS = ["M5.95 2.75 C6.45 5 6.25 7.4 5.7 9.4", "M26.05 2.75 C25.55 5 25.75 7.4 26.3 9.4"]
TEE_FOLDS = ["M6.4 10.2 C7.8 12 8.8 13.6 9.4 15.6", "M25.6 10.2 C24.2 12 23.2 13.6 22.6 15.6",
             "M9.2 30.1 C9.4 28.8 9.8 27.9 10.4 27.2", "M22.8 30.1 C22.6 28.8 22.2 27.9 21.6 27.2",
             "M3.9 4.8 C3.5 6.1 3.3 7.2 2.9 8.4", "M28.1 4.8 C28.5 6.1 28.7 7.2 29.1 8.4",
             "M15.2 30.2 C15.4 29.2 15.8 28.6 16.4 28.2"]


def tee_view(g, prints, front=True):
    if front:
        return dress(TEE_FRONT, g, prints, inside=TEE_INSIDE_FRONT, ribs_h=[TEE_COLLAR_FRONT],
                     folds=TEE_FOLDS, stitches=TEE_STITCH, seams=TEE_SEAMS,
                     extra_top=shade_rect(1, 31, 1, 31))
    return dress(TEE_BACK, g, prints, ribs_h=[TEE_COLLAR_BACK], folds=TEE_FOLDS, stitches=TEE_STITCH,
                 seams=TEE_SEAMS, extra_top=shade_rect(1, 31, 1, 31))


# ------------------------------------------------------------------ hoodie
HOODIE = ("M15.3 7.9 C14.3 3.6 16.4 0.6 20 0.6 C23.6 0.6 25.7 3.6 24.7 7.9 "
          "C26.6 8.3 28.6 8.6 30.4 9.1 C32.6 15 34.6 23 35.5 30.1 L35.9 32.7 "
          "C34.8 33.0 33.7 33.1 32.6 33.1 L32.3 30.6 C31.6 25 31.0 19 30.5 14.6 "
          "C30.7 20 30.8 26 30.9 30.9 C30.7 31.3 30.6 31.6 30.6 33.5 C24 33.75 16 33.75 9.4 33.5 "
          "C9.4 31.6 9.3 31.3 9.1 30.9 C9.2 26 9.3 20 9.5 14.6 C9.0 19 8.4 25 7.7 30.6 L7.4 33.1 "
          "C6.3 33.1 5.2 33.0 4.1 32.7 L4.5 30.1 C5.4 23 7.4 15 9.6 9.1 C11.4 8.6 13.4 8.3 15.3 7.9 Z")
HOODIE_OPEN = ("M17.0 10.4 C16.4 6.4 17.6 3.0 20 3.0 C22.4 3.0 23.6 6.4 23.0 10.4 "
               "C22.0 11.4 21.0 11.8 20 11.9 C19 11.8 18 11.4 17.0 10.4 Z")
HOODIE_BAND = "M9.1 30.9 C16 31.25 24 31.25 30.9 30.9 C30.7 31.3 30.6 31.6 30.6 33.5 C24 33.75 16 33.75 9.4 33.5 C9.4 31.6 9.3 31.3 9.1 30.9 Z"
HOODIE_CUFFS = ["M4.5 30.1 C5.6 30.4 6.6 30.55 7.7 30.6 L7.4 33.1 C6.3 33.1 5.2 33.0 4.1 32.7 Z",
                "M35.5 30.1 C34.4 30.4 33.4 30.55 32.3 30.6 L32.6 33.1 C33.7 33.1 34.8 33.0 35.9 32.7 Z"]
HOODIE_POCKET = "M14.4 22.2 C18 22.0 22 22.0 25.6 22.2 C26.4 25 27.0 28 27.5 30.75 C22.5 31.05 17.5 31.05 12.5 30.75 C13 28 13.6 25 14.4 22.2 Z"
HOODIE_POCKET_OPEN = ["M14.4 22.2 C13.3 25 12.8 28 12.5 30.75", "M25.6 22.2 C26.7 25 27.2 28 27.5 30.75"]
HOODIE_SEAMS = ["M15.3 7.9 C16.6 9.4 18.2 10.0 20 10.1 C21.8 10.0 23.4 9.4 24.7 7.9",
                "M9.75 9.2 C10.4 11 10.2 13 9.55 14.6", "M30.25 9.2 C29.6 11 29.8 13 30.45 14.6"]
HOODIE_SEAMS_BACK = HOODIE_SEAMS + ["M20 0.65 L20 9.9"]
HOODIE_STITCH = ["M9.2 31.25 C16 31.6 24 31.6 30.8 31.25", "M14.55 22.45 C18 22.25 22 22.25 25.45 22.45"]
HOODIE_FOLDS = ["M6.4 18 C6.9 19.2 7.6 19.8 8.4 20.0", "M33.6 18 C33.1 19.2 32.4 19.8 31.6 20.0",
                "M10.2 15.8 C11.2 17.2 11.8 18.6 12.0 20.4", "M29.8 15.8 C28.8 17.2 28.2 18.6 28.0 20.4",
                "M11 30.8 C11.3 29.8 11.6 29.2 12.1 28.8", "M29 30.8 C28.7 29.8 28.4 29.2 27.9 28.8",
                "M5.2 26 C5.9 26.8 6.6 27.1 7.4 27.2", "M34.8 26 C34.1 26.8 33.4 27.1 32.6 27.2",
                "M16.2 4.2 C16.6 2.8 17.6 1.9 18.8 1.5", "M23.8 4.2 C23.4 2.8 22.4 1.9 21.2 1.5"]
HOODIE_FOLDS_BACK = HOODIE_FOLDS[:8] + ["M17 5.5 C17.4 3.8 18.4 2.6 19.6 2.1"]


def hoodie_view(g, prints, front=True, strings=""):
    if front:
        pocket = (_p(HOODIE_POCKET, fill="#000", fill_opacity=".05")
                  + "".join(_p(d, fill="none", stroke="#000", stroke_opacity=".35", stroke_width=".12",
                               filter="url(#f-fold)") for d in HOODIE_POCKET_OPEN)
                  + "".join(_p(d, fill="none", stroke=EDGE[g], stroke_width=".045") for d in HOODIE_POCKET_OPEN)
                  + _p("M14.4 22.2 C18 22.0 22 22.0 25.6 22.2", fill="none", stroke=EDGE[g], stroke_width=".045"))
        return dress(HOODIE, g, pocket + prints, ribs=[HOODIE_BAND] + HOODIE_CUFFS, folds=HOODIE_FOLDS,
                     stitches=HOODIE_STITCH, seams=HOODIE_SEAMS, hood=HOODIE_OPEN,
                     extra_top=shade_rect(9, 31, 0, 34) + strings)
    return dress(HOODIE, g, prints, ribs=[HOODIE_BAND] + HOODIE_CUFFS, folds=HOODIE_FOLDS_BACK,
                 stitches=HOODIE_STITCH[:1], seams=HOODIE_SEAMS_BACK, extra_top=shade_rect(9, 31, 0, 34))


def drawstrings(g):
    col = {"black": "#2A2A2C", "white": "#E9E9E5", "heather": "#6A6C70"}[g]
    s = ""
    for d, tip in (("M18.7 11.4 C18.6 13 18.5 14.6 18.4 16.4", (18.4, 16.4)),
                   ("M21.3 11.4 C21.4 13 21.5 14.6 21.6 16.4", (21.6, 16.4))):
        s += _p(d, fill="none", stroke="#000", stroke_opacity=".25", stroke_width=".22",
                stroke_linecap="round", transform="translate(.07 .1)")
        s += _p(d, fill="none", stroke=col, stroke_width=".17", stroke_linecap="round")
        s += f'<rect x="{tip[0] - .1}" y="{tip[1]}" width=".2" height=".6" rx=".08" fill="{EDGE[g]}"/>'
    return s


# ------------------------------------------------------------------ crewneck
CREW = ("M15.4 1.6 Q20 5.2 24.6 1.6 C26.6 2.1 28.6 2.6 30.4 3.2 C32.6 9.5 34.6 18 35.5 25.1 "
        "L35.9 27.7 C34.8 28.0 33.7 28.1 32.6 28.1 L32.3 25.6 C31.6 20 31.0 14 30.5 9.6 "
        "C30.7 15 30.8 21 30.9 25.9 C30.7 26.3 30.6 26.6 30.6 28.5 C24 28.75 16 28.75 9.4 28.5 "
        "C9.4 26.6 9.3 26.3 9.1 25.9 C9.2 21 9.3 15 9.5 9.6 C9.0 14 8.4 20 7.7 25.6 L7.4 28.1 "
        "C6.3 28.1 5.2 28.0 4.1 27.7 L4.5 25.1 C5.4 18 7.4 9.5 9.6 3.2 C11.4 2.6 13.4 2.1 15.4 1.6 Z")
CREW_BACK = CREW.replace("M15.4 1.6 Q20 5.2 24.6 1.6", "M15.4 1.6 Q20 2.7 24.6 1.6")
CREW_INSIDE = "M15.4 1.6 Q20 2.7 24.6 1.6 Q20 5.2 15.4 1.6 Z"
CREW_COLLAR = "M15.4 1.6 Q20 5.2 24.6 1.6 L25.3 1.42 Q20 6.15 14.7 1.42 Z"
CREW_COLLAR_BACK = "M15.4 1.6 Q20 2.7 24.6 1.6 L25.3 1.42 Q20 3.45 14.7 1.42 Z"
CREW_BAND = "M9.1 25.9 C16 26.25 24 26.25 30.9 25.9 C30.7 26.3 30.6 26.6 30.6 28.5 C24 28.75 16 28.75 9.4 28.5 C9.4 26.6 9.3 26.3 9.1 25.9 Z"
CREW_CUFFS = ["M4.5 25.1 C5.6 25.4 6.6 25.55 7.7 25.6 L7.4 28.1 C6.3 28.1 5.2 28.0 4.1 27.7 Z",
              "M35.5 25.1 C34.4 25.4 33.4 25.55 32.3 25.6 L32.6 28.1 C33.7 28.1 34.8 28.0 35.9 27.7 Z"]
CREW_SEAMS = ["M9.75 3.3 C10.4 5.6 10.2 7.8 9.55 9.6", "M30.25 3.3 C29.6 5.6 29.8 7.8 30.45 9.6"]
CREW_STITCH = ["M9.2 26.25 C16 26.6 24 26.6 30.8 26.25"]
CREW_FOLDS = ["M6.4 14 C6.9 15.2 7.6 15.8 8.4 16.0", "M33.6 14 C33.1 15.2 32.4 15.8 31.6 16.0",
              "M10.2 10.8 C11.2 12.2 11.8 13.6 12.0 15.4", "M29.8 10.8 C28.8 12.2 28.2 13.6 28.0 15.4",
              "M11 25.8 C11.3 24.8 11.6 24.2 12.1 23.8", "M29 25.8 C28.7 24.8 28.4 24.2 27.9 23.8",
              "M5.2 21 C5.9 21.8 6.6 22.1 7.4 22.2", "M34.8 21 C34.1 21.8 33.4 22.1 32.6 22.2"]


def crew_view(g, prints, front=True):
    if front:
        return dress(CREW, g, prints, inside=CREW_INSIDE, ribs=[CREW_BAND] + CREW_CUFFS, ribs_h=[CREW_COLLAR],
                     folds=CREW_FOLDS, stitches=CREW_STITCH, seams=CREW_SEAMS, extra_top=shade_rect(9, 31, 0, 29))
    return dress(CREW_BACK, g, prints, ribs=[CREW_BAND] + CREW_CUFFS, ribs_h=[CREW_COLLAR_BACK],
                 folds=CREW_FOLDS, stitches=CREW_STITCH, seams=CREW_SEAMS, extra_top=shade_rect(9, 31, 0, 29))


# ------------------------------------------------------------------ sweatpants (joggers)
SWEATS = ("M6.35 1.0 C11 0.85 17 0.85 21.65 1.0 L21.7 3.6 C22.4 8 22.5 12 22.3 15 "
          "C22.0 22 21.6 30 21.4 38.8 C21.5 39.4 21.3 39.8 21.2 40.0 L21.3 43.2 "
          "C19.6 43.35 18 43.35 16.3 43.2 L16.3 40.0 C16.2 39.8 16.0 39.4 16.1 38.8 "
          "C15.6 30 15.0 21 14.5 15.6 Q14 14.4 13.5 15.6 C13 21 12.4 30 11.9 38.8 "
          "C12.0 39.4 11.8 39.8 11.7 40.0 L11.7 43.2 C10 43.35 8.4 43.35 6.7 43.2 L6.8 40.0 "
          "C6.7 39.8 6.5 39.4 6.6 38.8 C6.4 30 6.0 22 5.7 15 C5.5 12 5.6 8 6.3 3.6 Z")
SWEATS_BAND = "M6.35 1.0 C11 0.85 17 0.85 21.65 1.0 L21.7 3.6 C17 3.75 11 3.75 6.3 3.6 Z"
SWEATS_CUFFS = ["M6.8 40.0 C8.4 40.1 10.1 40.1 11.7 40.0 L11.7 43.2 C10 43.35 8.4 43.35 6.7 43.2 Z",
                "M16.3 40.0 C17.9 40.1 19.6 40.1 21.2 40.0 L21.3 43.2 C19.6 43.35 18 43.35 16.3 43.2 Z"]
SWEATS_SEAMS = ["M6.6 4.4 C7.2 6.4 7.8 8.4 8.4 10.2", "M21.4 4.4 C20.8 6.4 20.2 8.4 19.6 10.2",
                "M14 3.7 C14.05 7 14.05 10.5 14 13.4"]
SWEATS_STITCH = ["M14.35 3.8 C14.45 7 14.45 10.3 14.3 12.8", "M6.4 3.85 C11 3.95 17 3.95 21.6 3.85"]
SWEATS_FOLDS = ["M8.2 39.6 C8.5 38.4 9.0 37.8 9.6 37.5", "M10.6 39.6 C10.3 38.6 9.9 38.0 9.3 37.7",
                "M17.4 39.6 C17.7 38.4 18.2 37.8 18.8 37.5", "M19.8 39.6 C19.5 38.6 19.1 38.0 18.5 37.7",
                "M7.8 24.5 C8.6 25.2 9.6 25.4 10.6 25.2", "M17.4 24.5 C18.2 25.2 19.2 25.4 20.2 25.2",
                "M12.9 17 C12.6 22 12.3 28 12.0 34", "M15.1 17 C15.4 22 15.7 28 16.0 34",
                "M9 4.2 C9.4 5.2 9.6 6.2 9.6 7.4", "M19 4.2 C18.6 5.2 18.4 6.2 18.4 7.4"]


def sweats_view(g, prints):
    cord = ""
    col = {"black": "#2A2A2C", "white": "#E9E9E5", "heather": "#6A6C70"}[g]
    for d in ("M13.3 3.4 C13.1 4.8 12.9 6.2 12.7 7.6", "M14.7 3.4 C14.9 4.8 15.1 6.2 15.3 7.6"):
        cord += _p(d, fill="none", stroke=col, stroke_width=".15", stroke_linecap="round")
    legs = (f'<rect x="5.5" y="0" width="8.6" height="44" fill="url(#g-shade)"/>'
            f'<rect x="13.9" y="0" width="8.6" height="44" fill="url(#g-shade)"/>')
    return dress(SWEATS, g, prints, ribs_h=[SWEATS_BAND], ribs=SWEATS_CUFFS, folds=SWEATS_FOLDS,
                 stitches=SWEATS_STITCH, seams=SWEATS_SEAMS, extra_top=legs + cord)
