/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HIGHLIGHT REELS
 *
 * Paste a YouTube or Hudl URL into `url` and the tile becomes a real embed.
 * Leave it null and the tile renders as an empty slot with a "drop a link here"
 * message — so the gallery still looks intentional before you have video.
 *
 * Supported URL shapes:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.hudl.com/video/...        (any Hudl share or embed link)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const highlights = [
  {
    id: 'hl-2026-w1',
    title: 'Week 1 vs Fort Wayne Bishop Luers',
    kind: 'game',
    gameId: '2026-w1-luers',
    date: '2026-08-21',
    description: 'Season-opening win. Three second-half takeaways.',
    url: null, // ← PASTE HIGHLIGHT URL HERE
  },
  {
    id: 'hl-2026-w2',
    title: 'Week 2 vs Eastside',
    kind: 'game',
    gameId: '2026-w2-eastside',
    date: '2026-08-28',
    description: 'Home opener at The Landing Strip.',
    url: null,
  },
  {
    id: 'hl-2025-semistate',
    title: '2025 Class 2A Semi-State vs Andrean',
    kind: 'game',
    gameId: null,
    date: '2025-11-21',
    description:
      'Capped a 13-1 season. Joey Everett turned a swing pass into a 95-yard touchdown late.',
    url: null,
  },
  {
    id: 'hl-2024-title',
    title: '2024 Class 2A State Championship',
    kind: 'season',
    gameId: null,
    date: '2024-11-29', // TODO: verify/add — confirm the exact title game date
    description: "The program's first Class 2A state championship.",
    url: null,
  },
  {
    id: 'hl-placeholder-player',
    title: 'Player highlight slot',
    kind: 'player',
    playerId: 'placeholder-qb',
    date: null,
    description:
      'PLACEHOLDER — player reels also appear on their own profile page. Delete or repoint at a real player.',
    url: null,
  },
];

/**
 * Turns a YouTube or Hudl link into something an <iframe> will accept.
 * Returns null if the URL is missing or not a shape we recognise.
 */
export function toEmbedUrl(url) {
  if (!url) return null;

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  if (url.includes('hudl.com')) {
    return url.includes('/embed/') ? url : url.replace('/video/', '/embed/video/');
  }

  return url;
}
