import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description:
    'How orders are packed and dispatched, what international buyers should expect, and the conditions under which material can be returned or replaced.',
  alternates: { canonical: '/shipping-returns' },
  openGraph: { url: `${SITE.url}/shipping-returns`, title: `Shipping & Returns — ${SITE.name}` },
};

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping & Returns"
      lede="How material is packed, when it leaves, and what happens if something is wrong when it arrives."
      updated="8 September 2026"
      sections={[
        {
          heading: 'Processing',
          body: [
            <p key="1">
              Order requests are reviewed the same business day where possible. Once you accept the
              quote and payment clears, orders are packed and dispatched within one to two business
              days.
            </p>,
            <p key="2">
              We dispatch Monday to Wednesday so that nothing sits in a carrier depot over a
              weekend. Orders confirmed later in the week ship the following Monday.
            </p>,
          ],
        },
        {
          heading: 'Packing and cold chain',
          body: [
            <p key="1">
              Vials are packed upright in moulded foam inside an insulated carton with frozen gel
              packs. Lyophilised peptides are stable at ambient temperature for the length of a
              normal transit, so a thawed gel pack on arrival is expected and is not a sign of
              degraded material.
            </p>,
            <p key="2">
              Move material to -20 °C on receipt. Storage conditions specific to each product are
              listed on its page and repeated on the certificate.
            </p>,
          ],
        },
        {
          heading: 'Domestic shipping',
          body: [
            <p key="1">
              Within the United States we ship tracked two-day and overnight services. Shipping is
              quoted per order based on weight, destination and the service you select — there is no
              flat rate and no built-in margin.
            </p>,
            <p key="2">
              A tracking number is emailed when the label is created. Signature on delivery is
              available on request.
            </p>,
          ],
        },
        {
          heading: 'International shipping',
          body: [
            <p key="1">
              We ship to many destinations, subject to the laws of the destination country. The
              purchaser is the importer of record and is responsible for any duties, taxes, permits
              and customs clearance.
            </p>,
            <p key="2">
              Where import of a material is restricted in your jurisdiction, we cannot ship it —
              ask before ordering if you are unsure. We do not mislabel shipments or understate
              declared value under any circumstances.
            </p>,
          ],
        },
        {
          heading: 'Damaged or incorrect shipments',
          body: [
            <p key="1">
              Inspect the shipment on arrival. If a vial is cracked, a seal is compromised, the
              material does not match the certificate, or the lot number on the label does not
              resolve in the{' '}
              <Link href="/quality#archive" className="underline underline-offset-4 hover-gold">
                archive
              </Link>
              , email us within 7 days with photographs and the lot number.
            </p>,
            <p key="2">
              We replace confirmed damaged or mismatched material at our cost, including return
              shipping where a return is needed. This is not discretionary — it is the point of
              publishing certificates.
            </p>,
          ],
        },
        {
          heading: 'Returns',
          body: [
            <p key="1">
              Unopened vials with an intact crimp seal may be returned within 14 days of delivery
              for a refund less shipping, provided they have been stored as specified. Contact us
              first for a return authorisation — unauthorised returns cannot be processed.
            </p>,
            <p key="2">
              Once a crimp seal is broken the material cannot re-enter stock and is not returnable.
              Custom or special-order material is not returnable.
            </p>,
          ],
        },
        {
          heading: 'Refunds',
          body: [
            <p key="1">
              Approved refunds are issued to the original payment method within five business days
              of the return arriving and being checked. You will get an email when it is processed.
            </p>,
            <p key="2">
              Questions about a shipment or return go to{' '}
              <a
                href={`mailto:${SITE.email}`}
                className="underline underline-offset-4 hover-gold"
              >
                {SITE.email}
              </a>{' '}
              — include the order reference and lot number.
            </p>,
          ],
        },
      ]}
    />
  );
}
