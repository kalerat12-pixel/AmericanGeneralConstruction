import Link from "next/link";
import { site, commerce } from "@/lib/config";
import { EmailCapture } from "@/components/site/EmailCapture";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All flavors" },
      { href: "/shop?line=energy", label: "Energy" },
      { href: "/shop?line=hydration", label: "Caffeine-free" },
      { href: "/bundles", label: "Build a variety pack" },
      { href: "/rankings", label: "Flavor rankings" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/partners", label: "Gym partners" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/account", label: "Order history" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-sunken">
      <div className="shell-wide py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-display text-[2rem] font-extrabold uppercase leading-[0.9] tracking-[-0.035em] sm:text-[2.5rem]">
              Get the drop
              <br />
              before TikTok does.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ash">
              New flavors, restocks, and the occasional honest warning when
              something is not worth your money. One email a week, no more.
            </p>
            <EmailCapture source="footer" className="mt-6 max-w-md" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="type-eyebrow mb-5">{col.title}</h2>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="link-slide text-sm text-ash hover:text-bone">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="rule mt-16 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              {/* Required disclosure. Never imply a Ghost partnership. */}
              <p className="text-xs leading-relaxed text-ash-dim">{site.trademarkNotice}</p>
              {commerce.isAffiliate && (
                <p className="text-xs leading-relaxed text-ash-dim">
                  Some links on this site are affiliate links. If you buy through
                  them we may earn a commission at no extra cost to you. It never
                  changes where a flavor lands in our rankings.
                </p>
              )}
              <p className="text-xs leading-relaxed text-ash-dim">
                Energy drinks are not suitable for children, or for people who are
                pregnant, breastfeeding, or sensitive to caffeine. Nutrition
                figures are as printed on the manufacturer&rsquo;s packaging —
                always read the can.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 lg:items-end">
              <div className="flex gap-5">
                <a
                  href={site.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-slide text-sm"
                >
                  TikTok
                </a>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-slide text-sm"
                >
                  Instagram
                </a>
                <a href={`mailto:${site.email}`} className="link-slide text-sm">
                  Email
                </a>
              </div>
              <p className="type-mono text-xs text-ash-dim">
                &copy; {new Date().getFullYear()} {site.legalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
