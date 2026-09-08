import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Buttons are square-cornered and quiet. Gold is reserved for hairlines and
 * labels, so no variant here fills with champagne.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-[0.8125rem] font-medium uppercase tracking-[0.12em] transition-[background-color,color,border-color,opacity] duration-500 ease-calm disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        solid: 'bg-charcoal text-alabaster hover:bg-midnight',
        outline:
          'border border-charcoal/25 bg-transparent text-charcoal hover:border-champagne hover:text-charcoal',
        'outline-light':
          'border border-alabaster/35 bg-transparent text-alabaster hover:border-champagne hover-gold',
        ghost: 'bg-transparent text-charcoal hover-gold',
        link: 'h-auto p-0 text-charcoal underline-offset-8 hover-gold hover:underline',
      },
      size: {
        sm: 'h-10 px-5',
        md: 'h-12 px-7',
        lg: 'h-14 px-9',
        icon: 'h-11 w-11 px-0',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
