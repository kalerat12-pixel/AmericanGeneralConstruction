'use client';

import Link from 'next/link';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { Photo } from '@/components/photo';
import { Button } from '@/components/ui/button';
import { Rule } from '@/components/section';
import { OrderRequestForm } from './order-request-form';
import { useCart, cartSubtotal, cartCount } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';

export function CartView() {
  const { lines, hydrated, setQuantity, remove } = useCart();

  // Persisted state is only trustworthy after rehydration; render a quiet
  // placeholder until then rather than flashing an empty cart.
  if (!hydrated) {
    return (
      <div className="container-content section" aria-busy="true">
        <p className="sr-only">Loading your cart</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-content section">
        <div className="mx-auto max-w-md text-center">
          <p className="eyebrow">Your cart</p>
          <span aria-hidden className="mx-auto mt-4 block h-px w-10 bg-champagne/55" />
          <h2 className="mt-7 font-display text-display-xs font-light text-charcoal">
            Nothing here yet.
          </h2>
          <p className="mt-6 text-[0.9375rem] leading-[1.85] text-charcoal/70">
            When you add a material, it will wait here until you are ready to send an order
            request.
          </p>
          <Button asChild size="lg" className="mt-10">
            <Link href="/shop">Browse the catalogue</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);

  return (
    <div className="container-content section">
      <div className="grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="eyebrow">
            {count} {count === 1 ? 'item' : 'items'}
          </h2>
          <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />

          <ul className="mt-10">
            {lines.map((line) => (
              <li key={line.key}>
                <Rule />
                <div className="grid grid-cols-[88px_1fr] gap-6 py-8 sm:grid-cols-[112px_1fr] sm:gap-8">
                  <Link
                    href={`/shop/${line.slug}`}
                    className="relative aspect-[4/5] overflow-hidden bg-bone"
                  >
                    <Photo
                      src={line.image}
                      alt={line.imageAlt}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex flex-col justify-between gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-[1.375rem] font-light leading-tight text-charcoal">
                          <Link href={`/shop/${line.slug}`} className="hover-gold">
                            {line.name}
                          </Link>
                        </h3>
                        <p className="mt-2 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
                          {line.amount} · {line.sku}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center text-charcoal/65 hover-gold"
                      >
                        <X className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                        <span className="sr-only">
                          Remove {line.name} {line.amount} from cart
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center border border-charcoal/15">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center text-charcoal/70 hover-gold"
                        >
                          <Minus className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                          <span className="sr-only">Decrease quantity of {line.name}</span>
                        </button>
                        <span className="w-9 text-center font-sans text-[0.875rem] tabular-nums text-charcoal">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          disabled={line.quantity >= 20}
                          className="flex h-10 w-10 items-center justify-center text-charcoal/70 hover-gold disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                          <span className="sr-only">Increase quantity of {line.name}</span>
                        </button>
                      </div>
                      <p className="font-sans text-[0.9375rem] tabular-nums text-charcoal">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Rule />

          <div className="mt-10 flex items-baseline justify-between gap-6">
            <p className="eyebrow-muted">Subtotal</p>
            <p className="font-display text-[2rem] font-light lining-nums tabular-nums text-charcoal">
              {formatPrice(subtotal)}
            </p>
          </div>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-charcoal/65">
            Shipping and any applicable tax are quoted when we confirm your request. Nothing is
            charged from this page.
          </p>

          <Button asChild variant="link" className="mt-10">
            <Link href="/shop">
              Continue browsing
              <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
            </Link>
          </Button>
        </section>

        <OrderRequestForm lines={lines} subtotal={subtotal} />
      </div>
    </div>
  );
}
