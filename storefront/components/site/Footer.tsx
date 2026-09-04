"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { LogoLockup } from "@/components/brand/Logo";
import {
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/ui/BrandIcons";

const COLUMNS = [
  {
    title: "Compounds",
    links: [
      { label: "BPC-157", href: "/products/bpc-157" },
      { label: "Semaglutide", href: "/products/semaglutide" },
      { label: "Tirzepatide", href: "/products/tirzepatide" },
      { label: "CJC-1295 / Ipamorelin", href: "/products/cjc-1295-ipamorelin" },
      { label: "Epitalon", href: "/products/epitalon" },
      { label: "GHK-Cu", href: "/products/ghk-cu" },
    ],
  },
  {
    title: "Standards",
    links: [
      { label: "Certificates of Analysis", href: "#standards" },
      { label: "Testing Methodology", href: "#standards" },
      { label: "Cold-Chain Logistics", href: "#standards" },
      { label: "Lot Lookup", href: "#standards" },
      { label: "Storage & Handling", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Lifting4Gains", href: "#trending" },
      { label: "Contact Support", href: "mailto:support@lifting4gains.com" },
      { label: "Shipping & Returns", href: "#faq" },
      { label: "Terms of Service", href: "#legal" },
      { label: "Privacy Policy", href: "#legal" },
      { label: "Research Use Policy", href: "#legal" },
    ],
  },
];

const SOCIALS = [
  { label: "TikTok — @Lifting4Gains", href: "https://www.tiktok.com/@lifting4gains", icon: TikTokIcon, primary: true },
  { label: "Instagram", href: "https://www.instagram.com/", icon: InstagramIcon },
  { label: "YouTube", href: "https://www.youtube.com/", icon: YouTubeIcon },
  { label: "Email", href: "mailto:support@lifting4gains.com", icon: Mail },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    // Wire to your ESP (Klaviyo / Resend / Beehiiv) here.
    setDone(true);
    setEmail("");
  };

  return (
    <footer id="legal" className="relative border-t border-line bg-surface text-body">

      <div className="shell relative py-14 md:py-20">
        {/* Newsletter */}
        <div className="mb-14 border-y border-line py-10 md:py-12">
          <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
            <div>
              <p className="eyebrow mb-3">Lot Drop Alerts</p>
              <h3 className="mb-2 text-[1.6rem] leading-[1.1] font-bold text-ink md:text-[2rem]">
                New lots sell out in hours.
              </h3>
              <p className="text-[0.88rem] leading-relaxed text-body">
                Get the COA, the release time, and early access before a batch
                goes public. No spam, no daily blasts — release notices only.
              </p>
            </div>

            <form onSubmit={submit} className="w-full">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3.5 text-[0.85rem] text-ink placeholder:text-subtle transition-colors focus:border-brand-inverse focus:outline-none"
                />
                <button
                  type="submit"
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-action px-6 py-3.5 text-[0.82rem] font-semibold text-white transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] active:scale-95"
                >
                  {done ? (
                    <>
                      <Check className="size-4" strokeWidth={2.4} /> Subscribed
                    </>
                  ) : (
                    <>
                      Notify Me
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2.5 px-1 text-[0.68rem] text-subtle">
                By subscribing you confirm you are 21+ and acting in a research
                capacity.
              </p>
            </form>
          </div>
        </div>

        {/* 4-column grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="group mb-4 inline-flex">
              <LogoLockup />
            </a>
            <p className="mb-5 max-w-xs text-[0.82rem] leading-relaxed text-body">
              Research-grade peptides, manufactured to a purity standard we
              publish instead of promise. Built by the Lifting4Gains community.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map(({ label, href, icon: Icon, primary }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`grid size-9 place-items-center rounded-full border transition-all duration-300 active:scale-95 ${
                    primary
                      ? "border-brand/50 bg-brand-tint text-brand hover:bg-brand hover:text-white"
                      : "border-line text-subtle hover:border-ink-inverse hover:text-ink"
                  }`}
                >
                  <Icon className="size-[15px]" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[0.83rem] text-subtle transition-colors duration-200 hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal */}
        <div className="mt-12 border-t border-line pt-8">
          <p className="mb-4 max-w-4xl text-[0.72rem] leading-relaxed text-subtle">
            <strong className="text-ink">Research Use Only.</strong> All
            products sold by Lifting4Gains Research are intended strictly for
            laboratory research and in-vitro experimentation by qualified
            professionals. They are not drugs, foods, cosmetics, or dietary
            supplements, and are not for human or veterinary consumption. No
            statement on this site has been evaluated by the Food and Drug
            Administration, and nothing here is intended to diagnose, treat,
            cure, or prevent any disease. Purchasers assume full responsibility
            for compliance with all applicable federal, state, and local law.
            Must be 21 or older to purchase.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">
              © {new Date().getFullYear()} Lifting4Gains Research LLC
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {["Terms", "Privacy", "Refunds", "Accessibility"].map((t) => (
                <a
                  key={t}
                  href="#legal"
                  className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase transition-colors hover:text-ink"
                >
                  {t}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
