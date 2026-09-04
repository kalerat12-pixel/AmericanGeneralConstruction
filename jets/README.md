# Adams Central Flying Jets — fan & stats site

Unofficial fan site for Adams Central Flying Jets football (Monroe, Indiana).
Not affiliated with Adams Central Community Schools or the IHSAA.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the build locally
```

Stack: Vite + React 19 + Tailwind CSS v4 + React Router. Routing uses a
`HashRouter`, so the built `dist/` folder can be dropped on any static host
(GitHub Pages included) with no server rewrite rules.

## Updating data — this is the only folder you need

**All content lives in `src/data/`. You never have to touch layout code.**

| File | What's in it |
| --- | --- |
| `team.js` | School identity, venue, conference, address, external links |
| `roster.js` | Players — numbers, positions, measurables, stats, photos, highlight links |
| `schedule.js` | Game-by-game schedule and results, plus per-game film links |
| `teamStats.js` | Season totals, statistical leaders, ACAC standings |
| `history.js` | State titles, tournament hardware, coaching records |
| `highlights.js` | The video gallery |

Every file opens with a comment block explaining its shape. Search the project
for `TODO: verify/add` to find every gap in one pass.

### Adding a player photo

1. Drop the image in `public/players/` — e.g. `public/players/7-hamilton.jpg`
2. In `roster.js`, set that player's `photo: '/players/7-hamilton.jpg'`

Without a photo the card renders a team-coloured silhouette, so the grid stays
tidy either way.

### Adding a highlight video

Paste a YouTube or Hudl URL into the one field for that item:

- a player's reel → `highlightVideo` in `roster.js`
- a game's reel → `highlightVideo` in `schedule.js`
- the gallery → `url` in `highlights.js`

All three of these URL shapes work and are converted to embeds automatically:

```
https://www.youtube.com/watch?v=ID
https://youtu.be/ID
https://www.hudl.com/video/...
```

Empty slots render a labelled "no video yet" placeholder naming the exact field
to fill in, so the page never looks broken before you have film.

### Recording a game result

In `schedule.js`, set the game's `result`:

```js
result: { teamScore: 35, opponentScore: 20 },
```

W/L and the season record are computed from this — you never type the record
twice. Leave `result: null` for an upcoming game.

## Data honesty

Every entry carries a `status`:

- `verified` — sourced and confirmed; renders normally
- `needs-data` — a real person or game, details still missing; renders with an
  amber **Needs data** chip
- `placeholder` — invented demo row, shown so you can see the full layout;
  renders with a **Placeholder** chip. **Delete these.**

Nothing on this site was made up and presented as fact. Where a number could
not be sourced it is `null` and the UI shows an em dash, not a guess.

### What is real right now

Sourced from public reporting and listings:

- 2026 results: W 35-20 at Fort Wayne Bishop Luers; L 14-21 vs Eastside
- 2025: finished 13-1 (6-0 ACAC), lost 19-24 to Andrean in the Class 2A semi-state
- 2024: Class 2A state champions; Michael Mosser named IFCA Coach of the Year
- Mosser: head coach since 2009, 168-51 through the 2025 season
- Mosser era hardware: 9 sectional, 7 regional, 4 semi-state, 6 ACAC titles

### What still needs you

- Full roster: jersey numbers, positions, class years, heights, weights
- All player and team statistics
- Every highlight video link
- Remaining 2026 schedule (Weeks 4+ and the IHSAA tournament)
- Title-game opponents and scores for 2000 and 2024
- Individual years for the sectional/regional/semi-state titles
- All-time program record

The home page shows a running count of outstanding entries. Delete that panel
(the "Site data status" block in `src/pages/Home.jsx`) once you're done.
