import Link from "next/link";
import type { Product, Flavor } from "@/lib/types";
import { CanImage } from "@/components/product/CanImage";
import { Stars } from "@/components/ui/Stars";
import { formatPrice } from "@/lib/pricing";
import { ratingSummary } from "@/lib/data/reviews";

export function ProductCard({
  product,
  flavor,
  priority = false,
}: {
  product: Product;
  flavor: Flavor;
  priority?: boolean;
}) {
  const cheapest = Math.min(...product.variants.map((v) => v.priceCents));
  const summary = ratingSummary(product.slug);

  return (
    <article className="group relative flex min-w-0 flex-col border-b border-r border-line">
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col focus-visible:outline-offset-[-2px]">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-raised">
          {product.badge && (
            <span className="absolute left-4 top-4 z-10 border border-line-strong bg-ink/80 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ash">
              {product.badge}
            </span>
          )}

          <div className="flex h-full items-center justify-center p-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
            <CanImage
              slug={product.slug}
              name={flavor.name}
              size={260}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Hairline that fills on hover — the only accent on the card. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ember transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5 lg:p-6">
          {flavor.collab && (
            <p className="type-eyebrow mb-2 text-[10px] tracking-[0.18em]">{flavor.collab}</p>
          )}
          <h3 className="font-display text-xl font-extrabold uppercase leading-[0.95] tracking-[-0.03em] sm:text-2xl">
            {flavor.name}
          </h3>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ash">{flavor.shortTake}</p>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-5">
            <div className="min-w-0">
              {summary.count > 0 && (
                <span className="mb-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <Stars rating={summary.average} size={12} />
                  <span className="type-mono text-xs text-ash-dim">({summary.count})</span>
                </span>
              )}
              <p className="type-mono text-sm">
                <span className="text-ash-dim">From </span>
                {formatPrice(cheapest)}
              </p>
            </div>
            <span className="type-mono text-[11px] uppercase tracking-[0.1em] text-ash-dim">
              {flavor.caffeineMg > 0 ? `${flavor.caffeineMg}mg` : "No caffeine"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
