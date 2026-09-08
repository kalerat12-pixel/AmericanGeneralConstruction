import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Terms of Sale',
  description:
    'The terms on which Lifting4Gains supplies research-grade chemical reference materials, including eligibility, permitted use and limitations of liability.',
  alternates: { canonical: '/terms' },
  openGraph: { url: `${SITE.url}/terms`, title: `Terms of Sale — ${SITE.name}` },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Sale"
      lede="These terms govern every order placed with Lifting4Gains Research. Sending an order request means you accept them."
      updated="8 September 2026"
      sections={[
        {
          heading: 'Eligibility',
          body: [
            <p key="1">
              You must be at least 21 years of age and ordering on behalf of a qualified research
              entity — an academic institution, contract research organisation, commercial or
              analytical laboratory, or an equivalent professional setting. By placing an order you
              represent that both are true.
            </p>,
            <p key="2">
              We may decline or cancel any order at our discretion, including where the stated
              intended use is inconsistent with these terms.
            </p>,
          ],
        },
        {
          heading: 'Nature of the products',
          body: [
            <p key="1">
              All products are chemical reference materials supplied strictly for in-vitro
              laboratory research and analytical use. They are <strong>not</strong> drugs, foods,
              dietary supplements, cosmetics or medical devices, and they are not approved by any
              regulatory authority for use in humans or animals.
            </p>,
            <p key="2">
              Nothing on this website is medical advice or a recommendation for any use. No
              statement here has been evaluated by the Food and Drug Administration. We do not
              provide protocols, dosing guidance or application advice, and requests for such
              information will be declined.
            </p>,
          ],
        },
        {
          heading: 'Permitted use',
          body: [
            <p key="1">
              You agree that materials purchased will be used solely for laboratory research by
              trained personnel in an appropriate facility, and will not be administered to humans
              or animals, resold for such administration, added to any food, beverage, supplement
              or cosmetic product, or used in any clinical or diagnostic setting.
            </p>,
            <p key="2">
              You are responsible for handling, storage and disposal in accordance with applicable
              health, safety and environmental regulations in your jurisdiction.
            </p>,
          ],
        },
        {
          heading: 'Orders, pricing and payment',
          body: [
            <p key="1">
              Submitting an order request is an offer to purchase, not a completed sale. We confirm
              availability, lot assignment and shipping before issuing a quote and a payment link.
              No contract is formed until we accept your request in writing.
            </p>,
            <p key="2">
              Prices are in US dollars and exclude shipping, duties and any applicable taxes.
              Prices and specifications may change without notice; the figures on your written
              quote are the ones that apply.
            </p>,
          ],
        },
        {
          heading: 'Specifications and certificates',
          body: [
            <p key="1">
              Each lot is supplied with a certificate of analysis identified by lot number. The
              certificate describes the material as tested at the time of release and is the sole
              specification we warrant. Analytical results are reported to the precision stated on
              the certificate.
            </p>,
            <p key="2">
              Where material is found not to conform to its certificate, our liability is limited
              to replacement of the material or refund of the purchase price, at our option. See{' '}
              <Link
                href="/shipping-returns"
                className="underline underline-offset-4 hover-gold"
              >
                Shipping &amp; Returns
              </Link>
              .
            </p>,
          ],
        },
        {
          heading: 'Limitation of liability',
          body: [
            <p key="1">
              To the fullest extent permitted by law, {SITE.legalName} is not liable for any
              indirect, incidental, special or consequential loss arising from the purchase, use,
              storage or disposal of any material, including loss of data, profits or research
              outcomes.
            </p>,
            <p key="2">
              Our total aggregate liability in connection with any order will not exceed the amount
              paid for that order. Nothing in these terms excludes liability that cannot lawfully be
              excluded.
            </p>,
          ],
        },
        {
          heading: 'Indemnity',
          body: [
            <p key="1">
              You agree to indemnify and hold {SITE.legalName} harmless against any claim, loss or
              expense arising from your use of any material in breach of these terms, including any
              administration to a human or animal.
            </p>,
          ],
        },
        {
          heading: 'Governing law',
          body: [
            <p key="1">
              These terms are governed by the laws of the State of Delaware, United States, without
              regard to its conflict of law rules. The courts of that state have exclusive
              jurisdiction over any dispute arising from them.
            </p>,
            <p key="2">
              Questions about these terms can be sent to{' '}
              <a
                href={`mailto:${SITE.email}`}
                className="underline underline-offset-4 hover-gold"
              >
                {SITE.email}
              </a>
              .
            </p>,
          ],
        },
      ]}
    />
  );
}
