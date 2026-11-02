// Render preview stills for quick visual checks.
// Usage: node scripts/stills.mjs <frame|lineId[+offsetFrames]> ...
//   e.g. node scripts/stills.mjs 120 s3_05 s8_05+20
import fs from 'fs';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dialogue = JSON.parse(fs.readFileSync(path.join(root, 'src/config/dialogue.json'), 'utf8'));
const lineFrame = {};
let acc = 0;
for (const s of dialogue.scenes) {
  for (const l of s.lines) lineFrame[l.id] = acc + Math.round(l.at * 30);
  lineFrame[s.id] = acc;
  acc += Math.round(s.duration * 30);
}
const resolve = (arg) => {
  const m = arg.match(/^(.+?)([+-]\d+)?$/);
  const id = m[1];
  const off = m[2];
  const base = /^\d+$/.test(id) ? Number(id) : lineFrame[id];
  if (base === undefined) throw new Error(`Unknown frame/line: ${arg}`);
  return base + Number(off ?? 0);
};

const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : undefined;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'LastFriendGroup', browserExecutable});
fs.mkdirSync(path.join(root, 'out/stills'), {recursive: true});
for (const arg of process.argv.slice(2)) {
  const frame = resolve(arg);
  const output = path.join(root, `out/stills/${arg.replace(/[+-]/, '_')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable, scale: 0.5});
  console.log(`${arg} -> frame ${frame} -> ${path.relative(root, output)}`);
}
