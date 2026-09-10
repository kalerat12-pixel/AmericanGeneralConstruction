'use client';

import * as React from 'react';
import Link from 'next/link';
import { Photo } from '@/components/photo';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import { fromPrice, type Product } from '@/data/products';

/**
 * Card with a hover/focus image swap. The second frame is layered on top and
 * cross-fades in, so there is no layout shift and no flash on slow networks.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const [primary, secondary] = product.images;

  return (
    <article className={cn('group relative', className)}>
      <Link href={`/shop/${product.slug}`} className="block focus:outline-none">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          <Photo
            src={primary.src}
            alt={primary.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-opacity duration-700 ease-calm group-hover:opacity-0 group-focus-within:opacity-0"
          />
          {secondary && (
            <Photo
              src={secondary.src}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="scale-[1.02] object-cover opacity-0 transition-opacity duration-700 ease-calm group-hover:opacity-100 group-focus-within:opacity-100"
            />
          )}
          <div className="pointer-events-none absolute left-4 top-4">
            <Badge variant="sage">{product.category}</Badge>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[1.375rem] font-light leading-tight text-charcoal transition-colors duration-500 ease-calm group-hover-gold md:text-2xl">
              {/* Stretched link keeps the whole card clickable without nesting anchors. */}
              <span className="absolute inset-0" aria-hidden />
              {product.name}
            </h3>
            <p className="shrink-0 font-sans text-[0.9375rem] tabular-nums text-charcoal/75">
              {formatPrice(fromPrice(product))}
            </p>
          </div>
          <p className="mt-2.5 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
            {product.purity.toFixed(1)}% purity · {product.sizes.map((s) => s.amount).join(' / ')}
          </p>
        </div>
      </Link>
    </article>
  );
}
