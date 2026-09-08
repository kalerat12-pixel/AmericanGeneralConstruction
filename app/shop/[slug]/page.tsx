import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Gallery } from '@/components/product/gallery';
import { PurchasePanel } from '@/components/product/purchase-panel';
import { ProductCard } from '@/components/product/product-card';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { Badge } from '@/components/ui/badge';
import { FadeUp } from '@/components/motion';
import { Rule } from '@/components/section';
import { products, getProduct, relatedProducts, fromPrice } from '@/data/products';
import { SITE } from '@/lib/utils';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: 'Not found' };

  const url = `${SITE.url}/shop/${product.slug}`;
  return {
    title: product.name,
    description: `${product.description} ${product.purity}% purity, lot ${product.lotNumber}. Research use only — not for human consumption.`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: 'website',
      url,
      title: `${product.name} — ${SITE.name}`,
      description: product.description,
      images: [
        {
          url: product.images[0].src,
          width: 1200,
          height: 1500,
          alt: product.images[0].alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${SITE.name}`,
      description: product.description,
      images: [product.images[0].src],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const related = relatedProducts(product);

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sizes[0].sku,
    category: product.category,
    image: product.images.map((i) => `${SITE.url}${i.src}`),
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@type': 'Organization', name: SITE.legalName },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Purity', value: `${product.purity}%` },
      { '@type': 'PropertyValue', name: 'Lot number', value: product.lotNumber },
      ...product.specs.map((s) => ({
        '@type': 'PropertyValue' as const,
        name: s.label,
        value: s.value,
      })),
    ],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: fromPrice(product),
      highPrice: Math.max(...product.sizes.map((s) => s.price)),
      offerCount: product.sizes.length,
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/shop/${product.slug}`,
      seller: { '@type': 'Organization', name: SITE.legalName },
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE.url}/shop` },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE.url}/shop/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="texture-marble relative bg-alabaster">
        <div className="container-content pt-10 md:pt-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
              <li>
                <Link href="/" className="transition-colors hover-gold">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" strokeWidth={1.25} aria-hidden />
              <li>
                <Link href="/shop" className="transition-colors hover-gold">
                  Shop
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" strokeWidth={1.25} aria-hidden />
              <li aria-current="page" className="text-charcoal/70">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>

        <div className="container-content grid gap-14 py-12 md:py-16 lg:grid-cols-2 lg:gap-20 lg:py-20">
          <FadeUp>
            <Gallery images={product.images} />
          </FadeUp>

          <FadeUp delay={0.08} className="lg:pt-2">
            <div className="flex items-center gap-3">
              <Badge variant="sage">{product.category}</Badge>
              <Badge variant="champagne">{product.purity.toFixed(1)}% purity</Badge>
            </div>

            <h1 className="mt-7 text-balance font-display text-[2.5rem] font-light leading-[1.05] tracking-[0.015em] text-charcoal md:text-display-sm">
              {product.name}
            </h1>

            <p className="mt-6 max-w-prose text-pretty text-[1rem] leading-[1.85] text-charcoal/70">
              {product.description}
            </p>

            <Rule className="my-10" />

            <PurchasePanel product={product} />

            <Rule className="my-10" />

            {/* Lot provenance — the three facts a buyer actually checks. */}
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="eyebrow-muted">Purity</dt>
                <dd className="mt-2.5 font-sans text-[0.9375rem] tabular-nums text-charcoal">
                  {product.purity.toFixed(1)}% by RP-HPLC
                </dd>
              </div>
              <div>
                <dt className="eyebrow-muted">Lot number</dt>
                <dd className="mt-2.5 font-sans text-[0.9375rem] tabular-nums text-charcoal">
                  {product.lotNumber}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="eyebrow-muted">Storage</dt>
                <dd className="mt-2.5 max-w-prose text-[0.9375rem] leading-[1.8] text-charcoal/70">
                  {product.storage}
                </dd>
              </div>
            </dl>

            <a
              href={product.coaUrl}
              className="group mt-10 flex items-center justify-between gap-6 border border-champagne/40 px-6 py-5 transition-colors duration-500 ease-calm hover:border-champagne hover:bg-champagne/[0.06]"
            >
              <span className="flex items-center gap-4">
                <FileText className="h-5 w-5 shrink-0 text-champagne" strokeWidth={1} aria-hidden />
                <span>
                  <span className="block font-sans text-[0.9375rem] text-charcoal">
                    Certificate of Analysis
                  </span>
                  <span className="mt-1 block font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
                    PDF · Lot {product.lotNumber}
                  </span>
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-champagne transition-transform duration-500 ease-calm group-hover:translate-x-1"
                strokeWidth={1.25}
                aria-hidden
              />
            </a>
          </FadeUp>
        </div>
      </div>

      {/* Description + specification table */}
      <section className="border-t border-champagne/25 bg-bone/50">
        <div className="container-content section">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <FadeUp>
              <h2 className="eyebrow">Description</h2>
              <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
              <div className="mt-8 max-w-prose space-y-6">
                {product.longDescription.map((para, i) => (
                  <p key={i} className="text-[1rem] leading-[1.9] text-charcoal/70">
                    {para}
                  </p>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.08}>
              <h2 className="eyebrow">Specification</h2>
              <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[22rem] border-collapse text-left">
                  <caption className="sr-only">
                    Specification for {product.name}, lot {product.lotNumber}
                  </caption>
                  <tbody>
                    {[
                      { label: 'Purity', value: `${product.purity.toFixed(1)}% (RP-HPLC, 214 nm)` },
                      { label: 'Lot number', value: product.lotNumber },
                      ...product.specs,
                      { label: 'Storage', value: product.storage },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-champagne/20 align-top">
                        <th
                          scope="row"
                          className="w-2/5 py-4 pr-6 font-sans text-eyebrow font-medium uppercase tracking-eyebrow text-charcoal/65"
                        >
                          {row.label}
                        </th>
                        <td className="py-4 font-sans text-[0.875rem] leading-[1.7] text-charcoal/80">
                          <span className="break-words">{row.value}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeUp>
          </div>

          {/* Required on every product page. */}
          <RuoNotice className="mt-20 bg-alabaster/60" />
        </div>
      </section>

      {related.length > 0 && (
        <section className="texture-marble relative border-t border-champagne/25 bg-alabaster">
          <div className="container-content section">
            <h2 className="eyebrow">Also in the catalogue</h2>
            <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
            <ul className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
