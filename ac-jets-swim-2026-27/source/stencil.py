"""Custom stencil lettering for the Squadron hero words.

Instead of a stock stencil font, a crisp condensed grotesk is cut with
hand-placed bridges that follow one rule set, so every hero word (JETS, AC,
26-27, SQDN ...) shares the same stencil rhythm.

Bridge recipes are written per character in fractions of the glyph's ink box:
  ("v", fx, fy0, fy1)  vertical bridge centred at fx of the width, from fy0 to fy1
  ("h", fy, fx0, fx1)  horizontal bridge centred at fy of the height, from fx0 to fx1
fy is measured from the top of the glyph (0 = cap top, 1 = baseline).
"""
import svgkit as K

BASE = "sairac800"          # Saira Condensed ExtraBold
BRIDGE = 0.075              # bridge width as a fraction of cap height

# Rule: bridge only closed counters (A B D O P Q R 0 6 8 9) and split E/F arms from the
# stem, like aircraft tail markings. Open letters stay whole so words read at a distance.
RECIPES = {
    "A": [("v", 0.5, -0.05, 0.40)],
    "B": [("v", 0.42, -0.05, 0.25), ("v", 0.42, 0.75, 1.05)],
    "D": [("v", 0.42, -0.05, 0.25), ("v", 0.42, 0.75, 1.05)],
    "E": [("v", 0.36, -0.05, 1.05)],
    "F": [("v", 0.36, -0.05, 0.62)],
    "J": [],
    "N": [],
    "O": [("v", 0.5, -0.05, 0.25), ("v", 0.5, 0.75, 1.05)],
    "P": [("v", 0.42, -0.05, 0.25)],
    "Q": [("v", 0.5, -0.05, 0.25)],
    "R": [("v", 0.42, -0.05, 0.25)],
    "T": [],
    "0": [("v", 0.5, -0.05, 0.25), ("v", 0.5, 0.75, 1.05)],
    "6": [("v", 0.5, 0.78, 1.05)],
    "7": [],
    "8": [("v", 0.5, -0.05, 0.22), ("v", 0.5, 0.78, 1.05)],
    "9": [("v", 0.5, -0.05, 0.22), ("v", 0.45, 0.80, 1.05)],
}


def stencil_word(s, cap, x=0, y=0, tracking=0.0, anchor="start", font=BASE, bridge=BRIDGE,
                 recipes=None, flight_line=None):
    """Outline `s` with stencil bridges. flight_line=(fy, width_frac) also cuts one
    continuous horizontal line through the whole word at fy (0 = top, 1 = baseline)."""
    recipes = RECIPES if recipes is None else recipes
    b = bridge * cap
    glyphs = K.text_glyphs(font, s, cap, 0, 0, tracking=tracking)
    out = K.new()
    for ch, p in glyphs:
        x0, y0, x1, y1 = K.bounds(p)
        w, h = x1 - x0, y1 - y0
        cuts = []
        for r in recipes.get(ch.upper(), []):
            if r[0] == "v":
                _, fx, fa, fb = r
                cx = x0 + fx * w
                cuts.append(K.rect(cx - b / 2, y0 + fa * h, b, (fb - fa) * h))
            else:
                _, fy, fa, fb = r
                cy = y0 + fy * h
                cuts.append(K.rect(x0 + fa * w, cy - b / 2, (fb - fa) * w, b))
        if cuts:
            p = K.diff(p, K.union(*cuts))
        out.addPath(p)
    out = K.union(out)
    if flight_line:
        fy, wf = flight_line
        bx0, by0, bx1, by1 = K.bounds(out)
        lh = wf * cap
        out = K.diff(out, K.rect(bx0 - 1, by0 + fy * cap - lh / 2, bx1 - bx0 + 2, lh))
    bx0, _, bx1, _ = K.bounds(out)
    dx = {"middle": x - (bx0 + bx1) / 2, "end": x - bx1}.get(anchor, x - bx0)
    return K.translate(out, dx, y)


def fit_cap(s, width, tracking=0.0, font=BASE):
    w = K.bounds(stencil_word(s, 100, tracking=tracking, font=font))
    return 100 * width / (w[2] - w[0])
