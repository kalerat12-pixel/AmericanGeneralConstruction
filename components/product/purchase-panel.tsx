'use client';

import * as React from 'react';
import Link from 'next/link';
import { Minus, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/data/products';

export function PurchasePanel({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [sizeIndex, setSizeIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const size = product.sizes[sizeIndex];

  // Reset the confirmation after a beat so the button returns to its label.
  React.useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <div>
      <p className="font-display text-[2rem] font-light lining-nums tabular-nums text-charcoal">
        {formatPrice(size.price)}
      </p>

      <fieldset className="mt-10">
        <legend className="eyebrow-muted">Fill quantity</legend>
        <div className="mt-5 flex flex-wrap gap-3">
          {product.sizes.map((s, i) => (
            <button
              key={s.sku}
              type="button"
              onClick={() => setSizeIndex(i)}
              aria-pressed={i === sizeIndex}
              className={cn(
                'border px-6 py-3.5 font-sans text-[0.875rem] tracking-wide transition-colors duration-500 ease-calm',
                i === sizeIndex
                  ? 'border-champagne bg-champagne/10 text-charcoal'
                  : 'border-charcoal/15 text-charcoal/70 hover:border-charcoal/35 hover:text-charcoal',
              )}
            >
              {s.amount}
            </button>
          ))}
        </div>
        <p className="mt-4 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
          SKU {size.sku}
        </p>
      </fieldset>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <div className="flex items-center border border-charcoal/15">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex h-12 w-12 items-center justify-center text-charcoal/70 hover-gold disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Decrease quantity</span>
          </button>
          <span
            aria-live="polite"
            className="w-10 text-center font-sans text-[0.9375rem] tabular-nums text-charcoal"
          >
            {quantity}
          </span>
          <span className="sr-only">Quantity: {quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            disabled={quantity >= 20}
            className="flex h-12 w-12 items-center justify-center text-charcoal/70 hover-gold disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Increase quantity</span>
          </button>
        </div>

        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            add(product, size, quantity);
            setAdded(true);
          }}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Added to cart
            </>
          ) : (
            'Add to cart'
          )}
        </Button>
      </div>

      <p aria-live="polite" className="sr-only">
        {added ? `${quantity} × ${product.name} ${size.amount} added to cart` : ''}
      </p>

      <p className="mt-5 text-[0.8125rem] leading-relaxed text-charcoal/65">
        Checkout is by order request — you will confirm details with us before anything is
        charged.{' '}
        <Link href="/cart" className="underline underline-offset-4 hover-gold">
          Review your cart
        </Link>
        .
      </p>
    </div>
  );
}
