"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { site } from "@/lib/config";

/** Scroll position as an external store — no setState on mount. */
function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/rankings", label: "Rankings" },
  { href: "/bundles", label: "Build a pack" },
  { href: "/partners", label: "Gym partners" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const { totals, ready } = useCart();
  // The menu is scoped to the route it was opened on, so navigating closes it.
  // Adjusting state during render like this is React's recommended alternative
  // to a reset-on-prop-change effect.
  const [menu, setMenu] = useState({ path: pathname, open: false });
  const open = menu.path === pathname && menu.open;
  const setOpen = useCallback(
    (next: boolean | ((current: boolean) => boolean)) =>
      setMenu((current) => ({
        path: pathname,
        open: typeof next === "function" ? next(current.path === pathname && current.open) : next,
      })),
    [pathname],
  );
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 12,
    () => false,
  );

  // Lock the page behind the mobile menu, and restore on close.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const count = ready ? totals.itemCount : 0;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-ink/92 backdrop-blur-sm" : "border-transparent bg-transparent"
      }`}
    >
      <div className="shell-wide flex h-[68px] items-center justify-between gap-3 sm:gap-6">
        <Link
          href="/"
          className="font-display text-[15px] font-extrabold uppercase leading-none tracking-[-0.02em]"
          aria-label={`${site.name} home`}
        >
          Lifting<span className="text-ember">4</span>Gains
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`link-slide text-[13px] font-semibold uppercase tracking-[0.08em] ${
                      active ? "text-ember" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/account"
            className="hidden px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-ash transition-colors hover:text-bone lg:inline-block"
          >
            Account
          </Link>

          <Link
            href="/cart"
            className="group flex items-center gap-2 border border-line-input px-3 py-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors hover:border-bone sm:gap-2.5 sm:px-4"
          >
            Cart
            <span
              className={`type-mono min-w-[1.5rem] px-1.5 py-0.5 text-center text-[11px] ${
                count > 0 ? "bg-ember text-ink" : "bg-line text-ash"
              }`}
            >
              {count}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 items-center justify-center border border-line-input lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
              <span
                className={`h-px w-full bg-bone transition-transform duration-300 ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span className={`h-px w-full bg-bone transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
              <span
                className={`h-px w-full bg-bone transition-transform duration-300 ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu. Most traffic arrives from a TikTok bio link, so this is
          the primary navigation, not an afterthought. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-[68px] bottom-0 z-40 border-t border-line bg-ink lg:hidden"
      >
        <nav aria-label="Mobile" className="shell flex h-full flex-col pt-4">
          <ul className="flex flex-col">
            {NAV.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  className="flex items-baseline justify-between py-5 font-display text-[2rem] font-extrabold uppercase tracking-[-0.03em]"
                >
                  {item.label}
                  <span className="type-mono text-[11px] text-ash-dim">
                    0{i + 1}
                  </span>
                </Link>
              </li>
            ))}
            <li className="border-b border-line">
              <Link
                href="/account"
                className="flex items-baseline justify-between py-5 font-display text-[2rem] font-extrabold uppercase tracking-[-0.03em]"
              >
                Account
                <span className="type-mono text-[11px] text-ash-dim">06</span>
              </Link>
            </li>
          </ul>

          <div className="mt-auto pb-10 pt-8">
            <Link href="/shop" className="btn btn-primary w-full">
              Shop all flavors
            </Link>
            <a
              href={site.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block py-3 text-center text-sm text-ash"
            >
              {site.tiktokHandle} on TikTok
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
