"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Flavor, BundleSelection } from "@/lib/types";
import { CanImage } from "@/components/product/CanImage";
import { useCart } from "@/lib/cart/CartContext";
import { commerce } from "@/lib/config";
import {
  quoteBundle,
  formatPrice,
  BUNDLE_TIERS,
  BUNDLE_MIN,
  BUNDLE_MAX,
} from "@/lib/pricing";

const PRESETS: Array<{ name: string; blurb: string; slugs: string[] }> = [
  {
    name: "The starter twelve",
    blurb: "Four flavors, three of each. Works out what kind of drinker you are.",
    slugs: ["warheads-sour-watermelon", "citrus", "sour-patch-kids-redberry", "sonic-ocean-water"],
  },
  {
    name: "All sour, no apologies",
    blurb: "If your answer to 'too sour?' has always been 'no'.",
    slugs: ["warheads-sour-watermelon", "warheads-sour-green-apple", "warheads-sour-black-cherry"],
  },
  {
    name: "The daily driver case",
    blurb: "The two least sweet cans, for people who drink one every single day.",
    slugs: ["citrus", "lemon-lime"],
  },
];

export function BundleBuilder({ flavors }: { flavors: Flavor[] }) {
  const { add } = useCart();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const list: BundleSelection[] = useMemo(
    () =>
      Object.entries(selections)
        .filter(([, q]) => q > 0)
        .map(([flavorSlug, quantity]) => ({ flavorSlug, quantity })),
    [selections],
  );

  const quote = quoteBundle(list);
  const flavorMap = useMemo(() => new Map(flavors.map((f) => [f.slug, f])), [flavors]);

  function bump(slug: string, delta: number) {
    setAdded(false);
    setSelections((current) => {
      const next = Math.max(0, (current[slug] ?? 0) + delta);
      const total = Object.entries(current).reduce(
        (sum, [k, v]) => sum + (k === slug ? next : v),
        0,
      );
      if (total > BUNDLE_MAX) return current;
      return { ...current, [slug]: next };
    });
  }

  function applyPreset(slugs: string[]) {
    const per = Math.floor(12 / slugs.length);
    const remainder = 12 - per * slugs.length;
    const next: Record<string, number> = {};
    slugs.forEach((slug, i) => {
      next[slug] = per + (i < remainder ? 1 : 0);
    });
    setSelections(next);
    setAdded(false);
  }

  function addToCart() {
    // Each flavor enters the cart as its own single-can line at the tier price
    // the builder quoted, so the cart and the builder can never disagree.
    for (const sel of list) {
      add({
        productSlug: sel.flavorSlug,
        variantId: `${sel.flavorSlug}--1`,
        quantity: sel.quantity,
        subscribe: false,
      });
    }
    setAdded(true);
  }

  const pct = Math.min(100, (quote.count / 24) * 100);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">
      <div>
        {/* ---- Presets -------------------------------------------------- */}
        <section aria-labelledby="presets-heading">
          <h2 id="presets-heading" className="type-eyebrow">
            Or start from one of ours
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.slugs)}
                className="group border border-line-input p-5 text-left transition-colors hover:border-ember"
              >
                <span className="block font-display text-base font-extrabold uppercase leading-tight tracking-[-0.02em] transition-colors group-hover:text-ember">
                  {preset.name}
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-ash">{preset.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ---- Flavor picker -------------------------------------------- */}
        <section className="mt-14" aria-labelledby="picker-heading">
          <h2 id="picker-heading" className="type-eyebrow">
            Pick your cans
          </h2>

          <ul className="mt-5 grid gap-px border-t border-line sm:grid-cols-2">
            {flavors.map((flavor) => {
              const qty = selections[flavor.slug] ?? 0;
              const atMax = quote.count >= BUNDLE_MAX;

              return (
                <li
                  key={flavor.slug}
                  className={`flex min-w-0 items-center gap-3 border-b border-line py-4 sm:gap-4 sm:pr-6 ${
                    qty > 0 ? "bg-ember/[0.04]" : ""
                  }`}
                >
                  <div className="w-12 shrink-0">
                    <CanImage
                      slug={flavor.slug}
                      name={flavor.name}
                      size={64}
                      sizes="48px"
                      className="h-auto w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {flavor.collab && (
                      <p className="truncate text-[10px] uppercase tracking-[0.16em] text-ash-dim">
                        {flavor.collab}
                      </p>
                    )}
                    <p className="truncate font-display text-sm font-bold uppercase tracking-[-0.01em]">
                      {flavor.name}
                    </p>
                    <p className="hidden truncate text-xs text-ash sm:block">
                      {flavor.notes.join(" · ")}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => bump(flavor.slug, -1)}
                      disabled={qty === 0}
                      className="flex h-9 w-9 items-center justify-center border border-line-input text-lg leading-none transition-colors hover:border-bone disabled:opacity-30 disabled:hover:border-line-input"
                    >
                      <span aria-hidden="true">−</span>
                      <span className="sr-only">Remove one {flavor.name}</span>
                    </button>

                    <span
                      className="type-mono w-9 text-center text-sm"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <span className="sr-only">{flavor.name}: </span>
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => bump(flavor.slug, 1)}
                      disabled={atMax}
                      className="flex h-9 w-9 items-center justify-center border border-line-input text-lg leading-none transition-colors hover:border-bone disabled:opacity-30 disabled:hover:border-line-input"
                    >
                      <span aria-hidden="true">+</span>
                      <span className="sr-only">Add one {flavor.name}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ---- Live summary ------------------------------------------------ */}
      <aside
        className="mt-12 border-t border-line pt-7 pb-28 lg:sticky lg:top-28 lg:mt-0 lg:border lg:px-7 lg:py-8 lg:pb-8"
        aria-label="Your pack"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="type-eyebrow">Your pack</h2>
          <span className="type-mono text-sm text-ash">
            {quote.count} / {BUNDLE_MAX}
          </span>
        </div>

        {/* Progress to the next price break */}
        <div className="mt-4">
          <div className="h-1 w-full bg-line" role="presentation">
            <div
              className="h-full bg-ember transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ash" role="status" aria-live="polite">
            {quote.count < BUNDLE_MIN
              ? `Add ${BUNDLE_MIN - quote.count} more to reach the ${BUNDLE_MIN}-can minimum.`
              : quote.nextTier
                ? `Add ${quote.canToNext} more and every can drops to ${formatPrice(quote.nextTier.perCanCents)}.`
                : "You're at our best per-can price."}
          </p>
        </div>

        <div className="mt-6 max-h-52 overflow-y-auto lg:max-h-64">
          {list.length === 0 ? (
            <p className="text-sm text-ash-dim">Nothing picked yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {list.map((sel) => {
                const flavor = flavorMap.get(sel.flavorSlug);
                return (
                  <li key={sel.flavorSlug} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate text-ash">{flavor?.name ?? sel.flavorSlug}</span>
                    <span className="type-mono shrink-0">×{sel.quantity}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ash">Per can</dt>
            <dd className="type-mono">{formatPrice(quote.perCanCents)}</dd>
          </div>
          {quote.savingsCents > 0 && (
            <div className="flex justify-between text-ember">
              <dt>Volume saving</dt>
              <dd className="type-mono">−{formatPrice(quote.savingsCents)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="type-eyebrow">Total</dt>
            <dd className="type-mono font-display text-2xl font-extrabold tracking-[-0.03em]">
              {formatPrice(quote.subtotalCents)}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={addToCart}
          disabled={!quote.valid}
          className={`btn mt-6 w-full ${quote.valid ? "btn-primary" : "btn-ghost"}`}
        >
          {added ? "Added to cart" : quote.valid ? "Add pack to cart" : `Minimum ${BUNDLE_MIN} cans`}
        </button>

        {added && (
          <p role="status" className="mt-3 text-center text-sm">
            <Link href="/cart" className="link-slide text-ember">
              Go to cart
            </Link>
          </p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-ash-dim">
          Subscribe at checkout for a further{" "}
          {Math.round(commerce.subscriptionDiscount * 100)}% off. Free shipping over{" "}
          {formatPrice(commerce.freeShippingThresholdCents)}.
        </p>

        <details className="mt-5 border-t border-line pt-4">
          <summary className="cursor-pointer text-xs uppercase tracking-[0.1em] text-ash hover:text-bone">
            Volume pricing
          </summary>
          <dl className="mt-3 space-y-1.5 text-xs">
            {BUNDLE_TIERS.map((tier) => (
              <div
                key={tier.min}
                className={`flex justify-between ${
                  quote.perCanCents === tier.perCanCents ? "text-ember" : "text-ash"
                }`}
              >
                <dt>{tier.min}+ cans</dt>
                <dd className="type-mono">{formatPrice(tier.perCanCents)}/can</dd>
              </div>
            ))}
          </dl>
        </details>
      </aside>

      {/* Mobile action bar. Most traffic arrives from a TikTok bio link, so the
          running total and the add button stay reachable without scrolling. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-4 px-[var(--spacing-gutter)] py-3">
          <div className="min-w-0 flex-1">
            <p className="type-mono text-[11px] uppercase tracking-[0.1em] text-ash">
              {quote.count} {quote.count === 1 ? "can" : "cans"}
              {quote.count >= BUNDLE_MIN && ` · ${formatPrice(quote.perCanCents)}/can`}
            </p>
            <p className="type-mono font-display text-xl font-extrabold leading-tight tracking-[-0.03em]">
              {formatPrice(quote.subtotalCents)}
            </p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={!quote.valid}
            className={`btn shrink-0 px-6 py-3 ${quote.valid ? "btn-primary" : "btn-ghost"}`}
          >
            {added ? "Added" : quote.valid ? "Add pack" : `Add ${BUNDLE_MIN - quote.count} more`}
          </button>
        </div>
      </div>
    </div>
  );
}
