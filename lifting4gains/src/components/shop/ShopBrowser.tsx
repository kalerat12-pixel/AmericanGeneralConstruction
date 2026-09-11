"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, Flavor, FlavorFamily } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";

type SortKey = "recommended" | "price-asc" | "price-desc" | "sweetest" | "sourest";

const FAMILIES: Array<{ value: FlavorFamily; label: string }> = [
  { value: "sour", label: "Sour" },
  { value: "candy", label: "Candy" },
  { value: "fruit", label: "Fruit" },
  { value: "citrus", label: "Citrus" },
  { value: "creamy", label: "Creamy" },
  { value: "soda", label: "Soda" },
];

const CAFFEINE = [
  { value: "200", label: "200mg" },
  { value: "0", label: "Caffeine-free" },
];

const PACKS = [
  { value: "1", label: "Single" },
  { value: "4", label: "4-pack" },
  { value: "12", label: "12-pack" },
  { value: "24", label: "24-pack" },
];

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: "recommended", label: "Our order" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "sweetest", label: "Sweetest first" },
  { value: "sourest", label: "Sourest first" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3.5 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "border-ember bg-ember text-ink"
          : "border-line-input text-ash hover:border-ash hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * A labelled group of toggle chips. Uses role="group" + aria-labelledby rather
 * than fieldset/legend — a legend can't be laid out as a normal block, which
 * broke the chip wrapping inside the narrow sidebar column.
 */
function FilterGroup({
  id,
  legend,
  options,
  selected,
  toggle,
}: {
  id: string;
  legend: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  toggle: (value: string) => void;
}) {
  return (
    <div role="group" aria-labelledby={`${id}-legend`} className="min-w-0 border-t border-line py-6">
      <p id={`${id}-legend`} className="type-eyebrow mb-4">
        {legend}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip key={opt.value} active={selected.includes(opt.value)} onClick={() => toggle(opt.value)}>
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function ShopBrowser({
  products,
  flavors,
  initialLine,
}: {
  products: Product[];
  flavors: Flavor[];
  initialLine?: string;
}) {
  const flavorMap = useMemo(() => new Map(flavors.map((f) => [f.slug, f])), [flavors]);

  const [families, setFamilies] = useState<string[]>([]);
  const [caffeine, setCaffeine] = useState<string[]>(
    initialLine === "hydration" ? ["0"] : initialLine === "energy" ? ["200"] : [],
  );
  const [packs, setPacks] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
      setter((current) =>
        current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      );

  const activeCount = families.length + caffeine.length + packs.length;

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const flavor = flavorMap.get(product.flavorSlug);
      if (!flavor) return false;

      if (families.length && !families.includes(flavor.family)) return false;
      if (caffeine.length && !caffeine.includes(String(flavor.caffeineMg))) return false;
      if (packs.length && !product.variants.some((v) => packs.includes(String(v.packSize)))) {
        return false;
      }
      return true;
    });

    const priceOf = (p: Product) => Math.min(...p.variants.map((v) => v.priceCents));

    switch (sort) {
      case "price-asc":
        return [...filtered].sort((a, b) => priceOf(a) - priceOf(b));
      case "price-desc":
        return [...filtered].sort((a, b) => priceOf(b) - priceOf(a));
      case "sweetest":
        return [...filtered].sort(
          (a, b) =>
            (flavorMap.get(b.flavorSlug)?.profile.sweetness ?? 0) -
            (flavorMap.get(a.flavorSlug)?.profile.sweetness ?? 0),
        );
      case "sourest":
        return [...filtered].sort(
          (a, b) =>
            (flavorMap.get(b.flavorSlug)?.profile.sourness ?? 0) -
            (flavorMap.get(a.flavorSlug)?.profile.sourness ?? 0),
        );
      default:
        return filtered;
    }
  }, [products, flavorMap, families, caffeine, packs, sort]);

  const clearAll = () => {
    setFamilies([]);
    setCaffeine([]);
    setPacks([]);
  };

  return (
    <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-14">
      {/* Filters. Collapsed by default on mobile — the grid is what people came for. */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="shop-filters"
          className="btn btn-ghost w-full"
        >
          {filtersOpen ? "Hide filters" : "Filters"}
          {activeCount > 0 && (
            <span className="type-mono bg-ember px-2 py-0.5 text-[11px] text-ink">{activeCount}</span>
          )}
        </button>
      </div>

      {/* Class-based visibility, not the `hidden` attribute: the sidebar is
          collapsible on mobile but always present from `lg` up. */}
      <aside
        id="shop-filters"
        className={`${filtersOpen ? "block" : "hidden"} mt-6 lg:mt-0 lg:block`}
        aria-label="Product filters"
      >
        <div className="lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em]">Filter</h2>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-xs text-ash underline hover:text-ember">
                Clear all
              </button>
            )}
          </div>

          <FilterGroup id="flavor" legend="Flavor" options={FAMILIES} selected={families} toggle={toggle(setFamilies)} />
          <FilterGroup id="caffeine" legend="Caffeine" options={CAFFEINE} selected={caffeine} toggle={toggle(setCaffeine)} />
          <FilterGroup id="pack" legend="Pack size" options={PACKS} selected={packs} toggle={toggle(setPacks)} />

          <div className="border-t border-line py-6">
            <label htmlFor="sort" className="type-eyebrow mb-3 block">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="field"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-ink">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-line py-6">
            <p className="text-sm leading-relaxed text-ash">
              Not sure where to start?{" "}
              <Link href="/rankings" className="link-slide text-bone">
                Read the rankings
              </Link>{" "}
              — we tell you which ones to skip too.
            </p>
          </div>
        </div>
      </aside>

      <div className="mt-10 lg:mt-0">
        <p role="status" aria-live="polite" className="type-mono mb-5 text-sm text-ash">
          {visible.length} {visible.length === 1 ? "product" : "products"}
        </p>

        {visible.length === 0 ? (
          <div className="border border-line p-12 text-center">
            <p className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em]">
              Nothing matches that
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ash">
              You&rsquo;ve filtered your way into an empty shelf. Try dropping one of
              the filters.
            </p>
            <button type="button" onClick={clearAll} className="btn btn-ghost mt-7">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-3">
            {visible.map((product, i) => {
              const flavor = flavorMap.get(product.flavorSlug);
              if (!flavor) return null;
              return (
                <ProductCard key={product.id} product={product} flavor={flavor} priority={i < 3} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
