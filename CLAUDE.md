# Project memory

Claude Code reads this file automatically at the start of every session. It is
the only memory that survives between sessions — anything not written down here
(or in the repo) is gone when a session ends.

**Keep it current.** When a decision gets made, a preference gets stated, or
something turns out to be a dead end, add it here in the same commit.

---

## What's in this repo

Two unrelated projects share one repository:

1. **American General Construction** (repo root) — static marketing site,
   served by GitHub Pages from `main` at `/root`.
   - `index.html`, `styles.css`, `script.js` (design tokens live at the top of
     `styles.css`)
   - `api/quote.js` — Vercel serverless function, **dead on GitHub Pages.**
     Kept only in case the site moves to a host that runs server functions.
2. **Lifting4Gains** (`lifting4gains/`) — Next.js 16 App Router + TypeScript +
   Tailwind v4 + Supabase + Stripe. A Ghost Energy storefront. Not served by
   Pages. See `lifting4gains/README.md` to run it and
   `lifting4gains/DESIGN_NOTES.md` for the design rationale.

## Business facts — American General Construction

Verified from the Google Business Profile. Do not change these without a new
source.

- Phone: (260) 223-0548
- Address: 498 W 50 S, Monroe, IN 46772
- Hours: Mon–Fri 7 AM–5 PM, closed weekends

## Standing decisions

- **The quote form has no backend and that is intentional.** On GitHub Pages
  the submit fails and shows "Something went wrong — please call us directly at
  (260) 223-0548". That honest fallback is the chosen behavior, not a bug to
  fix. To make it work without a backend, point the `fetch` in `script.js` at a
  form service (e.g. Formspree) and swap the endpoint URL.
- **CNAME has been added and removed twice** (commits `b1e698e`/`90b6e9d`,
  `a3d25cc`/`5f4a1d3`). There is currently no custom domain. Before adding one
  again, confirm the DNS is actually pointed at GitHub Pages first.
- **Lifting4Gains ships one accent color — ember amber `#e2a03f`**, on roughly
  3–4% of painted surface. Every color token in that project is contrast-
  measured, not eyeballed. Don't introduce a second accent; see
  `lifting4gains/DESIGN_NOTES.md`.
- Lifting4Gains runs in **affiliate mode** with no env vars, no database and no
  API keys required. `npm install && npm run dev` is the whole setup.

## Working preferences

- Work happens on `claude/*` branches, never directly on `main`.
- (Add preferences here as they come up — tone, review style, what to ask about
  vs. just do.)

## Session log

Newest first. One or two lines per session: what changed and why.

- **2026-09-14** — Set up this file. No prior session memory existed; explained
  that Claude Code web sessions start from a fresh container each time and only
  repo contents persist.
