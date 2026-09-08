import * as React from 'react';
import { PageHeader, Rule } from '@/components/section';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { FadeUp } from '@/components/motion';

export interface LegalSection {
  heading: string;
  body: React.ReactNode[];
}

/**
 * Shared shell for Terms, Privacy and Shipping & Returns so the three read as
 * one document set rather than three separately styled pages.
 */
export function LegalPage({
  eyebrow,
  title,
  lede,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lede={lede}>
        <p className="mt-9 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">
          Last updated {updated}
        </p>
      </PageHeader>
      <RuoNotice variant="bar" />

      <div className="bg-alabaster">
        <div className="container-content section">
          <div className="grid gap-14 lg:grid-cols-[220px_1fr] lg:gap-20">
            <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="eyebrow">Contents</h2>
              <span aria-hidden className="mt-4 block h-px w-8 bg-champagne/50" />
              <ol className="mt-6 space-y-3">
                {sections.map((s, i) => (
                  <li key={s.heading}>
                    <a
                      href={`#s-${i + 1}`}
                      className="flex gap-3 font-sans text-[0.875rem] leading-relaxed text-charcoal/65 hover-gold"
                    >
                      <span className="tabular-nums text-charcoal/65">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="max-w-prose">
              {sections.map((s, i) => (
                <FadeUp key={s.heading} as="section" delay={0.03 * i}>
                  <div id={`s-${i + 1}`} className="scroll-mt-28 pt-2">
                    <Rule />
                    <h2 className="mt-10 font-display text-[1.875rem] font-light leading-snug text-charcoal md:text-[2.125rem]">
                      <span className="mr-4 align-middle font-sans text-eyebrow uppercase tracking-eyebrow text-gold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.heading}
                    </h2>
                    <div className="mb-14 mt-6 space-y-5">
                      {s.body.map((para, j) => (
                        <div key={j} className="text-[0.9375rem] leading-[1.9] text-charcoal/70">
                          {para}
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              ))}
              <Rule />
              <RuoNotice className="mt-14" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
