import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/section';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { FadeUp } from '@/components/motion';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers on certificates of analysis, storage and handling, shipping, ordering and returns. Research use only — not for human consumption.',
  alternates: { canonical: '/faq' },
  openGraph: {
    url: `${SITE.url}/faq`,
    title: `FAQ — ${SITE.name}`,
    description: 'Certificates, storage and handling, shipping, ordering and returns.',
  },
};

const groups: { heading: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    heading: 'Certificates & testing',
    items: [
      {
        q: 'What is on a certificate of analysis?',
        a: 'Purity by reversed-phase HPLC at 214 nm, identity by mass spectrometry with the observed and theoretical masses, water content by Karl Fischer, a residual solvent screen, net peptide content, and the laboratory’s accreditation details. The lot number and the analysis date appear at the top of every certificate.',
      },
      {
        q: 'Does the certificate match the vial I receive?',
        a: 'Yes. The lot number printed on your vial resolves to one certificate in the archive. Samples are drawn at fill from the same run as the vials that ship, not from a separate retained reference stock.',
      },
      {
        q: 'Who performs the testing?',
        a: 'An independent contract laboratory holding ISO/IEC 17025 accreditation. Samples are submitted under a lot code with no material identifying us, so the analyst has no commercial stake in the result.',
      },
      {
        q: 'What happens if a lot fails specification?',
        a: 'It is destroyed and the failing certificate is retained. Out-of-specification material is never blended into a passing lot, re-tested until it passes, or sold at a lower grade.',
      },
    ],
  },
  {
    heading: 'Storage & handling',
    items: [
      {
        q: 'How should lyophilised material be stored?',
        a: 'At -20 °C, protected from light and moisture, in the sealed vial as shipped. Each product page lists the storage condition specific to that material.',
      },
      {
        q: 'How long is material stable once reconstituted?',
        a: 'Reconstituted solutions are typically held at 2–8 °C and used within the window noted on the product page. Repeated freeze-thaw cycles are the most common cause of degradation, so aliquot before freezing.',
      },
      {
        q: 'Why is the vial contents less visible than I expected?',
        a: 'A lyophilised cake of a few milligrams occupies very little volume and can appear as a thin film on the vial base or wall. This is normal. Fill quantity is verified gravimetrically and confirmed by net peptide content on the certificate.',
      },
    ],
  },
  {
    heading: 'Ordering & shipping',
    items: [
      {
        q: 'Why is there no instant checkout?',
        a: (
          <>
            Every order is confirmed by hand — availability, lot assignment, shipping method and
            destination — before payment is taken. Add what you need to the{' '}
            <Link href="/cart" className="underline underline-offset-4 hover-gold">
              cart
            </Link>
            , send the request, and we reply with a quote and a secure payment link.
          </>
        ),
      },
      {
        q: 'How is material shipped?',
        a: 'Insulated with gel packs, tracked, and dispatched early in the week so nothing sits in a depot over a weekend. Lyophilised peptides are stable at ambient temperature for the length of a normal transit, but we ship cold regardless.',
      },
      {
        q: 'Do you ship internationally?',
        a: (
          <>
            To many destinations, subject to local law. Import responsibility sits with the
            purchaser. Ask before ordering if you are unsure —{' '}
            <Link
              href="/shipping-returns"
              className="underline underline-offset-4 hover-gold"
            >
              shipping and returns
            </Link>{' '}
            has the detail.
          </>
        ),
      },
      {
        q: 'Can I return material?',
        a: (
          <>
            Unopened vials with an intact crimp seal can be returned within 14 days. Once a seal is
            broken the material cannot re-enter stock and is not returnable. Anything that arrives
            damaged or mismatched to its certificate is replaced at our cost — see{' '}
            <Link
              href="/shipping-returns"
              className="underline underline-offset-4 hover-gold"
            >
              shipping and returns
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    heading: 'Use & compliance',
    items: [
      {
        q: 'Can you advise on how to use these materials?',
        a: 'No. We supply chemical reference materials and cannot advise on their use, in any context. We do not publish protocols, dosing information or application guidance, and any request for it will be declined.',
      },
      {
        q: 'Who is permitted to purchase?',
        a: 'Purchasers must be 21 or older and ordering on behalf of a qualified research entity. Materials are supplied strictly for in-vitro laboratory research and are not for human or veterinary consumption.',
      },
    ],
  },
];

export default function FaqPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) =>
      g.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: typeof item.a === 'string' ? item.a : g.heading,
        },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <PageHeader
        eyebrow="FAQ"
        title="The questions worth answering plainly."
        lede="If something is not covered here, write to us. We would rather answer once, properly, than leave you guessing."
      />
      <RuoNotice variant="bar" />

      <div className="texture-marble relative bg-alabaster">
        <div className="container-content section">
          <div className="mx-auto max-w-3xl space-y-20">
            {groups.map((group, gi) => (
              <FadeUp key={group.heading} delay={gi * 0.05}>
                <h2 className="eyebrow">{group.heading}</h2>
                <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
                <Accordion type="single" collapsible className="mt-8">
                  {group.items.map((item, i) => (
                    <AccordionItem key={item.q} value={`${gi}-${i}`}>
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </FadeUp>
            ))}
          </div>

          <RuoNotice className="mx-auto mt-20 max-w-3xl bg-alabaster/70" />
        </div>
      </div>
    </>
  );
}
