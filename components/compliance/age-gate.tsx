'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monogram } from '@/components/brand/wordmark';
import { SITE } from '@/lib/utils';

const KEY = 'l4g-age-verified';

/**
 * First-visit age gate. The answer is kept in localStorage, so it asks once
 * per browser. Rendered after mount to avoid a hydration mismatch, and it
 * cannot be dismissed with Escape or an overlay click — only by answering.
 */
export function AgeGate() {
  const [open, setOpen] = React.useState(false);
  const [declined, setDeclined] = React.useState(false);

  React.useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== 'true') setOpen(true);
    } catch {
      // Private mode or storage blocked — ask every visit rather than assume.
      setOpen(true);
    }
  }, []);

  const confirm = () => {
    try {
      localStorage.setItem(KEY, 'true');
    } catch {
      /* nothing to persist to; the session continues regardless */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        showClose={false}
        className="max-w-xl text-center"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Monogram className="mx-auto h-11 w-auto text-charcoal" title="L4G" />

        <p className="eyebrow mt-8">{SITE.disclaimer}</p>

        <DialogTitle className="mt-5 font-display text-display-xs font-light tracking-[0.01em] text-charcoal md:text-[2.5rem]">
          Please confirm your age
        </DialogTitle>

        <span aria-hidden className="mx-auto mt-7 block h-px w-16 bg-champagne/60" />

        <DialogDescription className="mx-auto mt-7 max-w-md text-[0.9375rem] leading-[1.8] text-charcoal/65">
          Everything sold here is a chemical reference material for laboratory research use only —
          not for human or veterinary consumption. You must be 21 or older to browse this
          catalogue.
        </DialogDescription>

        {declined ? (
          <p
            role="alert"
            className="mx-auto mt-9 max-w-md border border-champagne/40 px-6 py-5 text-[0.875rem] leading-[1.8] text-charcoal/70"
          >
            You must be 21 or older to view this catalogue. Thank you for stopping by.
          </p>
        ) : (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={confirm} size="lg" className="sm:min-w-[200px]">
              I am 21 or older
            </Button>
            <Button
              onClick={() => setDeclined(true)}
              variant="outline"
              size="lg"
              className="sm:min-w-[200px]"
            >
              I am under 21
            </Button>
          </div>
        )}

        <p className="mt-8 text-[0.75rem] leading-relaxed text-charcoal/65">
          By continuing you agree to our{' '}
          <a href="/terms" className="underline underline-offset-4 hover-gold">
            Terms of Sale
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline underline-offset-4 hover-gold">
            Privacy Policy
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
