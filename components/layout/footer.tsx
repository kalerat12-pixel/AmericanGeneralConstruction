import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';
import { Wordmark, Monogram } from '@/components/brand/wordmark';
import { footerNav } from './nav-links';
import { SITE } from '@/lib/utils';
import { NewsletterForm } from '@/components/newsletter-form';

/** Lucide has no TikTok glyph, so the mark is drawn to match its 1.25 stroke. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M16.5 3.2c.5 2.2 2 3.7 4.2 3.9v2.8c-1.6.1-3-.4-4.2-1.3v5.9c0 3.6-2.6 6-5.7 6C7.6 20.5 5 18 5 14.5s2.6-6 5.8-5.9v2.9c-.3-.1-.7-.1-1-.1-1.7 0-3 1.3-3 3.1s1.3 3.1 3 3.1c1.7 0 2.9-1.3 2.9-3.1V3.2h3.8Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="on-dark relative bg-midnight text-alabaster">
      <div className="container-content">
        <div className="grid gap-16 py-20 md:py-24 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:py-28">
          <div>
            <Monogram className="h-12 w-auto text-alabaster" title="L4G monogram" />
            <Wordmark size="md" className="mt-7 block text-alabaster" as="div" />
            <a
              href={SITE.tiktok}
              className="mt-3 inline-block font-sans text-eyebrow uppercase tracking-eyebrow text-alabaster/65 hover-gold"
              rel="noopener noreferrer"
              target="_blank"
            >
              {SITE.handle}
            </a>

            <p className="mt-8 max-w-xs text-[0.9375rem] leading-[1.8] text-alabaster/60">
              Research-grade peptides, sourced and tested with the care you would expect of a
              house that puts its name on the label.
            </p>

            <ul className="mt-8 flex items-center gap-1">
              <li>
                <a
                  href={SITE.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center text-alabaster/60 hover-gold"
                >
                  <TikTokIcon className="h-[18px] w-[18px]" />
                  <span className="sr-only">Lifting4Gains on TikTok</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lifting4gains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center text-alabaster/60 hover-gold"
                >
                  <Instagram className="h-[18px] w-[18px]" strokeWidth={1.25} aria-hidden />
                  <span className="sr-only">Lifting4Gains on Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex h-11 w-11 items-center justify-center text-alabaster/60 hover-gold"
                >
                  <Mail className="h-[18px] w-[18px]" strokeWidth={1.25} aria-hidden />
                  <span className="sr-only">Email {SITE.email}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="grid gap-12 sm:grid-cols-3">
            {Object.entries(footerNav).map(([heading, links]) => (
              <nav key={heading} aria-label={heading}>
                <h2 className="eyebrow">{heading}</h2>
                <span aria-hidden className="mt-4 block h-px w-8 bg-champagne/45" />
                <ul className="mt-5 space-y-3.5">
                  {links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="text-[0.9375rem] text-alabaster/65 hover-gold"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <span aria-hidden className="block h-px w-full bg-champagne/25" />

        <div className="grid gap-10 py-14 lg:grid-cols-[1.1fr_2fr] lg:gap-20">
          <div>
            <h2 className="eyebrow">The Dispatch</h2>
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-[1.8] text-alabaster/60">
              New lots, certificates and restocks. Sent rarely.
            </p>
          </div>
          <NewsletterForm variant="dark" />
        </div>

        <span aria-hidden className="block h-px w-full bg-champagne/25" />

        {/* Compliance block — required on every page. */}
        <div className="py-12">
          <p className="eyebrow">{SITE.disclaimer}</p>
          <div className="mt-5 max-w-3xl space-y-4 text-[0.8125rem] leading-[1.85] text-alabaster/65">
            <p>
              All products sold by {SITE.legalName} are supplied strictly as chemical reference
              materials for in-vitro laboratory research and analytical use by qualified
              professionals. They are not drugs, foods, cosmetics or medical devices, and they are
              not intended to diagnose, treat, cure or prevent any condition.
            </p>
            <p>
              Nothing on this website constitutes medical advice or a recommendation for use in
              humans or animals. No statement here has been evaluated by the Food and Drug
              Administration. Purchasers are responsible for determining the suitability of any
              material for their intended research and for complying with all applicable laws in
              their jurisdiction. You must be 21 or older to purchase.
            </p>
          </div>
        </div>

        <span aria-hidden className="block h-px w-full bg-champagne/20" />

        <div className="flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[0.75rem] tracking-wide text-alabaster/60">
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {footerNav.Legal.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-sans text-[0.75rem] tracking-wide text-alabaster/60 hover-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
