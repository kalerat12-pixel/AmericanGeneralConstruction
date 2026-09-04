/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEAM & SEASON STATS
 *
 * The win/loss record is computed from schedule.js, so you never type it twice.
 * Everything here is the stuff a scoreboard cannot derive: yardage, leaders,
 * and the conference table.
 *
 * Leaders reference a player by `playerId` from roster.js, so a name change in
 * one place updates everywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const seasonStats = {
  season: 2026,

  /** Conference record. TODO: verify/add as ACAC play starts. */
  conferenceRecord: { wins: null, losses: null },

  /**
   * Scoring. TODO: verify/add — these should be season totals, not per game.
   * Through two games the known scores are 35-20 (W) and 14-21 (L).
   */
  pointsFor: 49,
  pointsAgainst: 41,
  gamesCounted: 2,
  status: 'partial', // computed from the two confirmed 2026 results

  offense: {
    // TODO: verify/add — season totals from MaxPreps or your own book.
    totalYards: null,
    rushingYards: null,
    passingYards: null,
    turnoversLost: null,
  },

  defense: {
    // TODO: verify/add
    yardsAllowed: null,
    rushingYardsAllowed: null,
    passingYardsAllowed: null,
    takeaways: null,
  },

  /**
   * Statistical leaders. `playerId` must match an id in roster.js.
   * `value` is what gets displayed; `detail` is the small line under it.
   */
  leaders: {
    passing: [
      {
        playerId: 'placeholder-qb',
        value: '1,142',
        detail: '14 TD · 3 INT',
        status: 'placeholder',
      },
    ],
    rushing: [
      {
        playerId: 'placeholder-rb',
        value: '1,284',
        detail: '18 TD · 6.9 avg',
        status: 'placeholder',
      },
      {
        playerId: 'placeholder-qb',
        value: '733',
        detail: '11 TD',
        status: 'placeholder',
      },
    ],
    receiving: [
      {
        playerId: 'placeholder-rb',
        value: '168',
        detail: '12 rec · 2 TD',
        status: 'placeholder',
      },
    ],
    tackles: [
      {
        playerId: 'placeholder-rb',
        value: '75',
        detail: '44 solo · 31 ast',
        status: 'placeholder',
      },
      {
        playerId: 'placeholder-dl',
        value: '65',
        detail: '16 TFL',
        status: 'placeholder',
      },
    ],
    sacks: [
      {
        playerId: 'placeholder-dl',
        value: '8.5',
        detail: '3 forced fumbles',
        status: 'placeholder',
      },
    ],
  },
};

/**
 * ACAC standings table.
 * TODO: verify/add — real conference records once league play is under way.
 * The team list is the ACAC membership; records are placeholders.
 */
export const conferenceStandings = {
  conference: 'Allen County Athletic Conference',
  season: 2026,
  status: 'placeholder',
  teams: [
    { team: 'Adams Central', confWins: null, confLosses: null, isUs: true },
    { team: 'South Adams', confWins: null, confLosses: null },
    { team: 'Bluffton', confWins: null, confLosses: null },
    { team: 'Southern Wells', confWins: null, confLosses: null },
    { team: 'Woodlan', confWins: null, confLosses: null },
    { team: 'Heritage', confWins: null, confLosses: null },
    { team: 'Jay County', confWins: null, confLosses: null },
    // TODO: verify/add — confirm the full current ACAC membership.
  ],
};
