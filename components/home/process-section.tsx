import { Photo } from '@/components/photo';
import { FadeUp } from '@/components/motion';
import { SectionHeading, Rule } from '@/components/section';

const steps = [
  {
    n: '01',
    title: 'Synthesis',
    body: 'Solid-phase synthesis on a Rink amide or Wang resin, cleaved and precipitated cold, with crude purity checked before anything moves forward.',
  },
  {
    n: '02',
    title: 'Purification',
    body: 'Preparative reversed-phase HPLC on a C18 column. Fractions are pooled against a purity threshold, never against a yield target.',
  },
  {
    n: '03',
    title: 'Lyophilisation',
    body: 'Shell-frozen and dried under vacuum to a stable cake, then filled gravimetrically, stoppered and crimp-sealed under inert gas.',
  },
  {
    n: '04',
    title: 'Release',
    body: 'A sample from each lot goes to an accredited outside laboratory. The certificate is published before the lot is listed for sale.',
  },
];

export function ProcessSection() {
  return (
    <section className="texture-travertine relative bg-alabaster">
      <div className="container-content section">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="Quality & Process"
              title="Four steps, and a paper trail at each one."
              lede="Nothing here is proprietary or mysterious. It is ordinary peptide chemistry, done carefully and documented in full."
            />
            <FadeUp delay={0.12} className="mt-14">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Photo
                  src="/images/sunlight-on-stone.jpg"
                  alt="Late afternoon light raking across a pale marble surface"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </FadeUp>
          </div>

          <ol className="space-y-0">
            {steps.map((s, i) => (
              <FadeUp as="li" key={s.n} delay={i * 0.06}>
                {i === 0 && <Rule />}
                <div className="grid grid-cols-[auto_1fr] gap-7 py-10 md:gap-12 md:py-12">
                  <span className="font-sans text-eyebrow uppercase tracking-eyebrow text-gold">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.75rem] font-light leading-snug text-charcoal md:text-[2rem]">
                      {s.title}
                    </h3>
                    <p className="mt-4 max-w-prose text-[0.9375rem] leading-[1.85] text-charcoal/65">
                      {s.body}
                    </p>
                  </div>
                </div>
                <Rule />
              </FadeUp>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
