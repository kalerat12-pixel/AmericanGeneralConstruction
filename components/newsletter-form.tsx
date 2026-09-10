'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * No backend yet — the submit is captured locally and acknowledged. Wire the
 * handler to a list provider when one exists.
 */
export function NewsletterForm({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  const dark = variant === 'dark';

  if (done) {
    return (
      <p
        role="status"
        className={cn(
          'font-sans text-[0.9375rem]',
          dark ? 'text-alabaster/70' : 'text-charcoal/70',
          className,
        )}
      >
        Thank you — <span className="text-gold">{email}</span> is on the list.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className={cn('w-full max-w-md', className)}
    >
      <label htmlFor={`newsletter-${variant}`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          'flex items-center gap-3 border-b transition-colors duration-500 ease-calm focus-within:border-champagne',
          dark ? 'border-alabaster/25' : 'border-charcoal/20',
        )}
      >
        <input
          id={`newsletter-${variant}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={cn(
            'w-full border-0 bg-transparent py-3.5 font-sans text-[0.9375rem] outline-none focus-visible:outline-none',
            dark
              ? 'text-alabaster placeholder:text-alabaster/55'
              : 'text-charcoal placeholder:text-charcoal/55',
          )}
        />
        <button
          type="submit"
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center hover-gold',
            dark ? 'text-alabaster/70' : 'text-charcoal/70',
          )}
        >
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.25} aria-hidden />
          <span className="sr-only">Subscribe</span>
        </button>
      </div>
      <p
        className={cn(
          'mt-3.5 text-[0.75rem] leading-relaxed',
          dark ? 'text-alabaster/60' : 'text-charcoal/65',
        )}
      >
        Lot releases and restocks only. Unsubscribe in one click.
      </p>
    </form>
  );
}
