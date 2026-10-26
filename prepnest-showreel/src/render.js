// Renders frames with headless Chromium. Usage:
//   node render.js frames <outDir> <start> <end> [step]   -> JPEG frames
//   node render.js stills <outDir> t1 t2 ...              -> PNG stills at times (s)
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu-vsync'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('page:', m.text()));
  page.on('pageerror', e => { console.error('PAGEERROR', e); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => window.ready);
  const shot = async (t, file, type) => {
    await page.evaluate(t => window.render(t), t);
    await page.screenshot({ path: file, type, quality: type === 'jpeg' ? 95 : undefined, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  };
  if (mode === 'stills') {
    for (const ts of rest) await shot(parseFloat(ts), path.join(out, `t${parseFloat(ts).toFixed(2)}.png`), 'png');
  } else {
    const [a, b, step = 1] = rest.map(Number);
    const t0 = Date.now();
    for (let i = a; i < b; i += step) {
      await shot(i / 60, path.join(out, `f${String(i).padStart(5, '0')}.jpg`), 'jpeg');
      if (i % 120 === 0) console.log(`frame ${i} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }
  await browser.close();
})();
