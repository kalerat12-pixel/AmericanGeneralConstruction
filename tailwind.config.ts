import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.5rem', md: '2.5rem', lg: '3.5rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        alabaster: '#F7F4EF',
        bone: '#EDE7DE',
        charcoal: '#1C1A17',
        midnight: '#14181F',
        champagne: '#C9A961',
        sage: '#A8B5A6',
        // Semantic tokens (CSS variables so sections can invert cleanly)
        ink: 'hsl(var(--ink) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        rule: 'hsl(var(--rule) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display scale — deliberately far from the body scale.
        'display-xs': ['2rem', { lineHeight: '1.15', letterSpacing: '0.01em' }],
        'display-sm': ['2.75rem', { lineHeight: '1.1', letterSpacing: '0.01em' }],
        'display-md': ['3.75rem', { lineHeight: '1.05', letterSpacing: '0.015em' }],
        'display-lg': ['5rem', { lineHeight: '1.02', letterSpacing: '0.02em' }],
        'display-xl': ['6.5rem', { lineHeight: '0.98', letterSpacing: '0.025em' }],
        // Body / UI scale
        eyebrow: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.15em' }],
      },
      letterSpacing: {
        eyebrow: '0.15em',
        wordmark: '0.25em',
        wide: '0.08em',
      },
      maxWidth: {
        content: '1280px',
        prose: '68ch',
      },
      spacing: {
        section: '120px',
        'section-lg': '160px',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0,0,0,0.06)',
        'soft-lg': '0 30px 90px rgba(0,0,0,0.08)',
        'soft-sm': '0 12px 32px rgba(0,0,0,0.05)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        600: '600ms',
        800: '800ms',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms cubic-bezier(0.22,1,0.36,1) both',
        'accordion-down': 'accordion-down 400ms cubic-bezier(0.22,1,0.36,1)',
        'accordion-up': 'accordion-up 400ms cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
