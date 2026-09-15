"use client";

import { useMemo, useState } from "react";
import { FileCheck2, Layers } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { CATEGORIES, PRODUCTS, type CategoryFilter } from "@/lib/products";
import { cn } from "@/lib/utils";

export default function Catalog() {
  const [active, setActive] = useState<CategoryFilter>("All");

  const visible = useMemo(
    () =>
      active === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === active),
    [active],
  );

  return (
    <section id="collection" className="relative py-16 md:py-24">

      <div className="shell relative">
        <Reveal className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-2">
              <Layers className="size-3.5" strokeWidth={2.4} />
              The Collection
            </p>
            <h2 className="max-w-2xl text-[2rem] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[2.75rem]">
              Sixteen compounds. Named, not branded.
            </h2>
            <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-muted">
              We sell compounds under the names the research literature uses,
              at a stated milligram fill — because you cannot verify what a label
              will not name. Open any compound for its full sequence, structure
              and certificate of analysis.
            </p>
          </div>

          <a
            href="#standards"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line bg-surface-raised/70 px-5 py-2.5 text-[0.8rem] font-medium text-body backdrop-blur-md transition-all duration-300 hover:border-brand/50 hover:text-brand md:self-auto"
          >
            <FileCheck2 className="size-4" strokeWidth={2} />
            How we test
          </a>
        </Reveal>

        {/* Filter rail — horizontally scrollable on phones, no wrap jitter */}
        <Reveal delay={60}>
          <div
            role="tablist"
            aria-label="Filter by category"
            className="snap-rail -mx-5 mb-8 gap-2 px-5 pb-1 md:mx-0 md:px-0"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c}
                role="tab"
                type="button"
                aria-selected={active === c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[0.78rem] font-medium whitespace-nowrap transition-all duration-300 active:scale-95",
                  active === c
                    ? "border-action bg-action text-white shadow-[var(--shadow-card)]"
                    : "border-line bg-surface-raised/60 text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={i * 60} as="div" className="h-full">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-[0.72rem] leading-relaxed text-subtle">
            All compounds are supplied for laboratory research use only and are
            not for human or veterinary consumption. Statements describe
            published research directions, not product effects.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
