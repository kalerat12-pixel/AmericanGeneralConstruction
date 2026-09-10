import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'http://localhost:3100';
const PAGES = ['/', '/shop', '/shop/bpc-157', '/quality', '/about', '/faq', '/contact', '/cart', '/terms', '/privacy', '/shipping-returns', '/nope-404'];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
let total = 0;

for (const vp of [{ width: 1440, height: 1000, n: 'desktop' }, { width: 375, height: 812, n: 'mobile' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript(() => { try { localStorage.setItem('l4g-age-verified', 'true'); } catch {} });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    if (r.violations.length) {
      console.log(`\n${vp.n} ${p}`);
      for (const v of r.violations) {
        total++;
        console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) {
          console.log(`      ${node.target.join(' ')}`);
          if (node.failureSummary) console.log(`      → ${node.failureSummary.replace(/\n/g, ' ').slice(0, 180)}`);
        }
      }
    }
  }
  await ctx.close();
}

// The age gate is its own focus trap — audit it separately.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
  if (r.violations.length) {
    console.log('\ndesktop / (age gate open)');
    for (const v of r.violations) {
      total++;
      console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
      for (const node of v.nodes.slice(0, 3)) console.log(`      ${node.target.join(' ')}`);
    }
  }
  await ctx.close();
}

console.log(`\n=== ${total} violation types ===`);
await browser.close();
