export type ProductLine = "energy" | "hydration";

export type FlavorFamily =
  | "sour"
  | "candy"
  | "fruit"
  | "citrus"
  | "creamy"
  | "soda";

export type PackSize = 1 | 4 | 12 | 24;

export interface TasteProfile {
  /** 1 = barely sweet, 5 = candy-aisle sweet */
  sweetness: number;
  /** 1 = no pucker, 5 = your jaw locks up */
  sourness: number;
  /** 1 = sip it at your desk, 5 = it announces itself */
  intensity: number;
  /** 1 = thin and crisp, 5 = thick and syrupy on the tongue */
  body: number;
}

export interface Flavor {
  slug: string;
  name: string;
  /** Collab or sub-brand shown above the flavor name, e.g. "Warheads". */
  collab: string | null;
  line: ProductLine;
  family: FlavorFamily;
  caffeineMg: number;
  calories: number;
  sugarG: number;
  /** Named functional ingredients. No fabricated milligram counts. */
  actives: string[];
  /** Short descriptors used as filter chips and on the card. */
  notes: string[];
  /** Editorial tasting note — first person, written by the shop. */
  tastingNote: string;
  /** One-line take used on cards and in the ranking table. */
  shortTake: string;
  profile: TasteProfile;
  /** Flavor slugs that pair well in a variety pack. */
  pairsWith: string[];
  /** Honest use-case guidance: when this one actually works. */
  bestFor: string;
  /** Hex pair used only for the duotone can art, never for UI chrome. */
  canTone: [string, string];
  releaseYear: number | null;
  /** False when the flavor is a limited run or regional. */
  coreLineup: boolean;
}

export interface ProductVariant {
  id: string;
  packSize: PackSize;
  label: string;
  priceCents: number;
  compareAtCents: number | null;
  /** Outbound retailer URL used when COMMERCE_MODE=affiliate. */
  affiliateUrl: string | null;
  stripePriceId: string | null;
  stripeSubscriptionPriceId: string | null;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  flavorSlug: string;
  title: string;
  line: ProductLine;
  variants: ProductVariant[];
  featured: boolean;
  badge: string | null;
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  /** e.g. "Powerlifting, 4 yrs" — establishes who is talking. */
  context: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export type RankTier = "S" | "A" | "B" | "C";

export interface RankingEntry {
  rank: number;
  flavorSlug: string;
  tier: RankTier;
  verdict: string;
  /** The honest downside. Every entry has one. */
  knock: string;
}

export interface CartLine {
  productSlug: string;
  variantId: string;
  quantity: number;
  subscribe: boolean;
}

export interface BundleSelection {
  flavorSlug: string;
  quantity: number;
}

export interface PartnerLead {
  gymName: string;
  contactName: string;
  email: string;
  phone: string | null;
  city: string;
  memberCount: string;
  currentSupplier: string | null;
  monthlyCases: string;
  message: string | null;
  referralCode: string | null;
}

export interface Order {
  id: string;
  reference: string;
  email: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  isSubscription: boolean;
  createdAt: string;
  items: Array<{
    productSlug: string;
    title: string;
    variantLabel: string;
    quantity: number;
    unitPriceCents: number;
  }>;
}
