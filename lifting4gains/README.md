# Lifting4Gains — website

The link-in-bio home base for [@lifting4gains](https://www.tiktok.com/@lifting4gains).

Plain HTML, CSS and JavaScript. No build step, no npm, no framework, no backend.
Double-click `index.html` and it opens.

---

## Files

| File | What it's for |
|---|---|
| `index.html` | All the page content and text |
| `styles.css` | All the styling. Colours, fonts and spacing are the block at the very top |
| `script.js` | Builds the video cards and filter buttons. You rarely need to touch this |
| `videos.json` | **Your video list.** The one file you'll edit most |
| `assets/` | Your photo, the favicon, and the link-preview image |

---

## Previewing it

**Double-click `index.html`.** It opens in your browser and everything works.

One thing to know: browsers refuse to read `videos.json` from a file opened straight
off your desktop — it's a security rule, not a bug in the site. So in that one case the
page falls back to a backup copy of the list kept at the bottom of `index.html`, and
shows a small grey "Local preview" note above the grid.

**This only affects double-clicking.** The moment the site is online, `videos.json` is
what gets used, every time, and the note disappears.

If you want the double-click preview to show your real videos too, you have two options:

- **Easiest:** ignore it. Edit `videos.json`, upload, and check the live site.
- **Exact preview:** paste your updated `videos.json` list into the backup block at the
  bottom of `index.html` as well (it's clearly marked). Optional.
- **Best:** open Terminal, `cd` into this folder, run `python3 -m http.server 8000`, then
  visit `http://localhost:8000`. That serves the files properly and reads `videos.json`.

---

## How to add a video

1. On TikTok, open your video → **Share** → **Copy link**. You want the long form:

   ```
   https://www.tiktok.com/@lifting4gains/video/1234567890123456789
   ```

   If you get a short `vm.tiktok.com/xxxx` link, paste it into your browser's address
   bar first — it redirects to the long one. **The long link is the one that works.**

2. Open `videos.json` and add a block. Every entry looks exactly like this:

   ```json
   {
     "url": "https://www.tiktok.com/@lifting4gains/video/1234567890123456789",
     "caption": "The cue that finally fixed my low-bar squat",
     "tag": "squat",
     "cover": ""
   }
   ```

3. Save, upload, done. Videos appear on the page **in the order they're listed** — the
   top of the file is the first card on the page. Reordering the blocks reorders the grid.

### The rules of the file

- Every entry sits inside `{ }`, and entries are separated by commas.
- **No comma after the last entry**, right before the closing `]`. This is the one
  mistake everyone makes. If your videos vanish, check that first.
- `tag` is free text — whatever tags you use, the filter buttons build themselves from
  them automatically. Seeded with: `squat`, `bench`, `deadlift`, `form check`,
  `nutrition`, `gym humor`. Add `mobility` and a Mobility button appears on its own.
- `cover` is optional. Leave it as `""` and the card draws a striped placeholder with
  the tag name on it — which looks good and costs nothing. If you'd rather show a real
  thumbnail, screenshot your video, save it into `assets/`, and put
  `"cover": "assets/my-squat-clip.jpg"`.

> **The six entries in there now are placeholders.** Their URLs end in
> `0000000000000000001` and so on — they aren't real videos and won't play.
> Replace all six with your own links, and rewrite the six `caption` lines in your
> own words.

### Why videos don't load all at once

Each card starts as a lightweight placeholder. TikTok's real embed — which is heavy —
is only fetched when someone actually taps a card. On first load the page makes about
seven requests and pulls nothing from TikTok at all. That's what keeps it fast for
someone opening your link on mobile data.

---

## How to change the colours

Open `styles.css`. Everything you need is in the first block, under `:root`.

```css
--accent:     #D8FF00;   /* the volt yellow-green everywhere */
--accent-dim: #9DBA00;   /* quieter version for outlines */
--accent-ink: #0B0B0C;   /* the text colour sitting ON the accent */
--bg:         #0B0B0C;   /* page background */
--text:       #F2F2EF;   /* body text */
```

Change `--accent` and the buttons, chips, filters, rules and highlights all follow.

**One caution:** the accent carries near-black text on top of it (buttons, active
filters). So pick something **bright** — a light green, yellow, orange or cyan. If you
pick a dark colour like navy or maroon, black-on-it becomes unreadable, and you'd also
need to change `--accent-ink` to `#FFFFFF`. Paste both colours into
[webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)
and keep the ratio above 4.5.

### Fonts

Also in `:root`:

```css
--font-display: 'Anton', ...;   /* the big condensed headings */
--font-body:    'Inter', ...;   /* everything else */
```

To swap them, pick fonts on [fonts.google.com](https://fonts.google.com), then update
the `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...">` line
in the `<head>` of `index.html` to match.

---

## The Programs section — deleting it

Not selling anything yet? Remove it in one pass:

1. In `index.html`, find the big comment `PROGRAMS / COACHING — OPTIONAL SECTION`.
   Delete everything from there down to `END OPTIONAL PROGRAMS SECTION`.
2. Delete the nav line just above it: `<li><a href="#programs">Train</a></li>`
   (it's marked with a comment).
3. In the hero, change the first button's `href="#programs"` to `href="#free"` and its
   text to something like `Get the free guide`.

You can leave the `PROGRAMS` block in `styles.css` alone — unused CSS does no harm — or
delete that block too if you like things tidy.

---

## The email signup form

The form is a plain HTML form with no backend, which is exactly what you want: you point
it at a service and they handle the list, the confirmations and the unsubscribes.

In `index.html`, find:

```html
<form class="signup-form" action="TODO-PASTE-YOUR-FORM-ENDPOINT-HERE" method="post">
```

Replace that `action` value with your provider's endpoint:

| Service | Where to get the endpoint |
|---|---|
| **Formspree** | Create a form → `https://formspree.io/f/YOUR_FORM_ID` |
| **ConvertKit / Kit** | Form → Embed → HTML → copy the `action` URL |
| **Beehiiv** | Publication → subscribe form embed → copy the `action` URL |

All three accept this form as-is and show their own thank-you page after someone
signs up. There's already a hidden anti-spam field (`_gotcha`) that Formspree
understands and the others harmlessly ignore.

---

## Deploying

### Netlify (easiest, free, gives you a real link in minutes)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole **`lifting4gains` folder** onto the page.
3. You get a URL like `random-name-123.netlify.app` straight away. Rename it under
   **Site settings → Change site name** to something like `lifting4gains`.
4. To update later, drag the folder on again — or connect the GitHub repo so it
   redeploys whenever you push.

### GitHub Pages

This repo already serves the American General Construction site from its root, so this
site lives in a subfolder and will appear at:

```
https://<your-username>.github.io/americangeneralconstruction/lifting4gains/
```

Turn it on under **Settings → Pages → Deploy from branch → `main` / `/root`** (it's
likely on already for the other site).

If you later want Lifting4Gains to *be* the main site, move everything in this folder up
into the repo root — but that replaces the construction site, so only do it if that one
is finished with.

---

## Before you share the link — TODO checklist

Every spot on the page that still needs your words is wrapped in a **dashed yellow-green
box** with a `TODO #` label on it. **When there are no dashed boxes left on the page,
you're done.** In the code, search `index.html` for `todo` to find them.

### Do these first — they're visible to everyone

- [ ] **#1 — Your real web address.** In the `<head>`, replace every
      `https://YOUR-DOMAIN.com` with your actual URL — a find-and-replace catches
      all 5 (4 real ones plus the reminder comment). Until you do this,
      **your link previews won't show an image** when you paste the link on TikTok,
      Instagram or iMessage. This is the single most important one.
- [ ] **Your six real video links** in `videos.json`, replacing the `000000...`
      placeholders.
- [ ] **Your six captions** in `videos.json`.
- [ ] **#3 — Your tagline** in the hero. One line, under ten words.
- [ ] **#4 — Your About paragraphs.** Two or three sentences in your own voice.
- [ ] **#32 — The email form endpoint** (see the section above). Right now the form
      submits nowhere.

### Then these

- [ ] **#2 —** Want your real name in the hero instead of the handle? Swap the text.
- [ ] **#5, #6, #7 —** Quick facts: training since / trains for / based in.
      Don't want them? Delete the whole `<ul class="facts">` block.
- [ ] **#8 — Your photo.** Save it as `assets/about.jpg`, change the `src` in
      `index.html` from `assets/about-placeholder.svg` to `assets/about.jpg`, and
      **rewrite the `alt` text** to describe what's actually in the picture.
      A tall portrait shape (roughly 4:5) fits best.
- [ ] **#31 —** Say what the free thing actually is and what it does for them.
- [ ] **Link-preview image.** `assets/og-cover.png` is a placeholder wordmark. Replace
      it with a real 1200×630 image — a good gym photo with your handle on it works
      well. Keep the same filename and size.

### Programs section — skip all of these if you delete it

- [ ] **#9 —** One line about how you coach.
- [ ] **#10–#16 —** First program: name, price, description, three bullets, checkout link.
- [ ] **#17–#23 —** Second program (the "Most popular" one): same fields.
- [ ] **#24–#30 —** 1:1 coaching: name, price, description, three bullets, booking link.
- [ ] The three buttons currently point at `#TODO-checkout-link` and
      `#TODO-booking-link` and **do nothing**. Paste in your real Gumroad / Stripe /
      Payhip / Calendly links.

### Optional

- [ ] **#33 —** Adding Instagram, YouTube or an email address later? There's a
      commented-out block in the footer — uncomment the lines you want and fill in the
      addresses.

---

## What's deliberately not here

- **No tracking scripts.** No analytics, no pixels, no cookie banner needed.
- **No scraping.** Videos come from TikTok's official embed and a list you control.
  Nothing here breaks when TikTok changes their site, and nothing violates their terms.
- **No invented numbers.** No follower counts, view counts, testimonials or PRs are
  written anywhere on the page. Anything that looks like a claim is a TODO box waiting
  for you to fill in something true.
