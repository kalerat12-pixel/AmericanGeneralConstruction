/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEAM IDENTITY — rarely changes. Edit once, it updates the whole site.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const team = {
  name: 'Adams Central',
  mascot: 'Flying Jets',
  shortName: 'Jets',
  fullName: 'Adams Central Flying Jets',

  school: 'Adams Central Middle/High School',
  district: 'Adams Central Community Schools',
  city: 'Monroe',
  state: 'IN',
  address: '222 W Washington St, Monroe, IN 46772',

  venue: {
    name: 'Minnich Field',
    nickname: 'The Landing Strip',
  },

  conference: 'Allen County Athletic Conference',
  conferenceAbbr: 'ACAC',
  rival: 'South Adams Starfires',

  /** Drives the current-season labels across the site. */
  currentSeason: 2026,

  /** Official links. TODO: verify/add — confirm these before publishing. */
  links: {
    athletics: 'https://adamscentralathletics.com/', // TODO: verify/add
    maxpreps: 'https://www.maxpreps.com/in/monroe/adams-central-jets/football/',
    hudl: null, // TODO: verify/add — paste the team Hudl URL
    twitter: null, // TODO: verify/add
    facebook: null, // TODO: verify/add
  },
};

/** Shown in the footer. Keep this — the site is not school-affiliated. */
export const siteDisclaimer =
  'Unofficial fan and statistics site. Not affiliated with, endorsed by, or ' +
  'operated by Adams Central Community Schools or the IHSAA. Team names and ' +
  'marks belong to their respective owners.';
