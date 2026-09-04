import { fullName } from '../data/roster';

/**
 * Headshot, or a team-coloured silhouette when there is no photo yet.
 * Drop a file in public/players/ and set `photo` in roster.js to swap it in.
 */
export default function PlayerAvatar({ player, className = '' }) {
  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={fullName(player)}
        loading="lazy"
        className={`h-full w-full object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-end justify-center overflow-hidden bg-linear-to-b from-charcoal-2 to-ink ${className}`}
      role="img"
      aria-label={`${fullName(player)} — no photo yet`}
    >
      <div className="absolute inset-0 speed-lines" aria-hidden />
      <svg
        viewBox="0 0 120 140"
        className="relative h-[86%] w-auto text-jet-red/65"
        aria-hidden
      >
        {/* Shoulders-and-helmet silhouette */}
        <path
          fill="currentColor"
          d="M60 26c14.4 0 24 9.4 24 23.5 0 9-3.2 17-8.2 21.7l-.6 6.6 15.4 6.2C99.7 87.6 106 97 106 108.6V140H14v-31.4C14 97 20.3 87.6 29.4 84l15.4-6.2-.6-6.6C39.2 66.5 36 58.5 36 49.5 36 35.4 45.6 26 60 26Z"
        />
        <path
          fill="#ffffff"
          fillOpacity="0.16"
          d="M60 26c14.4 0 24 9.4 24 23.5 0 3-.36 5.9-1 8.6-4.6-8.3-13-13.4-23-13.4s-18.4 5.1-23 13.4c-.64-2.7-1-5.6-1-8.6C36 35.4 45.6 26 60 26Z"
        />
      </svg>
    </div>
  );
}
