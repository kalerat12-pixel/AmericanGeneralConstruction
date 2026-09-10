import * as React from 'react';
import { cn } from '@/lib/utils';
import { FadeUp } from '@/components/motion';

/** A hairline champagne rule used as a section divider. */
export function Rule({ className, strong }: { className?: string; strong?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(strong ? 'rule-hairline-strong' : 'rule-hairline', className)}
    />
  );
}

export function Eyebrow({
  children,
  className,
  muted,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return <p className={cn(muted ? 'eyebrow-muted' : 'eyebrow', className)}>{children}</p>;
}

/**
 * Section heading pattern used across the site: eyebrow, hairline, display
 * headline, optional lede. Keeps the vertical rhythm identical everywhere.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  as: Tag = 'h2',
  className,
  tone = 'light',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <FadeUp
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {eyebrow && (
        <span
          aria-hidden
          className={cn('mt-4 block h-px w-10 bg-champagne/55', align === 'center' && 'mx-auto')}
        />
      )}
      <Tag
        className={cn(
          'mt-7 text-balance font-display text-[2.25rem] font-light leading-[1.08] tracking-[0.015em] md:text-display-md',
          tone === 'dark' ? 'text-alabaster' : 'text-charcoal',
        )}
      >
        {title}
      </Tag>
      {lede && (
        <p
          className={cn(
            'mt-7 max-w-prose text-pretty text-[1rem] leading-[1.85] md:text-[1.0625rem]',
            align === 'center' && 'mx-auto',
            tone === 'dark' ? 'text-alabaster/65' : 'text-charcoal/65',
          )}
        >
          {lede}
        </p>
      )}
    </FadeUp>
  );
}

/** Page header used on every non-home route. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="texture-marble relative border-b border-champagne/25 bg-alabaster">
      <div className="container-content py-20 md:py-28 lg:py-32">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} lede={lede} />
        {children}
      </div>
    </header>
  );
}
