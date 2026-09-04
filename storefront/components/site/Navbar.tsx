"use client";

import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X, Zap } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#collection", label: "Collection" },
  { href: "#trending", label: "Trending" },
  { href: "#standards", label: "Standards" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled
          ? "glass-strong border-b border-steel/80"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="shell flex h-[60px] items-center justify-between gap-4">
        {/* Brand */}
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Lifting4Gains home">
          <span className="relative grid size-8 place-items-center rounded-[9px] border border-acid/40 bg-acid/10 transition-colors duration-300 group-hover:border-acid group-hover:bg-acid/20">
            <Zap className="size-4 text-acid" strokeWidth={2.5} />
            <span className="absolute inset-0 rounded-[9px] bg-acid/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.95rem] font-extrabold tracking-[-0.03em] text-chalk">
              LIFTING<span className="text-acid">4</span>GAINS
            </span>
            <span className="mt-0.5 font-mono text-[8px] tracking-[0.26em] text-smoke uppercase">
              Research Peptides
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative px-3.5 py-2 text-[0.8rem] font-medium text-fog transition-colors duration-300 hover:text-chalk"
              >
                {l.label}
                <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-acid transition-all duration-300 group-hover:w-5" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#collection"
            className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-acid px-5 py-2.5 text-[0.78rem] font-semibold text-[#04140a] shadow-[0_0_0_1px_rgba(0,255,102,0.45),0_8px_30px_-10px_rgba(0,255,102,0.7)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(0,255,102,0.9),0_10px_38px_-8px_rgba(0,255,102,0.95)] active:scale-95 sm:inline-flex"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Shop Collection</span>
          </a>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative grid size-10 place-items-center rounded-full border border-steel bg-carbon/70 text-mist backdrop-blur-md transition-all duration-300 hover:border-acid/60 hover:text-acid active:scale-95"
          >
            <ShoppingBag className="size-[17px]" strokeWidth={1.8} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid size-[18px] animate-ticker place-items-center rounded-full bg-acid font-mono text-[10px] font-bold text-[#04140a]">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="grid size-10 place-items-center rounded-full border border-steel bg-carbon/70 text-mist backdrop-blur-md transition-colors hover:text-chalk active:scale-95 lg:hidden"
          >
            {menuOpen ? (
              <X className="size-[18px]" strokeWidth={1.8} />
            ) : (
              <Menu className="size-[18px]" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "glass-strong overflow-hidden border-b border-steel transition-[max-height,opacity] duration-500 lg:hidden",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="shell flex flex-col py-3">
          {LINKS.map((l, i) => (
            <li key={l.href} className="border-b border-steel/60 last:border-0">
              <a
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-3.5 text-[0.95rem] font-medium text-mist transition-colors hover:text-acid"
              >
                {l.label}
                <span className="font-mono text-[10px] text-smoke">
                  0{i + 1}
                </span>
              </a>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <a
              href="#collection"
              onClick={() => setMenuOpen(false)}
              className="block rounded-full bg-acid py-3.5 text-center text-[0.85rem] font-semibold text-[#04140a]"
            >
              Shop Collection
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
