import { chromium } from 'playwright';
const OUT = process.argv[2];
const BASE = 'http://localhost:3100';

const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 768, height: 1000 },
  mobile: { width: 375, height: 812 },
};

const targets = JSON.parse(process.argv[3]);

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[t.vp ?? 'desktop'],
    deviceScaleFactor: 1,
  });
  // Skip the age gate for screenshots that aren't of the age gate.
  if (!t.showGate) {
    await ctx.addInitScript(() => {
      try { localStorage.setItem('l4g-age-verified', 'true'); } catch {}
    });
  }
  if (t.cart) {
    const cart = t.cart;
    await ctx.addInitScript((c) => {
      try { localStorage.setItem('l4g-cart', c); } catch {}
    }, cart);
  }
  const page = await ctx.newPage();
  await page.goto(BASE + t.path, { waitUntil: 'networkidle' });
  if (t.scroll) await page.evaluate((y) => window.scrollTo(0, y), t.scroll);
  await page.waitForTimeout(t.wait ?? 1400);
  await page.screenshot({
    path: `${OUT}/${t.name}.png`,
    fullPage: !!t.full,
  });
  console.log('shot', t.name);
  await ctx.close();
}
await browser.close();
