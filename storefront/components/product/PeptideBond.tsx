import { cn } from "@/lib/utils";

/** Full names for the 20 standard residues, keyed by one-letter code. */
const AA: Record<string, { three: string; name: string }> = {
  A: { three: "Ala", name: "Alanine" },
  C: { three: "Cys", name: "Cysteine" },
  D: { three: "Asp", name: "Aspartic acid" },
  E: { three: "Glu", name: "Glutamic acid" },
  F: { three: "Phe", name: "Phenylalanine" },
  G: { three: "Gly", name: "Glycine" },
  H: { three: "His", name: "Histidine" },
  I: { three: "Ile", name: "Isoleucine" },
  K: { three: "Lys", name: "Lysine" },
  L: { three: "Leu", name: "Leucine" },
  M: { three: "Met", name: "Methionine" },
  N: { three: "Asn", name: "Asparagine" },
  P: { three: "Pro", name: "Proline" },
  Q: { three: "Gln", name: "Glutamine" },
  R: { three: "Arg", name: "Arginine" },
  S: { three: "Ser", name: "Serine" },
  T: { three: "Thr", name: "Threonine" },
  V: { three: "Val", name: "Valine" },
  W: { three: "Trp", name: "Tryptophan" },
  Y: { three: "Tyr", name: "Tyrosine" },
};

function label(residue: string) {
  const std = AA[residue];
  return std ? { short: residue, three: std.three, name: std.name } : { short: residue, three: residue, name: "Non-standard residue" };
}

/**
 * The residue chain: every amino acid in order, joined by the peptide bonds
 * that link them. Wraps naturally, so a 4-mer and a 43-mer both read cleanly.
 */
export function ResidueChain({
  residues,
  accent = "green",
  className,
}: {
  residues: string[];
  accent?: "green" | "teal";
  className?: string;
}) {
  const accentText = accent === "green" ? "text-brand" : "text-teal";
  const accentBorder = accent === "green" ? "border-brand/40" : "border-teal/40";

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-y-3">
        <span className="mr-2 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-subtle uppercase">
          H₂N —
        </span>

        {residues.map((r, i) => {
          const { short, three, name } = label(r);
          const isLast = i === residues.length - 1;
          return (
            <span key={`${r}-${i}`} className="flex items-center">
              <span
                title={`${i + 1}. ${name}`}
                className={cn(
                  "group/res relative grid h-9 min-w-9 place-items-center rounded-md border bg-surface-raised px-1.5 transition-colors duration-200 hover:bg-surface-raised",
                  accentBorder,
                )}
              >
                <span className={cn("font-mono text-[0.72rem] leading-none font-bold", accentText)}>
                  {short}
                </span>
                <span className="mt-0.5 font-mono text-[7px] leading-none text-subtle">
                  {three !== short ? three : i + 1}
                </span>
              </span>
              {!isLast && (
                /* The peptide bond itself — C(=O)–N(H) */
                <span
                  className="mx-0.5 h-px w-2.5 shrink-0 bg-line-strong"
                  aria-hidden
                />
              )}
            </span>
          );
        })}

        <span className="ml-2 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-subtle uppercase">
          — COOH
        </span>
      </div>
    </div>
  );
}

/**
 * The peptide bond in close-up: the amide linkage that joins any two residues.
 * Drawn to scale on one baseline so the backbone reads left to right.
 */
export function PeptideBondDiagram({
  accent = "green",
  className,
}: {
  accent?: "green" | "teal";
  className?: string;
}) {
  const hue = accent === "green" ? "#00ff66" : "#00e5ff";

  return (
    <svg
      viewBox="0 0 640 220"
      className={className}
      role="img"
      aria-label="Diagram of a peptide bond: the carboxyl carbon of one amino acid joined to the amine nitrogen of the next, releasing water."
    >
      {/* Backbone baseline */}
      <g
        stroke="#5a5a66"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M60 120 H120" />
        <path d="M120 120 H180" />
        <path d="M180 120 H240" />
        <path d="M300 120 H360" />
        <path d="M360 120 H420" />
        <path d="M420 120 H480" />
        <path d="M480 120 H540" />
      </g>

      {/* The bond being formed, highlighted */}
      <path
        d="M240 120 H300"
        stroke={hue}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Carbonyl double bonds */}
      <g stroke="#5a5a66" strokeWidth="2">
        <path d="M236 112 V78" />
        <path d="M244 112 V78" />
        <path d="M476 112 V78" />
        <path d="M484 112 V78" />
      </g>

      {/* R-group stubs */}
      <g stroke="#5a5a66" strokeWidth="2" strokeLinecap="round">
        <path d="M180 120 V162" />
        <path d="M420 120 V162" />
        <path d="M120 120 V88" />
        <path d="M360 120 V88" />
      </g>

      {/* Atom labels */}
      <g fontFamily="ui-monospace, monospace" fontSize="19" fontWeight="700" textAnchor="middle">
        <text x="60" y="127" fill="#9a9aa3">H₂N</text>
        <text x="120" y="127" fill="#d4d4d8">Cα</text>
        <text x="180" y="127" fill="#d4d4d8">C</text>
        <text x="240" y="127" fill="#d4d4d8">C</text>
        <text x="300" y="127" fill={hue}>N</text>
        <text x="360" y="127" fill="#d4d4d8">Cα</text>
        <text x="420" y="127" fill="#d4d4d8">C</text>
        <text x="480" y="127" fill="#d4d4d8">C</text>
        <text x="540" y="127" fill="#9a9aa3">OH</text>
      </g>

      {/* Substituent labels */}
      <g fontFamily="ui-monospace, monospace" fontSize="17" textAnchor="middle" fill="#9a9aa3">
        <text x="240" y="70">O</text>
        <text x="480" y="70">O</text>
        <text x="180" y="180">R¹</text>
        <text x="420" y="180">R²</text>
        <text x="120" y="78">H</text>
        <text x="360" y="78">H</text>
        <text x="300" y="152">H</text>
      </g>

      {/* Callout */}
      <g>
        <path d="M270 108 V52" stroke={hue} strokeWidth="1.5" strokeDasharray="4 4" />
        <text
          x="270"
          y="38"
          textAnchor="middle"
          fill={hue}
          fontFamily="ui-monospace, monospace"
          fontSize="15"
          letterSpacing="2"
        >
          PEPTIDE BOND
        </text>
      </g>

      {/* Residue brackets */}
      <g stroke="#3a3a44" strokeWidth="1.5" fill="none">
        <path d="M50 196 V204 H250 V196" />
        <path d="M290 196 V204 H550 V196" />
      </g>
      <g fontFamily="ui-monospace, monospace" fontSize="13" fill="#6b6b75" textAnchor="middle" letterSpacing="1.5">
        <text x="150" y="220">RESIDUE n</text>
        <text x="420" y="220">RESIDUE n+1</text>
      </g>
    </svg>
  );
}
