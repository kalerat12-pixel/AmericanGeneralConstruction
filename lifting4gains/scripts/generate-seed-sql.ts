/**
 * Generates supabase/seed.sql from the bundled TypeScript catalog, so the
 * database and the zero-config local catalog can never drift apart.
 *
 *   npm run db:seed-sql
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { flavors } from "../src/lib/data/flavors";
import { products } from "../src/lib/data/products";
import { reviews } from "../src/lib/data/reviews";
import { rankings } from "../src/lib/data/rankings";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../supabase/seed.sql");

const q = (v: string | null | undefined): string =>
  v === null || v === undefined ? "null" : `'${v.replace(/'/g, "''")}'`;

const arr = (v: readonly string[]): string =>
  `array[${v.map((s) => q(s)).join(", ")}]::text[]`;

const lines: string[] = [
  "-- GENERATED FILE — do not edit by hand.",
  "-- Regenerate with: npm run db:seed-sql",
  "-- Source of truth: src/lib/data/*.ts",
  "",
  "begin;",
  "",
  "truncate table public.order_items, public.orders, public.reviews,",
  "  public.rankings, public.product_variants, public.products, public.flavors",
  "  restart identity cascade;",
  "",
  "-- Flavors -----------------------------------------------------------------",
];

for (const f of flavors) {
  lines.push(
    `insert into public.flavors (slug, name, collab, line, family, caffeine_mg, calories, sugar_g, actives, notes, tasting_note, short_take, sweetness, sourness, intensity, body, pairs_with, best_for, can_tone, release_year, core_lineup) values (${[
      q(f.slug),
      q(f.name),
      q(f.collab),
      q(f.line),
      q(f.family),
      f.caffeineMg,
      f.calories,
      f.sugarG,
      arr(f.actives),
      arr(f.notes),
      q(f.tastingNote),
      q(f.shortTake),
      f.profile.sweetness,
      f.profile.sourness,
      f.profile.intensity,
      f.profile.body,
      arr(f.pairsWith),
      q(f.bestFor),
      arr(f.canTone),
      f.releaseYear ?? "null",
      f.coreLineup,
    ].join(", ")});`,
  );
}

lines.push("", "-- Products ----------------------------------------------------------------");
for (const p of products) {
  lines.push(
    `insert into public.products (id, slug, title, line, featured, badge) values (${[
      q(p.id),
      q(p.slug),
      q(p.title),
      q(p.line),
      p.featured,
      q(p.badge),
    ].join(", ")});`,
  );
  for (const v of p.variants) {
    lines.push(
      `insert into public.product_variants (id, product_slug, pack_size, label, price_cents, compare_at_cents, affiliate_url, stripe_price_id, stripe_subscription_price_id, in_stock) values (${[
        q(v.id),
        q(p.slug),
        v.packSize,
        q(v.label),
        v.priceCents,
        v.compareAtCents ?? "null",
        q(v.affiliateUrl),
        q(v.stripePriceId),
        q(v.stripeSubscriptionPriceId),
        v.inStock,
      ].join(", ")});`,
    );
  }
}

lines.push("", "-- Rankings ----------------------------------------------------------------");
for (const r of rankings) {
  lines.push(
    `insert into public.rankings (rank, flavor_slug, tier, verdict, knock) values (${[
      r.rank,
      q(r.flavorSlug),
      q(r.tier),
      q(r.verdict),
      q(r.knock),
    ].join(", ")});`,
  );
}

lines.push(
  "",
  "-- Reviews -----------------------------------------------------------------",
  "-- Seeded reviews are pre-approved; reviews submitted through the site are not.",
);
for (const r of reviews) {
  lines.push(
    `insert into public.reviews (product_slug, author, context, rating, title, body, verified_purchase, helpful_count, approved, created_at) values (${[
      q(r.productSlug),
      q(r.author),
      q(r.context),
      r.rating,
      q(r.title),
      q(r.body),
      r.verifiedPurchase,
      r.helpfulCount,
      true,
      q(`${r.createdAt}T12:00:00Z`),
    ].join(", ")});`,
  );
}

lines.push(
  "",
  "-- Referral codes ----------------------------------------------------------",
  "-- Two live examples so the partner flow can be demoed end to end.",
  `insert into public.referral_codes (code, gym_name, discount_percent, commission_percent) values ('IRONHOUSE10', 'Iron House Barbell', 10, 5) on conflict (code) do nothing;`,
  `insert into public.referral_codes (code, gym_name, discount_percent, commission_percent) values ('CHALKDUST10', 'Chalk Dust Strength Co.', 10, 5) on conflict (code) do nothing;`,
  "",
  "commit;",
  "",
);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"), "utf8");
console.log(
  `Wrote ${out}\n  ${flavors.length} flavors, ${products.length} products, ${products.reduce(
    (n, p) => n + p.variants.length,
    0,
  )} variants, ${rankings.length} rankings, ${reviews.length} reviews`,
);
