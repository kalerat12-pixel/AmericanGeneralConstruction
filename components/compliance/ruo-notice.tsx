import { cn } from '@/lib/utils';
import { SITE } from '@/lib/utils';

/**
 * The Research Use Only line. Required on every product page and repeated in
 * the footer; `variant` only changes how loudly it is set, never the wording.
 */
export function RuoNotice({
  variant = 'block',
  className,
}: {
  variant?: 'block' | 'inline' | 'bar';
  className?: string;
}) {
  if (variant === 'inline') {
    return (
      <p className={cn('eyebrow', className)}>
        {SITE.disclaimer}
      </p>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={cn('border-y border-champagne/30 bg-bone/60', className)}>
        <p className="container-content py-3.5 text-center font-sans text-[0.6875rem] uppercase tracking-eyebrow text-charcoal/70">
          {SITE.disclaimer}
        </p>
      </div>
    );
  }

  return (
    <aside
      aria-label="Research use disclaimer"
      className={cn('border border-champagne/35 p-7 md:p-8', className)}
    >
      <p className="eyebrow">{SITE.disclaimer}</p>
      <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/50" />
      <p className="mt-5 max-w-prose text-[0.875rem] leading-[1.85] text-charcoal/65">
        This material is supplied as a chemical reference standard for in-vitro laboratory
        research by qualified professionals. It is not a drug, food, cosmetic or medical device,
        and it is not intended to diagnose, treat, cure or prevent any condition. It is not for
        human or veterinary use. Purchasers must be 21 or older and are responsible for handling
        the material in accordance with the laws of their jurisdiction.
      </p>
    </aside>
  );
}
