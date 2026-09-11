"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { getProduct, getVariant } from "@/lib/data/products";
import { getFlavor } from "@/lib/data/flavors";
import { formatPrice } from "@/lib/pricing";
import { commerce } from "@/lib/config";
import { rememberOrder } from "@/lib/orders-store";

interface OutboundItem {
  title: string;
  flavorName: string;
  variantLabel: string;
  quantity: number;
  url: string | null;
}

type Result =
  | { mode: "affiliate"; reference: string; outbound: OutboundItem[] }
  | { mode: "stripe" | "simulated"; reference: string; url: string; note?: string };

export function CheckoutFlow() {
  const { lines, totals, ready, clear } = useCart();
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referralCode, lines }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");

      if (data.mode === "affiliate") {
        setResult(data);
        // Keep a copy of the order locally so /account can show it without auth.
        rememberOrder({
          reference: data.reference,
          email,
          totalCents: totals.totalCents,
          createdAt: new Date().toISOString(),
        });
        clear();
      } else {
        rememberOrder({
          reference: data.reference,
          email,
          totalCents: totals.totalCents,
          createdAt: new Date().toISOString(),
        });
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-ash">Loading…</p>;

  /* ---- Affiliate handoff ------------------------------------------------ */
  if (result && result.mode === "affiliate") {
    return (
      <div className="max-w-2xl">
        <p className="type-eyebrow text-ember">Order {result.reference}</p>
        <h2 className="type-section mt-4">Finish up at the retailer</h2>
        <p className="type-lead mt-5">
          We&rsquo;ve saved your list. Open each link to complete the purchase —
          your order is already tagged to us, so nothing extra to do.
        </p>

        <ul className="mt-10 border-t border-line">
          {result.outbound.map((item, i) => (
            <li key={`${item.title}-${i}`} className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5">
              <div className="min-w-0">
                <p className="font-display text-base font-bold uppercase tracking-[-0.02em]">
                  {item.flavorName}
                </p>
                <p className="mt-1 text-sm text-ash">
                  {item.variantLabel} × {item.quantity}
                </p>
              </div>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="btn btn-ghost shrink-0"
                >
                  Open retailer
                </a>
              ) : (
                <span className="text-sm text-ash-dim">No link available</span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-primary">
            Back to the shop
          </Link>
          <Link href="/account" className="btn btn-ghost">
            View your orders
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-12">
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em]">
          Your cart is empty
        </h2>
        <Link href="/shop" className="btn btn-primary mt-6">
          Shop all flavors
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">
      <form onSubmit={onSubmit} noValidate>
        <h2 className="type-eyebrow">Your details</h2>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="checkout-email" className="mb-2 block text-sm font-medium">
              Email
              <span className="ml-1 text-ember" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              aria-describedby="checkout-email-hint"
            />
            <p id="checkout-email-hint" className="mt-1.5 text-xs text-ash-dim">
              For your receipt and order updates. Nothing else.
            </p>
          </div>

          <div>
            <label htmlFor="referral" className="mb-2 block text-sm font-medium">
              Gym referral code
              <span className="ml-2 text-xs text-ash-dim">Optional</span>
            </label>
            <input
              id="referral"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="field type-mono"
              placeholder="IRONHOUSE10"
              aria-describedby="referral-hint"
            />
            <p id="referral-hint" className="mt-1.5 text-xs text-ash-dim">
              If your gym is a partner, their code gets you 10% off and credits
              them. Ask at the front desk.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-6 border border-ember/40 bg-ember/[0.06] px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary mt-8 w-full sm:w-auto" disabled={busy}>
          {busy
            ? "Working…"
            : commerce.isAffiliate
              ? "Get my retailer links"
              : `Pay ${formatPrice(totals.totalCents)}`}
        </button>

        {!commerce.isAffiliate && (
          <p className="mt-4 text-xs leading-relaxed text-ash-dim">
            You&rsquo;ll be taken to Stripe to pay. We never see your card details.
            {totals.hasSubscription &&
              " Your subscription renews every 4 weeks and can be cancelled from your account at any time."}
          </p>
        )}
      </form>

      <aside className="mt-12 lg:sticky lg:top-28 lg:mt-0" aria-label="Order summary">
        <div className="panel p-7">
          <h2 className="type-eyebrow">Order summary</h2>

          <ul className="mt-6 space-y-3.5">
            {lines.map((line) => {
              const product = getProduct(line.productSlug);
              const variant = getVariant(line.productSlug, line.variantId);
              const flavor = getFlavor(line.productSlug);
              if (!product || !variant || !flavor) return null;

              const unit = line.subscribe
                ? Math.round(variant.priceCents * (1 - commerce.subscriptionDiscount))
                : variant.priceCents;

              return (
                <li key={line.variantId} className="flex justify-between gap-4 text-sm">
                  <span className="min-w-0 text-ash">
                    {flavor.name}
                    <span className="text-ash-dim">
                      {" "}
                      · {variant.label} × {line.quantity}
                    </span>
                    {line.subscribe && <span className="block text-xs text-ember">Subscription</span>}
                  </span>
                  <span className="type-mono shrink-0">{formatPrice(unit * line.quantity)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
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
        </div>
      </aside>
    </div>
  );
}
