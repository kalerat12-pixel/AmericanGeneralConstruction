import type { Metadata } from "next";
import Link from "next/link";

import { PartnerForm } from "@/components/partners/PartnerForm";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WHOLESALE_TIERS, formatPrice } from "@/lib/pricing";
import { site, commerce } from "@/lib/config";

export const metadata: Metadata = {
  title: "Wholesale Ghost Energy for gyms",
  description:
    "Case pricing on Ghost Energy for gym owners — from $2.49 a can at five cases down to $1.89 at fifty. Plus a referral code your members can use.",
  alternates: { canonical: "/partners" },
};

const HOW = [
  {
    n: "01",
    title: "Tell us what you need",
    body: "Gym size, rough monthly volume, and how much fridge space you're working with. Two minutes, no call.",
  },
  {
    n: "02",
    title: "We quote in a working day",
    body: "A real price per case for the flavors your members actually want, not a rate card that expires in a week.",
  },
  {
    n: "03",
    title: "Your code goes live",
    body: "Members get 10% off online. You earn 5% back as credit on your next case order. It tracks automatically.",
  },
  {
    n: "04",
    title: "We keep you stocked",
    body: "Standing order on the schedule you pick, delivered in your opening hours. Change or pause it any time.",
  },
];

const FAQ = [
  {
    q: "What's the minimum order?",
    a: `${commerce.wholesaleMinimumCases} cases. Below that you're better off on our retail 24-packs — we'll tell you that rather than sell you a wholesale account you don't need.`,
  },
  {
    q: "Can we mix flavors across a case order?",
    a: "Yes, and you should. Most gyms end up with roughly half sour, a quarter citrus, and the rest split across candy flavors. We'll suggest a split based on what sells in gyms your size.",
  },
  {
    q: "How does the referral code pay out?",
    a: "As credit against your next case order, reconciled monthly. You'll get a plain statement showing every order that used your code. If you'd rather have it as a payment, ask and we'll arrange it.",
  },
  {
    q: "Do we have to sign anything?",
    a: "No contract and no exclusivity. If we stop being the best option for your fridge, stop ordering — we'd rather you did that than sit in a term you regret.",
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* ---- Hero -------------------------------------------------------- */}
      <header className="relative isolate overflow-hidden border-b border-line grain">
        <div className="absolute inset-0 -z-10">
          <EditorialImage name="rack-uprights" alt="" priority sizes="100vw" className="opacity-70" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-ink/45" />
        </div>

        <div className="shell-wide pb-16 pt-24 lg:pb-24 lg:pt-32">
          <div className="max-w-3xl">
            <Eyebrow>Gym partners</Eyebrow>
            <h1 className="type-display mt-6">
              Stock the fridge.
              <br />
              Keep the margin.
            </h1>
            <p className="type-lead mt-7 max-w-xl">
              Case pricing on Ghost Energy for gym owners, from{" "}
              {formatPrice(WHOLESALE_TIERS[0].perCanCents)} a can — plus a referral
              code your members can use online that pays you back.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#quote" className="btn btn-primary">
                Get case pricing
              </a>
              <a href={`mailto:${site.wholesaleEmail}`} className="btn btn-ghost">
                {site.wholesaleEmail}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Pricing tiers ------------------------------------------------ */}
      <section className="border-b border-line" aria-labelledby="pricing-heading">
        <div className="shell-wide py-20 lg:py-24">
          <Reveal>
            <Eyebrow>Wholesale pricing</Eyebrow>
            <h2 id="pricing-heading" className="type-section mt-5 max-w-2xl">
              Published, not negotiated.
            </h2>
            <p className="type-lead mt-5 max-w-xl">
              Here&rsquo;s what you&rsquo;ll pay. No &ldquo;contact us for a
              quote&rdquo; where the number depends on how well you haggle.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {WHOLESALE_TIERS.map((tier, i) => (
              <Reveal key={tier.cases} delay={i * 70}>
                <div className="flex h-full flex-col border-b border-line py-7 sm:pr-8">
                  <p className="type-eyebrow">{tier.cases}</p>
                  <p className="mt-4 font-display text-4xl font-extrabold tracking-[-0.045em] lg:text-5xl">
                    {formatPrice(tier.perCanCents)}
                    <span className="text-base font-normal tracking-normal text-ash-dim">/can</span>
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ash">{tier.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ash-dim">
            A case is 24 cans. Pricing excludes tax and applies to mixed-flavor case
            orders. Delivery is free over ten cases; below that it&rsquo;s quoted on
            your postcode at cost.
          </p>
        </div>
      </section>

      {/* ---- How it works ------------------------------------------------- */}
      <section className="border-b border-line bg-ink-sunken" aria-labelledby="how-heading">
        <div className="shell-wide py-20 lg:py-24">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 id="how-heading" className="type-section mt-5 max-w-xl">
              Four steps, one of them yours.
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-px border-t border-line md:grid-cols-2 lg:grid-cols-4">
            {HOW.map((step, i) => (
              <Reveal key={step.n} as="li" delay={i * 70}>
                <div className="h-full border-b border-line py-7 md:pr-8">
                  <span className="type-mono text-sm text-ember">{step.n}</span>
                  <h3 className="mt-4 font-display text-lg font-extrabold uppercase leading-tight tracking-[-0.025em]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Referral explainer + form ------------------------------------ */}
      <section id="quote" className="scroll-mt-24 border-b border-line" aria-labelledby="quote-heading">
        <div className="shell-wide grid gap-14 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-24">
          <div>
            <Reveal>
              <Eyebrow>Referral codes</Eyebrow>
              <h2 id="quote-heading" className="type-section mt-5">
                Your members buy. You get paid.
              </h2>
              <p className="type-lead mt-6">
                Every partner gym gets a code. Members take 10% off anything on the
                site, you take 5% back as credit. It costs your members less than
                the vending machine and it costs you nothing to run.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-10 border border-line-strong p-6">
                <p className="type-eyebrow">Example</p>
                <dl className="mt-5 space-y-3 text-sm">
                  {[
                    ["40 members order a 12-pack", formatPrice(3499 * 40)],
                    ["Their discount at 10%", `−${formatPrice(Math.round(3499 * 40 * 0.1))}`],
                    ["Your credit at 5%", formatPrice(Math.round(3499 * 40 * 0.05))],
                  ].map(([k, v], i) => (
                    <div
                      key={k}
                      className={`flex justify-between gap-4 ${
                        i === 2 ? "border-t border-line pt-3 text-ember" : "text-ash"
                      }`}
                    >
                      <dt>{k}</dt>
                      <dd className="type-mono shrink-0">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs leading-relaxed text-ash-dim">
                  Illustrative maths on our list price — your actual credit depends on
                  what your members order.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-12">
                <h3 className="type-eyebrow">Common questions</h3>
                <dl className="mt-5">
                  {FAQ.map((item) => (
                    <div key={item.q} className="border-t border-line py-5">
                      <dt className="font-display text-base font-bold uppercase tracking-[-0.015em]">
                        {item.q}
                      </dt>
                      <dd className="mt-2.5 text-sm leading-relaxed text-ash">{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
            <PartnerForm />
          </Reveal>
        </div>
      </section>

      <section className="shell-wide py-16">
        <p className="text-sm text-ash">
          Not a gym owner but you want a code?{" "}
          <Link href="/contact" className="link-slide text-bone">
            Talk to us
          </Link>{" "}
          — we run the same deal for coaches, teams and clubs.
        </p>
      </section>
    </>
  );
}
