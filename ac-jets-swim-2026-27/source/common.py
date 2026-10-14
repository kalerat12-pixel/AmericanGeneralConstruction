"""Shared constants and helpers for the collection."""
import math

import svgkit as K

# ---------------------------------------------------------------- inks
INKS = {
    "red": ("Jets Red", "#C8102E", "PMS 186 C"),
    "white": ("White", "#FFFFFF", "Bright white (low-bleed on dark garments)"),
    "black": ("Black", "#101820", "PMS Black 6 C"),
    "grey": ("Cool Gray", "#8A8D8F", "PMS Cool Gray 8 C"),
}

# Garment colours (for previews / mockups only - never printed)
GARMENTS = {
    "black": ("Black", "#151515"),
    "white": ("White", "#F4F4F2"),
    "heather": ("Heather Grey", "#B8BABC"),
}

# role -> ink, per garment colour. Every design is drawn with roles so the
# three colourways share identical geometry.
PALETTES = {
    "black": {"main": "white", "accent": "red", "detail": "white"},
    "white": {"main": "black", "accent": "red", "detail": "black"},
    "heather": {"main": "black", "accent": "red", "detail": "black"},
}

ITALIC = math.tan(math.radians(10))  # Archivo italic angle

COORDS = "40.7458° N  84.9428° W"


# ---------------------------------------------------------------- helpers

def hrule(x1, x2, y, t=4):
    return K.rect(x1, y - t / 2, x2 - x1, t)


def vrule(x, y1, y2, t=4):
    return K.rect(x - t / 2, y1, t, y2 - y1)


def fit_tracking(fontname, s, cap, width, slant=0.0):
    """Tracking (em/1000) that makes `s` exactly `width` wide at `cap`."""
    w0 = K.text_width(fontname, s, cap, 0, slant)
    w1 = K.text_width(fontname, s, cap, 1000, slant)
    return 1000 * (width - w0) / (w1 - w0)


def ink_box(path):
    return K.bounds(path)


def vary_stroke(points, widths):
    """Variable-width stroke along a polyline; returns a closed Path.
    points: [(x, y)], widths: [w] same length."""
    n = len(points)
    left, right = [], []
    for i in range(n):
        x, y = points[i]
        if i == 0:
            dx, dy = points[1][0] - x, points[1][1] - y
        elif i == n - 1:
            dx, dy = x - points[i - 1][0], y - points[i - 1][1]
        else:
            dx, dy = points[i + 1][0] - points[i - 1][0], points[i + 1][1] - points[i - 1][1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        h = widths[i] / 2
        left.append((x + nx * h, y + ny * h))
        right.append((x - nx * h, y - ny * h))
    return K.poly(left + list(reversed(right)))


def outline_ring(path, gap, weight):
    """Varsity-style outline: a ring `weight` wide, separated from `path` by `gap`."""
    outer = K.union(path, K.stroke(path, 2 * (gap + weight), join="round"))
    inner = K.union(path, K.stroke(path, 2 * gap, join="round"))
    return K.diff(outer, inner)


class Art:
    """One printable artwork, drawn with roles (main / accent / detail)."""

    def __init__(self, key, title, placement, size_note, layers, notes=""):
        self.key = key
        self.title = title
        self.placement = placement
        self.size_note = size_note
        self.layers = layers  # [(role, Path)] bottom -> top
        self.notes = notes
