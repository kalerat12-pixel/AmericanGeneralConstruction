export const primaryNav = [
  { href: '/shop', label: 'Shop' },
  { href: '/quality', label: 'Quality & Testing' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const;

export const footerNav = {
  Catalogue: [
    { href: '/shop', label: 'All products' },
    { href: '/shop?category=Recovery', label: 'Recovery' },
    { href: '/shop?category=Metabolic', label: 'Metabolic' },
    { href: '/shop?category=Cosmetic', label: 'Cosmetic' },
    { href: '/shop?category=Cognitive', label: 'Cognitive' },
  ],
  House: [
    { href: '/about', label: 'About' },
    { href: '/quality', label: 'Quality & Testing' },
    { href: '/quality#archive', label: 'COA archive' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/terms', label: 'Terms of Sale' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/shipping-returns', label: 'Shipping & Returns' },
  ],
} as const;
