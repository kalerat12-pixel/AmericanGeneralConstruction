import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findProduct, findFlavor, listReviews, reviewSummary, listProducts, listRankings } from "@/lib/repository";
import { CanImage } from "@/components/product/CanImage";
import { BuyBox } from "@/components/product/BuyBox";
import { CaffeineAdvisory } from "@/components/product/CaffeineAdvisory";
import { ReviewList } from "@/components/product/ReviewList";
import { Meter } from "@/components/ui/Meter";
import { Stars } from "@/components/ui/Stars";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/pricing";
import { site } from "@/lib/config";

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const flavor = await findFlavor(slug);
  if (!flavor) return { title: "Not found" };

  const name = flavor.collab ? `${flavor.collab} ${flavor.name}` : flavor.name;
  return {
    title: `Ghost ${flavor.line === "energy" ? "Energy" : "Hydration"} — ${name}`,
    description: `${flavor.shortTake} ${flavor.tastingNote.slice(0, 110)}…`,
    alternates: { canonical: `/product/${slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, flavor] = await Promise.all([findProduct(slug), findFlavor(slug)]);
  if (!product || !flavor) notFound();

  const [reviews, summary, allProducts, allFlavorsRankings] = await Promise.all([
    listReviews(slug),
    reviewSummary(slug),
    listProducts(),
    listRankings(),
  ]);

  const rank = allFlavorsRankings.find((r) => r.flavorSlug === slug);
  const productMap = new Map(allProducts.map((p) => [p.slug, p]));

  const pairings = await Promise.all(
    flavor.pairsWith.slice(0, 3).map(async (s) => ({
      product: productMap.get(s),
      flavor: await findFlavor(s),
    })),
  );

  const displayName = flavor.collab ? `${flavor.collab} ${flavor.name}` : flavor.name;
  const cheapest = Math.min(...product.variants.map((v) => v.priceCents));

  // Product structured data. aggregateRating is only emitted when reviews exist.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: flavor.tastingNote,
    brand: { "@type": "Brand", name: "Ghost" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (cheapest / 100).toFixed(2),
      highPrice: (Math.max(...product.variants.map((v) => v.priceCents)) / 100).toFixed(2),
      offerCount: product.variants.length,
      seller: { "@type": "Organization", name: site.name },
    },
    ...(summary.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: summary.average,
        reviewCount: summary.count,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell-wide pt-8 lg:pt-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-ash-dim">
            <li>
              <Link href="/" className="hover:text-bone">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:text-bone">Shop</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ash">{displayName}</li>
          </ol>
        </nav>
      </div>

      <article className="shell-wide pb-24 pt-10 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ---- Gallery ------------------------------------------------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-square overflow-hidden border border-line bg-ink-raised grain">
              <div className="flex h-full items-center justify-center p-10">
                <CanImage
                  slug={product.slug}
                  name={flavor.name}
                  size={420}
                  priority
                  sizes="(max-width: 1024px) 90vw, 44vw"
                  className="h-full w-auto object-contain"
                />
              </div>
              {product.badge && (
                <span className="absolute left-5 top-5 border border-line-strong bg-ink/85 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ash">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Secondary views: context shots rather than fake product angles. */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {["plates-stacked", "rack-uprights", "chalk-dust"].map((plate) => (
                <div
                  key={plate}
                  className="relative aspect-square overflow-hidden border border-line bg-ink-raised"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/editorial/${plate}.svg`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ash-dim">
              Product imagery on this site is a clearly-labelled placeholder. We
              don&rsquo;t reproduce or hotlink Ghost&rsquo;s photography.
            </p>
          </div>

          {/* ---- Detail -------------------------------------------------- */}
          <div>
            <div className="flex flex-wrap items-center gap-4">
              {flavor.collab && <Eyebrow>{flavor.collab}</Eyebrow>}
              {rank && (
                <Link
                  href="/rankings"
                  className="type-mono border border-line-strong px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-ash transition-colors hover:border-ember hover:text-ember"
                >
                  Ranked #{rank.rank} &middot; Tier {rank.tier}
                </Link>
              )}
            </div>

            <h1 className="type-display mt-4">{flavor.name}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {summary.count > 0 && (
                <a href="#reviews" className="flex items-center gap-2.5 text-sm text-ash hover:text-bone">
                  <Stars rating={summary.average} />
                  <span className="type-mono">
                    {summary.average.toFixed(1)} ({summary.count})
                  </span>
                </a>
              )}
              <span className="type-mono text-sm text-ash">From {formatPrice(cheapest)}</span>
            </div>

            <p className="type-lead mt-7">{flavor.tastingNote}</p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {flavor.notes.map((note) => (
                <li
                  key={note}
                  className="border border-line-strong px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-ash"
                >
                  {note}
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-line pt-10">
              <BuyBox product={product} flavor={flavor} />
            </div>

            {/* ---- Flavor profile --------------------------------------- */}
            <section className="mt-12 border-t border-line pt-10" aria-labelledby="profile-heading">
              <h2 id="profile-heading" className="type-eyebrow">
                Flavor profile
              </h2>
              <div className="mt-5 divide-y divide-line">
                <Meter label="Sweetness" value={flavor.profile.sweetness} />
                <Meter label="Sourness" value={flavor.profile.sourness} />
                <Meter label="Intensity" value={flavor.profile.intensity} />
                <Meter label="Body" value={flavor.profile.body} />
              </div>
            </section>

            {/* ---- Nutrition -------------------------------------------- */}
            <section className="mt-12 border-t border-line pt-10" aria-labelledby="nutrition-heading">
              <h2 id="nutrition-heading" className="type-eyebrow">
                What&rsquo;s in it
              </h2>

              <table className="mt-5 w-full text-sm">
                <caption className="sr-only">
                  Nutrition information per {flavor.line === "energy" ? "16 fl oz can" : "bottle"}
                </caption>
                <tbody className="divide-y divide-line">
                  {[
                    ["Serving size", flavor.line === "energy" ? "1 can (16 fl oz)" : "1 bottle"],
                    ["Calories", String(flavor.calories)],
                    ["Total sugars", `${flavor.sugarG}g`],
                    ["Caffeine", flavor.caffeineMg > 0 ? `${flavor.caffeineMg}mg` : "0mg"],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="py-3 text-left font-normal text-ash">{k}</th>
                      <td className="type-mono py-3 text-right">{v}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-3 text-left align-top font-normal text-ash">
                      Also contains
                    </th>
                    <td className="py-3 text-right">{flavor.actives.join(", ")}</td>
                  </tr>
                </tbody>
              </table>

              <p className="mt-4 text-xs leading-relaxed text-ash-dim">
                Figures as printed on the manufacturer&rsquo;s packaging. Formulations
                change — always read the can in your hand. We list functional
                ingredients by name only; we don&rsquo;t republish dosages we
                can&rsquo;t verify.
              </p>
            </section>

            <div className="mt-8">
              <CaffeineAdvisory caffeineMg={flavor.caffeineMg} />
            </div>
          </div>
        </div>

        {/* ---- Pairs well with ------------------------------------------- */}
        {pairings.some((p) => p.product && p.flavor) && (
          <section className="mt-24 border-t border-line pt-16" aria-labelledby="pairs-heading">
            <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Pairs well with</Eyebrow>
                <h2 id="pairs-heading" className="type-section mt-5 max-w-xl">
                  Put these in the same pack
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-ash md:text-right">
                Flavors that give you somewhere to go when you&rsquo;ve had three
                {" "}{flavor.name} in a row.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-2 border-l border-t border-line lg:grid-cols-3">
              {pairings.map(
                (pair, i) =>
                  pair.product &&
                  pair.flavor && (
                    <Reveal key={pair.product.id} delay={i * 70}>
                      <ProductCard product={pair.product} flavor={pair.flavor} />
                    </Reveal>
                  ),
              )}
            </div>
          </section>
        )}

        {/* ---- Reviews ---------------------------------------------------- */}
        <section id="reviews" className="mt-24 border-t border-line pt-16" aria-labelledby="reviews-heading">
          <Eyebrow>What people said</Eyebrow>
          <h2 id="reviews-heading" className="type-section mt-5 mb-12 max-w-xl">
            Reviews
          </h2>
          <ReviewList reviews={reviews} summary={summary} />
        </section>
      </article>
    </>
  );
}
