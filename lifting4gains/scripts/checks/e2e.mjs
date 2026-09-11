import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const fail = [];
const ok = (label, cond, detail = "") => console.log(`${cond ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`) || (cond || fail.push(label));

// 1. PDP -> subscribe toggle changes price
await page.goto("http://localhost:3000/product/citrus", { waitUntil: "networkidle" });
const before = await page.locator("text=/^\\$/").last().textContent();
await page.getByRole("checkbox").first().check();
await page.waitForTimeout(200);
const sub = await page.locator("text=Subscribe & save").first().isVisible();
ok("PDP subscribe-and-save visible", sub);
const total = await page.locator(".type-mono.font-display").first().textContent();
ok("Subscribe applies 15% off ($34.99 -> $29.74)", total.trim() === "$29.74", `got ${total.trim()}`);

// 2. Add to cart
await page.getByRole("checkbox").first().uncheck();
await page.getByRole("button", { name: "Add to cart" }).click();
await page.waitForTimeout(400);
ok("Cart badge increments", (await page.locator("header").getByText("1", { exact: true }).count()) > 0);

// 3. Bundle builder live pricing
await page.goto("http://localhost:3000/bundles", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "The starter twelve" }).click();
await page.waitForTimeout(300);
const perCan = await page.getByText("$2.92").first().isVisible();
ok("Bundle preset hits the 12-can tier ($2.92/can)", perCan);
const bundleTotal = await page.locator('aside dd.type-mono.font-display').first().textContent();
ok("Bundle total = 12 x $2.92 = $35.04", bundleTotal.trim() === "$35.04", `got ${bundleTotal.trim()}`);

// 4. Checkout (affiliate mode)
await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
await page.locator("#checkout-email").fill("test@example.com");
await page.getByRole("button", { name: /retailer links/i }).click();
await page.waitForTimeout(1200);
const ref = await page.locator("text=/Order L4G-/").first().textContent().catch(() => "");
ok("Affiliate checkout returns an order reference", /L4G-/.test(ref), ref.trim());
const outbound = await page.getByRole("link", { name: "Open retailer" }).count();
ok("Outbound tagged retailer links rendered", outbound > 0, `${outbound} links`);
const href = await page.getByRole("link", { name: "Open retailer" }).first().getAttribute("href");
ok("Outbound link carries the affiliate tag", href.includes("ref=lifting4gains"), href);
const rel = await page.getByRole("link", { name: "Open retailer" }).first().getAttribute("rel");
ok("Outbound link is rel=nofollow sponsored", rel.includes("nofollow") && rel.includes("sponsored"), rel);

// 5. Partner lead form issues a referral code
await page.goto("http://localhost:3000/partners", { waitUntil: "networkidle" });
await page.locator("#gymName").fill("Iron House Barbell");
await page.locator("#contactName").fill("Sam Reed");
await page.locator("#email").fill("sam@ironhouse.test");
await page.locator("#city").fill("Fort Wayne");
await page.locator("#memberCount").selectOption("300–600");
await page.locator("#monthlyCases").selectOption("10–24 cases");
await page.getByRole("button", { name: "Request pricing" }).click();
await page.waitForTimeout(1200);
const code = (await page.locator(".type-mono.font-display").first().textContent().catch(() => "")).trim();
ok("Partner form issues a usable referral code", /^IRONHOUSEB[0-9]{2,3}$/.test(code), code);

// 6. Newsletter
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.locator("#email-home").fill("lifter@example.com");
await page.locator("#email-home").press("Enter");
await page.waitForTimeout(1000);
ok("Newsletter signup confirms", await page.getByText(/on the list/i).first().isVisible());

// 7. Shop filters
await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
const all = await page.getByText(/^19 products$/).isVisible();
ok("Shop lists all 19 products", all);
await page.getByRole("button", { name: "Caffeine-free" }).click();
await page.waitForTimeout(300);
ok("Caffeine-free filter narrows to 3", await page.getByText(/^3 products$/).isVisible());

await browser.close();
console.log(fail.length ? `\n${fail.length} FAILURES: ${fail.join(", ")}` : "\nAll end-to-end checks passed.");
