import { cn } from '@/lib/utils';

/**
 * The wordmark is set in live type rather than the SVG lockup so it stays
 * crisp and selectable. /public/brand holds the outlined SVG versions for
 * anywhere the font isn't available.
 */
export function Wordmark({
  className,
  size = 'md',
  as: Comp = 'span',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  as?: 'span' | 'div' | 'h1';
}) {
  return (
    <Comp
      className={cn(
        'wordmark whitespace-nowrap',
        size === 'sm' && 'text-[0.9375rem]',
        size === 'md' && 'text-[1.25rem] md:text-[1.375rem]',
        size === 'lg' && 'text-display-xs md:text-display-sm',
        className,
      )}
    >
      LIFTING4GAINS
    </Comp>
  );
}

/** The L4G monogram, drawn inline so it inherits currentColor. */
export function Monogram({
  className,
  title = 'L4G',
  showRule = true,
}: {
  className?: string;
  title?: string;
  showRule?: boolean;
}) {
  return (
    <svg
      viewBox="33 137 446 230"
      role="img"
      aria-label={title}
      className={cn('h-8 w-auto', className)}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        <path d="M71 161 V301 H133" />
        <path d="M57 161 H85" />
        <path d="M133 287 V301" />
        <path d="M245 161 L177 253 H287" />
        <path d="M245 161 V301" />
        <path d="M231 301 H259" />
        <path d="M435.8 178.6 A62 74 0 1 0 435.8 283.4" />
        <path d="M435.8 283.4 V241 H403" />
      </g>
      {showRule && <rect x="86" y="341" width="340" height="1.8" fill="#C9A961" />}
    </svg>
  );
}
