/**
 * Product photography for the catalogue.
 *
 * Each plate is a studio still of the vial standing on a seamless warm sweep,
 * with that product's own peptide backbone drawn faintly across the ground —
 * parsed from the `Sequence` spec in data/products.ts, so the artwork behind
 * BPC-157 is BPC-157's chemistry and nobody else's.
 *
 * The glass is built the way a real render would be: the background is
 * sampled, inverted and compressed to stand in for refraction, masked to the
 * vial body, then the speculars, cap, label, contact shadow and reflection go
 * on top. Nothing here is a photograph — see the note in CREDITS.md.
 *
 * Run: npm run gen:plates
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { products, type Product } from '../data/products';
import { parseSequence, chainSvg } from './peptide-chain';
import { makeNoise, fbm, clamp01, smoothstep, mix } from '../lib/noise';

const ROOT = process.cwd();
const IMG = path.join(ROOT, 'public', 'images');
fs.mkdirSync(IMG, { recursive: true });

const W = 1200;
const H = 1500;

type RGB = [number, number, number];
const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16),
];
const blend = (a: RGB, b: RGB, t: number): RGB =>
  [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

const ALABASTER = hex('#F7F4EF');
const BONE = hex('#EDE7DE');
const CHAMPAGNE = '#C9A961';

/* ------------------------------------------------------------------ *
 * The sweep the vial stands on
 * ------------------------------------------------------------------ */

/**
 * A seamless cyclorama: wall falling into table with no visible seam, lit by
 * one soft key from the upper left. This is what makes it read as a product
 * shot rather than an object pasted onto a texture.
 */
function sweep(seed: number, dark: boolean) {
  const n = makeNoise(seed);
  const grain = makeNoise(seed + 5);
  const buf = Buffer.allocUnsafe(W * H * 3);
  const horizon = 0.63;

  let i = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;

      let c: RGB = dark ? hex('#1B1E24') : blend(ALABASTER, BONE, 0.35);

      // The curve of the sweep: the ground darkens as it recedes, and the
      // table plane lifts slightly toward the viewer.
      if (v < horizon) {
        c = blend(c, dark ? hex('#0F1216') : hex('#DCD3C4'), smoothstep(horizon, 0.12, v) * 0.55);
      } else {
        const t = (v - horizon) / (1 - horizon);
        c = blend(c, dark ? hex('#23262C') : hex('#E6DED1'), smoothstep(0, 0.6, t) * 0.5);
        c = blend(c, dark ? hex('#0C0E12') : hex('#C9BFAE'), smoothstep(0.55, 1, t) * 0.45);
      }

      // Key light, upper left, wide and soft.
      const kx = (u - 0.3) * 1.25;
      const ky = (v - 0.24) * 1.05;
      const key = Math.exp(-(kx * kx + ky * ky) * 2.1);
      c = blend(c, dark ? hex('#4A4436') : hex('#FFFCF4'), key * (dark ? 0.3 : 0.55));

      // Cool fill from the right keeps the shadow side from going muddy.
      const fx = (u - 0.94) * 1.6;
      const fy = (v - 0.5) * 1.2;
      c = blend(c, dark ? hex('#2A3038') : hex('#EFEDE9'), Math.exp(-(fx * fx + fy * fy) * 2.4) * 0.22);

      // Very slight unevenness so the gradient doesn't band.
      const drift = fbm(n, u * 1.6, v * 1.6, 3) * 0.5 + 0.5;
      c = blend(c, dark ? hex('#171A1F') : hex('#E9E1D4'), drift * 0.1);

      const g = grain(x * 0.75, y * 0.75) * (dark ? 2.2 : 2.6);
      buf[i++] = clamp01((c[0] + g) / 255) * 255;
      buf[i++] = clamp01((c[1] + g) / 255) * 255;
      buf[i++] = clamp01((c[2] + g) / 255) * 255;
    }
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } });
}

/* ------------------------------------------------------------------ *
 * Vial geometry — shared by the silhouette mask and the glass overlay
 * ------------------------------------------------------------------ */

interface Vial {
  x0: number; x1: number; cx: number;
  capTop: number; capH: number; neckTop: number; neckBot: number;
  shoulder: number; by: number; nw: number; vw: number; vh: number;
  rot: number;
}

function geometry(angled: boolean): Vial {
  const vw = angled ? W * 0.275 : W * 0.25;
  const vh = angled ? H * 0.64 : H * 0.7;
  const cx = angled ? W * 0.52 : W * 0.5;
  const cy = angled ? H * 0.5 : H * 0.49;
  const y0 = cy - vh / 2;
  return {
    vw, vh, cx,
    x0: cx - vw / 2, x1: cx + vw / 2,
    capTop: y0,
    capH: vh * 0.082,
    neckTop: y0 + vh * 0.082,
    neckBot: y0 + vh * 0.2,
    shoulder: y0 + vh * 0.3,
    by: y0 + vh,
    nw: vw * 0.2,
    rot: angled ? -7 : 0,
  };
}

/** The closed outline of the glass body, from the neck down to the base. */
function bodyPath(v: Vial) {
  const r = v.vw * 0.075;
  const s = v.vh * 0.05;
  const f = (n: number) => n.toFixed(1);
  return [
    `M${f(v.cx - v.nw)} ${f(v.neckTop)}`,
    `L${f(v.cx - v.nw)} ${f(v.neckBot)}`,
    `C${f(v.cx - v.nw)} ${f(v.neckBot + s)} ${f(v.x0)} ${f(v.shoulder - s)} ${f(v.x0)} ${f(v.shoulder)}`,
    `L${f(v.x0)} ${f(v.by - r)}`,
    `Q${f(v.x0)} ${f(v.by)} ${f(v.x0 + r)} ${f(v.by)}`,
    `L${f(v.x1 - r)} ${f(v.by)}`,
    `Q${f(v.x1)} ${f(v.by)} ${f(v.x1)} ${f(v.by - r)}`,
    `L${f(v.x1)} ${f(v.shoulder)}`,
    `C${f(v.x1)} ${f(v.shoulder - s)} ${f(v.cx + v.nw)} ${f(v.neckBot + s)} ${f(v.cx + v.nw)} ${f(v.neckBot)}`,
    `L${f(v.cx + v.nw)} ${f(v.neckTop)}`,
    'Z',
  ].join(' ');
}

const rotate = (v: Vial) =>
  v.rot ? ` transform="rotate(${v.rot} ${v.cx.toFixed(1)} ${(v.capTop + v.vh / 2).toFixed(1)})"` : '';

/* ------------------------------------------------------------------ *
 * Glass, cap, label
 * ------------------------------------------------------------------ */

function glassSvg(v: Vial, o: { amber: boolean; cake: string; label: string; size: string; sequence: string }) {
  const f = (n: number) => n.toFixed(1);
  const body = bodyPath(v);
  const labelTop = v.capTop + v.vh * 0.42;
  const labelH = v.vh * 0.3;
  const labelX = v.x0 + v.vw * 0.085;
  const labelW = v.vw * 0.83;
  const glassEdge = o.amber ? '#5C3A16' : '#4A463E';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <!-- Transmission through the glass wall: darkest at the rims where the
       light path through the glass is longest. -->
  <linearGradient id="tint" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${o.amber ? '#2A1503' : '#3B3831'}" stop-opacity="${o.amber ? 0.95 : 0.72}"/>
    <stop offset="5%"   stop-color="${o.amber ? '#5E3308' : '#6E695E'}" stop-opacity="${o.amber ? 0.86 : 0.5}"/>
    <stop offset="14%"  stop-color="${o.amber ? '#9A5C14' : '#A9A396'}" stop-opacity="${o.amber ? 0.6 : 0.24}"/>
    <stop offset="30%"  stop-color="${o.amber ? '#C98A2E' : '#DFDACE'}" stop-opacity="${o.amber ? 0.42 : 0.12}"/>
    <stop offset="46%"  stop-color="${o.amber ? '#B87A22' : '#C9C3B6'}" stop-opacity="${o.amber ? 0.52 : 0.18}"/>
    <stop offset="64%"  stop-color="${o.amber ? '#9A5C14' : '#98928６'.replace('６','6')}" stop-opacity="${o.amber ? 0.66 : 0.3}"/>
    <stop offset="84%"  stop-color="${o.amber ? '#5A3007' : '#5F5A50'}" stop-opacity="${o.amber ? 0.86 : 0.54}"/>
    <stop offset="100%" stop-color="${o.amber ? '#241202' : '#332F29'}" stop-opacity="${o.amber ? 0.97 : 0.76}"/>
  </linearGradient>

  <!-- Vertical falloff: brighter at the shoulder, denser toward the base. -->
  <linearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="${o.amber ? '#FFE0A8' : '#FFFFFF'}" stop-opacity="0.3"/>
    <stop offset="18%"  stop-color="#FFFFFF" stop-opacity="0.06"/>
    <stop offset="62%"  stop-color="${o.amber ? '#3A1E05' : '#33302A'}" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="${o.amber ? '#1C0E02' : '#232019'}" stop-opacity="0.42"/>
  </linearGradient>

  <!-- The bright core where the key passes through the cylinder. -->
  <radialGradient id="caustic" cx="0.34" cy="0.42" r="0.42">
    <stop offset="0%"   stop-color="${o.amber ? '#FFD79A' : '#FFFFFF'}" stop-opacity="0.5"/>
    <stop offset="60%"  stop-color="${o.amber ? '#E8A94E' : '#EFEBE2'}" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="${o.amber ? '#E8A94E' : '#EFEBE2'}" stop-opacity="0"/>
  </radialGradient>

  <!-- Speculars fall off rather than ending as hard stripes. -->
  <linearGradient id="specA" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0"/>
    <stop offset="45%"  stop-color="#FFFFFF" stop-opacity="0.88"/>
    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="specFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0"/>
    <stop offset="14%"  stop-color="#FFFFFF" stop-opacity="1"/>
    <stop offset="78%"  stop-color="#FFFFFF" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <mask id="specMask">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#specFade)"/>
  </mask>

  <linearGradient id="cap" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#6E6A61" stop-opacity="0.95"/>
    <stop offset="12%"  stop-color="#CFC9BD" stop-opacity="0.98"/>
    <stop offset="30%"  stop-color="#F6F3EC" stop-opacity="1"/>
    <stop offset="46%"  stop-color="#A8A296" stop-opacity="0.98"/>
    <stop offset="62%"  stop-color="#E4DFD5" stop-opacity="1"/>
    <stop offset="82%"  stop-color="#8B8579" stop-opacity="0.96"/>
    <stop offset="100%" stop-color="#5D584F" stop-opacity="0.95"/>
  </linearGradient>

  <linearGradient id="flip" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${CHAMPAGNE}" stop-opacity="0.7"/>
    <stop offset="26%"  stop-color="#E8D3A2" stop-opacity="0.95"/>
    <stop offset="55%"  stop-color="${CHAMPAGNE}" stop-opacity="1"/>
    <stop offset="100%" stop-color="#8E7238" stop-opacity="0.92"/>
  </linearGradient>

  <linearGradient id="cake" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.5"/>
    <stop offset="22%"  stop-color="${o.cake}" stop-opacity="0.96"/>
    <stop offset="100%" stop-color="${o.cake}" stop-opacity="0.99"/>
  </linearGradient>

  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#E4DFD6" stop-opacity="0.97"/>
    <stop offset="18%"  stop-color="#FCFAF6" stop-opacity="0.99"/>
    <stop offset="72%"  stop-color="#F6F2EA" stop-opacity="0.99"/>
    <stop offset="100%" stop-color="#D8D2C7" stop-opacity="0.97"/>
  </linearGradient>

  <linearGradient id="labelEdgeL" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${glassEdge}" stop-opacity="0.34"/>
    <stop offset="100%" stop-color="${glassEdge}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="labelEdgeR" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${glassEdge}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${glassEdge}" stop-opacity="0.4"/>
  </linearGradient>

  <clipPath id="bodyClip"><path d="${body}"/></clipPath>
</defs>

<g${rotate(v)}>
  <g clip-path="url(#bodyClip)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#tint)"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#depth)"/>
    <rect x="${f(v.x0)}" y="${f(v.shoulder)}" width="${f(v.vw)}" height="${f(v.by - v.shoulder)}" fill="url(#caustic)"/>

    <!-- Lyophilised cake, settled and slightly domed. -->
    <path d="M${f(v.x0)} ${f(v.by - v.vh * 0.085)} Q${f(v.cx)} ${f(v.by - v.vh * 0.105)} ${f(v.x1)} ${f(v.by - v.vh * 0.085)} L${f(v.x1)} ${f(v.by)} L${f(v.x0)} ${f(v.by)} Z" fill="url(#cake)"/>
    <!-- Meniscus of light where the cake meets the glass. -->
    <path d="M${f(v.x0)} ${f(v.by - v.vh * 0.085)} Q${f(v.cx)} ${f(v.by - v.vh * 0.105)} ${f(v.x1)} ${f(v.by - v.vh * 0.085)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="2"/>

    <!-- Base thickness: the punt reads as a dark band with a bright rim. -->
    <rect x="${f(v.x0)}" y="${f(v.by - v.vh * 0.035)}" width="${f(v.vw)}" height="${f(v.vh * 0.035)}"
          fill="${glassEdge}" fill-opacity="0.42"/>
    <rect x="${f(v.x0)}" y="${f(v.by - v.vh * 0.042)}" width="${f(v.vw)}" height="3"
          fill="#FFFFFF" fill-opacity="0.5"/>

    <!-- Speculars. The narrow one is the key's edge, the broad one its core. -->
    <g mask="url(#specMask)">
      <rect x="${f(v.x0 + v.vw * 0.06)}" y="${f(v.neckBot)}"
            width="${f(v.vw * 0.1)}" height="${f(v.by - v.neckBot)}" fill="url(#specA)" opacity="0.95"/>
      <rect x="${f(v.x0 + v.vw * 0.19)}" y="${f(v.shoulder)}"
            width="${f(v.vw * 0.06)}" height="${f(v.by - v.shoulder)}" fill="url(#specA)" opacity="0.4"/>
      <rect x="${f(v.x1 - v.vw * 0.15)}" y="${f(v.shoulder)}"
            width="${f(v.vw * 0.07)}" height="${f(v.by - v.shoulder)}" fill="url(#specA)" opacity="0.5"/>
    </g>

    <!-- Shoulder catch light. -->
    <path d="M${f(v.x0 + v.vw * 0.1)} ${f(v.shoulder + v.vh * 0.008)} Q${f(v.cx)} ${f(v.shoulder - v.vh * 0.03)} ${f(v.x1 - v.vw * 0.1)} ${f(v.shoulder + v.vh * 0.008)}"
          fill="none" stroke="#FFFFFF" stroke-opacity="0.38" stroke-width="${f(v.vh * 0.008)}"/>
  </g>

  <!-- Outline last so the silhouette stays crisp over the refraction. -->
  <path d="${body}" fill="none" stroke="${glassEdge}" stroke-opacity="0.5" stroke-width="1.6"/>

  <!-- Neck -->
  <rect x="${f(v.cx - v.nw)}" y="${f(v.neckTop)}" width="${f(v.nw * 2)}" height="${f(v.neckBot - v.neckTop)}"
        fill="${o.amber ? '#7A4A18' : '#B0AA9E'}" fill-opacity="0.3"/>
  <rect x="${f(v.cx - v.nw * 0.72)}" y="${f(v.neckTop)}" width="${f(v.nw * 0.3)}" height="${f(v.neckBot - v.neckTop)}"
        fill="#FFFFFF" fill-opacity="0.42"/>

  <!-- Aluminium crimp collar, fluted. -->
  <rect x="${f(v.cx - v.nw * 1.3)}" y="${f(v.neckTop - v.capH * 0.08)}"
        width="${f(v.nw * 2.6)}" height="${f(v.vh * 0.072)}" rx="2" fill="url(#cap)"/>
  ${Array.from({ length: 11 }, (_, k) => {
    const x = v.cx - v.nw * 1.24 + (k * v.nw * 2.48) / 10;
    return `<line x1="${f(x)}" y1="${f(v.neckTop - v.capH * 0.04)}" x2="${f(x)}" y2="${f(v.neckTop + v.vh * 0.064)}" stroke="#3E3A33" stroke-opacity="0.16" stroke-width="1"/>`;
  }).join('')}
  <rect x="${f(v.cx - v.nw * 1.3)}" y="${f(v.neckTop - v.capH * 0.08)}"
        width="${f(v.nw * 2.6)}" height="2.5" fill="#FFFFFF" fill-opacity="0.55"/>

  <!-- Flip-top, in champagne to tie the vial to the brand. -->
  <rect x="${f(v.cx - v.nw * 1.16)}" y="${f(v.capTop + v.capH * 0.34)}" width="${f(v.nw * 2.32)}"
        height="${f(v.capH * 0.68)}" rx="${f(v.vw * 0.018)}" fill="url(#flip)"/>
  <ellipse cx="${f(v.cx)}" cy="${f(v.capTop + v.capH * 0.34)}" rx="${f(v.nw * 1.16)}" ry="${f(v.capH * 0.17)}"
           fill="#E8D3A2"/>
  <ellipse cx="${f(v.cx)}" cy="${f(v.capTop + v.capH * 0.32)}" rx="${f(v.nw * 0.82)}" ry="${f(v.capH * 0.11)}"
           fill="#FFF6E2" fill-opacity="0.55"/>

  <!-- Label -->
  <rect x="${f(labelX)}" y="${f(labelTop)}" width="${f(labelW)}" height="${f(labelH)}" fill="url(#paper)"/>
  <rect x="${f(labelX)}" y="${f(labelTop)}" width="${f(labelW)}" height="2" fill="#FFFFFF" fill-opacity="0.85"/>
  <rect x="${f(labelX)}" y="${f(labelTop + labelH - 2)}" width="${f(labelW)}" height="2" fill="#000000" fill-opacity="0.1"/>
  <rect x="${f(labelX)}" y="${f(labelTop)}" width="${f(labelW)}" height="${f(labelH)}"
        fill="none" stroke="${CHAMPAGNE}" stroke-opacity="0.5" stroke-width="1"/>

  <text x="${f(v.cx)}" y="${f(labelTop + labelH * 0.245)}" text-anchor="middle"
        font-family="Georgia,'Times New Roman',serif" font-size="${f(v.vw * 0.098)}"
        letter-spacing="${f(v.vw * 0.032)}" fill="#1C1A17">L4G</text>
  <line x1="${f(labelX + labelW * 0.3)}" y1="${f(labelTop + labelH * 0.33)}"
        x2="${f(labelX + labelW * 0.7)}" y2="${f(labelTop + labelH * 0.33)}"
        stroke="${CHAMPAGNE}" stroke-opacity="0.85" stroke-width="1"/>
  <text x="${f(v.cx)}" y="${f(labelTop + labelH * 0.53)}" text-anchor="middle"
        font-family="Helvetica,Arial,sans-serif" font-size="${f(v.vw * 0.082)}"
        letter-spacing="${f(v.vw * 0.006)}" fill="#1C1A17" font-weight="500">${o.label}</text>
  <text x="${f(v.cx)}" y="${f(labelTop + labelH * 0.67)}" text-anchor="middle"
        font-family="Helvetica,Arial,sans-serif" font-size="${f(v.vw * 0.05)}"
        letter-spacing="${f(v.vw * 0.014)}" fill="#6B655C">${o.sequence}</text>
  <text x="${f(v.cx)}" y="${f(labelTop + labelH * 0.845)}" text-anchor="middle"
        font-family="Helvetica,Arial,sans-serif" font-size="${f(v.vw * 0.054)}"
        letter-spacing="${f(v.vw * 0.02)}" fill="#1C1A17">${o.size}</text>
  <text x="${f(v.cx)}" y="${f(labelTop + labelH * 0.945)}" text-anchor="middle"
        font-family="Helvetica,Arial,sans-serif" font-size="${f(v.vw * 0.036)}"
        letter-spacing="${f(v.vw * 0.024)}" fill="#8A8378">RESEARCH USE ONLY</text>

  <!-- Glass curvature over the label edges. -->
  <rect x="${f(labelX)}" y="${f(labelTop)}" width="${f(labelW * 0.16)}" height="${f(labelH)}"
        fill="url(#labelEdgeL)"/>
  <rect x="${f(labelX + labelW * 0.84)}" y="${f(labelTop)}" width="${f(labelW * 0.16)}" height="${f(labelH)}"
        fill="url(#labelEdgeR)"/>
</g>
</svg>`;
}

/** Contact shadow and the reflection the vial casts down the sweep. */
function groundSvg(v: Vial, dark: boolean) {
  const f = (n: number) => n.toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="cast" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%"  stop-color="${dark ? '#000000' : '#463C2E'}" stop-opacity="${dark ? 0.6 : 0.34}"/>
    <stop offset="45%" stop-color="${dark ? '#000000' : '#463C2E'}" stop-opacity="${dark ? 0.24 : 0.14}"/>
    <stop offset="100%" stop-color="${dark ? '#000000' : '#463C2E'}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="contact" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%"  stop-color="${dark ? '#000000' : '#2E2618'}" stop-opacity="0.72"/>
    <stop offset="100%" stop-color="${dark ? '#000000' : '#2E2618'}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.16"/>
    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
</defs>
  <!-- Long soft cast to the lower right, away from the key. -->
  <ellipse cx="${f(v.cx + v.vw * 0.42)}" cy="${f(v.by + v.vw * 0.1)}"
           rx="${f(v.vw * 1.5)}" ry="${f(v.vw * 0.3)}" fill="url(#cast)"/>
  <!-- Tight dark line where the glass actually meets the surface. -->
  <ellipse cx="${f(v.cx)}" cy="${f(v.by + 3)}" rx="${f(v.vw * 0.52)}" ry="${f(v.vw * 0.075)}" fill="url(#contact)"/>
  <!-- Reflection in the polished sweep. -->
  <rect x="${f(v.x0 + v.vw * 0.06)}" y="${f(v.by)}" width="${f(v.vw * 0.88)}" height="${f(v.vh * 0.2)}" fill="url(#refl)"/>
</svg>`;
}

/* ------------------------------------------------------------------ *
 * Plate assembly
 * ------------------------------------------------------------------ */

const cakeColour = (p: Product) => {
  const appearance = p.specs.find((s) => s.label === 'Appearance')?.value ?? '';
  if (/blue/i.test(appearance)) return '#2F4F8F';   // GHK-Cu's copper complex
  if (/off-white/i.test(appearance)) return '#EFE9DC';
  return '#F4F0E7';
};

/** One-letter sequence for the label, trimmed to fit. */
const shortSequence = (p: Product) => {
  const raw = p.specs.find((s) => s.label === 'Sequence')?.value ?? '';
  const core = raw.replace(/·.*$/, '').replace(/^(Ac|Hexenoyl)-/i, '').replace(/-(NH2|OH)$/i, '');
  if (core.includes('-')) return core.split('-').slice(0, 3).join('-');
  return core.length > 18 ? `${core.slice(0, 17)}…` : core;
};

async function plate(p: Product, variant: 0 | 1) {
  const angled = variant === 1;
  // Amber is the house vial, but a coloured cake needs flint glass to read —
  // GHK-Cu's deep blue would go brown behind amber.
  const appearance = p.specs.find((s) => s.label === 'Appearance')?.value ?? '';
  const amber = !/blue|yellow|pink/i.test(appearance);
  const v = geometry(angled);
  const seed = 400 + p.id.charCodeAt(3) * 7 + variant * 31;
  const seq = p.specs.find((s) => s.label === 'Sequence')?.value ?? '';
  const formula = p.specs.find((s) => s.label === 'Molecular formula')?.value ?? '';

  // 1 — ground
  const ground = await sweep(seed, false).png().toBuffer();

  // 2 — this peptide's backbone, drawn across the sweep
  const parsed = parseSequence(seq, 18);
  const perRow = parsed.residues.length <= 4 ? parsed.residues.length : parsed.residues.length <= 8 ? 4 : 6;
  const chain = Buffer.from(
    chainSvg(parsed, {
      width: W, height: H, color: '#8A7038', opacity: angled ? 0.16 : 0.19,
      perRow, bond: parsed.residues.length <= 4 ? 82 : 62,
      caption: formula,
    }),
  );
  const withChain = await sharp(ground)
    .composite([{ input: await sharp(chain).png().toBuffer(), blend: 'over' }])
    .png()
    .toBuffer();

  // 3 — refraction: the sweep behind the vial, inverted and compressed the way
  //     a cylinder of glass bends it, then masked to the body silhouette.
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g${rotate(v)}><path d="${bodyPath(v)}" fill="#fff"/></g></svg>`;
  const mask = await sharp(Buffer.from(maskSvg)).png().toBuffer();
  const refracted = await sharp(
    await sharp(withChain)
      .flop()
      .resize({ width: Math.round(W * 0.82), height: H, fit: 'fill' })
      .extend({
        left: Math.round(W * 0.09), right: W - Math.round(W * 0.82) - Math.round(W * 0.09),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .blur(4)
      .modulate({ brightness: amber ? 0.5 : 0.86, saturation: amber ? 0.55 : 0.8 })
      .tint(amber ? { r: 176, g: 116, b: 40 } : { r: 226, g: 222, b: 212 })
      .png()
      .toBuffer(),
  )
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 4 — assemble: ground shadow, refraction, then the glass over it
  const out = await sharp(withChain)
    .composite([
      { input: Buffer.from(groundSvg(v, false)), blend: 'over' },
      { input: refracted, blend: 'over' },
      {
        // Rendered at 2x and resampled down — librsvg drops the hairlines on
        // the crimp flutes and the label rule at final size.
        input: await sharp(
          await sharp(
            Buffer.from(
              glassSvg(v, {
                amber,
                cake: cakeColour(p),
                label: p.name.toUpperCase().replace(/\s*\(.*\)/, ''),
                size: p.sizes[0].amount,
                sequence: shortSequence(p),
              }),
            ),
          )
            .resize({ width: W * 2 })
            .png()
            .toBuffer(),
        )
          .resize({ width: W })
          .png()
          .toBuffer(),
        blend: 'over',
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  // 5 — final grade: gentle vignette so the eye lands on the vial
  const vignette = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><radialGradient id="v" cx="0.5" cy="0.44" r="0.72">
        <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#3A3226" stop-opacity="0.3"/>
      </radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#v)"/>
    </svg>`,
  );

  const file = `${p.slug}-0${variant + 1}.jpg`;
  await sharp(out)
    .composite([{ input: vignette, blend: 'over' }])
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(IMG, file));
  console.log('  ✓', file, `— ${parsed.residues.length}${parsed.truncated ? '+' : ''} residues drawn`);
}

async function main() {
  const only = process.argv[2];
  for (const p of products) {
    if (only && p.slug !== only) continue;
    await plate(p, 0);
    await plate(p, 1);
  }
}

main();
