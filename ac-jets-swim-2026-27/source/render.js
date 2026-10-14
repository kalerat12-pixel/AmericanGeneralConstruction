// Rasterise SVGs to PNG with headless Chromium.
// usage: node render.js jobs.json
// jobs.json: [{ "svg": "/abs/in.svg", "png": "/abs/out.png", "dpi": 300, "transparent": true }]
// The SVG's width/height (in inches) set the output size: px = inches * dpi.
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await chromium.launch();
  for (const job of jobs) {
    const svg = fs.readFileSync(job.svg, 'utf8');
    const m = svg.match(/<svg[^>]*\swidth="([\d.]+)in"[^>]*\sheight="([\d.]+)in"/);
    const wIn = parseFloat(m[1]);
    const hIn = parseFloat(m[2]);
    const dpi = job.dpi || 300;
    // 96 CSS px per inch; the device scale factor makes 1in = dpi device pixels.
    const cssW = Math.ceil(wIn * 96);
    const cssH = Math.ceil(hIn * 96);
    const context = await browser.newContext({
      viewport: { width: cssW, height: cssH },
      deviceScaleFactor: dpi / 96,
    });
    const page = await context.newPage();
    const bg = job.transparent === false ? (job.bg || '#fff') : 'transparent';
    const html = `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:${bg}}
      img{display:block;width:${wIn * 96}px;height:${hIn * 96}px}</style></head>
      <body><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`;
    await page.setContent(html);
    await page.waitForFunction(() => document.images[0] && document.images[0].complete);
    fs.mkdirSync(path.dirname(job.png), { recursive: true });
    await page.screenshot({ path: job.png, omitBackground: job.transparent !== false });
    await context.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
