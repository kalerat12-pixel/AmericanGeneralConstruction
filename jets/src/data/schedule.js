/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SCHEDULE & RESULTS
 *
 * One object per game. To record a result, fill in `result`. To add a highlight
 * reel, paste the URL into `highlightVideo` (YouTube or Hudl — both work).
 *
 *   result: null                          → upcoming game
 *   result: { teamScore, opponentScore }  → played; W/L is computed for you
 *
 *   location: 'home' | 'away' | 'neutral'
 *   status:   'verified' | 'needs-verification' | 'placeholder'
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const schedule = [
  {
    id: '2026-w1-luers',
    season: 2026,
    week: 1,
    date: '2026-08-21',
    kickoff: '19:00',
    opponent: 'Fort Wayne Bishop Luers',
    location: 'away', // TODO: verify/add — inferred, since Eastside was billed as the home opener
    venue: null,
    isConference: false,
    isPlayoff: false,
    result: { teamScore: 35, opponentScore: 20 },
    highlightVideo: null, // ← PASTE GAME HIGHLIGHT URL HERE
    notes: 'Season opener. Defense forced three second-half turnovers.',
    status: 'verified',
    source: 'journalgazette.net, maxpreps.com',
  },
  {
    id: '2026-w2-eastside',
    season: 2026,
    week: 2,
    date: '2026-08-28',
    kickoff: '19:00',
    opponent: 'Eastside',
    location: 'home',
    venue: 'Minnich Field',
    isConference: false,
    isPlayoff: false,
    result: { teamScore: 14, opponentScore: 21 },
    highlightVideo: null, // ← PASTE GAME HIGHLIGHT URL HERE
    notes: "Home opener. Snapped an 18-game regular-season winning streak.",
    status: 'verified',
    source: 'bernewitness.com',
  },
  {
    id: '2026-w3-tippecanoe-valley',
    season: 2026,
    week: 3,
    date: '2026-09-04',
    kickoff: '19:00',
    opponent: 'Tippecanoe Valley',
    location: 'home', // TODO: verify/add
    venue: null,
    isConference: false,
    isPlayoff: false,
    result: null,
    highlightVideo: null,
    notes: '',
    status: 'needs-verification',
    source: 'maxpreps.com schedule listing',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TODO: verify/add — remaining 2026 games (Weeks 4-9 + ACAC slate + IHSAA
  // tournament). Copy the shape above. Example of an upcoming conference game:
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'placeholder-rivalry',
    season: 2026,
    week: null, // TODO: verify/add
    date: null, // TODO: verify/add
    kickoff: '19:00',
    opponent: 'South Adams',
    location: 'home',
    venue: 'Minnich Field',
    isConference: true,
    isPlayoff: false,
    isRivalry: true,
    result: null,
    highlightVideo: null,
    notes: 'PLACEHOLDER — rivalry game shown so you can see the styling. Fix the date or delete this row.',
    status: 'placeholder',
  },
];

/** Sorted oldest → newest; undated rows fall to the end. */
export function sortedSchedule(games = schedule) {
  return [...games].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

/** 'W' | 'L' | 'T' | null */
export function gameOutcome(game) {
  if (!game.result) return null;
  const { teamScore, opponentScore } = game.result;
  if (teamScore == null || opponentScore == null) return null;
  if (teamScore > opponentScore) return 'W';
  if (teamScore < opponentScore) return 'L';
  return 'T';
}

/** Running record from whatever games have results. */
export function recordFromSchedule(games = schedule) {
  return games.reduce(
    (acc, game) => {
      const outcome = gameOutcome(game);
      if (outcome === 'W') acc.wins += 1;
      else if (outcome === 'L') acc.losses += 1;
      else if (outcome === 'T') acc.ties += 1;
      return acc;
    },
    { wins: 0, losses: 0, ties: 0 },
  );
}
