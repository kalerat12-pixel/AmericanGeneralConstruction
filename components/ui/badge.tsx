import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-sans text-[0.625rem] font-medium uppercase tracking-eyebrow',
  {
    variants: {
      variant: {
        // Label text sits a few steps darker than the border tint so the
        // 11px caps still clear 4.5:1 on the washed background.
        sage: 'border border-sage/50 bg-sage/10 px-2.5 py-1 text-[#4F5F50]',
        champagne: 'border border-champagne/45 bg-champagne/10 px-2.5 py-1 text-[#7A5F1C]',
        plain: 'border border-charcoal/15 px-2.5 py-1 text-charcoal/70',
        bare: 'text-[#7A5F1C]',
      },
    },
    defaultVariants: { variant: 'sage' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
