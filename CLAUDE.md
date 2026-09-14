# Project memory

Claude Code reads this file automatically at the start of every session. It is
the only memory that survives between sessions — anything not written down here
(or in the repo) is gone when a session ends.

**Keep it current.** When a decision gets made, a preference gets stated, or
something turns out to be a dead end, add it here in the same commit.

---

## What's in this repo

Two unrelated projects are associated with this repository, on different
branches:

1. **American General Construction** (repo root) — static marketing site,
   served by GitHub Pages from `main` at `/root`.
   - `index.html`, `styles.css`, `script.js` (design tokens live at the top of
     `styles.css`)
   - `api/quote.js` — Vercel serverless function, **dead on GitHub Pages.**
     Kept only in case the site moves to a host that runs server functions.
2. **Lifting4Gains** — a Next.js 16 Ghost Energy storefront (App Router,
   TypeScript, Tailwind v4, Supabase, Stripe). **Not on `main`.** It lives on
   the branch `claude/wizardly-albattani-83sfjw`; PR #3 that would have merged
   it was reverted (see `revert-3-claude/bold-feynman-odto9e`). Treat that as
   deliberate and do not merge it into `main` without asking. When checked out,
   see `lifting4gains/README.md` to run it and `lifting4gains/DESIGN_NOTES.md`
   for the design rationale.

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

- **Update this file at the end of every session.** The user asked for Claude to
  keep memory of what they do and say across sessions — this file is that
  memory. Append to the session log, and fold anything durable (a decision, a
  correction, a stated preference, a fact about the business) into the section
  where it belongs, so future sessions start smarter instead of re-asking.
- Work happens on `claude/*` branches, never directly on `main`.
- Prefer being told the honest limitation over a confident guess.

## How this file stays current

A Stop hook enforces the habit, because "remember to do it" is not a mechanism:

- `.claude/settings.json` registers `.claude/hooks/session-log-reminder.sh` on
  the `Stop` event.
- When a turn ends with unpushed work that does **not** include `CLAUDE.md`, the
  hook blocks and prints a reminder to write the log, then commit and push.
- It stays silent when nothing changed, when `CLAUDE.md` is already part of the
  change, and on the reminder's own follow-up turn (no loops).

If the reminder is ever wrong for a given session, say so and stop — it is a
prompt, not a gate. To review or disable it, use `/hooks`.

## Session log

Newest first. One or two lines per session: what changed and why.

- **2026-09-14** — Discovered `main` never carried Lifting4Gains: PR #3 was
  reverted. The user confirmed they did not want it merged. Memory files were
  therefore split onto their own branch off `main` rather than riding along
  with the Lifting4Gains lineage.
- **2026-09-14** — Added the Stop hook above, at the user's request that memory
  be updated at the end of every session. Also confirmed `CLAUDE_PROJECT_DIR` is
  not always set, so the hook command falls back to a relative path.
- **2026-09-14** — Set up this file. No prior session memory existed; explained
  that Claude Code web sessions start from a fresh container each time and only
  repo contents persist.
