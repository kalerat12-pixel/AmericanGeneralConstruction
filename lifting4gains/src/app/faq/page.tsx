import type { Metadata } from "next";
import Link from "next/link";
import { faqGroups } from "@/lib/data/faq";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Caffeine content, stacking with pre-workout, shipping, subscriptions and how this shop actually works.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="shell pb-24 pt-16 lg:pt-24">
        <header className="max-w-2xl">
          <Eyebrow>Questions</Eyebrow>
          <h1 className="type-display mt-5">Straight answers.</h1>
          <p className="type-lead mt-6">
            The things people actually ask us, answered without marketing language.
            Can&rsquo;t find it?{" "}
            <Link href="/contact" className="link-slide text-bone">
              Ask us directly
            </Link>
            .
          </p>
        </header>

        <div className="mt-16 space-y-16 lg:mt-24">
          {faqGroups.map((group) => (
            <section key={group.title} aria-labelledby={`faq-${group.title.replace(/\s+/g, "-")}`}>
              <h2
                id={`faq-${group.title.replace(/\s+/g, "-")}`}
                className="type-section max-w-xl"
              >
                {group.title}
              </h2>

              <dl className="mt-8 border-t border-line">
                {group.items.map((item) => (
                  <div key={item.q} className="border-b border-line py-7">
                    <dt className="font-display text-lg font-extrabold uppercase leading-tight tracking-[-0.025em] lg:text-xl">
                      {item.q}
                    </dt>
                    <dd className="mt-3.5 max-w-3xl text-[15px] leading-relaxed text-ash">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="panel mt-20 p-8 lg:p-12">
          <h2 className="type-section max-w-lg">Still stuck?</h2>
          <p className="type-lead mt-5 max-w-lg">
            Email us and a person will answer — usually same day, always within one
            working day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${site.email}`} className="btn btn-primary">
              {site.email}
            </a>
            <Link href="/contact" className="btn btn-ghost">
              Contact form
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
