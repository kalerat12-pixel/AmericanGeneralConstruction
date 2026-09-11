/**
 * Star rating. Drawn as SVG rather than an emoji or icon font so it inherits
 * currentColor, scales cleanly, and carries a real text label for screen
 * readers instead of a row of decorative glyphs.
 */
export function Stars({
  rating,
  size = 14,
  className = "",
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex gap-[3px] text-ember" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`half-${i}-${size}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M10 1.6l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.88l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L10 1.6z"
                fill={fill === 1 ? "currentColor" : fill === 0.5 ? `url(#half-${i}-${size})` : "none"}
                stroke="currentColor"
                strokeOpacity={fill ? 0 : 0.38}
                strokeWidth="1.2"
              />
            </svg>
          );
        })}
      </span>
      <span className={showValue ? "text-sm type-mono text-ash" : "sr-only"}>
        {rating.toFixed(1)} out of 5
      </span>
    </span>
  );
}
