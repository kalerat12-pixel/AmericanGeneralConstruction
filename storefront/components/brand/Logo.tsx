import { cn } from "@/lib/utils";

/**
 * LIFTING4GAINS identity.
 *
 * Three pieces, one construction:
 *  - LogoMonogram  L4G drawn as a single connected glyph. The "4" is the accent
 *                  and its diagonal reads as a bond angle — the whole mark is
 *                  built from one 16-unit stroke, so it holds together at any size.
 *  - LogoMark      The monogram inside a hex badge (hex = the molecular motif
 *                  that runs through the brand). Legible down to ~28px.
 *  - LogoLockup    Mark + wordmark + descriptor, for nav and footer.
 */

interface MonogramProps {
  className?: string;
  /** Accent applied to the 4. */
  accent?: string;
  /** Applied to the L and G. */
  ink?: string;
}

export function LogoMonogram({
  className,
  accent = "#00ff66",
  ink = "currentColor",
}: MonogramProps) {
  return (
    <svg
      viewBox="0 0 180 76"
      className={className}
      fill="none"
      strokeWidth="16"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      role="img"
      aria-label="Lifting4Gains"
    >
      {/* L */}
      <path d="M10 8 V60 H46" stroke={ink} />
      {/* 4 — diagonal reads as a peptide bond angle */}
      <path d="M90 8 L58 48 H108" stroke={accent} />
      <path d="M90 8 V68" stroke={accent} />
      {/* G */}
      <path d="M160 25 A22 22 0 1 0 160 51 V38 H143" stroke={ink} />
    </svg>
  );
}

interface MarkProps {
  className?: string;
  /** Draw the molecular vertex nodes on the hex. Off below ~32px. */
  nodes?: boolean;
}

export function LogoMark({ className, nodes = true }: MarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Lifting4Gains"
    >
      <defs>
        <linearGradient id="l4g-hex" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00ff66" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#00ff66" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="l4g-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16161a" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
      </defs>

      {/* Hex field */}
      <path
        d="M60 5 L107 32 V88 L60 115 L13 88 V32 Z"
        fill="url(#l4g-fill)"
        stroke="url(#l4g-hex)"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Vertex nodes — the molecule cue */}
      {nodes && (
        <g fill="#00ff66">
          <circle cx="60" cy="5" r="4.5" />
          <circle cx="107" cy="32" r="3" opacity="0.55" />
          <circle cx="107" cy="88" r="3" opacity="0.55" />
          <circle cx="60" cy="115" r="4.5" />
          <circle cx="13" cy="88" r="3" opacity="0.55" />
          <circle cx="13" cy="32" r="3" opacity="0.55" />
        </g>
      )}

      {/* Monogram centred on the hex: 0.44 scale leaves an even optical
          margin against the hex's vertical sides. */}
      <g transform="translate(21.7 43.3) scale(0.44)">
        <LogoMonogramPaths ink="#fafafa" accent="#00ff66" />
      </g>
    </svg>
  );
}

/** Raw paths, so the mark can nest the monogram without a nested <svg>. */
function LogoMonogramPaths({ ink, accent }: { ink: string; accent: string }) {
  return (
    <g fill="none" strokeWidth="16" strokeLinecap="butt" strokeLinejoin="miter">
      <path d="M10 8 V60 H46" stroke={ink} />
      <path d="M90 8 L58 48 H108" stroke={accent} />
      <path d="M90 8 V68" stroke={accent} />
      <path d="M160 25 A22 22 0 1 0 160 51 V38 H143" stroke={ink} />
    </g>
  );
}

export function LogoLockup({
  className,
  descriptor = "Research Peptides",
  tone = "light",
}: {
  className?: string;
  descriptor?: string | false;
  /** "light" = for white grounds · "dark" = for the black bands */
  tone?: "light" | "dark";
}) {
  const wordmark = tone === "dark" ? "text-ink-inverse" : "text-ink";
  const sub = tone === "dark" ? "text-muted-inverse" : "text-subtle";
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative shrink-0">
        <LogoMark className="size-8" />
        <span className="absolute inset-0 -z-10 rounded-full bg-brand/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[0.95rem] font-extrabold tracking-[-0.03em]", wordmark)}>
          LIFTING<span className="text-brand">4</span>GAINS
        </span>
        {descriptor && (
          <span className={cn("mt-0.5 font-mono text-[8px] tracking-[0.26em] uppercase", sub)}>
            {descriptor}
          </span>
        )}
      </span>
    </span>
  );
}

/** Public alias so the vial label can nest the monogram inside its own <svg>. */
export function LogoMonogramPathsForLabel(props: { ink: string; accent: string }) {
  return <LogoMonogramPaths {...props} />;
}
