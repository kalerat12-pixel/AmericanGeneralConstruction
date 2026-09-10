import * as React from 'react';
import { cn } from '@/lib/utils';

const fieldStyles =
  'w-full border-0 border-b border-charcoal/20 bg-transparent px-0 py-3 font-sans text-[0.9375rem] text-charcoal transition-colors duration-500 ease-calm placeholder:text-charcoal/55 focus:border-champagne focus:outline-none focus-visible:outline-none disabled:opacity-40';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input type={type} className={cn(fieldStyles, className)} ref={ref} {...props} />
  ),
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea className={cn(fieldStyles, 'min-h-[120px] resize-y', className)} ref={ref} {...props} />
));
Textarea.displayName = 'Textarea';

/**
 * Native <select> (keyboard and screen-reader behaviour comes free), with the
 * platform arrow swapped for a champagne chevron so it matches the hairlines.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      fieldStyles,
      'cursor-pointer appearance-none bg-[length:9px_6px] bg-[right_2px_center] bg-no-repeat pr-7',
      "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='6' viewBox='0 0 9 6'%3E%3Cpath d='M1 1l3.5 3.5L8 1' fill='none' stroke='%23C9A961' stroke-width='1.2'/%3E%3C/svg%3E\")]",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export { Input, Textarea, Select, fieldStyles };
