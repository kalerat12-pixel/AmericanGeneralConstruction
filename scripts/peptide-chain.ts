/**
 * Draws a peptide's actual primary structure as a skeletal backbone diagram.
 *
 * The backbone repeats N–Cα–C(=O) once per residue, drawn as a zig-zag with
 * the side chain branching off each Cα. Sequences are parsed from the exact
 * `Sequence` spec in data/products.ts, so each product's artwork shows its own
 * chemistry — including terminal modifiers (Ac-, -NH2, Hexenoyl-) and the
 * non-standard residues in Ipamorelin.
 */

/** IUPAC one-letter → three-letter, for the sequences written that way. */
const ONE_TO_THREE: Record<string, string> = {
  A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', E: 'Glu', Q: 'Gln',
  G: 'Gly', H: 'His', I: 'Ile', L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe',
  P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val',
};

/**
 * Side-chain terminal group per residue, drawn as a label on the branch.
 * Gly has none (its side chain is a single H), and Pro's ring closes back
 * onto the backbone nitrogen — both are flagged so the drawing stays honest.
 */
const SIDE_CHAIN: Record<string, { label: string; length: number }> = {
  Ala: { label: 'CH₃', length: 1 },
  Arg: { label: 'NH·C(NH₂)₂', length: 3 },
  Asn: { label: 'CONH₂', length: 2 },
  Asp: { label: 'COOH', length: 2 },
  Cys: { label: 'SH', length: 1 },
  Glu: { label: 'COOH', length: 3 },
  Gln: { label: 'CONH₂', length: 3 },
  Gly: { label: '', length: 0 },
  His: { label: 'imidazole', length: 2 },
  Ile: { label: 'CH(CH₃)CH₂CH₃', length: 2 },
  Leu: { label: 'CH(CH₃)₂', length: 2 },
  Lys: { label: 'NH₂', length: 4 },
  Met: { label: 'S·CH₃', length: 3 },
  Phe: { label: 'phenyl', length: 2 },
  Pro: { label: '', length: 0 },
  Ser: { label: 'OH', length: 1 },
  Thr: { label: 'OH', length: 1 },
  Trp: { label: 'indole', length: 2 },
  Tyr: { label: 'phenol', length: 2 },
  Val: { label: 'CH(CH₃)₂', length: 1 },
  // Non-standard residues that appear in this catalogue.
  Aib: { label: '(CH₃)₂', length: 1 },
  Nal: { label: 'naphthyl', length: 2 },
};

export interface Residue {
  code: string;
  /** D-configuration, as written in the Ipamorelin sequence. */
  d?: boolean;
  cyclic?: boolean;
}

export interface ParsedSequence {
  nTerm: string | null;
  cTerm: string | null;
  residues: Residue[];
  /** Non-peptide component, e.g. the copper in GHK-Cu. */
  ligand: string | null;
  truncated: boolean;
}

/** Handles both `GEPPPGKPADDAGLV` and `Aib-His-D-2-Nal-D-Phe-Lys-NH2` forms. */
export function parseSequence(spec: string, max = Infinity): ParsedSequence {
  let s = spec.trim();
  let ligand: string | null = null;

  const dot = s.indexOf('·');
  if (dot !== -1) {
    ligand = s.slice(dot + 1).trim();
    s = s.slice(0, dot).trim();
  }

  let nTerm: string | null = null;
  let cTerm: string | null = null;

  const nMatch = s.match(/^(Ac|Hexenoyl|Acetyl)-/i);
  if (nMatch) {
    nTerm = nMatch[1];
    s = s.slice(nMatch[0].length);
  }
  const cMatch = s.match(/-(NH2|OH)$/i);
  if (cMatch) {
    cTerm = cMatch[1] === 'NH2' ? 'NH₂' : cMatch[1];
    s = s.slice(0, -cMatch[0].length);
  }

  const residues: Residue[] = [];

  if (s.includes('-')) {
    // Three-letter form. 'D' and positional prefixes ('2' in "D-2-Nal") arrive
    // as their own tokens once split on the hyphen, so they are held and
    // applied to the residue token that follows.
    let pendingD = false;
    for (const raw of s.split('-')) {
      const token = raw.trim();
      if (!token) continue;
      if (token === 'D' || token === 'L') { pendingD = token === 'D'; continue; }
      if (/^\d+$/.test(token)) continue; // positional locant, not a residue
      const code = token.replace(/^\d+/, '');
      if (!code) continue;
      residues.push({ code, d: pendingD, cyclic: code === 'Pro' });
      pendingD = false;
    }
  } else {
    for (const ch of s.replace(/[^A-Z]/g, '')) {
      const code = ONE_TO_THREE[ch];
      if (code) residues.push({ code, cyclic: code === 'Pro' });
    }
  }

  const truncated = residues.length > max;
  return { nTerm, cTerm, residues: residues.slice(0, max), ligand, truncated };
}

export interface ChainOptions {
  width: number;
  height: number;
  /** Stroke and label colour. */
  color: string;
  /** Whole-drawing opacity — this is a background layer, not the subject. */
  opacity: number;
  /** Residues per row before wrapping. */
  perRow?: number;
  /** Bond length in px; sets the overall scale of the drawing. */
  bond?: number;
  showLabels?: boolean;
  /** Small caption under the drawing, e.g. the molecular formula. */
  caption?: string;
}

/**
 * Renders the backbone as SVG.
 *
 * Geometry per residue, walking left to right:
 *   N (up) → Cα (down) → C' (up), with =O rising off C' and the side chain
 *   dropping from Cα. The zig-zag is the standard skeletal convention: every
 *   vertex is an atom, and the tetrahedral angle is approximated at 120°.
 */
export function chainSvg(parsed: ParsedSequence, o: ChainOptions): string {
  const {
    width, height, color, opacity,
    perRow = 10, bond = 46, showLabels = true, caption,
  } = o;

  const dx = bond * Math.cos(Math.PI / 6); // horizontal run of one bond
  const dy = bond * Math.sin(Math.PI / 6); // vertical rise of one bond
  const rows = Math.ceil(parsed.residues.length / perRow);
  const rowHeight = bond * 3.9;
  const drawnWidth = perRow * dx * 3;
  const originX = (width - drawnWidth) / 2;
  const originY = (height - rows * rowHeight) / 2 + bond;

  const parts: string[] = [];
  const line = (x1: number, y1: number, x2: number, y2: number, w = 1.6) =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${w}"/>`;
  const text = (x: number, y: number, t: string, size: number, anchor = 'middle', weight = 400) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif">${t}</text>`;

  parsed.residues.forEach((res, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const baseX = originX + col * dx * 3;
    const baseY = originY + row * rowHeight;

    // Backbone vertices: amide N, alpha carbon, carbonyl carbon.
    const nX = baseX, nY = baseY;
    const caX = baseX + dx, caY = baseY + dy;
    const cX = baseX + dx * 2, cY = baseY;
    const nextX = baseX + dx * 3, nextY = baseY + dy;

    parts.push(line(nX, nY, caX, caY));
    parts.push(line(caX, caY, cX, cY));

    // Peptide bond into the next residue (or the C-terminus).
    const isLast = i === parsed.residues.length - 1;
    const wrapsHere = col === perRow - 1 && !isLast;
    if (!wrapsHere) parts.push(line(cX, cY, nextX, nextY));

    // Carbonyl: a double bond rising vertically off C'.
    const oY = cY - bond * 0.8;
    parts.push(line(cX - 3, cY, cX - 3, oY + 6));
    parts.push(line(cX + 3, cY, cX + 3, oY + 6));
    if (showLabels) parts.push(text(cX, oY, 'O', bond * 0.3));

    // Amide N–H.
    if (showLabels && !res.cyclic) {
      parts.push(text(nX, nY - bond * 0.24, 'H', bond * 0.24));
      parts.push(line(nX, nY - bond * 0.42, nX, nY - bond * 0.2, 1.1));
    }
    if (showLabels) parts.push(text(nX - bond * 0.26, nY + bond * 0.1, 'N', bond * 0.3));

    // Proline's ring closes onto its own backbone nitrogen.
    if (res.cyclic) {
      // Pyrrolidine: the three side-chain carbons close back onto the amide N,
      // drawn as the five-membered ring proline actually is.
      const r = bond * 0.5;
      const cxr = (nX + caX) / 2;
      const cyr = (nY + caY) / 2 + r * 0.72;
      const ring: string[] = [];
      for (let k = 0; k < 3; k++) {
        const ang = Math.PI * (0.62 + (k + 1) * 0.36);
        ring.push(`${(cxr + r * Math.cos(ang)).toFixed(1)} ${(cyr + r * Math.sin(ang)).toFixed(1)}`);
      }
      parts.push(
        `<path d="M${nX.toFixed(1)} ${nY.toFixed(1)} L${ring.join(' L')} L${caX.toFixed(1)} ${caY.toFixed(1)}" fill="none" stroke-width="1.5"/>`,
      );
    } else {
      // Side chain dropping from Cα.
      const sc = SIDE_CHAIN[res.code] ?? { label: res.code, length: 2 };
      if (sc.length > 0) {
        const len = Math.min(sc.length, 3);
        let px = caX, py = caY;
        for (let b = 0; b < len; b++) {
          const tx = px + (b % 2 === 0 ? 0 : dx * 0.55) * (b % 4 < 2 ? 1 : -1);
          const ty = py + bond * 0.5;
          parts.push(line(px, py, tx, ty, 1.4));
          px = tx; py = ty;
        }
        if (showLabels && sc.label) {
          parts.push(text(px + bond * 0.16, py + bond * 0.22, sc.label, bond * 0.22, 'start'));
        }
      }
    }

    // Residue identity, on a shared baseline per row so the names never sit
    // on top of the backbone or a side chain.
    if (showLabels) {
      const label = (res.d ? 'D-' : '') + res.code;
      parts.push(text(caX, baseY + bond * 2.5, label, bond * 0.28, 'middle', 500));
    }
  });

  // Terminal groups.
  if (parsed.residues.length) {
    const firstX = originX, firstY = originY;
    if (parsed.nTerm) {
      parts.push(line(firstX - dx, firstY - dy, firstX, firstY));
      parts.push(text(firstX - dx - bond * 0.2, firstY - dy, parsed.nTerm, bond * 0.26, 'end', 500));
    } else if (showLabels) {
      parts.push(text(firstX - bond * 0.5, firstY - bond * 0.1, 'H₂N', bond * 0.26, 'end', 500));
    }

    const lastIdx = parsed.residues.length - 1;
    const lastRow = Math.floor(lastIdx / perRow);
    const lastCol = lastIdx % perRow;
    const endX = originX + lastCol * dx * 3 + dx * 3;
    const endY = originY + lastRow * rowHeight + dy;
    parts.push(
      text(endX + bond * 0.22, endY + bond * 0.1, parsed.cTerm ?? 'OH', bond * 0.26, 'start', 500),
    );
    if (parsed.truncated) {
      parts.push(text(endX + bond * 1.2, endY + bond * 0.1, '···', bond * 0.4, 'start'));
    }
  }

  // Coordinating metal, drawn as a dative bond rather than part of the chain.
  if (parsed.ligand) {
    const cx = originX + drawnWidth / 2;
    const cy = originY + rows * rowHeight + bond * 0.9;
    parts.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(bond * 0.44).toFixed(1)}" fill="none" stroke-width="1.6"/>`,
    );
    parts.push(text(cx, cy + bond * 0.15, parsed.ligand.replace(/\s+/g, ''), bond * 0.26, 'middle', 500));
    parts.push(
      `<line x1="${cx.toFixed(1)}" y1="${(cy - bond * 0.46).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy - bond * 1.1).toFixed(1)}" stroke-width="1.2" stroke-dasharray="4 4"/>`,
    );
  }

  if (caption) {
    parts.push(
      text(width / 2, originY + rows * rowHeight + bond * (parsed.ligand ? 2.1 : 1.2), caption, bond * 0.24, 'middle', 400),
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <g stroke="${color}" fill="${color}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">
    ${parts.join('\n    ')}
  </g>
</svg>`;
}
