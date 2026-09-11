"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { CanImage } from "@/components/product/CanImage";
import { getProduct, getVariant } from "@/lib/data/products";
import { getFlavor } from "@/lib/data/flavors";
import { formatPrice } from "@/lib/pricing";
import { commerce } from "@/lib/config";

export function CartView() {
  const { lines, totals, ready, setQuantity, setSubscribe, remove } = useCart();

  if (!ready) {
    return (
      <p className="py-12 text-sm text-ash" role="status">
        Loading your cart…
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-[-0.035em]">
          Nothing in here yet
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ash">
          Start with the rankings if you don&rsquo;t know what you want — we tell you
          which ones to skip as well as which to buy.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            Shop all flavors
          </Link>
          <Link href="/rankings" className="btn btn-ghost">
            Read the rankings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">
      <ul className="border-t border-line">
        {lines.map((line) => {
          const product = getProduct(line.productSlug);
          const variant = getVariant(line.productSlug, line.variantId);
          const flavor = getFlavor(line.productSlug);
          if (!product || !variant || !flavor) return null;

          const unit = line.subscribe
            ? Math.round(variant.priceCents * (1 - commerce.subscriptionDiscount))
            : variant.priceCents;

          return (
            <li key={line.variantId} className="flex gap-5 border-b border-line py-6">
              <Link
                href={`/product/${product.slug}`}
                className="w-16 shrink-0 sm:w-20"
                tabIndex={-1}
                aria-hidden="true"
              >
                <CanImage
                  slug={product.slug}
                  name={flavor.name}
                  size={96}
                  sizes="80px"
                  className="h-auto w-full"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div className="min-w-0">
                    {flavor.collab && (
                      <p className="text-[10px] uppercase tracking-[0.16em] text-ash-dim">
                        {flavor.collab}
                      </p>
                    )}
                    <h2 className="font-display text-lg font-extrabold uppercase tracking-[-0.025em]">
                      <Link href={`/product/${product.slug}`} className="hover:text-ember">
                        {flavor.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-ash">{variant.label}</p>
                  </div>

                  <p className="type-mono shrink-0 text-base">
                    {formatPrice(unit * line.quantity)}
                  </p>
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-xs text-ash">
                  <input
                    type="checkbox"
                    checked={line.subscribe}
                    onChange={(e) => setSubscribe(line.variantId, e.target.checked)}
                    className="h-3.5 w-3.5 accent-[var(--color-ember)]"
                  />
                  Subscribe every 4 weeks and save{" "}
                  {Math.round(commerce.subscriptionDiscount * 100)}%
                </label>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center border border-line-input text-lg leading-none transition-colors hover:border-bone"
                    >
                      <span aria-hidden="true">−</span>
                      <span className="sr-only">Decrease quantity of {flavor.name}</span>
                    </button>
                    <span className="type-mono w-9 text-center text-sm">
                      <span className="sr-only">Quantity: </span>
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center border border-line-input text-lg leading-none transition-colors hover:border-bone"
                    >
                      <span aria-hidden="true">+</span>
                      <span className="sr-only">Increase quantity of {flavor.name}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(line.variantId)}
                    className="text-xs text-ash-dim underline transition-colors hover:text-ember"
                  >
                    Remove<span className="sr-only"> {flavor.name} from cart</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="mt-10 lg:sticky lg:top-28 lg:mt-0" aria-label="Order summary">
        <div className="panel p-7">
          <h2 className="type-eyebrow">Summary</h2>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ash">Subtotal</dt>
              <dd className="type-mono">{formatPrice(totals.subtotalCents)}</dd>
            </div>

            {totals.discountCents > 0 && (
              <div className="flex justify-between text-ember">
                <dt>Subscriber discount</dt>
                <dd className="type-mono">−{formatPrice(totals.discountCents)}</dd>
              </div>
            )}

            <div className="flex justify-between">
              <dt className="text-ash">Shipping</dt>
              <dd className="type-mono">
                {commerce.isAffiliate
                  ? "At retailer"
                  : totals.shippingCents === 0
                    ? "Free"
                    : formatPrice(totals.shippingCents)}
              </dd>
            </div>

            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="type-eyebrow">Total</dt>
              <dd className="type-mono font-display text-2xl font-extrabold tracking-[-0.03em]">
                {formatPrice(totals.totalCents)}
              </dd>
            </div>
          </dl>

          {!commerce.isAffiliate && totals.freeShippingGapCents > 0 && (
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ash">
              Add {formatPrice(totals.freeShippingGapCents)} more for free shipping.
            </p>
          )}

          <Link href="/checkout" className="btn btn-primary mt-6 w-full">
            {commerce.isAffiliate ? "Continue" : "Checkout"}
          </Link>

          <Link href="/shop" className="btn btn-quiet mt-4 w-full text-sm">
            Keep shopping
          </Link>
        </div>

        {commerce.isAffiliate && (
          <p className="mt-5 text-xs leading-relaxed text-ash-dim">
            We&rsquo;re an independent shop. At the next step we hand you tagged
            links to a stocking retailer to complete your order — we may earn a
            commission at no extra cost to you.
          </p>
        )}
      </aside>
    </div>
  );
}
