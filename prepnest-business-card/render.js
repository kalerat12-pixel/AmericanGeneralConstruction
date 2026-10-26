const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const dir = __dirname;
  const p = await b.newPage({ viewport: { width: 360, height: 216 }, deviceScaleFactor: 300 / 96 });
  await p.goto('file://' + path.join(dir, 'card.html')); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(dir, 'prepnest-business-card-print.pdf'), width: '3.75in', height: '2.25in', printBackground: true, preferCSSPageSize: true });
  for (const [f, name] of [['card.html', ''], ['card-guides.html', '-guides']]) {
    await p.goto('file://' + path.join(dir, f)); await p.evaluate(() => document.fonts.ready);
    const pages = await p.$$('.page');
    for (const [i, side] of [[0, 'front'], [1, 'back']]) await pages[i].screenshot({ path: path.join(dir, `${side}${name}.png`) });
  }
  await b.close();
})();
