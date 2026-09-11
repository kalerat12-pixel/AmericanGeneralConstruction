"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, Flavor } from "@/lib/types";
import { useCart } from "@/lib/cart/CartContext";
import { commerce } from "@/lib/config";
import { formatPrice, formatUnit } from "@/lib/pricing";

export function BuyBox({ product, flavor }: { product: Product; flavor: Flavor }) {
  const { add } = useCart();
  const inStock = product.variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState(
    // Default to the 12-pack where there is one — it's the honest sweet spot.
    (inStock.find((v) => v.packSize === 12) ?? inStock[0])?.id ?? "",
  );
  const [subscribe, setSubscribe] = useState(false);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const unitNoun = product.line === "energy" ? "can" : "bottle";

  const effectiveCents = subscribe
    ? Math.round(variant.priceCents * (1 - commerce.subscriptionDiscount))
    : variant.priceCents;

  function onAdd() {
    add({ productSlug: product.slug, variantId: variant.id, quantity: 1, subscribe });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  }

  return (
    <div>
      <fieldset>
        <legend className="type-eyebrow mb-4">Pack size</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {product.variants.map((v) => {
            const selected = v.id === variantId;
            return (
              <label
                key={v.id}
                className={`relative flex cursor-pointer flex-col border p-3.5 transition-colors ${
                  selected
                    ? "border-ember bg-ember/[0.06]"
                    : "border-line-input hover:border-ash"
                } ${v.inStock ? "" : "cursor-not-allowed opacity-45"}`}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={selected}
                  disabled={!v.inStock}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                <span className="font-display text-sm font-bold uppercase tracking-[0.02em]">
                  {v.label}
                </span>
                <span className="type-mono mt-1.5 text-sm">{formatPrice(v.priceCents)}</span>
                {v.packSize > 1 && (
                  <span className="type-mono mt-0.5 text-[11px] text-ash-dim">
                    {formatUnit(v.priceCents, v.packSize, unitNoun)}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Subscribe and save */}
      <div className="mt-5 border border-line-input">
        <label className="flex cursor-pointer items-start gap-3.5 p-4">
          <input
            type="checkbox"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ember)]"
          />
          <span>
            <span className="flex flex-wrap items-baseline gap-x-2.5 font-display text-sm font-bold uppercase tracking-[0.02em]">
              Subscribe &amp; save {Math.round(commerce.subscriptionDiscount * 100)}%
              <span className="type-mono text-xs font-normal normal-case tracking-normal text-ember">
                {formatPrice(Math.round(variant.priceCents * (1 - commerce.subscriptionDiscount)))}
                {" every 4 weeks"}
              </span>
            </span>
            <span className="mt-1.5 block text-xs leading-relaxed text-ash">
              Delivered every four weeks. Skip, pause or cancel from your account —
              no email required, no phone call, no retention flow.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
        <span className="type-eyebrow">Total</span>
        <span className="flex items-baseline gap-3">
          {subscribe && (
            <span className="type-mono text-sm text-ash-dim line-through">
              {formatPrice(variant.priceCents)}
            </span>
          )}
          <span className="type-mono font-display text-3xl font-extrabold tracking-[-0.03em]">
            {formatPrice(effectiveCents)}
          </span>
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <button type="button" onClick={onAdd} className="btn btn-primary w-full" disabled={!variant.inStock}>
          {added ? "Added to cart" : variant.inStock ? "Add to cart" : "Out of stock"}
        </button>

        {added && (
          <p role="status" className="text-center text-sm">
            <Link href="/cart" className="link-slide text-ember">
              Go to cart
            </Link>
          </p>
        )}

        {/* Affiliate mode: we don't hold this stock, so offer the direct route too. */}
        {commerce.isAffiliate && variant.affiliateUrl && (
          <a
            href={variant.affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="btn btn-ghost w-full"
          >
            Buy direct at retailer
          </a>
        )}
      </div>

      {commerce.isAffiliate && (
        <p className="mt-4 text-xs leading-relaxed text-ash-dim">
          We&rsquo;re an independent shop, not a Ghost warehouse. Checking out here
          hands you tagged links to a stocking retailer — we may earn a small
          commission, at no extra cost to you, and it never affects our rankings.
        </p>
      )}

      <dl className="mt-7 space-y-2.5 border-t border-line pt-6 text-sm">
        {[
          ["Caffeine", flavor.caffeineMg > 0 ? `${flavor.caffeineMg}mg per ${unitNoun}` : "None"],
          ["Sugar", `${flavor.sugarG}g`],
          ["Calories", `${flavor.calories} per ${unitNoun}`],
          ["Best for", flavor.bestFor],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-4">
            <dt className="w-24 shrink-0 text-ash-dim">{k}</dt>
            <dd className="flex-1">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
