/**
 * Generates every image asset the site uses, as SVG, into /public.
 *
 *   npm run art
 *
 * Why generated rather than photographed: the brief calls for gritty, real gym
 * photography, but we will not hotlink or fabricate Ghost's product shots, and
 * this build had no licensed photo source available. So the site ships with:
 *
 *   1. Clearly-labelled placeholder cans — generic vessel, no Ghost trade
 *      dress, the word PLACEHOLDER on the label. Swap per flavor by dropping a
 *      real .jpg at public/cans/<slug>.jpg (the component prefers it).
 *   2. Duotone "editorial plates" — high-contrast gym silhouettes with film
 *      grain, desaturated into the site palette so they never fight it. Same
 *      swap rule: public/editorial/<name>.jpg wins if present.
 *
 * See public/editorial/README.md for the shot list to replace these with.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { flavors } from "../src/lib/data/flavors";

const here = dirname(fileURLToPath(import.meta.url));
const pub = resolve(here, "../public");

const INK = "#0d0d0f";
const BONE = "#f4f2ee";
const ASH = "#9b9690";
const EMBER = "#e2a03f";

function write(relPath: string, contents: string) {
  const full = resolve(pub, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents.trim() + "\n", "utf8");
}

/* -------------------------------------------------------------------------- */
/* Film grain — used as a CSS background overlay across the site               */
/* -------------------------------------------------------------------------- */

write(
  "texture/grain.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <filter id="g">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="220" height="220" filter="url(#g)"/>
</svg>`,
);

/* -------------------------------------------------------------------------- */
/* Placeholder cans                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Greedily wraps a flavor name onto the can label. Long names ("Sour
 * Watermelon", "Original Bubble Gum") otherwise run off the side of the can.
 */
function fitLabel(name: string): { lines: string[]; fontSize: number } {
  const words = name.toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 11 || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  // Archivo-ish average advance is ~0.58em; the usable label width is ~150px.
  const longest = Math.max(...lines.map((l) => l.length));
  const fontSize = Math.max(18, Math.min(34, Math.floor(150 / (longest * 0.58))));

  return { lines, fontSize };
}

function canSvg(opts: {
  slug: string;
  name: string;
  collab: string | null;
  line: "energy" | "hydration";
  caffeineMg: number;
  tone: [string, string];
}): string {
  const { name, collab, line, caffeineMg, tone } = opts;
  const id = opts.slug.replace(/[^a-z0-9]/g, "");
  const lineWord = line === "energy" ? "ENERGY" : "HYDRATION";

  const { lines, fontSize } = fitLabel(name);
  const nameTop = collab ? 262 : 244;
  const nameBlock = lines
    .map(
      (text, i) =>
        `<text x="200" y="${nameTop + i * (fontSize + 4)}" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="-0.5" fill="${BONE}">${text}</text>`,
    )
    .join("\n    ");
  const ruleY = nameTop + (lines.length - 1) * (fontSize + 4) + 26;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 640" width="400" height="640" role="img" aria-label="Placeholder can artwork for ${name}">
  <defs>
    <linearGradient id="body${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${tone[0]}"/>
      <stop offset="18%" stop-color="${tone[1]}"/>
      <stop offset="46%" stop-color="${tone[1]}"/>
      <stop offset="62%" stop-color="${tone[0]}"/>
      <stop offset="100%" stop-color="${tone[0]}"/>
    </linearGradient>
    <linearGradient id="metal${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2a2a2f"/>
      <stop offset="30%" stop-color="#6b6b73"/>
      <stop offset="55%" stop-color="#3a3a41"/>
      <stop offset="100%" stop-color="#22222a"/>
    </linearGradient>
    <filter id="grain${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="d"/>
      <feComposite operator="in" in="d" in2="SourceGraphic"/>
    </filter>
    <clipPath id="clip${id}">
      <path d="M112 96 h176 a14 14 0 0 1 14 14 v404 a14 14 0 0 1 -14 14 h-176 a14 14 0 0 1 -14 -14 v-404 a14 14 0 0 1 14 -14 z"/>
    </clipPath>
  </defs>

  <rect width="400" height="640" fill="${INK}"/>

  <!-- floor shadow: one soft ellipse, no decorative drop shadows -->
  <ellipse cx="200" cy="556" rx="104" ry="15" fill="#000" opacity="0.55"/>

  <!-- lid -->
  <ellipse cx="200" cy="96" rx="88" ry="15" fill="url(#metal${id})"/>
  <ellipse cx="200" cy="93" rx="72" ry="11" fill="#1b1b21"/>
  <ellipse cx="200" cy="93" rx="40" ry="6" fill="#2e2e36"/>

  <!-- body -->
  <path d="M112 96 h176 a14 14 0 0 1 14 14 v404 a14 14 0 0 1 -14 14 h-176 a14 14 0 0 1 -14 -14 v-404 a14 14 0 0 1 14 -14 z" fill="url(#body${id})"/>

  <g clip-path="url(#clip${id})">
    <!-- cylinder shading: darken the edges so it reads as round -->
    <rect x="98" y="96" width="34" height="432" fill="#000" opacity="0.42"/>
    <rect x="268" y="96" width="34" height="432" fill="#000" opacity="0.5"/>
    <rect x="150" y="96" width="26" height="432" fill="${BONE}" opacity="0.06"/>

    <!-- diagonal placeholder band -->
    <g transform="rotate(-38 200 300)">
      <rect x="40" y="272" width="320" height="56" fill="${INK}" opacity="0.82"/>
      <text x="200" y="308" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif"
            font-size="21" font-weight="700" letter-spacing="5" fill="${EMBER}">PLACEHOLDER</text>
    </g>

    <!-- label -->
    <text x="200" y="196" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif"
          font-size="13" font-weight="700" letter-spacing="5.5" fill="${BONE}" opacity="0.72">${lineWord}</text>
    ${
      collab
        ? `<text x="200" y="230" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif"
          font-size="14" font-weight="700" letter-spacing="3" fill="${BONE}" opacity="0.9">${collab.toUpperCase()}</text>`
        : ""
    }
    ${nameBlock}

    <line x1="140" y1="${ruleY}" x2="260" y2="${ruleY}" stroke="${BONE}" stroke-opacity="0.28"/>

    <text x="200" y="418" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif"
          font-size="12" font-weight="700" letter-spacing="3" fill="${BONE}" opacity="0.62">16 FL OZ</text>
    <text x="200" y="446" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif"
          font-size="12" font-weight="700" letter-spacing="3" fill="${BONE}" opacity="0.62">${
            caffeineMg > 0 ? `${caffeineMg} MG CAFFEINE` : "CAFFEINE FREE"
          }</text>
    <text x="200" y="474" text-anchor="middle" font-family="Archivo, Inter, Helvetica, Arial, sans-serif"
          font-size="12" font-weight="700" letter-spacing="3" fill="${BONE}" opacity="0.62">ZERO SUGAR</text>

    <rect x="98" y="96" width="204" height="432" filter="url(#grain${id})" opacity="0.1"/>
  </g>

  <!-- base rim -->
  <ellipse cx="200" cy="528" rx="88" ry="14" fill="url(#metal${id})"/>
  <ellipse cx="200" cy="528" rx="74" ry="9" fill="#15151a"/>
</svg>`;
}

for (const f of flavors) {
  write(
    `cans/${f.slug}.svg`,
    canSvg({
      slug: f.slug,
      name: f.name,
      collab: f.collab,
      line: f.line,
      caffeineMg: f.caffeineMg,
      tone: f.canTone,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Editorial plates — duotone gym silhouettes                                 */
/* -------------------------------------------------------------------------- */

function plateShell(id: string, w: number, h: number, inner: string, vignette = true): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="presentation">
  <defs>
    <linearGradient id="sky${id}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="#191920"/>
      <stop offset="55%" stop-color="#111116"/>
      <stop offset="100%" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="key${id}" cx="0.34" cy="0.22" r="0.75">
      <stop offset="0%" stop-color="#5c5c6b" stop-opacity="1"/>
      <stop offset="45%" stop-color="#2c2c36" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig${id}" cx="0.5" cy="0.45" r="0.78">
      <stop offset="58%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.7"/>
    </radialGradient>
    <filter id="grain${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <filter id="dust${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="5" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="gamma" exponent="3.4" amplitude="1.5"/></feComponentTransfer>
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#sky${id})"/>
  <rect width="${w}" height="${h}" fill="url(#key${id})"/>

  ${inner}

  <!-- airborne chalk dust catching the key light -->
  <rect width="${w}" height="${h}" filter="url(#dust${id})" opacity="0.18" fill="${BONE}"/>
  ${vignette ? `<rect width="${w}" height="${h}" fill="url(#vig${id})"/>` : ""}
  <rect width="${w}" height="${h}" filter="url(#grain${id})" opacity="0.075" style="mix-blend-mode:overlay"/>
</svg>`;
}

/** A loaded bar seen from the side, low and heavy in frame. */
function loadedBar(cx: number, cy: number, scale: number, opacity = 1): string {
  const plate = (dx: number, r: number, w: number) =>
    `<g transform="translate(${cx + dx} ${cy})">
       <rect x="${-w / 2}" y="${-r}" width="${w}" height="${r * 2}" rx="${w / 2}" fill="#0a0a0c"/>
       <rect x="${-w / 2}" y="${-r}" width="${w * 0.42}" height="${r * 2}" rx="${w / 4}" fill="#1e1e25"/>
       <ellipse cx="0" cy="0" rx="${w * 0.16}" ry="${r * 0.17}" fill="#2b2b34"/>
     </g>`;
  return `<g opacity="${opacity}" transform="translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})">
    <!-- bar -->
    <rect x="${cx - 640}" y="${cy - 9}" width="1280" height="18" rx="9" fill="#16161c"/>
    <rect x="${cx - 640}" y="${cy - 9}" width="1280" height="5" rx="2.5" fill="#3d3d47"/>
    <!-- knurl marks -->
    ${Array.from({ length: 22 }, (_, i) => `<rect x="${cx - 200 + i * 18}" y="${cy - 8}" width="2" height="16" fill="#000" opacity="0.55"/>`).join("")}
    <!-- collars -->
    <rect x="${cx - 300}" y="${cy - 22}" width="26" height="44" rx="6" fill="#101015"/>
    <rect x="${cx + 274}" y="${cy - 22}" width="26" height="44" rx="6" fill="#101015"/>
    ${plate(-370, 150, 34)}
    ${plate(-410, 150, 30)}
    ${plate(-444, 128, 22)}
    ${plate(370, 150, 34)}
    ${plate(410, 150, 30)}
    ${plate(444, 128, 22)}
  </g>`;
}

// 1. Hero — a loaded bar on the floor, shot low.
write(
  "editorial/bar-loaded.svg",
  plateShell(
    "bar",
    1920,
    1080,
    `
    <!-- back wall seam -->
    <rect x="0" y="0" width="1920" height="742" fill="#0e0e13" opacity="0.55"/>
    <rect x="0" y="740" width="1920" height="3" fill="${BONE}" opacity="0.05"/>
    <!-- platform boards -->
    ${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${744 + i * 38}" width="1920" height="2" fill="#000" opacity="0.5"/>`).join("")}
    <ellipse cx="960" cy="905" rx="620" ry="60" fill="#000" opacity="0.6"/>
    ${loadedBar(960, 760, 1)}
    `,
  ),
);

// 2. Bumper plates stacked face-on — abstract, strong circles.
write(
  "editorial/plates-stacked.svg",
  plateShell(
    "plt",
    1600,
    1000,
    `
    <g>
      ${[
        { cx: 430, cy: 560, r: 300 },
        { cx: 800, cy: 620, r: 340 },
        { cx: 1210, cy: 540, r: 280 },
      ]
        .map(
          (p, i) => `
        <circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="#0b0b0e"/>
        <circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="none" stroke="${BONE}" stroke-opacity="${0.1 + i * 0.03}" stroke-width="2"/>
        <circle cx="${p.cx}" cy="${p.cy}" r="${p.r * 0.72}" fill="none" stroke="${BONE}" stroke-opacity="0.06" stroke-width="1.5"/>
        <circle cx="${p.cx}" cy="${p.cy}" r="${p.r * 0.2}" fill="#15151b"/>
        <circle cx="${p.cx}" cy="${p.cy}" r="${p.r * 0.2}" fill="none" stroke="${ASH}" stroke-opacity="0.16" stroke-width="2"/>
      `,
        )
        .join("")}
    </g>
    <rect x="0" y="880" width="1600" height="120" fill="#08080a"/>
    <rect x="0" y="878" width="1600" height="2" fill="${BONE}" opacity="0.06"/>
    `,
  ),
);

// 3. Power rack uprights — vertical rhythm, reads instantly as a gym.
write(
  "editorial/rack-uprights.svg",
  plateShell(
    "rck",
    1600,
    1000,
    `
    ${[240, 470, 1130, 1360]
      .map(
        (x, i) => `
      <rect x="${x}" y="${-40 + i * 6}" width="78" height="1080" fill="#0a0a0d"/>
      <rect x="${x}" y="${-40 + i * 6}" width="12" height="1080" fill="#1c1c23"/>
      ${Array.from(
        { length: 26 },
        (_, j) =>
          `<circle cx="${x + 39}" cy="${60 + j * 36}" r="7" fill="#000"/><circle cx="${x + 39}" cy="${60 + j * 36}" r="7" fill="none" stroke="${ASH}" stroke-opacity="0.1"/>`,
      ).join("")}
    `,
      )
      .join("")}
    <!-- bar racked in the j-hooks -->
    <rect x="150" y="430" width="1300" height="16" rx="8" fill="#14141a"/>
    <rect x="150" y="430" width="1300" height="4" rx="2" fill="#3a3a45"/>
    <rect x="290" y="420" width="34" height="56" rx="8" fill="#0c0c10"/>
    <rect x="1280" y="420" width="34" height="56" rx="8" fill="#0c0c10"/>
    <rect x="0" y="920" width="1600" height="80" fill="#08080a"/>
    `,
  ),
);

// 4. Chalk — pure texture, for quiet full-bleed breaks.
write(
  "editorial/chalk-dust.svg",
  plateShell(
    "chk",
    1600,
    900,
    `
    <ellipse cx="800" cy="700" rx="520" ry="150" fill="#0a0a0d"/>
    <ellipse cx="800" cy="690" rx="470" ry="128" fill="#101015"/>
    <ellipse cx="800" cy="676" rx="360" ry="86" fill="#1a1a21"/>
    <g opacity="0.5">
      ${Array.from({ length: 70 }, (_, i) => {
        const x = 260 + ((i * 137) % 1080);
        const y = 180 + ((i * 311) % 480);
        const r = 1 + ((i * 7) % 4);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${BONE}" opacity="${0.05 + ((i % 5) * 0.035)}"/>`;
      }).join("")}
    </g>
    `,
    false,
  ),
);

// 5. Narrow strip for the community/TikTok band.
write(
  "editorial/strip-dark.svg",
  plateShell(
    "stp",
    1600,
    400,
    `
    ${Array.from(
      { length: 7 },
      (_, i) =>
        `<rect x="${-60 + i * 250}" y="-40" width="96" height="480" fill="#0a0a0e" opacity="${0.5 + (i % 3) * 0.15}" transform="skewX(-8)"/>`,
    ).join("")}
    <rect x="0" y="340" width="1600" height="60" fill="#08080a"/>
    `,
  ),
);

console.log(
  `Wrote ${flavors.length} placeholder cans, 5 editorial plates and 1 grain texture into /public`,
);
