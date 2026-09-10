import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/section';
import { ShopBrowser } from '@/components/shop/shop-browser';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { products } from '@/data/products';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'The full catalogue of research-grade peptides, filterable by category. Every lot ships with an independent certificate of analysis. Research use only.',
  alternates: { canonical: '/shop' },
  openGraph: {
    url: `${SITE.url}/shop`,
    title: `Shop — ${SITE.name}`,
    description:
      'The full catalogue of research-grade peptides. Every lot ships with an independent certificate of analysis.',
  },
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Catalogue"
        title="Ten materials, kept in stock."
        lede="A deliberately short list. Each entry is synthesised, purified and released against the same specification, and each one is documented in the certificate archive."
      />
      <RuoNotice variant="bar" />
      <Suspense fallback={<div className="container-content section" aria-busy="true" />}>
        <ShopBrowser products={products} />
      </Suspense>
    </>
  );
}
