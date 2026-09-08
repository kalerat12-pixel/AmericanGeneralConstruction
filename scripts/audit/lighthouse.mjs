import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

const PAGES = ['/', '/shop', '/shop/bpc-157', '/quality', '/about', '/faq', '/contact', '/cart', '/terms'];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--remote-debugging-port=9222'],
});
// Pre-set the age gate so Lighthouse audits the page, not the modal.
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.setItem('l4g-age-verified','true'); } catch {} });
const warm = await ctx.newPage();
await warm.goto('http://localhost:3100/');

const rows = [];
for (const p of PAGES) {
  const r = await lighthouse(`http://localhost:3100${p}`, {
    port: 9222,
    output: 'json',
    logLevel: 'error',
    onlyCategories: ['accessibility', 'seo', 'best-practices'],
    screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
    formFactor: 'desktop',
  });
  const c = r.lhr.categories;
  rows.push({ page: p, a11y: Math.round(c.accessibility.score * 100), seo: Math.round(c.seo.score * 100), bp: Math.round(c['best-practices'].score * 100) });
  const fails = Object.values(r.lhr.audits).filter(
    (a) => a.score !== null && a.score < 1 && ['accessibility', 'seo', 'best-practices'].some((cat) =>
      c[cat].auditRefs.some((ref) => ref.id === a.id && ref.weight > 0)));
  if (fails.length) {
    console.log(`\n${p} — failing weighted audits:`);
    for (const f of fails) console.log(`   • ${f.id}: ${f.title}`);
  }
}
console.log('\npage                      a11y  seo  best-practices');
for (const r of rows) console.log(`${r.page.padEnd(24)}  ${String(r.a11y).padStart(4)} ${String(r.seo).padStart(4)} ${String(r.bp).padStart(15)}`);
await browser.close();
