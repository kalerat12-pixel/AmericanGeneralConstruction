/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PROGRAM HISTORY
 *
 * Verified entries carry a `source`. Anything marked `needs-verification` is a
 * gap I could not confirm — fill it in and flip `status` to 'verified'.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const stateTitles = [
  {
    year: 2000,
    class: '1A',
    opponent: null, // TODO: verify/add — who did the Jets beat in the final?
    score: null, // TODO: verify/add — e.g. '21-14'
    status: 'needs-verification',
    note: 'First football state championship in program history.',
  },
  {
    year: 2024,
    class: '2A',
    opponent: 'Linton-Stockton',
    score: null, // TODO: verify/add — final score of the 2A title game
    status: 'needs-verification',
    note: "Program's first Class 2A state title. Michael Mosser named IFCA Coach of the Year.",
    source: 'wane.com / wzbd.com coverage, Dec 2024',
  },
];

/**
 * Deep tournament runs that did not end in a title.
 */
export const notableRuns = [
  {
    year: 2025,
    result: 'Class 2A Semi-State',
    detail: 'Finished 13-1 (6-0 ACAC). Lost 19-24 to Andrean in the 2A semi-state.',
    status: 'verified',
    source: 'nwitimes.com, maxpreps.com',
  },
  {
    year: 2024,
    result: 'Class 2A State Champions',
    detail: 'Beat Andrean in the semi-state en route to the 2A state title.',
    status: 'verified',
    source: 'nwitimes.com',
  },
];

/**
 * IHSAA tournament hardware.
 *
 * NOTE: the counts below are the MICHAEL MOSSER ERA only (2009–present), which
 * is what I could source. Program totals across all coaches are unknown.
 * `years` is intentionally empty — I will not guess title years.
 */
export const tournamentTitles = {
  scope: 'Michael Mosser era (2009–present)',
  source: 'wane.com / wzbd.com coverage, Dec 2024',
  sectional: { count: 9, years: [] }, // TODO: verify/add the individual years
  regional: { count: 7, years: [] }, // TODO: verify/add
  semiState: { count: 4, years: [] }, // TODO: verify/add
  conference: { count: 6, years: [] }, // TODO: verify/add — ACAC championships
};

export const allTimeRecord = {
  // TODO: verify/add — full program all-time record across every season.
  wins: null,
  losses: null,
  ties: null,
  firstSeason: null,
  status: 'needs-verification',
};

export const coaches = [
  {
    name: 'Michael Mosser',
    yearsFrom: 2009,
    yearsTo: null, // null = still coaching
    wins: 168,
    losses: 51,
    recordAsOf: 'end of the 2025 season',
    highlights: [
      '2024 Class 2A state champion',
      '2024 IFCA Coach of the Year',
      'Adams Central alumnus',
    ],
    status: 'verified',
    source: 'wane.com, wzbd.com — 155-50 through 2024, 168-51 (.767) through 2025',
  },
  // TODO: verify/add — earlier head coaches, including whoever led the 2000 1A title team.
];
