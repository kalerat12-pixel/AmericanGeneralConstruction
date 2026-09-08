'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';
import { Select } from '@/components/ui/input';
import { Stagger, StaggerItem } from '@/components/motion';
import { CATEGORIES, fromPrice, type Category, type Product } from '@/data/products';
import { cn } from '@/lib/utils';

const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price, low to high',
  'price-desc': 'Price, high to low',
  'purity-desc': 'Purity, high to low',
  'name-asc': 'Name, A–Z',
} as const;

type SortKey = keyof typeof SORTS;

function sortProducts(list: Product[], key: SortKey) {
  const copy = [...list];
  switch (key) {
    case 'price-asc':
      return copy.sort((a, b) => fromPrice(a) - fromPrice(b));
    case 'price-desc':
      return copy.sort((a, b) => fromPrice(b) - fromPrice(a));
    case 'purity-desc':
      return copy.sort((a, b) => b.purity - a.purity);
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function ShopBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const rawCategory = params.get('category');
  const category = (CATEGORIES as readonly string[]).includes(rawCategory ?? '')
    ? (rawCategory as Category)
    : null;
  const sort = (Object.keys(SORTS).includes(params.get('sort') ?? '')
    ? params.get('sort')
    : 'featured') as SortKey;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  };

  const filtered = React.useMemo(
    () => sortProducts(category ? products.filter((p) => p.category === category) : products, sort),
    [products, category, sort],
  );

  const counts = React.useMemo(
    () =>
      CATEGORIES.map((c) => ({
        category: c,
        count: products.filter((p) => p.category === c).length,
      })),
    [products],
  );

  return (
    <div className="container-content section">
      <div className="grid gap-14 lg:grid-cols-[minmax(190px,220px)_1fr] lg:gap-20">
        {/* Category sidebar */}
        <aside aria-label="Filter by category" className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="eyebrow">Category</h2>
          <span aria-hidden className="mt-4 block h-px w-8 bg-champagne/50" />
          <ul className="mt-6 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setParam('category', null)}
                aria-pressed={category === null}
                className={cn(
                  'flex w-full items-baseline justify-between gap-3 py-2.5 text-left font-sans text-[0.9375rem] transition-colors duration-500 ease-calm',
                  category === null
                    ? 'text-charcoal'
                    : 'text-charcoal/65 hover:text-charcoal',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      'h-px w-4 transition-all duration-500 ease-calm',
                      category === null ? 'bg-champagne' : 'bg-transparent',
                    )}
                  />
                  All products
                </span>
                <span className="font-sans text-[0.75rem] tabular-nums text-charcoal/65">
                  {products.length}
                </span>
              </button>
            </li>
            {counts.map(({ category: c, count }) => {
              const active = category === c;
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => setParam('category', active ? null : c)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-baseline justify-between gap-3 py-2.5 text-left font-sans text-[0.9375rem] transition-colors duration-500 ease-calm',
                      active ? 'text-charcoal' : 'text-charcoal/65 hover:text-charcoal',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className={cn(
                          'h-px w-4 transition-all duration-500 ease-calm',
                          active ? 'bg-champagne' : 'bg-transparent',
                        )}
                      />
                      {c}
                    </span>
                    <span className="font-sans text-[0.75rem] tabular-nums text-charcoal/65">
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-champagne/25 pb-6">
            <p aria-live="polite" className="font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              {category ? ` in ${category}` : ''}
            </p>
            <div className="flex items-center gap-4">
              <label
                htmlFor="sort"
                className="font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65"
              >
                Sort
              </label>
              <Select
                id="sort"
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="w-auto border-b-0 py-0 text-[0.9375rem]"
              >
                {Object.entries(SORTS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-24 text-center font-display text-2xl font-light text-charcoal/65">
              Nothing in this category yet.
            </p>
          ) : (
            <Stagger className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </div>
  );
}
