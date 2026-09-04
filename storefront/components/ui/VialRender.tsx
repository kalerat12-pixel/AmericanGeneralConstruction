import { LabelArtwork } from "@/components/brand/VialLabel";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  size: string;
  lot: string;
  purity: string;
  accent?: "acid" | "cyber";
  className?: string;
}

/**
 * Vector stand-in for the hyper-realistic 3D vial renders, now carrying the
 * branded wrap-around label.
 *
 * Drop-in replacement path: swap this component's body for an <Image> of a
 * real render or a <model-viewer> / R3F canvas. The wrapper's aspect ratio,
 * lighting and floor shadow are already tuned, so the layout will not shift.
 */
export default function VialRender({
  name,
  size,
  lot,
  purity,
  accent = "acid",
  className,
}: Props) {
  const hue = accent === "acid" ? "#00ff66" : "#00e5ff";
  const uid = `${accent}-${name.replace(/\W/g, "")}`;

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
        aria-label={`${name} research vial, ${size}`}
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
            <stop offset="0%" stopColor={hue} stopOpacity="0.5" />
            <stop offset="100%" stopColor={hue} stopOpacity="0.14" />
          </linearGradient>
          <clipPath id={`body-${uid}`}>
            <rect x="34" y="46" width="92" height="178" rx="12" />
          </clipPath>
        </defs>

        {/* floor contact shadow */}
        <ellipse cx="80" cy="230" rx="42" ry="6.5" fill="#000" opacity="0.55" />

        {/* body */}
        <rect
          x="34"
          y="46"
          width="92"
          height="178"
          rx="12"
          fill={`url(#glass-${uid})`}
          stroke="#ffffff"
          strokeOpacity="0.18"
        />

        {/* lyophilized cake, below the label */}
        <rect
          x="40"
          y="184"
          width="80"
          height="34"
          rx="6"
          fill={`url(#fluid-${uid})`}
        />

        {/* Wrap-around branded label, clipped to the vial body */}
        <g clipPath={`url(#body-${uid})`}>
          <LabelArtwork
            uid={uid}
            x={34}
            y={78}
            w={92}
            h={98}
            name={name}
            size={size}
            lot={lot}
            purity={purity}
            accent={accent}
          />
          {/* curvature shading so the label reads as wrapped, not pasted flat */}
          <rect
            x="34"
            y="78"
            width="92"
            height="98"
            fill={`url(#glass-${uid})`}
            opacity="0.28"
            style={{ mixBlendMode: "overlay" }}
          />
        </g>

        {/* neck + crimp seal */}
        <rect x="58" y="32" width="44" height="18" rx="3" fill="#1a1a1f" />
        <rect x="54" y="12" width="52" height="24" rx="4" fill={`url(#cap-${uid})`} />
        <rect x="54" y="21" width="52" height="1.5" fill="#000" opacity="0.35" />
        <circle cx="80" cy="12" r="9" fill={hue} opacity="0.9" />
        <circle cx="80" cy="12" r="9" fill="#000" opacity="0.25" />

        {/* specular highlight */}
        <rect x="45" y="58" width="6" height="152" rx="3" fill="#fff" opacity="0.12" />
      </svg>
    </div>
  );
}
