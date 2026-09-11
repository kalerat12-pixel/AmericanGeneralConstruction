# American General Construction — Website

Static marketing site for American General Construction (Monroe, IN).

## Structure

- `index.html` — page content
- `styles.css` — all styling (design tokens at the top of the file)
- `script.js` — mobile nav, smooth scroll, and quote form handling
- `api/quote.js` — a Vercel serverless function for the quote form. **Not used on GitHub Pages** (static hosting only runs HTML/CSS/JS, no server functions) — kept here in case this site is later moved to a host that supports it.

## Hosting on GitHub Pages

This repo is set up to be served directly from the `main` branch root via GitHub Pages (Settings → Pages → Source: Deploy from branch → `main` / `/root`).

**Known limitation:** because GitHub Pages can't run `api/quote.js`, the "Get My Free Quote" form has no live backend here. Submissions will show "Something went wrong — please call us directly at (260) 223-0548" — this is intentional (a real, honest fallback), not a bug. To get a working form again without a full backend, wire the form's `fetch` in `script.js` to a free form service such as Formspree, and update the endpoint URL.

## Business info (verified from Google Business Profile)

- Phone: (260) 223-0548
- Address: 498 W 50 S, Monroe, IN 46772
- Hours: Mon–Fri 7 AM–5 PM, closed weekends

---

## Also in this repo

`lifting4gains/` — a separate Next.js e-commerce app (Lifting4Gains, a Ghost
Energy storefront). It is unrelated to this construction site and is not served
by GitHub Pages; see [`lifting4gains/README.md`](lifting4gains/README.md) to run
or deploy it.
