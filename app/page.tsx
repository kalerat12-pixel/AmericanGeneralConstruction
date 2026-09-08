import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { ValueProps } from '@/components/home/value-props';
import { FeaturedCarousel } from '@/components/home/featured-carousel';
import { TrustSection } from '@/components/home/trust-section';
import { ProcessSection } from '@/components/home/process-section';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { featuredProducts } from '@/data/products';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: `${SITE.name} — Research Peptides, Third-Party Tested`,
  description:
    'Research-grade peptides supplied lyophilised and crimp-sealed, each lot matched to an independent certificate of analysis. Research use only — not for human consumption.',
  alternates: { canonical: '/' },
  openGraph: {
    url: SITE.url,
    title: `${SITE.name} — Research Peptides, Third-Party Tested`,
    description:
      'Research-grade peptides supplied lyophilised and crimp-sealed, each lot matched to an independent certificate of analysis.',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.legalName,
  alternateName: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/brand/og-default.png`,
  email: SITE.email,
  sameAs: [SITE.tiktok],
  description:
    'Supplier of research-grade peptides for in-vitro laboratory use, with third-party certificates of analysis published per lot.',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, hand-authored object — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Hero />
      <RuoNotice variant="bar" />
      <ValueProps />
      <FeaturedCarousel products={featuredProducts()} />
      <TrustSection />
      <ProcessSection />
      <NewsletterSection />
    </>
  );
}
