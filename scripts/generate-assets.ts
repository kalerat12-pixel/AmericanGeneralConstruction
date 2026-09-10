/**
 * Build-time image generator for the site's textures and scene plates.
 *
 * Product photography lives in generate-product-plates.ts — it needs each
 * product's sequence, so it reads data/products.ts rather than a manifest here.
 *
 * The session that built this site has no egress to Unsplash (or any other
 * photo host), so every plate here is synthesised: warm stone, coastal light
 * and linen, in the brand palette. `npm run fetch:photos` swaps them for the
 * real Unsplash frames listed in CREDITS.md wherever that host is reachable.
 *
 * Run: npm run gen:assets
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { makeNoise, fbm, ridged, clamp01, smoothstep, mix, mulberry32 } from '../lib/noise';

const ROOT = process.cwd();
const IMG = path.join(ROOT, 'public', 'images');
const TEX = path.join(ROOT, 'public', 'textures');
fs.mkdirSync(IMG, { recursive: true });
fs.mkdirSync(TEX, { recursive: true });

type RGB = [number, number, number];
const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const blend = (a: RGB, b: RGB, t: number): RGB => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

const ALABASTER = hex('#F7F4EF');
const BONE = hex('#EDE7DE');
const CHARCOAL = hex('#1C1A17');
const MIDNIGHT = hex('#14181F');
const CHAMPAGNE = hex('#C9A961');
const SAGE = hex('#A8B5A6');

type Shader = (x: number, y: number, w: number, h: number) => RGB;

async function render(
  file: string,
  w: number,
  h: number,
  shader: Shader,
  opts: { quality?: number; dir?: string } = {},
) {
  const buf = Buffer.allocUnsafe(w * h * 3);
  let i = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = shader(x, y, w, h);
      buf[i++] = c[0] < 0 ? 0 : c[0] > 255 ? 255 : c[0];
      buf[i++] = c[1] < 0 ? 0 : c[1] > 255 ? 255 : c[1];
      buf[i++] = c[2] < 0 ? 0 : c[2] > 255 ? 255 : c[2];
    }
  }
  const out = path.join(opts.dir ?? IMG, file);
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: opts.quality ?? 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(out);
  console.log('  ✓', path.relative(ROOT, out));
}

/* ------------------------------------------------------------------ *
 * Stone
 * ------------------------------------------------------------------ */

/** Carrara-style marble: warm ground, domain-warped grey veining. */
function marbleShader(seed: number, scale: number, contrast = 1): Shader {
  const n1 = makeNoise(seed);
  const n2 = makeNoise(seed + 101);
  const n3 = makeNoise(seed + 202);
  const grain = makeNoise(seed + 303);
  const vein: RGB = [150, 145, 138];
  const veinSoft: RGB = [196, 190, 181];
  const warm: RGB = [214, 200, 176];

  return (x, y) => {
    const u = (x / scale) * 1.0;
    const v = (y / scale) * 1.0;

    // A gentle two-stage warp: enough to make veins wander, not enough to
    // curdle them. Carrara reads as a mostly open white field.
    const wx = u + 0.95 * fbm(n1, u * 0.42, v * 0.42, 4);
    const wy = v + 0.95 * fbm(n2, u * 0.42 + 5.2, v * 0.42 + 1.3, 4);
    const w2x = wx + 0.34 * fbm(n3, wx * 1.1, wy * 1.1, 3);

    const r = ridged(n1, w2x * 0.55, wy * 0.55, 5);
    const primary = smoothstep(0.90, 0.995, r) * contrast;
    const secondary = smoothstep(0.80, 0.95, ridged(n2, w2x * 1.15 + 3, wy * 1.15, 4)) * 0.5;
    const mineral = smoothstep(0.74, 0.98, fbm(n3, wx * 0.35, wy * 0.35, 3) * 0.5 + 0.5) * 0.14;

    let c = blend(ALABASTER, BONE, clamp01(fbm(n2, u * 0.28, v * 0.28, 3) * 0.5 + 0.5) * 0.4);
    c = blend(c, veinSoft, clamp01(secondary * 0.7));
    c = blend(c, vein, clamp01(primary));
    c = blend(c, warm, clamp01(mineral));

    const g = grain(x * 0.7, y * 0.7) * 2.6;
    return [c[0] + g, c[1] + g, c[2] + g];
  };
}

/** Travertine: horizontal bedding planes with an open, pitted surface. */
function travertineShader(seed: number, scale: number): Shader {
  const n1 = makeNoise(seed);
  const n2 = makeNoise(seed + 51);
  const pit = makeNoise(seed + 77);
  const grain = makeNoise(seed + 91);
  const light: RGB = [231, 219, 201];
  const mid: RGB = [206, 190, 168];
  const deep: RGB = [176, 158, 134];

  return (x, y) => {
    const u = x / scale;
    const v = y / scale;
    // Bedding: strong horizontal stretch, gentle vertical variation.
    const band = fbm(n1, u * 0.7, v * 9.0, 5) * 0.5 + 0.5;
    const streak = fbm(n2, u * 0.4 + 9, v * 22, 4) * 0.5 + 0.5;

    let c = blend(light, mid, clamp01(band));
    c = blend(c, deep, clamp01(smoothstep(0.58, 0.92, streak) * 0.55));
    c = blend(c, light, clamp01(smoothstep(0.62, 0.98, 1 - streak) * 0.35));

    // Vugs — the small elongated voids travertine is known for.
    const p = fbm(pit, u * 16, v * 42, 3) * 0.5 + 0.5;
    const hole = smoothstep(0.70, 0.86, p);
    c = blend(c, [150, 133, 111], hole * 0.7);
    c = blend(c, [246, 239, 227], smoothstep(0.70, 0.88, 1 - p) * 0.25);

    const g = grain(x * 0.9, y * 0.9) * 3.2;
    return [c[0] + g, c[1] + g, c[2] + g];
  };
}

/** Linen: two perpendicular thread runs plus fibre noise. */
function linenShader(seed: number, threads: number): Shader {
  const fib = makeNoise(seed);
  const slub = makeNoise(seed + 13);
  const base: RGB = [237, 231, 222];
  const shade: RGB = [206, 197, 184];

  return (x, y) => {
    const warp = Math.sin((x / threads) * Math.PI * 2) * 0.5 + 0.5;
    const weft = Math.sin((y / threads) * Math.PI * 2) * 0.5 + 0.5;
    // Over/under alternation reads as the weave rather than a grid.
    const over = ((Math.floor(x / threads) + Math.floor(y / threads)) & 1) === 0;
    const weave = over ? warp * 0.75 + weft * 0.25 : weft * 0.75 + warp * 0.25;

    const fibre = fbm(fib, x * 0.25, y * 0.25, 3) * 0.5 + 0.5;
    const slubs = smoothstep(0.72, 0.98, fbm(slub, x * 0.01, y * 0.06, 3) * 0.5 + 0.5);

    let c = blend(shade, base, clamp01((weave - 0.5) * 1.9 + 0.5) * 0.78 + fibre * 0.22);
    c = blend(c, shade, slubs * 0.5);
    // Thread shadow in the interlace gutters.
    const gutter = Math.min(
      Math.abs(((x / threads) % 1) - 0.5),
      Math.abs(((y / threads) % 1) - 0.5),
    );
    return blend(c, [190, 180, 166], smoothstep(0.34, 0.5, 0.5 - gutter) * 0.22);
  };
}

/* ------------------------------------------------------------------ *
 * Light and water
 * ------------------------------------------------------------------ */

/** Mediterranean coast near dusk — haze, headlands, a calm sea. */
function coastShader(seed: number, horizon = 0.56): Shader {
  const n = makeNoise(seed);
  const n2 = makeNoise(seed + 31);
  const grain = makeNoise(seed + 47);

  const skyTop: RGB = [122, 128, 134];
  const skyMid: RGB = [210, 196, 176];
  const skyLow: RGB = [240, 214, 180];
  const seaFar: RGB = [138, 143, 139];
  const seaNear: RGB = [74, 82, 84];
  const land: RGB = [70, 68, 63];
  const landFar: RGB = [150, 148, 142];

  return (x, y, w, h) => {
    const u = x / w;
    const v = y / h;
    const hz = horizon;

    if (v < hz) {
      const t = v / hz;
      let c = blend(skyMid, skyTop, smoothstep(0.0, 0.72, 1 - t));
      c = blend(c, skyLow, smoothstep(0.55, 1.0, t));
      // A low sun off to the right, felt as a warm bloom rather than a disc.
      const dx = (u - 0.72) * 1.7;
      const dy = (v - hz * 0.86) * 2.6;
      const glow = Math.exp(-(dx * dx + dy * dy) * 3.4);
      c = blend(c, [252, 232, 200], glow * 0.72);
      // Cloud haze, stretched flat.
      const haze = fbm(n, u * 3.2, v * 7.0, 4) * 0.5 + 0.5;
      c = blend(c, [244, 232, 214], smoothstep(0.5, 0.95, haze) * 0.3 * (1 - t * 0.4));

      // Far headlands stacking into the haze. Soft-edged so they sit in the
      // atmosphere rather than being cut out of it.
      const ridge1 = hz - 0.06 - 0.05 * (fbm(n2, u * 1.6, 3.3, 3) * 0.5 + 0.5);
      const ridge2 = hz - 0.016 - 0.042 * (fbm(n2, u * 2.6 + 11, 8.1, 3) * 0.5 + 0.5);
      const near = hz - 0.004 - 0.012 * (fbm(n2, u * 5.5 + 31, 2.7, 3) * 0.5 + 0.5);
      c = blend(c, landFar, smoothstep(ridge1 - 0.006, ridge1 + 0.014, v) * 0.42);
      c = blend(c, blend(landFar, land, 0.5), smoothstep(ridge2 - 0.005, ridge2 + 0.01, v) * 0.6);
      c = blend(c, land, smoothstep(near - 0.003, near + 0.006, v) * 0.55);
      const g = grain(x * 0.8, y * 0.8) * 2.4;
      return [c[0] + g, c[1] + g, c[2] + g];
    }

    // Sea: ripple frequency rises toward the viewer.
    const t = (v - hz) / (1 - hz);
    let c = blend(seaFar, seaNear, smoothstep(0, 1, t));
    const rip = fbm(n, u * (7 + t * 34), (v - hz) * (60 + t * 190), 4);
    c = blend(c, [206, 206, 200], clamp01(smoothstep(0.24, 0.62, rip) * (0.16 + t * 0.3)));
    // Sun glitter path under the bloom.
    const path = Math.exp(-Math.pow((u - 0.72) / (0.09 + t * 0.22), 2));
    const glint = smoothstep(0.42, 0.82, fbm(n2, u * (26 + t * 70), (v - hz) * 210, 3) * 0.5 + 0.5);
    c = blend(c, [250, 234, 206], path * glint * 0.55);

    const g = grain(x * 0.8, y * 0.8) * 2.4;
    return [c[0] + g, c[1] + g, c[2] + g];
  };
}

/** Still water, viewed close and from above. */
function waterShader(seed: number): Shader {
  const n = makeNoise(seed);
  const n2 = makeNoise(seed + 19);
  const grain = makeNoise(seed + 23);
  const deep: RGB = [86, 100, 102];
  const shallow: RGB = [150, 163, 158];

  return (x, y, w, h) => {
    const u = x / w;
    const v = y / h;
    let c = blend(deep, shallow, clamp01(0.25 + v * 0.55 + fbm(n, u * 2.2, v * 2.2, 3) * 0.22));
    const ripple = fbm(n, u * 12, v * 46, 5);
    c = blend(c, [214, 216, 208], clamp01(smoothstep(0.18, 0.55, ripple) * 0.32));
    const fine = fbm(n2, u * 46, v * 150, 3);
    c = blend(c, [236, 232, 220], clamp01(smoothstep(0.44, 0.78, fine) * 0.2));
    // Warm sky reflected off the top edge.
    c = blend(c, [226, 208, 182], smoothstep(0.34, 0, v) * 0.28);
    const g = grain(x, y) * 2.2;
    return [c[0] + g, c[1] + g, c[2] + g];
  };
}

/** Late sun raking across a plaster-and-stone wall. */
function stoneLightShader(seed: number, dark = false): Shader {
  const marble = marbleShader(seed, dark ? 210 : 300, dark ? 0.9 : 0.5);
  const n = makeNoise(seed + 400);
  return (x, y, w, h) => {
    const u = x / w;
    const v = y / h;
    let c = marble(x, y, w, h);
    if (dark) c = blend(c, MIDNIGHT, 0.82);
    else c = blend(c, [232, 222, 205], 0.35);

    // A shaft of window light falling across the wall, softly edged.
    const edge = 0.24 + 0.36 * u + 0.045 * fbm(n, u * 1.8, v * 1.8, 3);
    const lit = smoothstep(edge + 0.075, edge - 0.03, v);
    c = blend(c, dark ? [116, 104, 80] : [255, 251, 240], lit * (dark ? 0.38 : 0.7));
    // Everything outside the shaft settles into a cool, deep shade.
    c = blend(c, dark ? [7, 9, 13] : [128, 117, 103], (1 - lit) * (dark ? 0.38 : 0.5));
    // Vignette.
    const d = Math.hypot(u - 0.5, v - 0.5);
    return blend(c, dark ? [6, 8, 11] : [162, 150, 134], smoothstep(0.4, 0.88, d) * 0.26);
  };
}

/**
 * Daylight on a plaster wall: a warm plane, one soft rectangle of window
 * light, and a slow falloff into shade. Deliberately abstract — the calm
 * of a quiet room without pretending to be a photograph of one.
 */
function plasterLightShader(seed: number, tilt = -0.22): Shader {
  const plaster = marbleShader(seed, 340, 0.34);
  const n = makeNoise(seed + 900);
  const grain = makeNoise(seed + 901);

  return (x, y, w, h) => {
    const u = x / w;
    const v = y / h;
    let c = plaster(x, y, w, h);
    c = blend(c, [230, 219, 201], 0.55);

    // Trowel movement across the plaster.
    const sweep = fbm(n, u * 1.6, v * 3.4, 4) * 0.5 + 0.5;
    c = blend(c, [214, 202, 184], smoothstep(0.55, 0.95, sweep) * 0.3);
    c = blend(c, [246, 240, 228], smoothstep(0.55, 0.95, 1 - sweep) * 0.25);

    // The light patch, sheared so it reads as a projection rather than a box.
    const su = u + (v - 0.5) * tilt;
    const inU = smoothstep(0.16, 0.30, su) * smoothstep(0.86, 0.72, su);
    const inV = smoothstep(0.10, 0.26, v) * smoothstep(0.78, 0.60, v);
    const patch = inU * inV;
    // A soft mullion splitting the patch in two.
    const mullion = 1 - Math.exp(-Math.pow((su - 0.52) / 0.017, 2)) * 0.55;
    c = blend(c, [255, 250, 235], patch * mullion * 0.72);

    // Ambient falloff: warm and open at the top, cool and deep at the base.
    c = blend(c, [252, 246, 232], smoothstep(0.5, 0.0, v) * 0.16);
    c = blend(c, [140, 130, 116], smoothstep(0.52, 1.0, v) * 0.3);
    c = blend(c, [150, 140, 126], smoothstep(0.35, 0.0, u) * 0.14);

    const g = grain(x * 0.6, y * 0.6) * 2.6;
    const d = Math.hypot(u - 0.5, v - 0.5);
    return blend(
      [c[0] + g, c[1] + g, c[2] + g],
      [150, 139, 124],
      smoothstep(0.46, 0.95, d) * 0.24,
    );
  };
}

/**
 * The founder portrait slot. Until a real frame is dropped in, this renders
 * a portrait-orientation linen-and-light plate with the L4G rule debossed —
 * an obvious, designed placeholder rather than a fake photograph.
 */
function portraitSlotShader(seed: number): Shader {
  const linen = linenShader(seed, 6.5);
  const light = plasterLightShader(seed + 5, -0.3);
  const grain = makeNoise(seed + 12);
  return (x, y, w, h) => {
    const u = x / w;
    const v = y / h;
    let c = blend(light(x, y, w, h), linen(x, y, w, h), 0.45);
    c = blend(c, [224, 212, 194], 0.16);

    // A soft-edged fall of light from the upper left, and deep shade opposite.
    const key = Math.exp(-(Math.pow((u - 0.34) * 1.35, 2) + Math.pow((v - 0.3) * 1.05, 2)) * 2.6);
    c = blend(c, [255, 250, 238], key * 0.5);
    const shade = smoothstep(0.42, 1.05, Math.hypot((u - 0.3) * 1.1, (v - 0.28) * 0.95));
    c = blend(c, [122, 111, 97], shade * 0.42);

    const d = Math.hypot((u - 0.5) * 1.05, (v - 0.46) * 0.9);
    c = blend(c, [128, 118, 104], smoothstep(0.36, 0.9, d) * 0.3);
    const g = grain(x * 0.5, y * 0.5) * 2.6;
    return [c[0] + g, c[1] + g, c[2] + g];
  };
}

/* ------------------------------------------------------------------ *
 * Manifest
 * ------------------------------------------------------------------ */

async function main() {
  const only = process.argv[2];
  const want = (k: string) => !only || only === k;

  if (want('textures')) {
    console.log('textures');
    await render('carrara-marble.jpg', 1400, 1400, marbleShader(11, 420), { dir: TEX, quality: 80 });
    await render('travertine.jpg', 1400, 1400, travertineShader(23, 380), { dir: TEX, quality: 80 });
    await render('linen.jpg', 900, 900, linenShader(37, 5.5), { dir: TEX, quality: 82 });
  }

  if (want('plates')) {
    console.log('plates');
    await render('hero-coast.jpg', 2560, 1440, coastShader(101), { quality: 80 });
    await render('hero-marble.jpg', 2400, 1500, marbleShader(202, 620, 1.05), { quality: 82 });
    await render('calm-water.jpg', 1800, 1200, waterShader(303), { quality: 80 });
    await render('sunlight-on-stone.jpg', 1800, 1200, stoneLightShader(404), { quality: 82 });
    await render('spa-interior.jpg', 1400, 1750, plasterLightShader(505), { quality: 84 });
    await render('daylight-plaster.jpg', 1800, 1200, plasterLightShader(515, -0.16), { quality: 84 });
    await render('travertine-wall.jpg', 1800, 1200, travertineShader(606, 520), { quality: 82 });
    await render('marble-dark.jpg', 2400, 1200, stoneLightShader(707, true), { quality: 80 });
    await render('linen-fold.jpg', 1600, 1100, linenShader(808, 7.5), { quality: 84 });
    await render('coast-band.jpg', 2400, 900, coastShader(909, 0.48), { quality: 80 });
    await render('founder-portrait.jpg', 1200, 1600, portraitSlotShader(1010), { quality: 86 });
  }

}

main();
