/**
 * Single import point for every data file.
 *
 *   import { roster, schedule, team } from '../data';
 *
 * The files themselves are where you edit:
 *   team.js       identity, venue, conference, links
 *   roster.js     players, measurables, per-player stats and highlight links
 *   schedule.js   game-by-game results and highlight reels
 *   teamStats.js  season totals, statistical leaders, conference standings
 *   history.js    state titles, tournament hardware, coaching records
 *   highlights.js the video gallery
 */

export * from './team';
export * from './roster';
export * from './schedule';
export * from './teamStats';
export * from './history';
export * from './highlights';
