/**
 * Emits a single self-contained HTML preview of the storefront, generated from
 * the same catalog the real app reads, so it can't drift from the site.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { flavors, energyFlavors } from "../src/lib/data/flavors";
import { products } from "../src/lib/data/products";
import { rankings, rankingsMeta, tierCopy } from "../src/lib/data/rankings";
import { reviews, reviewsFor, ratingSummary } from "../src/lib/data/reviews";
import { WHOLESALE_TIERS, BUNDLE_TIERS, formatPrice } from "../src/lib/pricing";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outPath = process.argv[2] ?? resolve(root, "preview.html");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function dataUri(relPath: string): string {
  const svg = readFileSync(resolve(root, "public", relPath), "utf8");
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

const can = (slug: string) => dataUri(`cans/${slug}.svg`);
const plate = (name: string) => dataUri(`editorial/${name}.svg`);

const flavorMap = new Map(flavors.map((f) => [f.slug, f]));
const productMap = new Map(products.map((p) => [p.slug, p]));

function stars(rating: number): string {
  const r = Math.round(rating * 2) / 2;
  return (
    `<span class="stars" role="img" aria-label="${rating.toFixed(1)} out of 5">` +
    [1, 2, 3, 4, 5]
      .map((i) => {
        const fill = r >= i ? "full" : r >= i - 0.5 ? "half" : "empty";
        return `<svg viewBox="0 0 20 20" class="star star--${fill}" aria-hidden="true"><path d="M10 1.6l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.88l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L10 1.6z"/></svg>`;
      })
      .join("") +
    `</span>`
  );
}

function meter(label: string, value: number): string {
  return `<div class="meter"><span class="meter__label">${label}</span><span class="meter__track" role="img" aria-label="${label}: ${value} of 5">${
    [1, 2, 3, 4, 5].map((i) => `<span class="seg${i <= value ? " seg--on" : ""}"></span>`).join("")
  }</span></div>`;
}

function productCard(slug: string): string {
  const f = flavorMap.get(slug)!;
  const p = productMap.get(slug)!;
  const s = ratingSummary(slug);
  const cheapest = Math.min(...p.variants.map((v) => v.priceCents));
  return `<article class="card" data-family="${f.family}" data-caffeine="${f.caffeineMg}">
  <div class="card__media">
    ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
    <img src="${can(slug)}" alt="${esc(f.name)} — placeholder product image" loading="lazy" width="260" height="416">
  </div>
  <div class="card__body">
    ${f.collab ? `<p class="eyebrow eyebrow--tight">${esc(f.collab)}</p>` : ""}
    <h3 class="card__title">${esc(f.name)}</h3>
    <p class="card__take">${esc(f.shortTake)}</p>
    <div class="card__foot">
      <div>
        ${s.count ? `<span class="card__rating">${stars(s.average)}<span class="dim">(${s.count})</span></span>` : ""}
        <p class="mono"><span class="dim">From </span>${formatPrice(cheapest)}</p>
      </div>
      <span class="mono card__caff">${f.caffeineMg > 0 ? `${f.caffeineMg}mg` : "No caffeine"}</span>
    </div>
  </div>
</article>`;
}

/* ---------------------------------------------------------------- HOME ---- */
const WHY = [
  ["We buy every can we rank", "Nobody pays for placement here and nobody can. If a flavor is too sweet to finish mid-session, the ranking page says so — including for the ones we make the most margin on."],
  ["Built for how you actually drink them", "Every product page tells you how it stacks with pre-workout, whether it survives warming up in a gym bag, and what it's genuinely good for. That's the information we wanted and could never find."],
  ["Gyms get real wholesale pricing", "Not a discount code — actual case pricing that works for a fridge at the front desk, plus a referral code your members can use. Down to $1.89 a can at volume."],
];

const featured = products.filter((p) => p.featured).slice(0, 4);
const proof = [reviews[5], reviews[3], reviews[7]];

const home = `
<section class="hero">
  <img class="hero__bg" src="${plate("bar-loaded")}" alt="" aria-hidden="true">
  <div class="hero__wash"></div>
  <div class="shell hero__inner">
    <p class="eyebrow"><span class="rule"></span>@lifting4gains &middot; independent Ghost stockist</p>
    <h1 class="hero__title">Stop guessing<br>which can<br><em>actually works.</em></h1>
    <p class="lead">Sixteen Ghost Energy flavors, ranked by people who drink them in a gym instead of at a desk. Buy the ones worth your money, skip the ones that aren't.</p>
    <div class="row">
      <a class="btn btn--primary" href="#shop" data-go="shop">Shop all flavors</a>
      <a class="btn btn--ghost" href="#rankings" data-go="rankings">Read the rankings</a>
    </div>
    <dl class="stats">
      ${[["200mg", "Caffeine per can"], ["0g", "Sugar, every flavor"], ["16", "Flavors ranked"], ["$2.71", "Per can at 24"]]
        .map(([k, v]) => `<div><dt class="sr-only">${v}</dt><dd><span class="stat__k">${k}</span><span class="stat__v">${v}</span></dd></div>`)
        .join("")}
    </dl>
  </div>
</section>

<section class="band">
  <div class="shell">
    <div class="head">
      <div>
        <p class="eyebrow"><span class="rule"></span>Start here</p>
        <h2 class="h2">The four we&rsquo;d put in your first order</h2>
      </div>
      <p class="head__note">One benchmark, one daily driver, one gateway flavor, and the one everybody sleeps on. Between them you&rsquo;ll work out what kind of drinker you are.</p>
    </div>
    <div class="grid grid--4">${featured.map((p) => productCard(p.slug)).join("")}</div>
  </div>
</section>

<section class="band band--split">
  <div class="shell split">
    <figure class="split__art">
      <img src="${plate("plates-stacked")}" alt="" aria-hidden="true">
      <figcaption>Run out of a<br>garage gym in<br><em>Fort Wayne.</em></figcaption>
    </figure>
    <div>
      <p class="eyebrow"><span class="rule"></span>Why this exists</p>
      <h2 class="h2">A shop, not a shelf.</h2>
      <p class="lead">Every energy drink retailer online lists flavors alphabetically and calls it a day. None of them will tell you which one you&rsquo;ll still want to drink in week six. We started ranking them on TikTok because nobody else was being honest about it — this shop is what that turned into.</p>
      <div class="why">
        ${WHY.map(([t, b], i) => `<div class="why__item"><span class="mono why__n">0${i + 1}</span><div><h3 class="h3">${esc(t)}</h3><p class="muted">${esc(b)}</p></div></div>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="band band--sunken">
  <div class="shell">
    <div class="head">
      <div>
        <p class="eyebrow"><span class="rule"></span>The list</p>
        <h2 class="h2">Every flavor, ranked. Including the ones we sell.</h2>
      </div>
      <a class="btn btn--ghost" href="#rankings" data-go="rankings">Full rankings</a>
    </div>
    <ol class="teaser">
      ${rankings.slice(0, 3).map((r) => {
        const f = flavorMap.get(r.flavorSlug)!;
        return `<li><span class="mono teaser__n">0${r.rank}</span><div><h3 class="h3">${f.collab ? esc(f.collab) + " " : ""}${esc(f.name)}</h3><p class="muted">${esc(f.shortTake)}</p></div><span class="mono chip">Tier ${r.tier}</span></li>`;
      }).join("")}
    </ol>
  </div>
</section>

<section class="band band--art">
  <img class="band__bg" src="${plate("rack-uprights")}" alt="" aria-hidden="true">
  <div class="band__wash"></div>
  <div class="shell split split--even">
    <div>
      <p class="eyebrow"><span class="rule"></span>Build your own</p>
      <h2 class="h1-ish">Twelve cans.<br>Your twelve.</h2>
      <p class="lead">Mix any flavors into one pack and watch the per-can price drop as you add. Nobody should have to commit to a case of something they haven&rsquo;t tried.</p>
      <a class="btn btn--primary" href="#bundles" data-go="bundles">Build a variety pack</a>
    </div>
    <div class="panel">
      <p class="eyebrow">Volume pricing</p>
      <dl class="tiers">
        ${BUNDLE_TIERS.map((t) => `<div><dt>${t.min}+ cans</dt><dd class="mono">${formatPrice(t.perCanCents)}<span class="dim">/can</span></dd></div>`).join("")}
      </dl>
      <p class="fine">Subscribe to any pack and take a further 15% off. Skip, pause or cancel from your account at any time.</p>
    </div>
  </div>
</section>

<section class="band">
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>From the crew</p>
    <h2 class="h2">Reviews from people who train.</h2>
    <div class="grid grid--3 quotes">
      ${proof.map((r) => `<figure class="quote">${stars(r.rating)}<blockquote><p class="quote__t">${esc(r.title)}</p><p class="muted">&ldquo;${esc(r.body)}&rdquo;</p></blockquote><figcaption class="fine"><span class="bright">${esc(r.author)}</span> &middot; ${esc(r.context)}</figcaption></figure>`).join("")}
    </div>
  </div>
</section>

<section class="band band--sunken">
  <div class="marquee" aria-hidden="true"><div class="marquee__track">${
    [0, 1].map(() => ["Flavor rankings every Friday", "Gym partner pricing", "No paid placements", "Build your own 12-pack", "Ships in 2–4 days", "Independent stockist"].map((t) => `<span>${t}<i></i></span>`).join("")).join("")
  }</div></div>
  <div class="shell split split--even">
    <div>
      <p class="eyebrow"><span class="rule"></span>The community</p>
      <h2 class="h2">You probably got here from a video.</h2>
      <p class="lead">Flavor tests, honest reviews, and whatever we&rsquo;re arguing about in the comments that week. The rankings on this site come straight out of it.</p>
    </div>
    <div class="panel">
      <h3 class="h3">First order? Take 10% off.</h3>
      <p class="muted">Join the list and we&rsquo;ll send a code, plus the new flavor verdict before it goes up anywhere else.</p>
      <form class="signup" data-demo>
        <label class="sr-only" for="email-home">Email address</label>
        <input id="email-home" type="email" placeholder="you@email.com" required>
        <button class="btn btn--primary" type="submit">Join</button>
      </form>
      <p class="fine">One email a week. Unsubscribe in a click.</p>
    </div>
  </div>
</section>`;

/* ---------------------------------------------------------------- SHOP ---- */
const shop = `
<section class="band band--top">
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>The shelf</p>
    <h1 class="h1-ish">Everything we stock.</h1>
    <p class="lead">Nineteen products across the energy and caffeine-free lines. Filter by how you actually choose — sour or sweet, single or case, caffeinated or not.</p>

    <div class="filters">
      <div class="filters__group">
        <p class="eyebrow">Flavor</p>
        <div class="chips">${["sour", "candy", "fruit", "citrus", "creamy", "soda"].map((f) => `<button class="chip chip--btn" data-filter="family" data-value="${f}">${f[0].toUpperCase()}${f.slice(1)}</button>`).join("")}</div>
      </div>
      <div class="filters__group">
        <p class="eyebrow">Caffeine</p>
        <div class="chips">${[["200", "200mg"], ["0", "Caffeine-free"]].map(([v, l]) => `<button class="chip chip--btn" data-filter="caffeine" data-value="${v}">${l}</button>`).join("")}</div>
      </div>
      <button class="link-btn" id="clear-filters" hidden>Clear all</button>
    </div>

    <p class="count mono" id="shop-count" role="status">19 products</p>
    <div class="grid grid--4" id="shop-grid">${products.map((p) => productCard(p.slug)).join("")}</div>
  </div>
</section>`;

/* ------------------------------------------------------------- PRODUCT ---- */
const pdpSlug = "warheads-sour-watermelon";
const pdpF = flavorMap.get(pdpSlug)!;
const pdpP = productMap.get(pdpSlug)!;
const pdpS = ratingSummary(pdpSlug);
const pdpRank = rankings.find((r) => r.flavorSlug === pdpSlug)!;

const product = `
<section class="band band--top">
  <div class="shell">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#home" data-go="home">Home</a> / <a href="#shop" data-go="shop">Shop</a> / <span>${esc(pdpF.collab!)} ${esc(pdpF.name)}</span></nav>
    <div class="pdp">
      <div>
        <div class="pdp__hero"><span class="badge">${esc(pdpP.badge!)}</span><img src="${can(pdpSlug)}" alt="${esc(pdpF.name)} — placeholder product image" width="420" height="672"></div>
        <div class="pdp__thumbs">${["plates-stacked", "rack-uprights", "chalk-dust"].map((n) => `<img src="${plate(n)}" alt="" aria-hidden="true">`).join("")}</div>
        <p class="fine">Product imagery on this site is a clearly-labelled placeholder. We don&rsquo;t reproduce or hotlink Ghost&rsquo;s photography.</p>
      </div>

      <div>
        <div class="pdp__meta"><p class="eyebrow"><span class="rule"></span>${esc(pdpF.collab!)}</p><span class="mono chip">Ranked #${pdpRank.rank} &middot; Tier ${pdpRank.tier}</span></div>
        <h1 class="h1-ish">${esc(pdpF.name)}</h1>
        <p class="pdp__rating">${stars(pdpS.average)}<span class="mono dim">${pdpS.average.toFixed(1)} (${pdpS.count})</span><span class="mono dim">From ${formatPrice(Math.min(...pdpP.variants.map((v) => v.priceCents)))}</span></p>
        <p class="lead">${esc(pdpF.tastingNote)}</p>
        <ul class="notes">${pdpF.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>

        <div class="buy">
          <p class="eyebrow">Pack size</p>
          <div class="packs">
            ${pdpP.variants.map((v) => `<button class="pack${v.packSize === 12 ? " is-on" : ""}" data-price="${v.priceCents}"><span class="pack__l">${esc(v.label)}</span><span class="mono">${formatPrice(v.priceCents)}</span>${v.packSize > 1 ? `<span class="mono fine">${formatPrice(Math.round(v.priceCents / v.packSize))}/can</span>` : ""}</button>`).join("")}
          </div>

          <label class="sub">
            <input type="checkbox" id="sub-toggle">
            <span><span class="sub__t">Subscribe &amp; save 15% <span class="mono accent" id="sub-price">${formatPrice(Math.round(3499 * 0.85))} every 4 weeks</span></span>
            <span class="fine">Delivered every four weeks. Skip, pause or cancel from your account — no email required, no phone call, no retention flow.</span></span>
          </label>

          <div class="total"><span class="eyebrow">Total</span><span><s class="mono dim" id="total-was" hidden></s><span class="mono total__n" id="total-now">${formatPrice(3499)}</span></span></div>
          <button class="btn btn--primary btn--full" data-demo-btn>Add to cart</button>
        </div>

        <div class="pdp__block">
          <p class="eyebrow">Flavor profile</p>
          ${meter("Sweetness", pdpF.profile.sweetness)}${meter("Sourness", pdpF.profile.sourness)}${meter("Intensity", pdpF.profile.intensity)}${meter("Body", pdpF.profile.body)}
        </div>

        <div class="pdp__block">
          <p class="eyebrow">What&rsquo;s in it</p>
          <table class="nutri">
            <tbody>
              <tr><th scope="row">Serving size</th><td class="mono">1 can (16 fl oz)</td></tr>
              <tr><th scope="row">Calories</th><td class="mono">${pdpF.calories}</td></tr>
              <tr><th scope="row">Total sugars</th><td class="mono">${pdpF.sugarG}g</td></tr>
              <tr><th scope="row">Caffeine</th><td class="mono">${pdpF.caffeineMg}mg</td></tr>
              <tr><th scope="row">Also contains</th><td>${pdpF.actives.join(", ")}</td></tr>
            </tbody>
          </table>
          <p class="fine">Figures as printed on the manufacturer&rsquo;s packaging. Formulations change — always read the can in your hand. We list functional ingredients by name only; we don&rsquo;t republish dosages we can&rsquo;t verify.</p>
        </div>

        <aside class="advisory">
          <p class="eyebrow accent">Caffeine advisory</p>
          <p class="bright">Contains ${pdpF.caffeineMg}mg of caffeine per can — roughly two cups of coffee.</p>
          <p class="muted">Health authorities generally advise healthy adults stay under 400mg of caffeine a day, so treat two cans as your ceiling and count anything else you&rsquo;ve had. Not recommended for children, or for people who are pregnant, breastfeeding, or sensitive to caffeine. If you&rsquo;re stacking this with a pre-workout, check that label&rsquo;s caffeine content first — it adds up faster than people expect.</p>
        </aside>
      </div>
    </div>

    <div class="pdp__reviews">
      <p class="eyebrow"><span class="rule"></span>What people said</p>
      <h2 class="h2">Reviews</h2>
      <ul class="reviews">
        ${reviewsFor(pdpSlug).map((r) => `<li><div class="reviews__top">${stars(r.rating)}<span class="mono fine">${new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span></div><h3 class="h3">${esc(r.title)}</h3><p class="muted">${esc(r.body)}</p><p class="fine"><span class="bright">${esc(r.author)}</span> &middot; ${esc(r.context)} &middot; <span class="accent">Verified purchase</span> &middot; ${r.helpfulCount} found this helpful</p></li>`).join("")}
      </ul>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------ RANKINGS ---- */
const rankingsHtml = `
<section class="band band--top">
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>The list</p>
    <h1 class="hero__title hero__title--sm">Every flavor,<br><em>ranked.</em></h1>
    <p class="lead">${esc(rankingsMeta.standfirst)}</p>
    <p class="byline fine">By <span class="bright">${esc(rankingsMeta.author)}</span> &middot; Updated September 1, 2026 &middot; ${rankings.length} flavors</p>

    <div class="method">
      <p class="eyebrow">How we ranked them</p>
      <ol>${rankingsMeta.method.map((m, i) => `<li><span class="mono accent">0${i + 1}</span><p class="muted">${esc(m)}</p></li>`).join("")}</ol>
    </div>

    <dl class="tierkey">
      ${Object.entries(tierCopy).map(([t, c]) => `<div><dt><span class="accent">${t}</span> <span class="dim">— ${esc(c.label.split("— ")[1])}</span></dt><dd class="muted">${esc(c.blurb)}</dd></div>`).join("")}
    </dl>

    <ol class="ranklist">
      ${rankings.map((r) => {
        const f = flavorMap.get(r.flavorSlug)!;
        return `<li>
  <div class="ranklist__n"><p class="rank">${String(r.rank).padStart(2, "0")}</p><span class="mono chip">Tier ${r.tier}</span></div>
  <div class="ranklist__art"><img src="${can(f.slug)}" alt="" aria-hidden="true" loading="lazy" width="180" height="288"></div>
  <div>
    ${f.collab ? `<p class="eyebrow eyebrow--tight">${esc(f.collab)}</p>` : ""}
    <h2 class="rank__name">${esc(f.name)}</h2>
    <p class="bright">${esc(r.verdict)}</p>
    <div class="knock"><p class="eyebrow eyebrow--tight">The knock</p><p class="muted">${esc(r.knock)}</p></div>
    <div class="rank__meters">${meter("Sweet", f.profile.sweetness)}${meter("Sour", f.profile.sourness)}</div>
  </div>
</li>`;
      }).join("")}
    </ol>
  </div>
</section>`;

/* ------------------------------------------------------------- BUNDLES ---- */
const bundles = `
<section class="band band--top">
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>Build your own</p>
    <h1 class="h1-ish">Your pack.<br>Your call.</h1>
    <p class="lead">Nobody should commit to twelve of something they haven&rsquo;t tried. Mix any flavors, any quantities — the per-can price drops as the pack gets bigger, and you can watch it happen.</p>

    <div class="builder">
      <div>
        <p class="eyebrow">Or start from one of ours</p>
        <div class="presets">
          ${[["The starter twelve", "Four flavors, three of each. Works out what kind of drinker you are.", "warheads-sour-watermelon,citrus,sour-patch-kids-redberry,sonic-ocean-water"],
             ["All sour, no apologies", "If your answer to 'too sour?' has always been 'no'.", "warheads-sour-watermelon,warheads-sour-green-apple,warheads-sour-black-cherry"],
             ["The daily driver case", "The two least sweet cans, for people who drink one every single day.", "citrus,lemon-lime"]]
            .map(([t, b, slugs]) => `<button class="preset" data-preset="${slugs}"><span class="preset__t">${esc(t)}</span><span class="fine">${esc(b)}</span></button>`).join("")}
        </div>

        <p class="eyebrow picker__head">Pick your cans</p>
        <ul class="picker">
          ${energyFlavors.map((f) => `<li data-slug="${f.slug}">
  <img src="${can(f.slug)}" alt="" aria-hidden="true" loading="lazy" width="48" height="77">
  <div class="picker__id">${f.collab ? `<span class="fine">${esc(f.collab)}</span>` : ""}<span class="picker__n">${esc(f.name)}</span></div>
  <div class="stepper"><button data-step="-1" aria-label="Remove one ${esc(f.name)}">&minus;</button><span class="mono qty">0</span><button data-step="1" aria-label="Add one ${esc(f.name)}">+</button></div>
</li>`).join("")}
        </ul>
      </div>

      <aside class="summary">
        <div class="summary__top"><p class="eyebrow">Your pack</p><span class="mono dim" id="b-count">0 / 36</span></div>
        <div class="bar"><span id="b-bar"></span></div>
        <p class="fine" id="b-hint" role="status">Add 4 more to reach the 4-can minimum.</p>
        <ul class="summary__list" id="b-list"><li class="dim">Nothing picked yet.</li></ul>
        <dl class="summary__totals">
          <div><dt class="muted">Per can</dt><dd class="mono" id="b-per">$3.49</dd></div>
          <div class="saving" id="b-saving" hidden><dt>Volume saving</dt><dd class="mono" id="b-save">&minus;$0.00</dd></div>
          <div class="summary__grand"><dt class="eyebrow">Total</dt><dd class="mono total__n" id="b-total">$0.00</dd></div>
        </dl>
        <button class="btn btn--ghost btn--full" id="b-add" disabled>Minimum 4 cans</button>
        <p class="fine">Subscribe at checkout for a further 15% off. Free shipping over $50.00.</p>
      </aside>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------ PARTNERS ---- */
const partners = `
<section class="band band--art band--top">
  <img class="band__bg" src="${plate("rack-uprights")}" alt="" aria-hidden="true">
  <div class="band__wash"></div>
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>Gym partners</p>
    <h1 class="h1-ish">Stock the fridge.<br>Keep the margin.</h1>
    <p class="lead">Case pricing on Ghost Energy for gym owners, from ${formatPrice(WHOLESALE_TIERS[0].perCanCents)} a can — plus a referral code your members can use online that pays you back.</p>
  </div>
</section>

<section class="band">
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>Wholesale pricing</p>
    <h2 class="h2">Published, not negotiated.</h2>
    <p class="lead">Here&rsquo;s what you&rsquo;ll pay. No &ldquo;contact us for a quote&rdquo; where the number depends on how well you haggle.</p>
    <div class="grid grid--4 wholesale">
      ${WHOLESALE_TIERS.map((t) => `<div class="ws"><p class="eyebrow">${t.cases}</p><p class="ws__n">${formatPrice(t.perCanCents)}<span class="dim">/can</span></p><p class="muted">${esc(t.note)}</p></div>`).join("")}
    </div>
    <p class="fine">A case is 24 cans. Pricing excludes tax and applies to mixed-flavor case orders. Delivery is free over ten cases; below that it&rsquo;s quoted on your postcode at cost.</p>
  </div>
</section>

<section class="band band--sunken">
  <div class="shell">
    <p class="eyebrow"><span class="rule"></span>How it works</p>
    <h2 class="h2">Four steps, one of them yours.</h2>
    <ol class="steps">
      ${[["Tell us what you need", "Gym size, rough monthly volume, and how much fridge space you're working with. Two minutes, no call."],
         ["We quote in a working day", "A real price per case for the flavors your members actually want, not a rate card that expires in a week."],
         ["Your code goes live", "Members get 10% off online. You earn 5% back as credit on your next case order. It tracks automatically."],
         ["We keep you stocked", "Standing order on the schedule you pick, delivered in your opening hours. Change or pause it any time."]]
        .map(([t, b], i) => `<li><span class="mono accent">0${i + 1}</span><h3 class="h3">${esc(t)}</h3><p class="muted">${esc(b)}</p></li>`).join("")}
    </ol>
  </div>
</section>`;

/* ---------------------------------------------------------------- PAGE ---- */
const css = readFileSync(resolve(here, "preview.css"), "utf8");
const js = readFileSync(resolve(here, "preview.js"), "utf8");

const html = `<title>Lifting4Gains</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">
<style>${css}</style>

<div class="notice">
  <span><strong>Static preview</strong> of the Lifting4Gains storefront — the real app is a Next.js 16 build in <code>lifting4gains/</code>. Filters, pack pricing and the pack builder are live here; checkout and forms need the server.</span>
</div>

<header class="hdr">
  <div class="shell hdr__in">
    <a class="logo" href="#home" data-go="home">LIFTING<span class="accent">4</span>GAINS</a>
    <nav class="nav" aria-label="Primary">
      ${[["home", "Home"], ["shop", "Shop"], ["rankings", "Rankings"], ["bundles", "Build a pack"], ["product", "Product page"], ["partners", "Gym partners"]]
        .map(([id, label]) => `<a href="#${id}" data-go="${id}">${label}</a>`).join("")}
    </nav>
  </div>
</header>

<main>
  <div class="view" id="view-home">${home}</div>
  <div class="view" id="view-shop" hidden>${shop}</div>
  <div class="view" id="view-product" hidden>${product}</div>
  <div class="view" id="view-rankings" hidden>${rankingsHtml}</div>
  <div class="view" id="view-bundles" hidden>${bundles}</div>
  <div class="view" id="view-partners" hidden>${partners}</div>
</main>

<footer class="ftr">
  <div class="shell">
    <p class="fine">GHOST&reg; is a registered trademark of its owner. Lifting4Gains is an independent retailer and is not affiliated with, endorsed by, or sponsored by Ghost Lifestyle or any of its collaborators.</p>
    <p class="fine">Some links on this site are affiliate links. If you buy through them we may earn a commission at no extra cost to you. It never changes where a flavor lands in our rankings.</p>
    <p class="fine">Energy drinks are not suitable for children, or for people who are pregnant, breastfeeding, or sensitive to caffeine. Nutrition figures are as printed on the manufacturer&rsquo;s packaging — always read the can.</p>
    <p class="fine dim">&copy; 2026 Lifting4Gains LLC</p>
  </div>
</footer>

<script>${js}</script>`;

writeFileSync(outPath, html, "utf8");
console.log(`Wrote ${outPath} — ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
