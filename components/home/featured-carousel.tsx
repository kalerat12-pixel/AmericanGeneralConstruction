'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { SectionHeading } from '@/components/section';
import { Button } from '@/components/ui/button';
import type { Product } from '@/data/products';

/**
 * A scroll-snapped rail rather than a JS carousel: it stays keyboard- and
 * touch-native, and the arrows only nudge scrollLeft.
 */
export function FeaturedCarousel({ products }: { products: Product[] }) {
  const railRef = React.useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const sync = React.useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    sync();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 32 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  return (
    <section className="relative bg-bone/50">
      <div className="section">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              eyebrow="Selected lots"
              title="In stock, tested, and ready to ship"
              className="max-w-xl"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => nudge(-1)}
                disabled={atStart}
                aria-label="Previous products"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.25} aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => nudge(1)}
                disabled={atEnd}
                aria-label="Next products"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        <ul
          ref={railRef}
          className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-8 scroll-pl-6 overflow-x-auto scroll-smooth px-6 pb-2 md:scroll-pl-10 md:px-10 lg:scroll-pl-14 lg:px-14"
        >
          {products.map((p) => (
            <li
              key={p.id}
              className="w-[74vw] shrink-0 snap-start sm:w-[46vw] lg:w-[min(26rem,30vw)]"
            >
              <ProductCard product={p} />
            </li>
          ))}
          <li aria-hidden className="w-2 shrink-0 sm:w-6 lg:w-10" />
        </ul>

        <div className="container-content mt-14">
          <Button asChild variant="link">
            <Link href="/shop">
              View the full catalogue
              <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
