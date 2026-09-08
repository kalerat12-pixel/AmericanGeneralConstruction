import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What Lifting4Gains collects, why, how long it is kept, and the choices you have over your information.',
  alternates: { canonical: '/privacy' },
  openGraph: { url: `${SITE.url}/privacy`, title: `Privacy Policy — ${SITE.name}` },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lede="We collect the minimum needed to fulfil an order and answer a question, and we do not sell any of it."
      updated="8 September 2026"
      sections={[
        {
          heading: 'What we collect',
          body: [
            <p key="1">
              <strong>Information you give us.</strong> Name, email address, organisation, shipping
              address, intended research use and any notes you include when you send an order
              request, a contact message or a newsletter subscription.
            </p>,
            <p key="2">
              <strong>Information collected automatically.</strong> Standard server logs — IP
              address, browser and device type, pages requested and timestamps — retained for
              security and diagnostics.
            </p>,
            <p key="3">
              <strong>Stored on your device.</strong> Your cart contents and your answer to the age
              confirmation are kept in your browser&apos;s local storage. They never leave your
              device and are not readable by us. Clearing site data removes both.
            </p>,
          ],
        },
        {
          heading: 'Why we use it',
          body: [
            <p key="1">
              To quote, fulfil and ship orders; to answer questions and provide certificates; to
              keep the records that supplying regulated research materials requires; to detect and
              prevent fraud and abuse; and, where you have asked for it, to send the occasional lot
              release notice.
            </p>,
            <p key="2">
              We do not use your information for profiling, behavioural advertising, or automated
              decision-making.
            </p>,
          ],
        },
        {
          heading: 'Who we share it with',
          body: [
            <p key="1">
              We do not sell, rent or trade personal information. We share it only with the service
              providers needed to run the business — payment processing, shipping carriers, email
              delivery and website hosting — each bound to use it solely for that purpose.
            </p>,
            <p key="2">
              We may disclose information where required by law, or to protect our rights, safety or
              property.
            </p>,
          ],
        },
        {
          heading: 'How long we keep it',
          body: [
            <p key="1">
              Order records are retained for seven years to meet tax and supply-record obligations.
              Contact messages are kept for two years. Newsletter subscriptions are kept until you
              unsubscribe. Server logs are kept for 90 days.
            </p>,
          ],
        },
        {
          heading: 'Cookies',
          body: [
            <p key="1">
              This site sets no advertising or cross-site tracking cookies. Any cookie present is
              strictly necessary for the site to function, and no third-party analytics script is
              loaded.
            </p>,
          ],
        },
        {
          heading: 'Your choices',
          body: [
            <p key="1">
              You may ask us for a copy of the information we hold about you, ask us to correct it,
              or ask us to delete it where we are not required to keep it. Write to{' '}
              <a
                href={`mailto:${SITE.email}`}
                className="underline underline-offset-4 hover-gold"
              >
                {SITE.email}
              </a>{' '}
              and we will respond within 30 days.
            </p>,
            <p key="2">
              Every newsletter carries a one-click unsubscribe link. Unsubscribing does not affect
              order-related correspondence.
            </p>,
          ],
        },
        {
          heading: 'Security',
          body: [
            <p key="1">
              Traffic to this site is encrypted in transit. Access to order records is limited to
              the people who need it to fulfil an order. No system is perfect, and we will notify
              affected customers without undue delay if a breach materially affects them.
            </p>,
          ],
        },
        {
          heading: 'Children',
          body: [
            <p key="1">
              This site is not directed at anyone under 21, and we do not knowingly collect
              information from anyone under that age. If you believe a minor has provided
              information, contact us and we will delete it.
            </p>,
          ],
        },
      ]}
    />
  );
}
