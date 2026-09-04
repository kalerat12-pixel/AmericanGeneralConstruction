/**
 * Team identity, built from SVG + CSS since there is no official logo file.
 *
 *  <JetGlyph />   the jet silhouette on its own (nav, favicons, watermarks)
 *  <Wordmark />   the full "Adams Central / Flying Jets" lockup
 */

export function JetGlyph({ className = '', title }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      {/* Swept-wing jet, nose to the right — angular, not cartoonish. */}
      <path d="M62.4 19.9 47.6 24l-9.1 2.5-6.8 10.9a1 1 0 0 1-.9.5h-4.3a.7.7 0 0 1-.66-.93l3.5-9.2-9.9 2.7-3.4 4.6a1 1 0 0 1-.8.4H11a.7.7 0 0 1-.66-.95l1.9-5.3-9.9 2.7a1.2 1.2 0 0 1-1.5-1.16v-1.3a1.2 1.2 0 0 1 .88-1.16l9-2.45-9-2.45a1.2 1.2 0 0 1-.88-1.16v-1.3A1.2 1.2 0 0 1 2.34 8.9l9.9 2.7-1.9-5.3A.7.7 0 0 1 11 5.35h3.74a1 1 0 0 1 .8.4l3.4 4.6 9.9 2.7-3.5-9.2a.7.7 0 0 1 .66-.93h4.3a1 1 0 0 1 .9.5l6.8 10.9 9.1 2.5 14.8 4.1a.1.1 0 0 1 0 .18Z" />
    </svg>
  );
}

export function Wordmark({ className = '', tone = 'light' }) {
  // tone: 'light' = for dark backgrounds, 'dark' = for white backgrounds
  const top = tone === 'light' ? 'text-steel-light' : 'text-charcoal-2';
  const main = tone === 'light' ? 'text-white' : 'text-ink';

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative flex items-center justify-center">
        <span className="absolute inset-0 -skew-x-12 bg-jet-red" aria-hidden />
        <JetGlyph className="relative z-10 h-4 w-7 text-white sm:h-5 sm:w-8" />
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`athletic text-[0.58rem] tracking-[0.28em] sm:text-[0.65rem] ${top}`}
        >
          Adams Central
        </span>
        <span
          className={`athletic -mt-0.5 text-lg italic sm:text-xl ${main}`}
          style={{ letterSpacing: '-0.01em' }}
        >
          Flying Jets
        </span>
      </span>
    </span>
  );
}
