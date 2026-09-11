import Link from "next/link";
import type { Metadata } from "next";

import { listProducts, listFlavors, listRankings } from "@/lib/repository";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stars } from "@/components/ui/Stars";
import { EmailCapture } from "@/components/site/EmailCapture";
import { CanImage } from "@/components/product/CanImage";
import { site, commerce } from "@/lib/config";
import { formatPrice, BUNDLE_TIERS } from "@/lib/pricing";
import { reviews } from "@/lib/data/reviews";

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
};

const WHY = [
  {
    n: "01",
    title: "We buy every can we rank",
    body: "Nobody pays for placement here and nobody can. If a flavor is too sweet to finish mid-session, the ranking page says so — including for the ones we make the most margin on.",
  },
  {
    n: "02",
    title: "Built for how you actually drink them",
    body: "Every product page tells you how it stacks with pre-workout, whether it survives warming up in a gym bag, and what it's genuinely good for. That's the information we wanted and could never find.",
  },
  {
    n: "03",
    title: "Gyms get real wholesale pricing",
    body: "Not a discount code — actual case pricing that works for a fridge at the front desk, plus a referral code your members can use. Down to $1.89 a can at volume.",
  },
];

export default async function HomePage() {
  const [products, flavors, rankings] = await Promise.all([
    listProducts(),
    listFlavors(),
    listRankings(),
  ]);

  const flavorMap = new Map(flavors.map((f) => [f.slug, f]));
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const topThree = rankings.slice(0, 3);
  const socialProof = [reviews[5], reviews[3], reviews[7]].filter(Boolean);
  const twentyFour = products[0]?.variants.find((v) => v.packSize === 24);

  return (
    <>
      {/* ---- Hero -------------------------------------------------------- */}
      <section className="relative isolate grain min-h-[88svh] overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          <EditorialImage
            name="bar-loaded"
            alt=""
            priority
            sizes="100vw"
            className="opacity-[0.85]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-ink/25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent"
          />
        </div>

        <div className="shell-wide flex min-h-[88svh] flex-col justify-end pb-14 pt-28 lg:pb-20">
          <div className="max-w-5xl">
            <Reveal>
              <Eyebrow>{site.tiktokHandle} &middot; independent Ghost stockist</Eyebrow>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="type-hero mt-6">
                Stop guessing
                <br />
                which can
                <br />
                <span className="text-ember">actually works.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="type-lead mt-8 max-w-xl">
                Sixteen Ghost Energy flavors, ranked by people who drink them in a
                gym instead of at a desk. Buy the ones worth your money, skip the
                ones that aren&rsquo;t.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/shop" className="btn btn-primary">
                  Shop all flavors
                </Link>
                <Link href="/rankings" className="btn btn-ghost">
                  Read the rankings
                </Link>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
                {[
                  { k: "200mg", v: "Caffeine per can" },
                  { k: "0g", v: "Sugar, every flavor" },
                  { k: "16", v: "Flavors ranked" },
                  {
                    k: twentyFour ? `${formatPrice(Math.round(twentyFour.priceCents / 24))}` : "$2.71",
                    v: "Per can at 24",
                  },
                ].map((stat) => (
                  <div key={stat.v}>
                    <dt className="sr-only">{stat.v}</dt>
                    <dd>
                      <span className="block font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                        {stat.k}
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-snug text-ash">
                        {stat.v}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Featured flavors -------------------------------------------- */}
      <section className="border-b border-line" aria-labelledby="featured-heading">
        <div className="shell-wide pt-20 lg:pt-28">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Start here</Eyebrow>
              <h2 id="featured-heading" className="type-section mt-5 max-w-xl">
                The four we&rsquo;d put in your first order
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ash md:text-right">
              One benchmark, one daily driver, one gateway flavor, and the one
              everybody sleeps on. Between them you&rsquo;ll work out what kind of
              drinker you are.
            </p>
          </Reveal>
        </div>

        <div className="shell-wide mt-12 lg:mt-16">
          <div className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
            {featured.map((product, i) => {
              const flavor = flavorMap.get(product.flavorSlug);
              if (!flavor) return null;
              return (
                <Reveal key={product.id} delay={i * 70}>
                  <ProductCard product={product} flavor={flavor} priority={i < 2} />
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-10 flex justify-center">
            <Link href="/shop" className="btn btn-ghost">
              All 19 products
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---- Why this exists --------------------------------------------- */}
      <section className="border-b border-line" aria-labelledby="why-heading">
        <div className="shell-wide grid gap-16 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:py-28">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden border border-line grain lg:sticky lg:top-28">
              <EditorialImage name="plates-stacked" alt="" sizes="(max-width: 1024px) 100vw, 40vw" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="font-display text-[1.75rem] font-extrabold uppercase leading-[0.92] tracking-[-0.035em]">
                  Run out of a
                  <br />
                  garage gym in
                  <br />
                  <span className="text-ember">Fort Wayne.</span>
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <Eyebrow>Why this exists</Eyebrow>
              <h2 id="why-heading" className="type-section mt-5">
                A shop, not a shelf.
              </h2>
              <p className="type-lead mt-6 max-w-xl">
                Every energy drink retailer online lists flavors alphabetically and
                calls it a day. None of them will tell you which one you&rsquo;ll
                still want to drink in week six. We started ranking them on TikTok
                because nobody else was being honest about it — this shop is what
                that turned into.
              </p>
            </Reveal>

            <div className="mt-12 space-y-px">
              {WHY.map((item, i) => (
                <Reveal key={item.n} delay={i * 80}>
                  <div className="group grid grid-cols-[auto_1fr] gap-6 border-t border-line py-7 transition-colors hover:border-line-strong sm:gap-10">
                    <span className="type-mono pt-1 text-sm text-ember">{item.n}</span>
                    <div>
                      <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.025em] sm:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ash">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Rankings teaser --------------------------------------------- */}
      <section className="border-b border-line bg-ink-sunken" aria-labelledby="ranked-heading">
        <div className="shell-wide py-20 lg:py-28">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>The list</Eyebrow>
              <h2 id="ranked-heading" className="type-section mt-5 max-w-2xl">
                Every flavor, ranked. Including the ones we sell.
              </h2>
            </div>
            <Link href="/rankings" className="btn btn-ghost shrink-0">
              Full rankings
            </Link>
          </Reveal>

          <ol className="mt-12 border-t border-line">
            {topThree.map((entry, i) => {
              const flavor = flavorMap.get(entry.flavorSlug);
              if (!flavor) return null;
              return (
                <Reveal key={entry.rank} as="li" delay={i * 80}>
                  <Link
                    href={`/product/${flavor.slug}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-6 sm:gap-10 sm:py-8"
                  >
                    <span className="type-mono w-10 font-display text-2xl font-extrabold text-ember sm:w-14 sm:text-4xl">
                      {String(entry.rank).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-extrabold uppercase tracking-[-0.025em] transition-colors group-hover:text-ember sm:text-2xl">
                        {flavor.collab ? `${flavor.collab} ` : ""}
                        {flavor.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-1 text-sm text-ash">{flavor.shortTake}</p>
                    </div>

                    <span className="type-mono hidden shrink-0 border border-line-strong px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-ash sm:block">
                      Tier {entry.tier}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---- Bundle CTA --------------------------------------------------- */}
      <section className="relative isolate overflow-hidden border-b border-line grain" aria-labelledby="bundle-heading">
        <div className="absolute inset-0 -z-10">
          <EditorialImage name="rack-uprights" alt="" sizes="100vw" className="opacity-70" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/78 to-ink/35" />
        </div>

        <div className="shell-wide py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <Eyebrow>Build your own</Eyebrow>
              <h2 id="bundle-heading" className="type-display mt-5 max-w-xl">
                Twelve cans.
                <br />
                Your twelve.
              </h2>
              <p className="type-lead mt-6 max-w-lg">
                Mix any flavors into one pack and watch the per-can price drop as
                you add. Nobody should have to commit to a case of something they
                haven&rsquo;t tried.
              </p>
              <Link href="/bundles" className="btn btn-primary mt-9">
                Build a variety pack
              </Link>
            </Reveal>

            <Reveal delay={120}>
              <div className="panel p-7 sm:p-9">
                <h3 className="type-eyebrow">Volume pricing</h3>
                <dl className="mt-6 space-y-px">
                  {BUNDLE_TIERS.map((tier) => (
                    <div
                      key={tier.min}
                      className="flex items-baseline justify-between gap-4 border-t border-line py-4"
                    >
                      <dt className="text-sm text-ash">{tier.min}+ cans</dt>
                      <dd className="type-mono font-display text-lg font-bold">
                        {formatPrice(tier.perCanCents)}
                        <span className="text-sm font-normal text-ash-dim">/can</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-ash-dim">
                  Subscribe to any pack and take a further{" "}
                  {Math.round(commerce.subscriptionDiscount * 100)}% off. Skip, pause
                  or cancel from your account at any time.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Social proof -------------------------------------------------- */}
      <section className="border-b border-line" aria-labelledby="proof-heading">
        <div className="shell-wide py-20 lg:py-28">
          <Reveal>
            <Eyebrow>From the crew</Eyebrow>
            <h2 id="proof-heading" className="type-section mt-5 max-w-2xl">
              Reviews from people who train.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-px border-t border-line md:grid-cols-3">
            {socialProof.map((review, i) => (
              <Reveal key={review.id} delay={i * 80}>
                <figure className="flex h-full flex-col border-b border-line px-0 py-8 md:border-r md:px-8 md:last:border-r-0">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-5 flex-1">
                    <p className="font-display text-lg font-bold uppercase leading-[1.1] tracking-[-0.02em]">
                      {review.title}
                    </p>
                    <p className="mt-3 text-[15px] leading-relaxed text-ash">
                      &ldquo;{review.body}&rdquo;
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 border-t border-line pt-4 text-xs text-ash-dim">
                    <span className="text-bone">{review.author}</span> &middot; {review.context}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Community strip ----------------------------------------------- */}
      <section className="relative isolate overflow-hidden border-b border-line" aria-labelledby="community-heading">
        <div className="absolute inset-0 -z-10">
          <EditorialImage name="strip-dark" alt="" sizes="100vw" className="opacity-60" />
        </div>

        <div
          aria-hidden="true"
          className="hide-scrollbar overflow-hidden border-b border-line py-5"
        >
          <div className="marquee-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center">
                {[
                  "Flavor rankings every Friday",
                  "Gym partner pricing",
                  "No paid placements",
                  "Build your own 12-pack",
                  "Ships in 2–4 days",
                  "Independent stockist",
                ].map((item) => (
                  <span
                    key={`${dup}-${item}`}
                    className="flex items-center whitespace-nowrap px-8 font-display text-sm font-bold uppercase tracking-[0.14em] text-ash"
                  >
                    {item}
                    <span className="ml-8 h-1 w-1 bg-ember" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="shell-wide grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <Reveal>
            <Eyebrow>The community</Eyebrow>
            <h2 id="community-heading" className="type-section mt-5">
              You probably got here from a video.
            </h2>
            <p className="type-lead mt-6 max-w-lg">
              Flavor tests, honest reviews, and whatever we&rsquo;re arguing about
              in the comments that week. The rankings on this site come straight
              out of it.
            </p>
            <a
              href={site.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost mt-9"
            >
              Follow {site.tiktokHandle}
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="panel p-7 sm:p-9">
              <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.025em]">
                First order? Take 10% off.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ash">
                Join the list and we&rsquo;ll send a code, plus the new flavor
                verdict before it goes up anywhere else.
              </p>
              <EmailCapture source="home" className="mt-6" />
              <p className="mt-4 text-xs text-ash-dim">
                One email a week. Unsubscribe in a click.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Gym partners teaser -------------------------------------------- */}
      <section aria-labelledby="partners-heading">
        <div className="shell-wide py-20 lg:py-28">
          <Reveal className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex items-start gap-8">
              <div className="hidden w-40 shrink-0 sm:block">
                <CanImage
                  slug="citrus"
                  name="Citrus"
                  size={200}
                  sizes="160px"
                  className="h-auto w-full"
                />
              </div>
              <div>
                <Eyebrow>Own a gym?</Eyebrow>
                <h2 id="partners-heading" className="type-section mt-5 max-w-xl">
                  Stock the fridge at {formatPrice(189)} a can.
                </h2>
                <p className="type-lead mt-5 max-w-lg">
                  Case pricing from five cases, a referral code for your members,
                  and delivery that shows up when you said you&rsquo;d be open.
                </p>
              </div>
            </div>
            <Link href="/partners" className="btn btn-primary shrink-0">
              Wholesale pricing
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
