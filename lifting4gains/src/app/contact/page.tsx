import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmailCapture } from "@/components/site/EmailCapture";
import { site, commerce } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get hold of a person at Lifting4Gains — orders, wholesale, or an argument about the rankings.",
  alternates: { canonical: "/contact" },
};

const ROUTES = [
  {
    title: "Orders and deliveries",
    body: "Where something is, a damaged can, a refund, a subscription you want changed.",
    action: site.email,
    href: `mailto:${site.email}`,
    note: "Same day, always within one working day.",
  },
  {
    title: "Gym and wholesale",
    body: `Case pricing, referral codes, standing orders. Minimum ${commerce.wholesaleMinimumCases} cases.`,
    action: site.wholesaleEmail,
    href: `mailto:${site.wholesaleEmail}`,
    note: "Or use the form on the gym partners page.",
  },
  {
    title: "Flavor takes and corrections",
    body: "Think we've got a ranking wrong? Tell us where and why — it's how the list moves.",
    action: `${site.tiktokHandle} on TikTok`,
    href: site.tiktok,
    note: "The comments are where most of this happens.",
    external: true,
  },
];

export default function ContactPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>Contact</Eyebrow>
        <h1 className="type-display mt-5">Talk to a person.</h1>
        <p className="type-lead mt-6">
          No ticket system, no bot, no &ldquo;your query is important to us&rdquo;.
          Pick the right inbox and someone who works here will answer it.
        </p>
      </header>

      <div className="mt-16 grid gap-px border-t border-line lg:mt-20 lg:grid-cols-3">
        {ROUTES.map((route) => (
          <section key={route.title} className="border-b border-line py-8 lg:pr-10">
            <h2 className="font-display text-xl font-extrabold uppercase leading-tight tracking-[-0.025em]">
              {route.title}
            </h2>
            <p className="mt-3.5 text-[15px] leading-relaxed text-ash">{route.body}</p>
            <a
              href={route.href}
              {...(route.external && { target: "_blank", rel: "noopener noreferrer" })}
              className="link-slide mt-5 inline-block text-sm text-bone"
            >
              {route.action}
            </a>
            <p className="mt-2.5 text-xs text-ash-dim">{route.note}</p>
          </section>
        ))}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="panel p-8">
          <h2 className="type-eyebrow">Looking up an order</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ash">
            Email us the reference from your receipt — it looks like{" "}
            <span className="type-mono text-bone">L4G-XXXXXXX</span> — and we&rsquo;ll
            pull it up. If you can&rsquo;t find the receipt, the email address you
            ordered with is enough.
          </p>
          <Link href="/account" className="btn btn-ghost mt-6">
            Orders on this device
          </Link>
        </div>

        <div className="panel p-8">
          <h2 className="type-eyebrow">Get the weekly</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ash">
            New flavor verdicts, restocks, and the occasional warning that something
            isn&rsquo;t worth your money.
          </p>
          <EmailCapture source="contact" className="mt-6" />
        </div>
      </div>
    </div>
  );
}
