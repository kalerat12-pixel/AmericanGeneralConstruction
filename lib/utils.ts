import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has no way to know that `text-eyebrow` and `text-display-*`
 * are font sizes rather than colours, so without this it silently drops them
 * when a `text-<colour>` class follows in the same `cn()` call.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'eyebrow',
            'display-xs',
            'display-sm',
            'display-md',
            'display-lg',
            'display-xl',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const SITE = {
  name: 'LIFTING4GAINS',
  legalName: 'Lifting4Gains Research',
  tagline: 'Research peptides, third-party tested.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lifting4gains.com',
  handle: '@lifting4gains',
  tiktok: 'https://www.tiktok.com/@lifting4gains',
  email: 'orders@lifting4gains.com',
  disclaimer: 'Research Use Only — Not for Human Consumption',
} as const;
