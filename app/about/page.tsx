import type { Metadata } from 'next';
import { Photo } from '@/components/photo';
import { PageHeader, SectionHeading, Rule } from '@/components/section';
import { FadeUp } from '@/components/motion';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { Monogram } from '@/components/brand/wordmark';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Lifting4Gains exists, how the catalogue is chosen, and the person behind it. Research use only — not for human consumption.',
  alternates: { canonical: '/about' },
  openGraph: {
    url: `${SITE.url}/about`,
    title: `About — ${SITE.name}`,
    description: 'Why Lifting4Gains exists, how the catalogue is chosen, and the person behind it.',
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A short catalogue, documented properly."
        lede="Lifting4Gains supplies research-grade peptides to laboratories, formulators and independent researchers. We keep the list short on purpose: ten materials we can source consistently and test the same way every time."
      />

      {/* Position */}
      <section className="texture-marble relative bg-alabaster">
        <div className="container-content section">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
            <SectionHeading
              eyebrow="What we are"
              title="A supplier, not an authority."
              className="lg:sticky lg:top-32 lg:self-start"
            />
            <FadeUp delay={0.08} className="max-w-prose space-y-6 text-[1rem] leading-[1.9] text-charcoal/70">
              <p>
                We sell chemical reference materials. That is the whole business. We do not tell
                anyone what to do with them, we do not publish protocols, and we do not make claims
                about what any of these compounds do in a body — because we are not qualified to,
                and because it would be against the law.
              </p>
              <p>
                What we can do is be exact about what is in the vial. Every lot has a purity number
                from an outside laboratory, a mass spectrum confirming identity, a water content, a
                residual solvent screen, and a certificate you can read before you spend anything.
                That certificate is the product as much as the powder is.
              </p>
              <p>
                The catalogue stays at ten entries because a supplier who lists two hundred
                materials is a reseller with a warehouse, not a house with a standard. When we
                cannot source something to the specification we publish, we do not list it.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="border-t border-champagne/25 bg-bone/50">
        <div className="container-content section">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <FadeUp>
              {/* Portrait slot — replace /images/founder-portrait.jpg in place. */}
              <figure className="relative aspect-[3/4] overflow-hidden bg-bone">
                <Photo
                  src="/images/founder-portrait.jpg"
                  alt="Portrait of the founder of Lifting4Gains"
                  fill
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover"
                />
              </figure>
            </FadeUp>

            <FadeUp delay={0.08} className="lg:pt-6">
              <p className="eyebrow">The founder</p>
              <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
              <h2 className="mt-7 max-w-xl text-balance font-display text-[2.25rem] font-light leading-[1.1] tracking-[0.015em] text-charcoal md:text-display-sm">
                I started asking for certificates, and stopped getting answers.
              </h2>

              <div className="mt-9 max-w-prose space-y-6 text-[1rem] leading-[1.9] text-charcoal/70">
                <p>
                  I have spent years making training content — I am{' '}
                  <a
                    href={SITE.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-charcoal underline decoration-champagne/60 underline-offset-4 transition-colors hover-gold"
                  >
                    {SITE.handle}
                  </a>{' '}
                  — and the question that came up most often had nothing to do with training. It was
                  some version of: how do I know what is actually in this?
                </p>
                <p>
                  So I started asking suppliers for certificates of analysis. Most could not produce
                  one. Several sent a certificate for a different lot. A few sent something that
                  had clearly been edited. It became obvious that the paperwork, not the powder, was
                  where the industry was cutting corners.
                </p>
                <p>
                  Lifting4Gains is my attempt to do the boring part properly. An accredited outside
                  laboratory tests every lot. The certificate goes up before the lot goes on sale.
                  The lot number on your vial matches the certificate in the archive. If it does
                  not, tell me and I will make it right.
                </p>
                <p>
                  I am not a chemist and I do not pretend to be one. I am the person who makes sure
                  the chemists are checked, the records are kept, and nobody on this website tells
                  you what to put in your body.
                </p>
              </div>

              <div className="mt-11 flex items-center gap-5">
                <Monogram className="h-9 w-auto text-charcoal" title="L4G" showRule={false} />
                <span aria-hidden className="h-px w-10 bg-champagne/55" />
                <a
                  href={SITE.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/70 hover-gold"
                >
                  {SITE.handle}
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="texture-travertine relative bg-alabaster">
        <div className="container-content section">
          <SectionHeading eyebrow="How we work" title="Four things we hold to." />
          <ul className="mt-16 grid gap-x-16 md:grid-cols-2">
            {[
              [
                'Publish before selling',
                'A lot is listed only after its certificate is in the archive. No pre-orders against a result we have not seen.',
              ],
              [
                'Destroy, do not downgrade',
                'A lot that misses specification is destroyed. It is not blended into a passing batch or sold as a lesser grade.',
              ],
              [
                'Say nothing we cannot support',
                'No therapeutic claims, no dosing guidance, no anecdotes dressed as evidence. Chemistry and handling only.',
              ],
              [
                'Answer the awkward question',
                'If you ask why a number moved between lots, you get the real answer and the retained sample record.',
              ],
            ].map(([title, body], i) => (
              <FadeUp as="li" key={title} delay={(i % 2) * 0.06}>
                <Rule />
                <div className="py-9">
                  <h3 className="font-display text-[1.625rem] font-light text-charcoal">{title}</h3>
                  <p className="mt-4 max-w-prose text-[0.9375rem] leading-[1.85] text-charcoal/65">
                    {body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </ul>
          <Rule />
          <RuoNotice className="mt-16 bg-alabaster/70" />
        </div>
      </section>
    </>
  );
}
