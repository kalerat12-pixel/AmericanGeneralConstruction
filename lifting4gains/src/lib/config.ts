/**
 * Single source of truth for how the store behaves.
 *
 * COMMERCE_MODE is the switch the whole business model hangs on:
 *
 *   "affiliate"  — we do not hold stock. Every buy action becomes an outbound,
 *                  tagged link to a retailer. Cart still works; checkout hands
 *                  the shopper a tagged list instead of taking payment.
 *
 *   "inventory"  — we hold stock. The same cart routes into Stripe Checkout,
 *                  subscriptions included, and we fulfil.
 *
 * Nothing outside this file needs to know which mode is active. Components ask
 * `commerce.takesPayment` / `commerce.isAffiliate` and render accordingly.
 */

export type CommerceMode = "affiliate" | "inventory";

const rawMode = process.env.NEXT_PUBLIC_COMMERCE_MODE?.trim().toLowerCase();

export const COMMERCE_MODE: CommerceMode =
  rawMode === "inventory" ? "inventory" : "affiliate";

export const commerce = {
  mode: COMMERCE_MODE,
  isAffiliate: COMMERCE_MODE === "affiliate",
  takesPayment: COMMERCE_MODE === "inventory",
  /** Appended to every outbound retailer link in affiliate mode. */
  affiliateTag: process.env.NEXT_PUBLIC_AFFILIATE_TAG ?? "lifting4gains",
  /** Recurring-order discount, applied in both modes for display honesty. */
  subscriptionDiscount: 0.15,
  freeShippingThresholdCents: 5000,
  flatShippingCents: 699,
  /** Wholesale enquiries below this case count get routed to retail instead. */
  wholesaleMinimumCases: 5,
} as const;

export const site = {
  name: "Lifting4Gains",
  legalName: "Lifting4Gains LLC",
  tagline: "Run by lifters. Stocked for lifters.",
  description:
    "A lifter-run shop for Ghost Energy — honest flavor rankings, build-your-own variety packs, and bulk pricing for gym owners.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "crew@lifting4gains.com",
  wholesaleEmail: "partners@lifting4gains.com",
  tiktok: "https://www.tiktok.com/@lifting4gains",
  tiktokHandle: "@lifting4gains",
  instagram: "https://www.instagram.com/lifting4gains",
  /** Shown in the footer. We are not Ghost and never imply otherwise. */
  trademarkNotice:
    "GHOST® is a registered trademark of its owner. Lifting4Gains is an independent retailer and is not affiliated with, endorsed by, or sponsored by Ghost Lifestyle or any of its collaborators.",
} as const;

export const stripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_"),
);

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
