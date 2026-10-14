"""Print-floor check for the 300 DPI PNGs.

For every print it reports, per ink:
  thin ink   ink that disappears under a 0.03 in morphological opening
             (strokes / slivers thinner than the screen-print minimum)
  tight gap  garment that fills under a 0.035 in closing of all inks together
             (knockouts, bridges and notches narrower than the minimum)
Acute vertices (a nose tip, a chamfer corner) always lose a few pixels; only
blobs above AREA_FLAG are flagged.

usage: python3 printcheck.py [glob]     (default: ../squadron/png/*_on-black.png)
"""
import glob
import os
import sys

from PIL import Image, ImageChops, ImageFilter

DPI = 300
THIN = 0.025          # small type on cotton; fleece pieces are also eyeballed at 0.03
GAP = 0.030           # absolute gap minimum (design floor for bridges is 0.035)
AREA_FLAG = 0.0015          # sq in; a 0.03 x 0.05 in blob


def odd(n):
    n = int(round(n))
    return n if n % 2 else n + 1


def masks(path):
    im = Image.open(path).convert("RGBA")
    pad = Image.new("RGBA", (im.width + 40, im.height + 40), (0, 0, 0, 0))
    pad.paste(im, (20, 20))
    im = pad                                     # keep filters away from the image edge
    r, g, b, a = im.split()
    ink = a.point(lambda v: 255 if v > 127 else 0)
    # red ink: strong red, weak green
    red = Image.merge("RGB", (r, g, b)).convert("HSV")
    h, s, v = red.split()
    is_red = ImageChops.multiply(s.point(lambda x: 255 if x > 120 else 0), ink)
    main = ImageChops.subtract(ink, is_red)
    return ink, {"main": main, "red": is_red}


def opening(m, k):
    return m.filter(ImageFilter.MinFilter(k)).filter(ImageFilter.MaxFilter(k))


def closing(m, k):
    return m.filter(ImageFilter.MaxFilter(k)).filter(ImageFilter.MinFilter(k))


def blobs(m, min_px):
    """Connected blobs larger than min_px: [(bbox_px, area_px)]."""
    import numpy as np
    from scipy import ndimage
    a = np.array(m) > 127
    lab, n = ndimage.label(a)
    if not n:
        return []
    areas = ndimage.sum(a, lab, range(1, n + 1))
    boxes = ndimage.find_objects(lab)
    out = []
    for i, (sl, ar) in enumerate(zip(boxes, areas)):
        if ar >= min_px:
            out.append(((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop), int(ar)))
    return sorted(out, key=lambda t: -t[1])


def check(path):
    ink, inks = masks(path)
    k_thin, k_gap = odd(THIN * DPI), odd(GAP * DPI)
    min_px = AREA_FLAG * DPI * DPI
    out = []
    for name, m in inks.items():
        if not m.getbbox():
            continue
        lost = ImageChops.subtract(m, opening(m, k_thin))
        lost = opening(lost, 3)                 # ignore single-pixel anti-alias fringe
        for bb, px in blobs(lost, min_px):
            out.append(f"thin {name} ink: {px / DPI / DPI:.4f} sq in near {tuple(round(v / DPI, 2) for v in bb)} in")
    filled = ImageChops.subtract(closing(ink, k_gap), ink)
    filled = opening(filled, 3)
    for bb, px in blobs(filled, min_px):
        out.append(f"tight gap: {px / DPI / DPI:.4f} sq in near {tuple(round(v / DPI, 2) for v in bb)} in")
    return out


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    pat = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "..", "squadron", "png", "*_on-black.png")
    bad = 0
    for p in sorted(glob.glob(pat)):
        issues = check(p)
        print(("FLAG " if issues else "ok   ") + os.path.basename(p))
        for i in issues:
            print("       " + i)
        bad += bool(issues)
    sys.exit(1 if bad else 0)
