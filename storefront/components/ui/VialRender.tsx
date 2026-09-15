import { LabelArtwork } from "@/components/brand/VialLabel";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  size: string;
  lot: string;
  purity: string;
  accent?: "green" | "teal";
  className?: string;
}

/**
 * Vector stand-in for real product photography, drawn for a light ground:
 * pale glass with a dark outline, a dark printed label, and a soft contact
 * shadow instead of the glow the dark theme used.
 *
 * Drop-in replacement path: swap the body for an <Image> of a real photo or a
 * <model-viewer> / R3F canvas. The wrapper's aspect ratio is already tuned, so
 * the layout will not shift.
 */
export default function VialRender({
  name,
  size,
  lot,
  purity,
  accent = "green",
  className,
}: Props) {
  const hue = accent === "green" ? "#00703a" : "#0f6e8c";
  const uid = `${accent}-${name.replace(/\W/g, "")}`;

  return (
    <div
      className={cn(
        "relative flex aspect-4/5 w-full items-center justify-center",
        className,
      )}
      data-render-slot="product-photo"
    >
      <svg
        viewBox="0 0 160 240"
        className="relative h-full w-auto"
        role="img"
        aria-label={`${name} research vial, ${size}`}
      >
        <defs>
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dfe4ea" />
            <stop offset="16%" stopColor="#f7f9fa" />
            <stop offset="45%" stopColor="#e6eaef" />
            <stop offset="78%" stopColor="#f4f6f8" />
            <stop offset="100%" stopColor="#d5dbe2" />
          </linearGradient>
          <linearGradient id={`cap-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8f96a0" />
            <stop offset="26%" stopColor="#e2e6eb" />
            <stop offset="52%" stopColor="#9aa1ab" />
            <stop offset="78%" stopColor="#eef1f4" />
            <stop offset="100%" stopColor="#858c96" />
          </linearGradient>
          <linearGradient id={`fluid-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hue} stopOpacity="0.32" />
            <stop offset="100%" stopColor={hue} stopOpacity="0.14" />
          </linearGradient>
          <clipPath id={`body-${uid}`}>
            <rect x="34" y="46" width="92" height="178" rx="12" />
          </clipPath>
        </defs>

        {/* contact shadow */}
        <ellipse cx="80" cy="230" rx="40" ry="5.5" fill="#0f1419" opacity="0.14" />

        {/* body */}
        <rect
          x="34"
          y="46"
          width="92"
          height="178"
          rx="12"
          fill={`url(#glass-${uid})`}
          stroke="#0f1419"
          strokeOpacity="0.14"
        />

        {/* lyophilized cake */}
        <rect
          x="40"
          y="184"
          width="80"
          height="34"
          rx="6"
          fill={`url(#fluid-${uid})`}
        />

        {/* printed wrap label */}
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
            opacity="0.22"
            style={{ mixBlendMode: "multiply" }}
          />
        </g>

        {/* neck + crimp seal */}
        <rect x="58" y="32" width="44" height="18" rx="3" fill="#c8cdd4" />
        <rect x="54" y="12" width="52" height="24" rx="4" fill={`url(#cap-${uid})`} />
        <rect x="54" y="21" width="52" height="1.2" fill="#0f1419" opacity="0.18" />
        <circle cx="80" cy="12" r="9" fill={hue} />

        {/* specular highlight */}
        <rect x="45" y="58" width="5" height="152" rx="2.5" fill="#ffffff" opacity="0.85" />
      </svg>
    </div>
  );
}
