"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus, ShieldCheck, Star } from "lucide-react";
import VialRender from "@/components/ui/VialRender";
import { useCart } from "@/lib/cart";
import { cn, formatUSD } from "@/lib/utils";
import type { Product } from "@/lib/products";

type Tab = "benefits" | "science";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [tab, setTab] = useState<Tab>("benefits");
  const [added, setAdded] = useState(false);

  const isGreen = product.accent === "green";
  const accentText = isGreen ? "text-brand" : "text-teal";
  const accentBorder = isGreen ? "border-brand/40" : "border-teal/40";
  const accentBg = isGreen ? "bg-brand/10" : "bg-teal/10";
  const href = `/products/${product.slug}`;

  const handleAdd = () => {
    add(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="panel panel-hover group relative flex h-full flex-col overflow-hidden rounded-md">
      {/* Media — the whole panel routes to the compound page */}
      <Link
        href={href}
        aria-label={`${product.name} — full specification and certificate of analysis`}
        className="relative block overflow-hidden border-b border-line bg-surface-tint px-5 pt-5 pb-2"
      >
        <div className="pointer-events-none absolute inset-0 hairline-grid" aria-hidden />

        <div className="relative flex items-start justify-between gap-2">
          <span className={cn("rounded-md border px-2 py-1 font-mono text-[9px] tracking-[0.14em] uppercase backdrop-blur-sm", accentBorder, accentBg, accentText)}>
            {product.category}
          </span>
          {product.bestSeller && (
            <span className="rounded-md border border-line bg-surface/80 px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-body uppercase backdrop-blur-sm">
              Best Seller
            </span>
          )}
        </div>

        <VialRender
          name={product.name}
          size={product.size}
          lot={product.lot}
          purity={product.purity}
          accent={product.accent}
          className="mx-auto max-w-[10.5rem] transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {product.badges.map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] text-muted">
              <ShieldCheck className={cn("size-3", accentText)} strokeWidth={2.2} />
              {b}
            </span>
          ))}
        </div>

        <h3 className="font-display text-xl leading-tight font-extrabold tracking-[-0.03em] text-ink">
          <Link href={href} className="transition-colors duration-300 hover:text-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-subtle">
          {product.synonyms}
        </p>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("size-3", i < Math.round(product.rating) ? "fill-brand text-brand" : "text-line")} />
            ))}
          </span>
          <span className="font-mono text-[10px] text-muted">
            {product.rating.toFixed(1)} · {product.reviewCount.toLocaleString("en-US")} reviews
          </span>
        </div>

        <p className="mt-3.5 text-[0.85rem] leading-relaxed text-muted">
          {product.tagline}
        </p>

        {/* Tabs */}
        <div className="mt-5 flex-1">
          <div role="tablist" aria-label={`${product.name} details`} className="inline-flex rounded-full border border-line bg-surface-sunken p-0.5">
            {(["benefits", "science"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-all duration-300",
                  tab === t
                    ? cn("bg-surface-raised text-ink", isGreen ? "shadow-[inset_0_0_0_1px_var(--color-brand-line)]" : "shadow-[inset_0_0_0_1px_var(--color-teal-line)]")
                    : "text-subtle hover:text-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3.5 min-h-[10.5rem]">
            {tab === "benefits" ? (
              <ul role="tabpanel" className="animate-rise space-y-2">
                {product.benefits.map((b) => (
                  <li key={b.slice(0, 24)} className="flex gap-2.5 text-[0.8rem] leading-relaxed text-muted">
                    <Check className={cn("mt-0.5 size-3.5 shrink-0", accentText)} strokeWidth={2.6} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <dl role="tabpanel" className="animate-rise space-y-2.5">
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Classification</dt>
                  <dd className="text-[0.8rem] text-body">{product.science.class}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Mechanism under study</dt>
                  <dd className="text-[0.8rem] leading-relaxed text-muted">{product.science.mechanism}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-line pt-2.5">
                  <div>
                    <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Half-life</dt>
                    <dd className="text-[0.75rem] text-body">{product.science.halfLife}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Indexed papers</dt>
                    <dd className={cn("font-mono text-[0.75rem] tabular-nums", accentText)}>
                      {product.science.citations}
                    </dd>
                  </div>
                </div>
                <div className="border-t border-line pt-2.5">
                  <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Molecular weight</dt>
                  <dd className="text-[0.75rem] text-muted">{product.chem.molecularWeight}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* Spec rail */}
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-md border border-line bg-surface-sunken p-3">
          {[
            ["Purity", product.purity],
            ["Residues", `${product.residues.length}`],
            ["Lot", product.lot.split("-").slice(-2).join("-")],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[8px] tracking-[0.18em] text-subtle uppercase">{k}</dt>
              <dd className="mt-0.5 truncate font-mono text-[0.72rem] text-body tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Price + CTA */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">
              {product.format}
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">
                {formatUSD(product.priceCents)}
              </span>
              {product.compareAtCents && (
                <span className="font-mono text-[0.78rem] text-subtle line-through">
                  {formatUSD(product.compareAtCents)}
                </span>
              )}
            </p>
          </div>
          <p className="shrink-0 pb-1 text-right font-mono text-[9px] tracking-[0.12em] text-subtle uppercase">
            <span className={accentText}>{product.unitsRemaining}</span> left
            <br />
            in lot
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
          className={cn(
            "group/cta relative mt-3.5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 text-[0.84rem] font-semibold transition-all duration-300 active:scale-[0.98]",
            added
              ? "bg-brand text-white"
              : "bg-action text-white hover:bg-action-hover",
          )}
        >
          <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover/cta:translate-x-full" />
          {added ? (
            <>
              <Check className="relative size-4" strokeWidth={3} />
              <span className="relative">Added to Order</span>
            </>
          ) : (
            <>
              <Plus className="relative size-4 transition-transform duration-300 group-hover/cta:rotate-90" strokeWidth={2.8} />
              <span className="relative">Add to Cart</span>
            </>
          )}
        </button>

        <Link
          href={href}
          className="group/link mt-3 flex items-center justify-center gap-1.5 text-[0.76rem] font-medium text-muted transition-colors duration-300 hover:text-brand"
        >
          Sequence, structure &amp; COA
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" strokeWidth={2.2} />
        </Link>
      </div>
    </article>
  );
}
