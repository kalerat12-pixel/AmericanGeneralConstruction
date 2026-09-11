import type { Metadata } from "next";
import Link from "next/link";

import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "The Lifting4Gains story",
  description:
    "How a flavor-ranking TikTok account turned into an independent Ghost Energy shop run by people who actually train.",
  alternates: { canonical: "/about" },
};

const TIMELINE = [
  {
    year: "2023",
    title: "One video, badly lit",
    body: "A ranking of four Ghost flavors filmed on a phone propped against a water bottle. It did 300,000 views in a weekend, and every single comment was an argument about where the watermelon should have gone.",
  },
  {
    year: "2024",
    title: "The comments became the job",
    body: "People stopped asking which flavor was best and started asking where to buy it, which one to stack with their pre-workout, and whether the cotton candy was really that sweet. We were answering the same twenty questions every day.",
  },
  {
    year: "2025",
    title: "Gyms started asking",
    body: "Three gym owners in the same month asked if we could get them cases for the front-desk fridge. That's when it stopped being a channel and started being a business.",
  },
  {
    year: "2026",
    title: "This shop",
    body: "Everything we'd been saying in comments, built into a store. Rankings that don't move for money, honest product pages, and case pricing published where anyone can read it.",
  },
];

const PRINCIPLES = [
  {
    title: "We say when something isn't worth it",
    body: "Two flavors in our rankings sit in the bottom tier and we sell both of them. If we only ever told you what to buy, the rankings would be an ad and you'd be right not to trust them.",
  },
  {
    title: "Prices are published, not negotiated",
    body: "Retail and wholesale pricing are both on the site. You shouldn't have to email someone to find out what a case costs, and you shouldn't get a worse price for being bad at haggling.",
  },
  {
    title: "We're not Ghost",
    body: "We're an independent shop that stocks their drinks because they're the best zero-sugar cans for training. No partnership, no sponsorship, no approval from them. If that ever changes we'll say so on this page first.",
  },
  {
    title: "Cancelling is one click",
    body: "Every subscription can be skipped, paused or cancelled from a link in your receipt. No phone call, no retention offer, no dark pattern designed to wear you down.",
  },
];

export default function AboutPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden border-b border-line grain">
        <div className="absolute inset-0 -z-10">
          <EditorialImage name="bar-loaded" alt="" priority sizes="100vw" className="opacity-70" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/55" />
        </div>

        <div className="shell pb-16 pt-24 lg:pb-24 lg:pt-32">
          <Eyebrow>About</Eyebrow>
          <h1 className="type-hero mt-6 max-w-4xl">
            It started
            <br />
            as an
            <br />
            <span className="text-ember">argument.</span>
          </h1>
          <p className="type-lead mt-8 max-w-2xl">
            {site.tiktokHandle} was never meant to be a shop. It was one guy ranking
            energy drinks in a garage gym because nobody else would tell you which
            ones were actually worth the money.
          </p>
        </div>
      </header>

      {/* ---- Story ------------------------------------------------------- */}
      <section className="border-b border-line" aria-labelledby="story-heading">
        <div className="shell grid gap-14 py-20 lg:grid-cols-[220px_1fr] lg:gap-20 lg:py-28">
          <h2 id="story-heading" className="type-eyebrow lg:pt-2">
            How we got here
          </h2>

          <ol className="border-t border-line">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.year} as="li" delay={i * 70}>
                <div className="grid gap-4 border-b border-line py-9 sm:grid-cols-[90px_1fr] sm:gap-10">
                  <p className="type-mono font-display text-lg font-bold text-ember">{item.year}</p>
                  <div>
                    <h3 className="font-display text-2xl font-extrabold uppercase leading-[0.98] tracking-[-0.03em] lg:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Principles --------------------------------------------------- */}
      <section className="border-b border-line bg-ink-sunken" aria-labelledby="principles-heading">
        <div className="shell py-20 lg:py-28">
          <Reveal>
            <Eyebrow>What we hold to</Eyebrow>
            <h2 id="principles-heading" className="type-section mt-5 max-w-2xl">
              Four things we won&rsquo;t trade away.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-px border-t border-line md:grid-cols-2">
            {PRINCIPLES.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <div className="h-full border-b border-line py-8 md:pr-10">
                  <h3 className="font-display text-xl font-extrabold uppercase leading-tight tracking-[-0.025em]">
                    {item.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ash">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Disclosure --------------------------------------------------- */}
      <section className="border-b border-line" aria-labelledby="disclosure-heading">
        <div className="shell grid gap-12 py-20 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow>Straight answer</Eyebrow>
            <h2 id="disclosure-heading" className="type-section mt-5">
              Are you sponsored by Ghost?
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="space-y-5 text-[15px] leading-relaxed text-ash lg:pt-3">
              <p className="text-bone">No. Not now, not ever so far.</p>
              <p>
                We&rsquo;re an independent retailer. We buy the product, we sell the
                product, and we rank it however we find it. Ghost has no say in what
                goes on this site, has not approved it, and has no relationship with
                us beyond us being a customer of the people who distribute their
                drinks.
              </p>
              <p>
                GHOST&reg; is a registered trademark of its owner. We use the flavor
                names because that&rsquo;s what the products are called — that&rsquo;s
                the whole extent of it.
              </p>
              <p>
                If a brand ever does pay us for something, it&rsquo;ll be labelled on
                the page it appears on, in the same size text as everything else.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="shell py-20 lg:py-28">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="type-section max-w-xl">Come argue about flavors.</h2>
            <p className="type-lead mt-5 max-w-lg">
              The rankings get rewritten because of comments. Yours included.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a href={site.tiktok} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {site.tiktokHandle}
            </a>
            <Link href="/rankings" className="btn btn-ghost">
              Read the rankings
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
