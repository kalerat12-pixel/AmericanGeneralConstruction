import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Monogram } from '@/components/brand/wordmark';

export default function NotFound() {
  return (
    <div className="texture-marble relative bg-alabaster">
      <div className="container-content flex min-h-[60svh] flex-col items-center justify-center py-24 text-center md:py-32">
        <Monogram className="h-10 w-auto text-charcoal/70" title="L4G" />
        <p className="eyebrow mt-10">Error 404</p>
        <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
        <h1 className="mt-7 max-w-lg text-balance font-display text-[2.5rem] font-light leading-[1.08] tracking-[0.015em] text-charcoal md:text-display-sm">
          This page is not in the archive.
        </h1>
        <p className="mt-6 max-w-md text-[0.9375rem] leading-[1.85] text-charcoal/70">
          The link may be out of date, or the lot it pointed to may have sold out. The catalogue is
          the best place to start again.
        </p>
        <div className="mt-11 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/shop">View the catalogue</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
