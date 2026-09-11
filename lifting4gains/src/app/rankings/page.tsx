import type { Metadata } from "next";
import Link from "next/link";

import { listRankings, listFlavors } from "@/lib/repository";
import { rankingsMeta, tierCopy } from "@/lib/data/rankings";
import { CanImage } from "@/components/product/CanImage";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Meter } from "@/components/ui/Meter";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Every Ghost Energy flavor, ranked (2026)",
  description:
    "All 16 Ghost Energy flavors ranked by lifters who drink them in a gym, not at a desk. Honest verdicts, the knock on every flavor, and what to buy instead.",
  alternates: { canonical: "/rankings" },
  openGraph: {
    title: "Every Ghost Energy flavor, ranked (2026)",
    description:
      "All 16 Ghost Energy flavors ranked by lifters. Every entry gets a verdict and a knock.",
    type: "article",
  },
};

export default async function RankingsPage() {
  const [rankings, flavors] = await Promise.all([listRankings(), listFlavors()]);
  const flavorMap = new Map(flavors.map((f) => [f.slug, f]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: rankingsMeta.title,
    description: metadata.description,
    numberOfItems: rankings.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: rankings.map((r) => ({
      "@type": "ListItem",
      position: r.rank,
      name: flavorMap.get(r.flavorSlug)?.name ?? r.flavorSlug,
      url: `${site.url}/product/${r.flavorSlug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ---- Masthead ---------------------------------------------------- */}
      <header className="relative isolate overflow-hidden border-b border-line grain">
        <div className="absolute inset-0 -z-10">
          <EditorialImage name="chalk-dust" alt="" priority sizes="100vw" className="opacity-75" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        </div>

        <div className="shell pb-16 pt-24 lg:pb-24 lg:pt-32">
          <Eyebrow>The list</Eyebrow>
          <h1 className="type-hero mt-6 max-w-4xl">
            Every flavor,
            <br />
            <span className="text-ember">ranked.</span>
          </h1>
          <p className="type-lead mt-8 max-w-2xl">{rankingsMeta.standfirst}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-ash-dim">
            <span>
              By <span className="text-bone">{rankingsMeta.author}</span>
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>
              Updated{" "}
              <time dateTime={rankingsMeta.updated}>
                {new Date(rankingsMeta.updated).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{rankings.length} flavors</span>
          </div>
        </div>
      </header>

      {/* ---- Method ------------------------------------------------------ */}
      <section className="border-b border-line" aria-labelledby="method-heading">
        <div className="shell grid gap-10 py-16 lg:grid-cols-[240px_1fr] lg:gap-16">
          <h2 id="method-heading" className="type-eyebrow lg:pt-1">
            How we ranked them
          </h2>
          <ol className="space-y-5">
            {rankingsMeta.method.map((item, i) => (
              <li key={item} className="flex gap-5">
                <span className="type-mono shrink-0 text-sm text-ember">{String(i + 1).padStart(2, "0")}</span>
                <p className="max-w-2xl text-[15px] leading-relaxed text-ash">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Tier key ---------------------------------------------------- */}
      <section className="border-b border-line bg-ink-sunken" aria-labelledby="tiers-heading">
        <div className="shell py-14">
          <h2 id="tiers-heading" className="type-eyebrow">
            The tiers
          </h2>
          <dl className="mt-7 grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(tierCopy).map(([tier, copy]) => (
              <div key={tier} className="border-t border-line pt-5 sm:pr-8">
                <dt className="font-display text-base font-extrabold uppercase tracking-[-0.02em]">
                  <span className="text-ember">{tier}</span>
                  <span className="text-ash"> — {copy.label.split("— ")[1]}</span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ash">{copy.blurb}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- The ranking ------------------------------------------------- */}
      <div className="shell py-16 lg:py-24">
        <ol className="space-y-px">
          {rankings.map((entry) => {
            const flavor = flavorMap.get(entry.flavorSlug);
            if (!flavor) return null;

            return (
              <Reveal key={entry.rank} as="li">
                <article className="grid gap-7 border-t border-line py-10 sm:grid-cols-[110px_1fr] sm:gap-10 lg:grid-cols-[110px_180px_1fr] lg:py-14">
                  <div className="flex items-start gap-4 sm:block">
                    <p className="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-ember lg:text-7xl">
                      {String(entry.rank).padStart(2, "0")}
                    </p>
                    <p className="type-mono mt-2 border border-line-strong px-2 py-1 text-center text-[11px] uppercase tracking-[0.1em] text-ash sm:inline-block">
                      Tier {entry.tier}
                    </p>
                  </div>

                  <Link
                    href={`/product/${flavor.slug}`}
                    className="hidden shrink-0 lg:block"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <div className="border border-line bg-ink-raised p-4 transition-colors hover:border-line-strong">
                      <CanImage
                        slug={flavor.slug}
                        name={flavor.name}
                        size={180}
                        sizes="180px"
                        className="h-auto w-full"
                      />
                    </div>
                  </Link>

                  <div className="min-w-0">
                    {flavor.collab && (
                      <p className="type-eyebrow text-[10px] tracking-[0.18em]">{flavor.collab}</p>
                    )}
                    <h2 className="mt-2">
                      <Link
                        href={`/product/${flavor.slug}`}
                        className="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-[-0.035em] transition-colors hover:text-ember lg:text-5xl"
                      >
                        {flavor.name}
                      </Link>
                    </h2>

                    <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bone lg:text-base">
                      {entry.verdict}
                    </p>

                    <div className="mt-6 max-w-2xl border-l-2 border-ember pl-5">
                      <p className="type-eyebrow mb-1.5 text-[10px]">The knock</p>
                      <p className="text-[15px] leading-relaxed text-ash">{entry.knock}</p>
                    </div>

                    <div className="mt-7 grid max-w-md grid-cols-1 gap-x-8 sm:grid-cols-2">
                      <Meter label="Sweet" value={flavor.profile.sweetness} />
                      <Meter label="Sour" value={flavor.profile.sourness} />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href={`/product/${flavor.slug}`} className="btn btn-ghost">
                        Shop {flavor.name}
                      </Link>
                      <Link href="/bundles" className="btn btn-quiet text-sm">
                        Add to a variety pack →
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>

        <div className="mt-16 border-t border-line pt-12">
          <div className="panel p-8 lg:p-12">
            <h2 className="type-section max-w-xl">Disagree? Good.</h2>
            <p className="type-lead mt-5 max-w-xl">
              The rankings move. If enough of you tell us we&rsquo;ve got one wrong,
              we&rsquo;ll drink it again and say so. Every argument worth having
              happens in the comments on {site.tiktokHandle}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Argue with us on TikTok
              </a>
              <Link href="/bundles" className="btn btn-ghost">
                Build your own top four
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
