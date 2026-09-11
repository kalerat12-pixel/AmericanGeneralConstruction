import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/shop", "/product/warheads-sour-watermelon", "/rankings", "/bundles", "/partners", "/about", "/cart", "/checkout", "/faq", "/contact", "/privacy", "/terms", "/shipping-returns", "/account"];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let total = 0;

for (const route of routes) {
  for (const [label, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    if (violations.length) {
      total += violations.length;
      console.log(`\n${route} [${label}]`);
      for (const v of violations) {
        console.log(`  ${v.impact ?? "?"} · ${v.id}: ${v.help}`);
        for (const n of v.nodes.slice(0, 2)) console.log(`     ${n.target.join(" ")} — ${(n.failureSummary ?? "").split("\n")[1]?.trim() ?? ""}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
console.log(total === 0 ? "\nNo axe violations across all routes." : `\n${total} violation groups found.`);
