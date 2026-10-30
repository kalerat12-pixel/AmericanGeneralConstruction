"""The team's AC logo (block AC with a fighter flying through it), from the
artwork the team supplied (assets/ac-logo-original.png, 300 x 300 px).

The supplied file is a small bitmap, so it is traced to vector here at print size:
upscaled 8x, smoothed, then gaps narrower than the print floor are widened and ink
slivers below it removed (the keylines around the jet and the canopy frames are
about half a pixel wide in the original), then traced to straight-edged paths.
One ink: role "logo" (red on black, white and grey garments, white on red)."""
import math
import os

import cv2
import numpy as np
import pathops
from PIL import Image

import svgkit as K

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "ac-logo-original.png")
U = 8                       # upscale factor for tracing
GAP_MIN = 0.042             # in: widen gaps narrower than this
INK_MIN = 0.034             # in: drop ink narrower than this


def _disk(r):
    r = max(1, int(round(r)))
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


def _mask():
    a = np.array(Image.open(SRC).convert("RGBA")).astype(np.float32)[..., 3] / 255.0
    big = cv2.resize(a, None, fx=U, fy=U, interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (0, 0), 2.0)
    m = (big > 0.5).astype(np.uint8)
    ys, xs = np.nonzero(m)
    return m, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)


def ac_logo(height):
    """Logo `height` print units tall (1 unit = 0.01 in), top-left at (0, 0)."""
    m, (x0, y0, x1, y1) = _mask()
    m = np.pad(m[y0:y1, x0:x1], 40)
    px_in = height / 100.0 / (y1 - y0)            # inches per upscaled pixel
    # widen thin gaps: the part of the background a disk of the minimum gap can't reach
    rg = GAP_MIN / px_in / 2
    gap = 1 - m
    thin_gap = gap & (1 - cv2.morphologyEx(gap, cv2.MORPH_OPEN, _disk(rg)))
    # the inside corners of wide gaps also escape the disk; they are small wedges, not
    # keylines, so leave them alone
    n, lab, stats, _ = cv2.connectedComponentsWithStats(thin_gap, connectivity=8)
    keep = np.zeros(n, np.uint8)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] > 3.0 * rg * rg
    thin_gap = keep[lab]
    m = m & (1 - cv2.dilate(thin_gap, _disk(rg)))
    # remove ink slivers the screen can't hold
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, _disk(INK_MIN / px_in / 2))
    cs, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = pathops.Path()
    k = height / (y1 - y0)
    for c in cs:
        if cv2.contourArea(c) < (0.03 / px_in) ** 2:
            continue
        p = cv2.approxPolyDP(c, 0.35 * U, True)[:, 0, :].astype(float)
        poly = K.poly([((x - 40) * k, (y - 40) * k) for x, y in p])
        out = pathops.op(out, poly, pathops.PathOp.XOR, clockwise=True)
    bx = K.bounds(out)
    return K.translate(out, -bx[0], -bx[1])
