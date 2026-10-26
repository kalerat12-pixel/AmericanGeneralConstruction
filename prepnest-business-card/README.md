# PrepNest business card

US standard size: **3.5 × 2 in** (89 × 51 mm), two-sided.

| File | Use |
|---|---|
| `prepnest-business-card-print.pdf` | Send this to the printer. Page 1 = front, page 2 = back. Includes 0.125 in bleed on every side (page is 3.75 × 2.25 in), fonts embedded, vector QR code. |
| `front.png`, `back.png` | 300 dpi previews (with bleed), for online printers that want images, or for sharing. |
| `front-guides.png`, `back-guides.png` | Same, with the trim line drawn in red, so you can see what gets cut off. |

**QR code:** opens `https://getprepnest.com/?ref=card`. The site's waitlist form already reads `ref`, so sign-ups from the card are tagged `card`. Verified with a QR decoder.

**Printing tips:** choose "includes bleed" / "full bleed" when uploading. A matte or soft-touch 16 pt (350 gsm) stock suits the cream and forest colors.

To edit text or colors: change `build.py`, then run `python3 build.py && node render.js` (needs Playwright and the Inter font installed; Fraunces is in `fonts/`).
