/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ROSTER
 *
 * ONE PLACE PER PLAYER. To fill a player in:
 *
 *   photo:          '/players/12-lastname.jpg'   → drop the file in jets/public/players/
 *   highlightVideo: 'https://youtu.be/XXXX'      → YouTube or Hudl URL, either works
 *   stats:          only include the groups that apply to their position
 *
 * `status` controls what the site shows:
 *   'verified'          → a real, confirmed player. Renders normally.
 *   'needs-data'        → real name, missing details. Renders with a "Needs data" chip.
 *   'placeholder'       → invented demo row. Renders with a "Placeholder" chip. DELETE THESE.
 *
 * Available stat groups (all optional, all per-season):
 *   passing   { completions, attempts, yards, touchdowns, interceptions, long }
 *   rushing   { attempts, yards, touchdowns, long }
 *   receiving { receptions, yards, touchdowns, long }
 *   defense   { tacklesSolo, tacklesAssisted, tacklesForLoss, sacks,
 *               interceptions, forcedFumbles, fumbleRecoveries, passBreakups }
 *   kicking   { fieldGoalsMade, fieldGoalsAttempted, extraPointsMade,
 *               extraPointsAttempted, touchbacks }
 *   returns   { kickReturns, kickReturnYards, kickReturnTds,
 *               puntReturns, puntReturnYards, puntReturnTds }
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const roster = [
  // ═══ REAL NAMES, DETAILS STILL NEEDED ═══════════════════════════════════════
  // These names came from public roster listings but I could not confirm jersey
  // numbers, positions, or measurables. Fill each one in and set status:'verified'.
  {
    id: 'hamilton-max',
    status: 'needs-data',
    number: null,
    firstName: 'Max',
    lastName: 'Hamilton',
    positions: [], // TODO: verify/add
    gradeLevel: null, // 9 | 10 | 11 | 12 — TODO: verify/add
    heightInches: null,
    weightLbs: null,
    photo: null,
    highlightVideo: null,
    bio: '',
    stats: {},
    source: 'maxpreps.com roster listing',
  },
  {
    id: 'hammond-reece',
    status: 'needs-data',
    number: null,
    firstName: 'Reece',
    lastName: 'Hammond',
    positions: [],
    gradeLevel: null,
    heightInches: null,
    weightLbs: null,
    photo: null,
    highlightVideo: null,
    bio: '',
    stats: {},
    source: 'maxpreps.com roster listing',
  },
  {
    id: 'schnitz-chase',
    status: 'needs-data',
    number: null,
    firstName: 'Chase',
    lastName: 'Schnitz',
    positions: [],
    gradeLevel: null,
    heightInches: null,
    weightLbs: null,
    photo: null,
    highlightVideo: null,
    bio: '',
    stats: {},
    source: 'maxpreps.com roster listing',
  },
  {
    id: 'beckner-ben',
    status: 'needs-data',
    number: null,
    firstName: 'Ben',
    lastName: 'Beckner',
    positions: [],
    gradeLevel: null,
    heightInches: null,
    weightLbs: null,
    photo: null,
    highlightVideo: null,
    bio: '',
    stats: {},
    source: 'maxpreps.com roster listing',
  },
  {
    id: 'roach-jamison',
    status: 'needs-data',
    number: null,
    firstName: 'Jamison',
    lastName: 'Roach',
    positions: [],
    gradeLevel: null,
    heightInches: null,
    weightLbs: null,
    photo: null,
    highlightVideo: null,
    bio: '',
    stats: {},
    source: 'maxpreps.com roster listing',
  },
  {
    id: 'everett-joey',
    status: 'needs-data',
    number: null,
    firstName: 'Joey',
    lastName: 'Everett',
    positions: [],
    gradeLevel: null,
    heightInches: null,
    weightLbs: null,
    photo: null,
    highlightVideo: null,
    bio: '',
    stats: {},
    source: 'nwitimes.com — 95-yard receiving TD in the 2025 2A semi-state',
  },

  // ═══ PLACEHOLDERS — DELETE THESE ════════════════════════════════════════════
  // Invented rows, here only so you can see every field rendered: a full stat
  // line, a bio, a photo slot and a highlight embed. Nothing below is real.
  {
    id: 'placeholder-qb',
    status: 'placeholder',
    number: 7,
    firstName: 'Sample',
    lastName: 'Quarterback',
    positions: ['QB', 'FS'],
    gradeLevel: 12,
    heightInches: 73,
    weightLbs: 190,
    photo: null, // ← '/players/7-lastname.jpg'
    highlightVideo: null, // ← 'https://www.youtube.com/watch?v=...' or a Hudl URL
    bio: 'PLACEHOLDER BIO. Three-year starter under center in the Jets Wing-T. Replace this text with a real write-up, or delete the row entirely.',
    stats: {
      passing: {
        completions: 61,
        attempts: 104,
        yards: 1142,
        touchdowns: 14,
        interceptions: 3,
        long: 62,
      },
      rushing: { attempts: 118, yards: 733, touchdowns: 11, long: 47 },
    },
  },
  {
    id: 'placeholder-rb',
    status: 'placeholder',
    number: 22,
    firstName: 'Sample',
    lastName: 'Runningback',
    positions: ['RB', 'LB'],
    gradeLevel: 11,
    heightInches: 70,
    weightLbs: 195,
    photo: null,
    highlightVideo: null,
    bio: 'PLACEHOLDER BIO. Replace or delete.',
    stats: {
      rushing: { attempts: 187, yards: 1284, touchdowns: 18, long: 71 },
      receiving: { receptions: 12, yards: 168, touchdowns: 2, long: 34 },
      defense: {
        tacklesSolo: 44,
        tacklesAssisted: 31,
        tacklesForLoss: 9,
        sacks: 2,
        interceptions: 1,
        forcedFumbles: 2,
        fumbleRecoveries: 1,
        passBreakups: 3,
      },
    },
  },
  {
    id: 'placeholder-dl',
    status: 'placeholder',
    number: 55,
    firstName: 'Sample',
    lastName: 'Lineman',
    positions: ['DE', 'OT'],
    gradeLevel: 12,
    heightInches: 75,
    weightLbs: 240,
    photo: null,
    highlightVideo: null,
    bio: 'PLACEHOLDER BIO. Replace or delete.',
    stats: {
      defense: {
        tacklesSolo: 38,
        tacklesAssisted: 27,
        tacklesForLoss: 16,
        sacks: 8.5,
        interceptions: 0,
        forcedFumbles: 3,
        fumbleRecoveries: 2,
        passBreakups: 1,
      },
    },
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

export const GRADE_LABELS = {
  9: 'Freshman',
  10: 'Sophomore',
  11: 'Junior',
  12: 'Senior',
};

/** 73 → 6'1" */
export function formatHeight(inches) {
  if (!inches) return null;
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export function fullName(player) {
  return `${player.firstName} ${player.lastName}`.trim();
}

export function getPlayer(id) {
  return roster.find((p) => p.id === id);
}

/**
 * Real players first, demo rows last; then jersey number ascending, with
 * unnumbered players sorted alphabetically at the end of their group.
 */
export function sortedRoster(players = roster) {
  const rank = (p) => (p.status === 'placeholder' ? 1 : 0);
  return [...players].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    if (a.number == null && b.number == null) {
      return a.lastName.localeCompare(b.lastName);
    }
    if (a.number == null) return 1;
    if (b.number == null) return -1;
    return a.number - b.number;
  });
}

/** True when a player has at least one non-empty stat group. */
export function hasStats(player) {
  return Object.values(player.stats ?? {}).some(
    (group) => group && Object.keys(group).length > 0,
  );
}
