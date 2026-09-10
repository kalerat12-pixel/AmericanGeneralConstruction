import { chromium } from 'playwright';
const BASE = 'http://localhost:3100';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

// 1. Age gate traps focus and cannot be escaped without answering.
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  console.log('age gate still open after Escape:', await p.locator('[role="dialog"]').isVisible());
  const seen = [];
  for (let i = 0; i < 6; i++) {
    await p.keyboard.press('Tab');
    seen.push(await p.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 28) ?? document.activeElement?.tagName));
  }
  console.log('tab cycle inside gate:', JSON.stringify(seen));
  await p.getByRole('button', { name: /21 or older/i }).click();
  await p.waitForTimeout(300);
  console.log('gate dismissed:', await p.locator('[role="dialog"]').count() === 0);
  console.log('persisted:', await p.evaluate(() => localStorage.getItem('l4g-age-verified')));
  await ctx.close();
}

// 2. Tab order on the home page, and the skip link.
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('l4g-age-verified','true'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const order = [];
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press('Tab');
    order.push(await p.evaluate(() => {
      const el = document.activeElement;
      return `${el?.tagName}:${(el?.textContent ?? '').trim().slice(0, 24) || el?.getAttribute('aria-label') || ''}`;
    }));
  }
  console.log('\nhome tab order:'); order.forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
  await ctx.close();
}

// 3. Product card hover swap must also fire on keyboard focus.
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('l4g-age-verified','true'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(BASE + '/shop', { waitUntil: 'networkidle' });
  const link = p.locator('article a').first();
  await link.focus();
  await p.waitForTimeout(900);
  const op = await p.locator('article').first().locator('img').nth(1).evaluate((el) => getComputedStyle(el).opacity);
  console.log('\nsecond frame opacity on focus:', op);
  await ctx.close();
}

// 4. Add to cart via keyboard, then confirm the header count updates.
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('l4g-age-verified','true'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(BASE + '/shop/bpc-157', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Add to cart' }).press('Enter');
  await p.waitForTimeout(500);
  console.log('button after add:', (await p.getByRole('button', { name: /Added to cart/i }).count()) > 0);
  console.log('header count:', await p.locator('header a[href="/cart"] span[aria-hidden]').innerText());
  await p.goto(BASE + '/cart', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  console.log('cart persisted across navigation:', await p.locator('text=BPC-157').first().isVisible());
  await ctx.close();
}

// 5. Reduced motion: nothing should stay at opacity 0 waiting for an observer.
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('l4g-age-verified','true'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(BASE + '/quality', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const hidden = await p.evaluate(() =>
    [...document.querySelectorAll('body *')].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.opacity === '0' && el.getBoundingClientRect().height > 4 && cs.visibility !== 'hidden';
    }).length);
  console.log('\nreduced-motion: elements stuck at opacity 0:', hidden);
  await ctx.close();
}
await b.close();
