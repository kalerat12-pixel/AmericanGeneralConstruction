import type { Metadata } from 'next';
import { Mail, Clock, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/section';
import { ContactForm } from '@/components/contact-form';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { FadeUp } from '@/components/motion';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach Lifting4Gains about a certificate, an order, or bulk supply. We reply within one business day. Research use only.',
  alternates: { canonical: '/contact' },
  openGraph: {
    url: `${SITE.url}/contact`,
    title: `Contact — ${SITE.name}`,
    description: 'Reach us about a certificate, an order, or bulk supply.',
  },
};

const details = [
  { icon: Mail, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: Clock, label: 'Hours', value: 'Monday–Friday, 9am–5pm ET' },
  { icon: MapPin, label: 'Dispatch', value: 'Ships from the United States' },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Ask, and you get a real answer."
        lede="Certificates, order status, bulk supply, or a material you cannot find. One inbox, answered by a person, usually the same day."
      />
      <RuoNotice variant="bar" />

      <div className="texture-marble relative bg-alabaster">
        <div className="container-content section">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <FadeUp>
              <h2 className="eyebrow">Details</h2>
              <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
              {/* dt/dd stay direct children of each row <div> so the list keeps
                  a valid description-list structure. */}
              <dl className="mt-10 border-t border-champagne/30">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 border-b border-champagne/30 py-7"
                  >
                    <Icon
                      className="row-span-2 mt-0.5 h-5 w-5 shrink-0 text-champagne"
                      strokeWidth={1}
                      aria-hidden
                    />
                    <dt className="eyebrow-muted">{label}</dt>
                    <dd className="col-start-2 font-sans text-[0.9375rem] text-charcoal/75">
                      {href ? (
                        <a href={href} className="underline underline-offset-4 hover-gold">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-10 max-w-prose text-[0.875rem] leading-[1.85] text-charcoal/70">
                For anything tied to a specific vial, include the lot number from the label — it
                lets us pull the certificate and the retained sample record straight away.
              </p>
            </FadeUp>

            <FadeUp delay={0.08}>
              <h2 className="eyebrow">Write to us</h2>
              <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
              <div className="mt-10">
                <ContactForm />
              </div>
            </FadeUp>
          </div>

          <RuoNotice className="mt-20 bg-alabaster/70" />
        </div>
      </div>
    </>
  );
}
