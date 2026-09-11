import type { Product, ProductVariant, PackSize } from "@/lib/types";
import { flavors } from "./flavors";
import { commerce } from "@/lib/config";

/**
 * Products are derived from the flavor catalog so a new flavor only has to be
 * added in one place. Pack pricing lives here; per-flavor merchandising
 * (featured, badge) is the only hand-maintained part.
 */

const AFFILIATE_BASE =
  process.env.NEXT_PUBLIC_AFFILIATE_BASE_URL ?? "https://www.ghostlifestyle.com/search?q=";

/** Cents per pack size, by product line. */
const PRICING: Record<"energy" | "hydration", Partial<Record<PackSize, number>>> = {
  energy: { 1: 379, 4: 1399, 12: 3499, 24: 6499 },
  hydration: { 1: 299, 12: 2999 },
};

/** Struck-through "compare at" price — the honest single-can maths. */
function compareAt(line: "energy" | "hydration", pack: PackSize): number | null {
  if (pack === 1) return null;
  const single = PRICING[line][1];
  if (!single) return null;
  return single * pack;
}

const MERCHANDISING: Record<string, { featured?: boolean; badge?: string }> = {
  "warheads-sour-watermelon": { featured: true, badge: "Best seller" },
  citrus: { featured: true, badge: "Most reordered" },
  "sour-patch-kids-redberry": { featured: true, badge: "Start here" },
  "sonic-ocean-water": { featured: true, badge: "Underrated" },
  "warheads-sour-green-apple": { badge: "Crew pick" },
  "bubblicious-cotton-candy": { badge: "Polarizing" },
  "welchs-grape": { badge: "Sells out" },
  "hydration-warheads-sour-watermelon": { badge: "Caffeine-free" },
};

/**
 * Outbound retailer link used in affiliate mode. We build a retailer SEARCH
 * URL rather than guessing a deep product path that could 404, and tag it so
 * attribution works. Swap AFFILIATE_BASE for your network's deep links when
 * you have them — see README.
 */
function buildAffiliateUrl(title: string): string {
  const url = new URL(
    AFFILIATE_BASE.includes("?") ? AFFILIATE_BASE : `${AFFILIATE_BASE}?`,
  );
  // Respect a query key already present on the base (e.g. "...?q="), else add one.
  const existingKey = [...url.searchParams.keys()].find(
    (k) => url.searchParams.get(k) === "",
  );
  url.searchParams.set(existingKey ?? "q", title);
  url.searchParams.set("ref", commerce.affiliateTag);
  return url.toString();
}

function packLabel(pack: PackSize, line: "energy" | "hydration"): string {
  const unit = line === "energy" ? "can" : "bottle";
  if (pack === 1) return `Single ${unit}`;
  return `${pack}-pack`;
}

function buildVariants(
  slug: string,
  title: string,
  line: "energy" | "hydration",
): ProductVariant[] {
  const packs = Object.keys(PRICING[line]).map(Number) as PackSize[];
  return packs.map((pack) => {
    const priceCents = PRICING[line][pack]!;
    return {
      id: `${slug}--${pack}`,
      packSize: pack,
      label: packLabel(pack, line),
      priceCents,
      compareAtCents: compareAt(line, pack),
      affiliateUrl: buildAffiliateUrl(title),
      // Populated by `npm run stripe:sync` once you create prices in Stripe.
      stripePriceId: process.env[`STRIPE_PRICE_${slug.toUpperCase().replace(/-/g, "_")}_${pack}`] ?? null,
      stripeSubscriptionPriceId: null,
      inStock: true,
    };
  });
}

export const products: Product[] = flavors.map((flavor) => {
  const merch = MERCHANDISING[flavor.slug] ?? {};
  const lineWord = flavor.line === "energy" ? "Energy" : "Hydration";
  const title = flavor.collab
    ? `Ghost ${lineWord} — ${flavor.collab} ${flavor.name}`
    : `Ghost ${lineWord} — ${flavor.name}`;

  return {
    id: `prod_${flavor.slug}`,
    slug: flavor.slug,
    flavorSlug: flavor.slug,
    title,
    line: flavor.line,
    variants: buildVariants(flavor.slug, title, flavor.line),
    featured: merch.featured ?? false,
    badge: merch.badge ?? null,
  };
});

export const productBySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return productBySlug.get(slug);
}

export function getVariant(slug: string, variantId: string): ProductVariant | undefined {
  return getProduct(slug)?.variants.find((v) => v.id === variantId);
}

export const featuredProducts = products.filter((p) => p.featured);

/** Cheapest per-unit price across the catalog, used in hero copy. */
export function bestPerCanCents(): number {
  const twentyFour = PRICING.energy[24]!;
  return Math.round(twentyFour / 24);
}
