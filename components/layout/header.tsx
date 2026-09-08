'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Wordmark } from '@/components/brand/wordmark';
import { primaryNav } from './nav-links';
import { useCart, cartCount } from '@/lib/cart';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const count = hydrated ? cartCount(lines) : 0;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on navigation, and lock the body while it is open.
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,border-color] duration-600 ease-calm',
        scrolled
          ? 'border-b border-champagne/25 bg-alabaster/95 backdrop-blur-[2px]'
          : 'border-b border-transparent bg-alabaster',
      )}
    >
      <div className="container-content flex h-[72px] items-center justify-between gap-6 md:h-[88px]">
        <Link
          href="/"
          className="text-charcoal hover-gold"
          aria-label="LIFTING4GAINS — home"
        >
          <Wordmark size="md" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative font-sans text-eyebrow font-medium uppercase tracking-eyebrow transition-colors duration-500 ease-calm',
                      active ? 'text-charcoal' : 'text-charcoal/70 hover:text-charcoal',
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -bottom-2 left-0 h-px w-full origin-left bg-champagne transition-transform duration-600 ease-calm',
                        active ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/cart"
            className="group flex h-11 items-center gap-2 px-3 text-charcoal hover-gold"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} aria-hidden />
            <span className="sr-only">Cart</span>
            <span
              aria-hidden
              className="min-w-[1.25rem] font-sans text-eyebrow tracking-eyebrow tabular-nums"
            >
              {count > 0 ? String(count).padStart(2, '0') : '00'}
            </span>
            <span className="sr-only">
              {count === 1 ? '1 item in cart' : `${count} items in cart`}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center text-charcoal hover-gold lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.25} aria-hidden />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.25} aria-hidden />
            )}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-champagne/25 bg-alabaster lg:hidden"
      >
        <nav aria-label="Primary mobile" className="container-content py-6">
          <ul className="flex flex-col">
            {primaryNav.map((item) => (
              <li key={item.href} className="border-b border-champagne/15 last:border-0">
                <Link
                  href={item.href}
                  className="block py-4 font-display text-2xl font-light text-charcoal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
