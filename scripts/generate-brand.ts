/**
 * Builds the Lifting4Gains logo lockups as outlined SVG (no font dependency),
 * plus favicon / apple-touch-icon / OG image derived from the monogram.
 *
 * Run: npm run gen:brand
 */
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const ROOT = process.cwd();
const BRAND = path.join(ROOT, 'public', 'brand');
const APP = path.join(ROOT, 'app');
const TMP = path.join(ROOT, '.tmp-assets');
const FONT = path.join(TMP, 'CormorantGaramond-Light.ttf');
const UI_FONT = path.join(TMP, 'Inter-Medium.ttf');

/**
 * The lockups are outlined from the real fonts, so the two faces are fetched
 * on demand into a gitignored scratch directory rather than vendored.
 */
async function ensureFonts() {
  fs.mkdirSync(TMP, { recursive: true });
  const faces: [string, string][] = [
    [FONT, 'Cormorant+Garamond:wght@300'],
    [UI_FONT, 'Inter:wght@500'],
  ];
  for (const [file, family] of faces) {
    if (fs.existsSync(file)) continue;
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }).then((r) => r.text());
    const url = css.match(/https:\/\/[^)]*\.ttf/)?.[0];
    if (!url) throw new Error(`could not resolve a TTF for ${family}`);
    const bytes: ArrayBuffer = await fetch(url).then((r) => r.arrayBuffer());
    const buf = Buffer.from(new Uint8Array(bytes));
    fs.writeFileSync(file, buf);
    console.log('  ↓', path.relative(ROOT, file));
  }
}

const CHARCOAL = '#1C1A17';
const ALABASTER = '#F7F4EF';
const CHAMPAGNE = '#C9A961';
const MIDNIGHT = '#14181F';

type Face = ReturnType<typeof opentype.parse>;
let font: Face;
let uiFont: Face;

const parseFont = (file: string): Face => {
  const b = fs.readFileSync(file);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
};

/**
 * Cormorant has no true small-caps, and the wordmark is all-caps anyway.
 * opentype.js has no tracking option, so letters are laid out one at a time
 * with the 0.25em spec applied between them. librsvg also mis-parses several
 * glyph outlines concatenated into one `d`, so each letter stays its own path.
 */
function tracked(text: string, size: number, tracking: number, face: Face = font) {
  const paths: string[] = [];
  let x = 0;
  for (const ch of text) {
    const glyph = face.charToGlyph(ch);
    paths.push(glyph.getPath(x, 0, size).toPathData(3));
    x += ((glyph.advanceWidth ?? 0) / face.unitsPerEm) * size + tracking * size;
  }
  // librsvg mis-parses several glyph outlines concatenated into one `d`,
  // so each letter stays its own <path>. The trailing letter contributes
  // no tracking to the visual width.
  return { paths, width: x - tracking * size };
}

const WORDMARK = 'LIFTING4GAINS';
const TRACKING = 0.25;

const asPaths = (paths: string[], fill: string) =>
  paths.map((d) => `<path d="${d}" fill="${fill}" />`).join('');

function wordmarkSvg(fill: string, rule: string) {
  const size = 72;
  const { paths, width } = tracked(WORDMARK, size, TRACKING);
  const padX = 48;
  const padY = 44;
  const capTop = -font.charToGlyph('L').getMetrics().yMax / font.unitsPerEm * size;
  const h = Math.round(-capTop + padY * 2);
  const w = Math.round(width + padX * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="wm">
  <title id="wm">LIFTING4GAINS</title>
  <g transform="translate(${padX} ${Math.round(-capTop + padY)})">${asPaths(paths, fill)}</g>
  <rect x="${padX}" y="${h - Math.round(padY * 0.5)}" width="${Math.round(width)}" height="1.4" fill="${rule}" />
</svg>`;
}

function stackedSvg(fill: string, rule: string) {
  const size = 44;
  const { paths, width } = tracked(WORDMARK, size, TRACKING);
  const monoW = 446 * 0.62;
  const monoH = 230 * 0.62;
  const w = Math.round(Math.max(width, monoW) + 96);
  const monoX = (w - monoW) / 2;
  const capTop = -font.charToGlyph('L').getMetrics().yMax / font.unitsPerEm * size;
  const wordY = 56 + monoH + 54;
  const h = Math.round(wordY + 56);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="st">
  <title id="st">LIFTING4GAINS — monogram and wordmark</title>
  <g transform="translate(${monoX.toFixed(1)} 56) scale(${(monoW / 446).toFixed(4)}) translate(-33 -137)">
    <g fill="none" stroke="${fill}" stroke-width="8" stroke-linecap="butt" stroke-linejoin="miter">
      <path d="M71 161 V301 H133" />
      <path d="M57 161 H85" />
      <path d="M133 287 V301" />
      <path d="M245 161 L177 253 H287" />
      <path d="M245 161 V301" />
      <path d="M231 301 H259" />
      <path d="M435.8 178.6 A62 74 0 1 0 435.8 283.4" />
      <path d="M435.8 283.4 V241 H403" />
    </g>
    <rect x="86" y="341" width="340" height="1.8" fill="${rule}" />
  </g>
  <g transform="translate(${((w - width) / 2).toFixed(1)} ${(wordY - capTop - size * 0.72).toFixed(1)})">${asPaths(paths, fill)}</g>
</svg>`;
}

/* ---------- Raster derivatives ---------- */
async function raster() {
  // monogram*.svg are hand-authored geometry checked into /public/brand.
  const tight = fs.readFileSync(path.join(BRAND, 'monogram-tight-light.svg'));

  // Icons: monogram on alabaster, with breathing room around the tight crop.
  const icon = async (px: number) => {
    const inner = Math.round(px * 0.74);
    const mark = await sharp(await sharp(tight).resize({ width: inner * 4 }).png().toBuffer())
      .resize({ width: inner })
      .png()
      .toBuffer();
    const meta = await sharp(mark).metadata();
    return sharp({
      create: { width: px, height: px, channels: 4, background: ALABASTER },
    })
      .composite([
        {
          input: mark,
          top: Math.round((px - (meta.height ?? inner)) / 2),
          left: Math.round((px - inner) / 2),
        },
      ])
      .png()
      .toBuffer();
  };

  fs.writeFileSync(path.join(APP, 'apple-icon.png'), await icon(180));
  fs.writeFileSync(path.join(APP, 'icon.png'), await icon(512));
  fs.writeFileSync(path.join(ROOT, 'public', 'apple-touch-icon.png'), await icon(180));

  // .ico with the three sizes browsers actually ask for.
  const pngs = await Promise.all([16, 32, 48].map((s) => icon(s)));
  fs.writeFileSync(path.join(APP, 'favicon.ico'), buildIco(pngs, [16, 32, 48]));

  // 1200x630 OG image: monogram + wordmark on midnight, champagne rule.
  // Each element is rasterised on its own and composited — librsvg drops thin
  // outlines when many are packed into one small-scale render.
  const W = 1200;
  const H = 630;

  // librsvg drops hairline outlines when it rasterises straight to a small
  // size, so every element is rendered at 4x and resampled down.
  const crisp = async (svg: Buffer, width: number) =>
    sharp(await sharp(svg).resize({ width: width * 4 }).png().toBuffer())
      .resize({ width })
      .png()
      .toBuffer();

  const textSvg = (text: string, fill: string, size = 64, tracking = TRACKING, face: Face = font) => {
    const t = tracked(text, size, tracking, face);
    const cap = (face.charToGlyph('L').getMetrics().yMax / face.unitsPerEm) * size;
    return Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(t.width)} ${Math.ceil(cap)}">` +
        `<g transform="translate(0 ${cap.toFixed(1)})">${asPaths(t.paths, fill)}</g></svg>`,
    );
  };

  const monoPng = await crisp(fs.readFileSync(path.join(BRAND, 'monogram-tight-dark.svg')), 300);
  const wordPng = await crisp(textSvg(WORDMARK, ALABASTER), 600);
  // Eyebrow labels are Inter Medium per the type spec — a Light serif this
  // small loses its hairlines entirely.
  const eyebrowPng = await crisp(
    textSvg('RESEARCH PEPTIDES', CHAMPAGNE, 64, 0.15, uiFont),
    252,
  );

  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<rect width="${W}" height="${H}" fill="${MIDNIGHT}"/>` +
      `<rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" ` +
      `stroke="${CHAMPAGNE}" stroke-opacity="0.3" stroke-width="1"/></svg>`,
  );

  const dims = async (b: Buffer) => {
    const m = await sharp(b).metadata();
    return { w: m.width ?? 0, h: m.height ?? 0 };
  };
  const md = await dims(monoPng);
  const wd = await dims(wordPng);
  const ed = await dims(eyebrowPng);

  await sharp(frame)
    .composite([
      { input: monoPng, left: Math.round((W - md.w) / 2), top: 186 },
      { input: wordPng, left: Math.round((W - wd.w) / 2), top: 186 + md.h + 72 },
      { input: eyebrowPng, left: Math.round((W - ed.w) / 2), top: 186 + md.h + 72 + wd.h + 40 },
    ])
    .png()
    .toFile(path.join(ROOT, 'public', 'brand', 'og-default.png'));

  console.log('brand assets written');
}

/** Minimal ICO container around PNG-encoded frames. */
function buildIco(pngs: Buffer[], sizes: number[]) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + pngs.length * 16;
  pngs.forEach((png, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
  });
  return Buffer.concat([header, ...entries, ...pngs]);
}

async function main() {
  await ensureFonts();
  font = parseFont(FONT);
  uiFont = parseFont(UI_FONT);

  fs.mkdirSync(BRAND, { recursive: true });
  fs.writeFileSync(path.join(BRAND, 'wordmark-light.svg'), wordmarkSvg(CHARCOAL, CHAMPAGNE));
  fs.writeFileSync(path.join(BRAND, 'wordmark-dark.svg'), wordmarkSvg(ALABASTER, CHAMPAGNE));
  fs.writeFileSync(path.join(BRAND, 'stacked-light.svg'), stackedSvg(CHARCOAL, CHAMPAGNE));
  fs.writeFileSync(path.join(BRAND, 'stacked-dark.svg'), stackedSvg(ALABASTER, CHAMPAGNE));

  await raster();
}

main();
