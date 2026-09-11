import "server-only";

import { getSupabaseAnon } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/config";
import { flavors as localFlavors, getFlavor as localGetFlavor } from "@/lib/data/flavors";
import { products as localProducts, getProduct as localGetProduct } from "@/lib/data/products";
import { reviewsFor as localReviewsFor, ratingSummary as localRatingSummary } from "@/lib/data/reviews";
import { rankings as localRankings } from "@/lib/data/rankings";
import type { Flavor, Product, Review, RankingEntry } from "@/lib/types";

/**
 * Every read goes through here.
 *
 * With Supabase configured, content comes from the database. Without it, the
 * bundled TypeScript catalog is used — identical shape, identical content
 * (seed.sql is generated from it), so `npm run dev` works on a fresh clone
 * with no environment variables at all.
 */

type Row = Record<string, unknown>;

function rowToFlavor(row: Row): Flavor {
  return {
    slug: row.slug as string,
    name: row.name as string,
    collab: (row.collab as string) ?? null,
    line: row.line as Flavor["line"],
    family: row.family as Flavor["family"],
    caffeineMg: Number(row.caffeine_mg),
    calories: Number(row.calories),
    sugarG: Number(row.sugar_g),
    actives: (row.actives as string[]) ?? [],
    notes: (row.notes as string[]) ?? [],
    tastingNote: row.tasting_note as string,
    shortTake: row.short_take as string,
    profile: {
      sweetness: Number(row.sweetness),
      sourness: Number(row.sourness),
      intensity: Number(row.intensity),
      body: Number(row.body),
    },
    pairsWith: (row.pairs_with as string[]) ?? [],
    bestFor: row.best_for as string,
    canTone: ((row.can_tone as string[]) ?? ["#1a1a1e", "#3a3a42"]) as [string, string],
    releaseYear: (row.release_year as number) ?? null,
    coreLineup: Boolean(row.core_lineup),
  };
}

function rowToProduct(row: Row): Product {
  const variants = ((row.product_variants as Row[]) ?? []).map((v) => ({
    id: v.id as string,
    packSize: Number(v.pack_size) as Product["variants"][number]["packSize"],
    label: v.label as string,
    priceCents: Number(v.price_cents),
    compareAtCents: (v.compare_at_cents as number) ?? null,
    affiliateUrl: (v.affiliate_url as string) ?? null,
    stripePriceId: (v.stripe_price_id as string) ?? null,
    stripeSubscriptionPriceId: (v.stripe_subscription_price_id as string) ?? null,
    inStock: Boolean(v.in_stock),
  }));
  variants.sort((a, b) => a.packSize - b.packSize);

  return {
    id: row.id as string,
    slug: row.slug as string,
    flavorSlug: row.slug as string,
    title: row.title as string,
    line: row.line as Product["line"],
    variants,
    featured: Boolean(row.featured),
    badge: (row.badge as string) ?? null,
  };
}

function rowToReview(row: Row): Review {
  return {
    id: row.id as string,
    productSlug: row.product_slug as string,
    author: row.author as string,
    context: (row.context as string) ?? "",
    rating: Number(row.rating),
    title: row.title as string,
    body: row.body as string,
    createdAt: String(row.created_at).slice(0, 10),
    verifiedPurchase: Boolean(row.verified_purchase),
    helpfulCount: Number(row.helpful_count),
  };
}

export async function listFlavors(): Promise<Flavor[]> {
  if (!supabaseConfigured) return localFlavors;
  const db = getSupabaseAnon();
  if (!db) return localFlavors;

  const { data, error } = await db.from("flavors").select("*");
  if (error || !data?.length) return localFlavors;
  return data.map(rowToFlavor);
}

export async function findFlavor(slug: string): Promise<Flavor | undefined> {
  if (!supabaseConfigured) return localGetFlavor(slug);
  const all = await listFlavors();
  return all.find((f) => f.slug === slug);
}

export async function listProducts(): Promise<Product[]> {
  if (!supabaseConfigured) return localProducts;
  const db = getSupabaseAnon();
  if (!db) return localProducts;

  const { data, error } = await db
    .from("products")
    .select("*, product_variants(*)");
  if (error || !data?.length) return localProducts;
  return data.map(rowToProduct);
}

export async function findProduct(slug: string): Promise<Product | undefined> {
  if (!supabaseConfigured) return localGetProduct(slug);
  const all = await listProducts();
  return all.find((p) => p.slug === slug);
}

export async function listReviews(productSlug: string): Promise<Review[]> {
  if (!supabaseConfigured) return localReviewsFor(productSlug);
  const db = getSupabaseAnon();
  if (!db) return localReviewsFor(productSlug);

  const { data, error } = await db
    .from("reviews")
    .select("*")
    .eq("product_slug", productSlug)
    .eq("approved", true)
    .order("helpful_count", { ascending: false });

  if (error || !data) return localReviewsFor(productSlug);
  return data.map(rowToReview);
}

export async function reviewSummary(productSlug: string) {
  if (!supabaseConfigured) return localRatingSummary(productSlug);
  const list = await listReviews(productSlug);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of list) distribution[r.rating] += 1;
  const average = list.length
    ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
    : 0;
  return { average: Math.round(average * 10) / 10, count: list.length, distribution };
}

export async function listRankings(): Promise<RankingEntry[]> {
  if (!supabaseConfigured) return localRankings;
  const db = getSupabaseAnon();
  if (!db) return localRankings;

  const { data, error } = await db.from("rankings").select("*").order("rank");
  if (error || !data?.length) return localRankings;
  return data.map((row) => ({
    rank: Number(row.rank),
    flavorSlug: row.flavor_slug as string,
    tier: row.tier as RankingEntry["tier"],
    verdict: row.verdict as string,
    knock: row.knock as string,
  }));
}

/** Tells the UI whether it is showing live data or the bundled catalog. */
export const dataSource = supabaseConfigured ? "supabase" : "bundled";
