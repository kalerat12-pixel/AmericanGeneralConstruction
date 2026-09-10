import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AgeGate } from '@/components/compliance/age-gate';
import { SITE } from '@/lib/utils';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Research Peptides`,
    template: `%s — ${SITE.name}`,
  },
  description:
    'Research-grade peptides supplied lyophilised with a third-party certificate of analysis for every lot. Research use only — not for human consumption.',
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  keywords: [
    'research peptides',
    'certificate of analysis',
    'third-party tested',
    'laboratory reference material',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
    url: SITE.url,
    title: `${SITE.name} — Research Peptides`,
    description:
      'Research-grade peptides supplied lyophilised with a third-party certificate of analysis for every lot.',
    images: [
      {
        url: '/brand/og-default.png',
        width: 1200,
        height: 630,
        alt: 'LIFTING4GAINS — research peptides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Research Peptides`,
    description:
      'Research-grade peptides supplied lyophilised with a third-party certificate of analysis for every lot.',
    images: ['/brand/og-default.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#F7F4EF',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:bg-charcoal focus:px-5 focus:py-3 focus:font-sans focus:text-eyebrow focus:uppercase focus:tracking-eyebrow focus:text-alabaster"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <AgeGate />
      </body>
    </html>
  );
}
