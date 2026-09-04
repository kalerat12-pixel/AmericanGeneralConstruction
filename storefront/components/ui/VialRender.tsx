import { cn } from "@/lib/utils";

interface Props {
  /** Short code printed on the vial label, e.g. "R+" or "MASS". */
  code: string;
  accent?: "acid" | "cyber";
  className?: string;
  /** Milligram fill shown under the code. */
  fill?: string;
}

/**
 * Vector stand-in for the hyper-realistic 3D vial renders.
 *
 * Drop-in replacement path: swap this component's body for a
 * <Image src="/renders/<slug>.webp" …> or a <model-viewer> / R3F canvas.
 * The wrapper's aspect ratio, lighting and floor shadow are already tuned,
 * so the surrounding layout will not shift when real renders land.
 */
export default function VialRender({
  code,
  accent = "acid",
  className,
  fill = "5 mg",
}: Props) {
  const hue = accent === "acid" ? "#00ff66" : "#00e5ff";
  const uid = `${accent}-${code.replace(/\W/g, "")}`;
  // Auto-fit the label text: "R" and "CENTURY" have to live in the same 84px band.
  const codeSize = code.length <= 2 ? 22 : code.length <= 4 ? 18 : code.length <= 6 ? 14 : 11.5;

  return (
    <div
      className={cn(
        "relative flex aspect-4/5 w-full items-center justify-center",
        className,
      )}
      data-render-slot="product-3d"
    >
      {/* key light */}
      <div
        className="pointer-events-none absolute inset-0 animate-aurora"
        style={{
          background: `radial-gradient(38% 34% at 50% 42%, ${hue}2e 0%, transparent 72%)`,
          filter: "blur(38px)",
        }}
        aria-hidden
      />

      <svg
        viewBox="0 0 160 240"
        className="relative h-full w-auto animate-float drop-shadow-[0_28px_40px_rgba(0,0,0,0.75)]"
        role="img"
        aria-label={`${code} research vial, ${fill}`}
      >
        <defs>
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="18%" stopColor="#ffffff" stopOpacity="0.26" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={`cap-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a2a31" />
            <stop offset="26%" stopColor="#9aa0aa" />
            <stop offset="52%" stopColor="#40444c" />
            <stop offset="78%" stopColor="#c3c8d0" />
            <stop offset="100%" stopColor="#25252b" />
          </linearGradient>
          <linearGradient id={`fluid-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hue} stopOpacity="0.55" />
            <stop offset="100%" stopColor={hue} stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={`label-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d0d10" />
            <stop offset="45%" stopColor="#1b1b21" />
            <stop offset="100%" stopColor="#08080a" />
          </linearGradient>
        </defs>

        {/* floor contact shadow */}
        <ellipse cx="80" cy="228" rx="40" ry="6.5" fill="#000" opacity="0.55" />

        {/* body */}
        <rect
          x="38"
          y="50"
          width="84"
          height="172"
          rx="11"
          fill={`url(#glass-${uid})`}
          stroke="#ffffff"
          strokeOpacity="0.18"
        />
        {/* lyophilized cake */}
        <rect
          x="44"
          y="172"
          width="72"
          height="44"
          rx="7"
          fill={`url(#fluid-${uid})`}
        />
        {/* label band */}
        <rect
          x="38"
          y="94"
          width="84"
          height="56"
          fill={`url(#label-${uid})`}
          stroke={hue}
          strokeOpacity="0.35"
        />
        <text
          x="80"
          y="120"
          textAnchor="middle"
          fill="#fafafa"
          fontSize={codeSize}
          fontWeight="700"
          letterSpacing="0.5"
          fontFamily="system-ui, sans-serif"
        >
          {code}
        </text>
        <text
          x="80"
          y="138"
          textAnchor="middle"
          fill={hue}
          fontSize="8.5"
          letterSpacing="2.2"
          fontFamily="ui-monospace, monospace"
        >
          {fill.toUpperCase()}
        </text>
        <rect x="46" y="156" width="46" height="2" fill="#fff" opacity="0.13" />
        <rect x="46" y="161" width="30" height="2" fill="#fff" opacity="0.08" />

        {/* neck + crimp seal */}
        <rect x="60" y="36" width="40" height="17" rx="3" fill="#1a1a1f" />
        <rect
          x="56"
          y="17"
          width="48"
          height="23"
          rx="4"
          fill={`url(#cap-${uid})`}
        />
        <rect x="56" y="25" width="48" height="1.5" fill="#000" opacity="0.35" />
        <circle cx="80" cy="17" r="8.5" fill={hue} opacity="0.9" />
        <circle cx="80" cy="17" r="8.5" fill="#000" opacity="0.25" />

        {/* specular highlight */}
        <rect
          x="48"
          y="62"
          width="6"
          height="146"
          rx="3"
          fill="#fff"
          opacity="0.12"
        />
      </svg>
    </div>
  );
}
