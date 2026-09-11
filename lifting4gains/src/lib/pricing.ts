import { commerce } from "@/lib/config";
import { getProduct, getVariant } from "@/lib/data/products";
import type { CartLine, BundleSelection } from "@/lib/types";

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** "$2.71/can" style unit price. */
export function formatUnit(cents: number, packSize: number, noun = "can"): string {
  return `${formatPrice(Math.round(cents / packSize))}/${noun}`;
}

export interface CartTotals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  itemCount: number;
  hasSubscription: boolean;
  /** Cents still to spend before shipping goes free. 0 once qualified. */
  freeShippingGapCents: number;
}

export function lineTotalCents(line: CartLine): number {
  const variant = getVariant(line.productSlug, line.variantId);
  if (!variant) return 0;
  const gross = variant.priceCents * line.quantity;
  return line.subscribe
    ? Math.round(gross * (1 - commerce.subscriptionDiscount))
    : gross;
}

export function lineDiscountCents(line: CartLine): number {
  const variant = getVariant(line.productSlug, line.variantId);
  if (!variant || !line.subscribe) return 0;
  const gross = variant.priceCents * line.quantity;
  return gross - Math.round(gross * (1 - commerce.subscriptionDiscount));
}

export function cartTotals(lines: CartLine[]): CartTotals {
  let subtotalCents = 0;
  let discountCents = 0;
  let itemCount = 0;
  let hasSubscription = false;

  for (const line of lines) {
    const variant = getVariant(line.productSlug, line.variantId);
    if (!variant) continue;
    subtotalCents += variant.priceCents * line.quantity;
    discountCents += lineDiscountCents(line);
    itemCount += line.quantity;
    if (line.subscribe) hasSubscription = true;
  }

  const afterDiscount = subtotalCents - discountCents;

  // Affiliate mode never quotes shipping — the retailer owns that leg.
  const qualifiesFree =
    afterDiscount >= commerce.freeShippingThresholdCents || afterDiscount === 0;
  const shippingCents = commerce.isAffiliate
    ? 0
    : qualifiesFree
      ? 0
      : commerce.flatShippingCents;

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents: afterDiscount + shippingCents,
    itemCount,
    hasSubscription,
    freeShippingGapCents: Math.max(0, commerce.freeShippingThresholdCents - afterDiscount),
  };
}

/* -------------------------------------------------------------------------- */
/* Build-your-own bundle                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Volume tiers for the variety-pack builder. The whole point of the page is
 * that the price moves as you add cans, so the breaks need to be visible and
 * worth chasing.
 */
export interface BundleTier {
  min: number;
  perCanCents: number;
  label: string;
}

export const BUNDLE_TIERS: BundleTier[] = [
  { min: 4, perCanCents: 349, label: "Four-can minimum" },
  { min: 8, perCanCents: 319, label: "8+ cans" },
  { min: 12, perCanCents: 292, label: "12+ cans — the standard case" },
  { min: 24, perCanCents: 271, label: "24+ cans — best per-can price we do" },
];

export const BUNDLE_MIN = 4;
export const BUNDLE_MAX = 36;

export function bundleTierFor(count: number): BundleTier {
  let tier = BUNDLE_TIERS[0];
  for (const t of BUNDLE_TIERS) if (count >= t.min) tier = t;
  return tier;
}

export function nextBundleTier(count: number): BundleTier | null {
  return BUNDLE_TIERS.find((t) => count < t.min) ?? null;
}

export interface BundleQuote {
  count: number;
  perCanCents: number;
  subtotalCents: number;
  /** What the same cans would cost bought as singles. */
  singlesCents: number;
  savingsCents: number;
  tierLabel: string;
  nextTier: BundleTier | null;
  canToNext: number;
  valid: boolean;
}

export function quoteBundle(selections: BundleSelection[]): BundleQuote {
  const count = selections.reduce((sum, s) => sum + s.quantity, 0);
  const tier = bundleTierFor(count);
  const next = nextBundleTier(count);
  const perCanCents = tier.perCanCents;
  const subtotalCents = count * perCanCents;
  const singlesCents = count * BUNDLE_TIERS[0].perCanCents;

  return {
    count,
    perCanCents,
    subtotalCents,
    singlesCents,
    savingsCents: Math.max(0, singlesCents - subtotalCents),
    tierLabel: tier.label,
    nextTier: next,
    canToNext: next ? next.min - count : 0,
    valid: count >= BUNDLE_MIN && count <= BUNDLE_MAX,
  };
}

/* -------------------------------------------------------------------------- */
/* Wholesale                                                                  */
/* -------------------------------------------------------------------------- */

export const WHOLESALE_TIERS = [
  { cases: "5–9 cases", perCanCents: 249, note: "Single-location gyms getting started." },
  { cases: "10–24 cases", perCanCents: 229, note: "The typical order for a busy 300-member box." },
  { cases: "25–49 cases", perCanCents: 209, note: "Multi-location or a gym with a real front-of-house." },
  { cases: "50+ cases", perCanCents: 189, note: "Chains and distributors. Talk to us directly." },
] as const;

export function displayProductPrice(slug: string): { from: number; label: string } | null {
  const product = getProduct(slug);
  if (!product) return null;
  const cheapest = Math.min(...product.variants.map((v) => v.priceCents));
  return { from: cheapest, label: `From ${formatPrice(cheapest)}` };
}
