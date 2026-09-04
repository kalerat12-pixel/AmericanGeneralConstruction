import { LogoMonogramPathsForLabel } from "./Logo";

interface LabelProps {
  name: string;
  size: string;
  lot: string;
  purity: string;
  accent?: "acid" | "cyber";
}

interface ArtworkProps extends LabelProps {
  /** Bounding box of the label on the parent SVG's coordinate system. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Unique per instance — gradient ids must not collide across vials. */
  uid: string;
}

/** Reference geometry. Everything below is authored in this box, then scaled. */
const REF_W = 84;
const REF_H = 92;

/** Long product names get two lines and a smaller face. */
function splitName(name: string): [string] | [string, string] {
  if (name.length <= 13) return [name];
  const slash = name.indexOf("/");
  if (slash > 0) {
    return [name.slice(0, slash).trim(), name.slice(slash + 1).trim()];
  }
  const mid = name.lastIndexOf(" ", Math.ceil(name.length / 2) + 4);
  if (mid > 0) return [name.slice(0, mid), name.slice(mid + 1)];
  return [name];
}

/**
 * The wrap-around vial label. Rendered as an SVG <g> so the same artwork can
 * sit on a curved vial (VialRender) or lie flat as printable label art
 * (FlatVialLabel) without being drawn twice.
 */
export function LabelArtwork({
  x,
  y,
  w,
  h,
  uid,
  name,
  size,
  lot,
  purity,
  accent = "acid",
}: ArtworkProps) {
  const hue = accent === "acid" ? "#00ff66" : "#00e5ff";
  // One uniform scale for positions and type alike, so the artwork keeps its
  // proportions in any box, then centred on whatever space is left over.
  const s = Math.min(w / REF_W, h / REF_H);
  const ox = x + (w - REF_W * s) / 2;
  const oy = y + (h - REF_H * s) / 2;
  const px = (v: number) => ox + v * s;
  const py = (v: number) => oy + v * s;
  const f = (v: number) => v * s;

  const lines = splitName(name);
  const nameSize = lines.length > 1 ? 10 : name.length > 9 ? 11.5 : 14;

  return (
    <g>
      <defs>
        <linearGradient id={`lbl-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#08080a" />
          <stop offset="18%" stopColor="#1c1c22" />
          <stop offset="55%" stopColor="#121216" />
          <stop offset="100%" stopColor="#08080a" />
        </linearGradient>
      </defs>

      <rect x={x} y={y} width={w} height={h} fill={`url(#lbl-${uid})`} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={hue}
        strokeOpacity="0.4"
        strokeWidth={f(0.7)}
      />

      {/* Top hairline */}
      <rect x={px(6)} y={py(7)} width={f(REF_W - 12)} height={f(0.6)} fill="#fff" opacity="0.16" />

      {/* Brand monogram */}
      <g transform={`translate(${px(25)} ${py(11)}) scale(${f(34 / 180)})`}>
        <LogoMonogramPathsForLabel ink="#fafafa" accent={hue} />
      </g>

      {/* Compound name */}
      {lines.map((line, i) => (
        <text
          key={line}
          x={px(REF_W / 2)}
          y={py(lines.length > 1 ? 40 + i * 12 : 45)}
          textAnchor="middle"
          fill="#fafafa"
          fontSize={f(nameSize)}
          fontWeight="700"
          letterSpacing={f(0.2)}
          fontFamily="system-ui, sans-serif"
        >
          {line}
        </text>
      ))}

      {/* Fill weight */}
      <text
        x={px(REF_W / 2)}
        y={py(60)}
        textAnchor="middle"
        fill={hue}
        fontSize={f(8)}
        letterSpacing={f(2)}
        fontFamily="ui-monospace, monospace"
      >
        {size.toUpperCase()}
      </text>

      {/* Divider */}
      <rect x={px(14)} y={py(66)} width={f(REF_W - 28)} height={f(0.5)} fill="#fff" opacity="0.12" />

      {/* Lot / purity microtext */}
      <text
        x={px(REF_W / 2)}
        y={py(75)}
        textAnchor="middle"
        fill="#8b8b95"
        fontSize={f(4.6)}
        letterSpacing={f(0.5)}
        fontFamily="ui-monospace, monospace"
      >
        {lot} · {purity}
      </text>

      {/* Compliance line */}
      <text
        x={px(REF_W / 2)}
        y={py(85)}
        textAnchor="middle"
        fill={hue}
        fontSize={f(4.4)}
        letterSpacing={f(1.1)}
        fontFamily="ui-monospace, monospace"
        opacity="0.85"
      >
        RESEARCH USE ONLY
      </text>
    </g>
  );
}

/**
 * The label lying flat — the artwork as it goes to the label printer.
 *
 * A wrap label is wide, because it goes around the vial's circumference: only
 * the centre panel faces the buyer on the shelf. The flanking panels carry the
 * handling and traceability data, exactly as they do on a real vial.
 */
export function FlatVialLabel({
  name,
  size,
  lot,
  purity,
  accent = "acid",
  className,
}: LabelProps & { className?: string }) {
  const hue = accent === "acid" ? "#00ff66" : "#00e5ff";
  const uid = `flat-${name.replace(/\W/g, "")}`;
  const lines = splitName(name);
  const nameSize = lines.length > 1 ? 15 : name.length > 9 ? 18 : 23;

  // Deterministic bar widths — a plausible code, not a scannable one.
  const bars = Array.from({ length: 28 }, (_, i) =>
    ((i * 7 + name.charCodeAt(i % name.length)) % 3) + 1,
  );

  return (
    <svg
      viewBox="0 0 400 150"
      className={className}
      role="img"
      aria-label={`${name} vial wrap label artwork, ${size}, lot ${lot}, research use only`}
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#08080a" />
          <stop offset="30%" stopColor="#1c1c22" />
          <stop offset="50%" stopColor="#16161b" />
          <stop offset="70%" stopColor="#1c1c22" />
          <stop offset="100%" stopColor="#08080a" />
        </linearGradient>
        <clipPath id={`clip-${uid}`}>
          <rect x="2" y="2" width="396" height="146" rx="9" />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        <rect x="2" y="2" width="396" height="146" fill={`url(#bg-${uid})`} />

        {/* Full-bleed rules */}
        <rect x="2" y="14" width="396" height="0.8" fill="#fff" opacity="0.14" />
        <rect x="2" y="135" width="396" height="0.8" fill="#fff" opacity="0.14" />

        {/* Panel dividers */}
        <rect x="118" y="14" width="0.8" height="121" fill="#fff" opacity="0.1" />
        <rect x="282" y="14" width="0.8" height="121" fill="#fff" opacity="0.1" />

        {/* ── Left panel: handling ────────────────────────────────────── */}
        <g fontFamily="ui-monospace, monospace" fill="#8b8b95">
          <text x="14" y="34" fontSize="6.5" letterSpacing="1.6" fill={hue}>
            STORAGE
          </text>
          <text x="14" y="48" fontSize="7">Store 2–8 °C, desiccated.</text>
          <text x="14" y="59" fontSize="7">Protect from light.</text>
          <text x="14" y="78" fontSize="6.5" letterSpacing="1.6" fill={hue}>
            HANDLING
          </text>
          <text x="14" y="92" fontSize="7">Reconstitute with</text>
          <text x="14" y="103" fontSize="7">bacteriostatic water.</text>
          <text x="14" y="122" fontSize="6.5" fill="#5f5f68">
            Not sterile. Not for
          </text>
          <text x="14" y="131" fontSize="6.5" fill="#5f5f68">
            human consumption.
          </text>
        </g>

        {/* ── Centre panel: the face of the vial ──────────────────────── */}
        <g transform="translate(160 26) scale(0.455)">
          <LogoMonogramPathsForLabel ink="#fafafa" accent={hue} />
        </g>

        {lines.map((line, i) => (
          <text
            key={line}
            x="200"
            y={lines.length > 1 ? 78 + i * 19 : 86}
            textAnchor="middle"
            fill="#fafafa"
            fontSize={nameSize}
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {line}
          </text>
        ))}

        <text
          x="200"
          y="106"
          textAnchor="middle"
          fill={hue}
          fontSize="12"
          letterSpacing="3"
          fontFamily="ui-monospace, monospace"
        >
          {size.toUpperCase()}
        </text>

        <rect x="150" y="114" width="100" height="0.6" fill="#fff" opacity="0.12" />

        <text
          x="200"
          y="128"
          textAnchor="middle"
          fill={hue}
          fontSize="7"
          letterSpacing="2.2"
          fontFamily="ui-monospace, monospace"
          opacity="0.9"
        >
          RESEARCH USE ONLY
        </text>

        {/* ── Right panel: traceability ───────────────────────────────── */}
        <g fontFamily="ui-monospace, monospace" fill="#8b8b95">
          <text x="296" y="34" fontSize="6.5" letterSpacing="1.6" fill={hue}>
            LOT
          </text>
          <text x="296" y="47" fontSize="8" fill="#d4d4d8">{lot}</text>
          <text x="296" y="62" fontSize="6.5" letterSpacing="1.6" fill={hue}>
            PURITY
          </text>
          <text x="296" y="75" fontSize="8" fill="#d4d4d8">{purity}</text>
        </g>

        {/* Code block */}
        <g transform="translate(296 88)">
          {bars.map((wBar, i) => {
            const xPos = bars.slice(0, i).reduce((a, b) => a + b + 1, 0);
            return (
              <rect
                key={i}
                x={xPos}
                y="0"
                width={wBar}
                height="26"
                fill="#d4d4d8"
                opacity={i % 4 === 0 ? 0.85 : 0.6}
              />
            );
          })}
        </g>
        <text
          x="296"
          y="126"
          fontSize="5.4"
          letterSpacing="0.6"
          fontFamily="ui-monospace, monospace"
          fill="#5f5f68"
        >
          L4G RESEARCH LLC · USA
        </text>
      </g>

      <rect
        x="2"
        y="2"
        width="396"
        height="146"
        rx="9"
        fill="none"
        stroke={hue}
        strokeOpacity="0.35"
      />
    </svg>
  );
}
