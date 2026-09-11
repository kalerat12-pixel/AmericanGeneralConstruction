import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; simulated?: string }>;
}) {
  const { ref, simulated } = await searchParams;

  return (
    <div className="shell pb-24 pt-20 lg:pt-28">
      <div className="max-w-2xl">
        <Eyebrow>Done</Eyebrow>
        <h1 className="type-display mt-5">
          You&rsquo;re
          <br />
          sorted.
        </h1>

        {ref && (
          <p className="type-mono mt-8 border border-line-strong px-5 py-4 text-lg">
            <span className="text-ash-dim">Order </span>
            {ref}
          </p>
        )}

        <p className="type-lead mt-7">
          A receipt is on its way to your inbox. If it hasn&rsquo;t landed in ten
          minutes, check your spam folder and then{" "}
          <Link href="/contact" className="link-slide text-bone">
            tell us
          </Link>{" "}
          — we&rsquo;ll sort it.
        </p>

        {simulated === "1" && (
          <div className="mt-8 border border-ember/40 bg-ember/[0.06] p-6">
            <h2 className="type-eyebrow text-ember">Simulated checkout</h2>
            <p className="mt-3 text-sm leading-relaxed text-bone">
              No Stripe keys are configured, so this order was recorded without
              taking payment. Add <code className="type-mono">STRIPE_SECRET_KEY</code>{" "}
              to <code className="type-mono">.env.local</code> to run a real test-mode
              checkout — see the README.
            </p>
          </div>
        )}

        <div className="mt-12 border-t border-line pt-10">
          <h2 className="type-eyebrow">What happens next</h2>
          <ol className="mt-6 space-y-5">
            {[
              "We pack your order the same day if it's in before 2pm.",
              "Tracking lands by email as soon as it leaves us — usually next morning.",
              "Most orders arrive in 2–4 working days.",
            ].map((step, i) => (
              <li key={step} className="flex gap-5">
                <span className="type-mono shrink-0 text-sm text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px] leading-relaxed text-ash">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/account" className="btn btn-primary">
            View your orders
          </Link>
          <a href={site.tiktok} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Follow {site.tiktokHandle}
          </a>
        </div>
      </div>
    </div>
  );
}
