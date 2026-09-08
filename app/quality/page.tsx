import type { Metadata } from 'next';
import { FileText, Download } from 'lucide-react';
import { Photo } from '@/components/photo';
import { PageHeader, SectionHeading, Rule } from '@/components/section';
import { FadeUp } from '@/components/motion';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { products } from '@/data/products';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Quality & Testing',
  description:
    'How every lot is synthesised, purified and released: analytical methods, acceptance criteria, and the full certificate of analysis archive.',
  alternates: { canonical: '/quality' },
  openGraph: {
    url: `${SITE.url}/quality`,
    title: `Quality & Testing — ${SITE.name}`,
    description:
      'Analytical methods, acceptance criteria, and the full certificate of analysis archive.',
  },
};

const methods = [
  {
    title: 'Reversed-phase HPLC',
    detail:
      'Purity determined on a C18 column with a water/acetonitrile gradient, detection at 214 nm. Reported as area percent of the main peak.',
    spec: '≥ 98.0%',
  },
  {
    title: 'Mass spectrometry',
    detail:
      'Identity confirmed by electrospray ionisation. Observed monoisotopic mass must agree with the theoretical mass.',
    spec: '± 1.0 Da',
  },
  {
    title: 'Karl Fischer titration',
    detail:
      'Residual water in the lyophilised cake, measured coulometrically on a sample drawn at fill.',
    spec: '≤ 8.0%',
  },
  {
    title: 'Residual solvents',
    detail:
      'Headspace gas chromatography for acetonitrile, TFA and residual cleavage reagents carried through purification.',
    spec: 'Within ICH Q3C',
  },
  {
    title: 'Peptide content',
    detail:
      'Net peptide determined by amino acid analysis so the labelled fill reflects peptide, not counter-ion and water.',
    spec: 'Reported per lot',
  },
  {
    title: 'Bioburden & endotoxin',
    detail:
      'Total aerobic count and LAL endotoxin screening on lots intended for cell-based research.',
    spec: 'Reported per lot',
  },
];

export default function QualityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Quality & Testing"
        title="The certificate comes first. The listing comes second."
        lede="A lot is not published for sale until an accredited outside laboratory has returned a result and that certificate is in the archive below. If a result misses specification, the lot is destroyed."
      />
      <RuoNotice variant="bar" />

      {/* Independent testing */}
      <section className="texture-marble relative bg-alabaster">
        <div className="container-content section">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <FadeUp>
              <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/5]">
                <Photo
                  src="/images/spa-interior.jpg"
                  alt="Daylight falling across a pale plaster wall in a quiet, empty room"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </FadeUp>

            <div className="lg:pt-6">
              <SectionHeading
                eyebrow="Independent by design"
                title="We are not the laboratory that grades us."
                lede="Samples are drawn at fill and sent, blinded to the analyst, to an ISO/IEC 17025 accredited contract laboratory. We do not choose which result to publish — every certificate a lot generates is filed, including the ones that ended a lot."
              />
              <FadeUp delay={0.1} className="mt-12 space-y-8">
                {[
                  ['Sampling', 'Drawn at fill from the same run as the vials you receive, not from a retained reference stock.'],
                  ['Blinding', 'Submitted under a lot code only. The laboratory has no commercial relationship with a result.'],
                  ['Retention', 'A sealed retain from every lot is kept for 24 months so a result can be re-checked on request.'],
                ].map(([term, def]) => (
                  <div key={term}>
                    <Rule />
                    <div className="grid gap-2 pt-6 sm:grid-cols-[140px_1fr] sm:gap-8">
                      <h3 className="eyebrow-muted">{term}</h3>
                      <p className="max-w-prose text-[0.9375rem] leading-[1.85] text-charcoal/65">
                        {def}
                      </p>
                    </div>
                  </div>
                ))}
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Methods */}
      <section className="border-t border-champagne/25 bg-bone/50">
        <div className="container-content section">
          <SectionHeading
            eyebrow="Testing standards"
            title="Six tests, and the number each one has to clear."
          />

          <ul className="mt-16 grid gap-x-12 gap-y-0 md:grid-cols-2">
            {methods.map((m, i) => (
              <FadeUp as="li" key={m.title} delay={(i % 2) * 0.06}>
                <Rule />
                <div className="py-9">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h3 className="font-display text-[1.5rem] font-light text-charcoal">
                      {m.title}
                    </h3>
                    <p className="font-sans text-eyebrow uppercase tracking-eyebrow text-gold">
                      {m.spec}
                    </p>
                  </div>
                  <p className="mt-4 max-w-prose text-[0.9375rem] leading-[1.85] text-charcoal/65">
                    {m.detail}
                  </p>
                </div>
              </FadeUp>
            ))}
          </ul>
          <Rule />
        </div>
      </section>

      {/* COA archive */}
      <section id="archive" className="texture-travertine relative scroll-mt-24 bg-alabaster">
        <div className="container-content section">
          <SectionHeading
            eyebrow="COA Archive"
            title="Every current lot, and the paper behind it."
            lede="Certificates are published as PDFs and stay available for 24 months after a lot sells out. The lot number printed on your vial is the one to look for."
          />

          <div className="mt-16 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <caption className="sr-only">
                Certificates of analysis for all current lots
              </caption>
              <thead>
                <tr className="border-b border-champagne/45">
                  {['Material', 'Category', 'Lot', 'Purity', 'Certificate'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="py-4 pr-6 font-sans text-eyebrow font-medium uppercase tracking-eyebrow text-charcoal/65 last:pr-0 last:text-right"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-champagne/20">
                    <th
                      scope="row"
                      className="py-5 pr-6 font-display text-[1.25rem] font-light text-charcoal"
                    >
                      {p.name}
                    </th>
                    <td className="py-5 pr-6 font-sans text-[0.875rem] text-charcoal/70">
                      {p.category}
                    </td>
                    <td className="py-5 pr-6 font-sans text-[0.875rem] tabular-nums text-charcoal/70">
                      {p.lotNumber}
                    </td>
                    <td className="py-5 pr-6 font-sans text-[0.875rem] tabular-nums text-charcoal/70">
                      {p.purity.toFixed(1)}%
                    </td>
                    <td className="py-5 text-right">
                      <a
                        href={p.coaUrl}
                        className="inline-flex items-center gap-2 font-sans text-[0.8125rem] uppercase tracking-eyebrow text-charcoal/70 hover-gold"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden />
                        <span>
                          PDF
                          <span className="sr-only"> — certificate of analysis for {p.name}, lot {p.lotNumber}</span>
                        </span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FadeUp className="mt-14 flex items-start gap-4 border border-champagne/35 p-7">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-champagne" strokeWidth={1} aria-hidden />
            <p className="max-w-prose text-[0.875rem] leading-[1.85] text-charcoal/65">
              Looking for a lot that is no longer listed? Email{' '}
              <a
                href={`mailto:${SITE.email}`}
                className="underline underline-offset-4 hover-gold"
              >
                {SITE.email}
              </a>{' '}
              with the lot number on your vial and we will send the certificate and the retain
              record.
            </p>
          </FadeUp>

          <RuoNotice className="mt-14 bg-alabaster/70" />
        </div>
      </section>
    </>
  );
}
