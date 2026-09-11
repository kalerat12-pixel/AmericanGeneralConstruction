import type { CartLine, Order } from "@/lib/types";
import { getProduct, getVariant } from "@/lib/data/products";
import { getFlavor } from "@/lib/data/flavors";
import { cartTotals } from "@/lib/pricing";
import { commerce } from "@/lib/config";
import { getSupabaseService } from "@/lib/supabase/client";

/** Human-readable order reference — quotable over the phone. */
export function buildReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `L4G-${stamp}${rand}`;
}

export interface ResolvedLine {
  productSlug: string;
  title: string;
  flavorName: string;
  variantLabel: string;
  packSize: number;
  quantity: number;
  unitPriceCents: number;
  subscribe: boolean;
  affiliateUrl: string | null;
}

/**
 * Turns opaque cart lines into priced, titled lines. Always re-priced on the
 * server from the catalog — a client-supplied price is never trusted.
 */
export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  const resolved: ResolvedLine[] = [];

  for (const line of lines) {
    const product = getProduct(line.productSlug);
    const variant = getVariant(line.productSlug, line.variantId);
    const flavor = getFlavor(line.productSlug);
    if (!product || !variant || !flavor) continue;

    resolved.push({
      productSlug: product.slug,
      title: product.title,
      flavorName: flavor.name,
      variantLabel: variant.label,
      packSize: variant.packSize,
      quantity: Math.max(1, Math.min(99, Math.floor(line.quantity))),
      unitPriceCents: line.subscribe
        ? Math.round(variant.priceCents * (1 - commerce.subscriptionDiscount))
        : variant.priceCents,
      subscribe: Boolean(line.subscribe),
      affiliateUrl: variant.affiliateUrl,
    });
  }

  return resolved;
}

export async function recordOrder(params: {
  email: string;
  lines: CartLine[];
  reference: string;
  status: Order["status"];
  stripeSessionId?: string | null;
  referralCode?: string | null;
}): Promise<{ persisted: boolean; id: string | null }> {
  const db = getSupabaseService();
  const resolved = resolveLines(params.lines);
  const totals = cartTotals(params.lines);

  if (!db) {
    console.info(`[order] ${params.reference} for ${params.email} — no database configured`);
    return { persisted: false, id: null };
  }

  const { data, error } = await db
    .from("orders")
    .insert({
      reference: params.reference,
      email: params.email.toLowerCase(),
      status: params.status,
      subtotal_cents: totals.subtotalCents,
      discount_cents: totals.discountCents,
      shipping_cents: totals.shippingCents,
      total_cents: totals.totalCents,
      is_subscription: totals.hasSubscription,
      commerce_mode: commerce.mode,
      stripe_session_id: params.stripeSessionId ?? null,
      referral_code: params.referralCode ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[order] insert failed", error);
    return { persisted: false, id: null };
  }

  const { error: itemsError } = await db.from("order_items").insert(
    resolved.map((line) => ({
      order_id: data.id,
      product_slug: line.productSlug,
      title: line.title,
      variant_label: line.variantLabel,
      quantity: line.quantity,
      unit_price_cents: line.unitPriceCents,
      subscribe: line.subscribe,
    })),
  );

  if (itemsError) console.error("[order] items insert failed", itemsError);

  return { persisted: true, id: data.id };
}
