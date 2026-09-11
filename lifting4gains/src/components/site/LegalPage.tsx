import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

export interface LegalSection {
  heading: string;
  body: string[];
}

/**
 * Shared shell for the legal pages so they read as one document set rather than
 * three pages that drifted apart.
 */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
  footer,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  footer?: ReactNode;
}) {
  return (
    <div className="shell pb-24 pt-16 lg:pt-24">
      <header className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="type-display mt-5">{title}</h1>
        <p className="type-mono mt-6 text-sm text-ash-dim">
          Last updated{" "}
          <time dateTime={updated}>
            {new Date(updated).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </p>
        <p className="type-lead mt-6">{intro}</p>
      </header>

      <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[240px_1fr] lg:gap-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="type-eyebrow mb-4">On this page</h2>
          <ul className="space-y-2.5">
            {sections.map((section) => (
              <li key={section.heading}>
                <a
                  href={`#${slugify(section.heading)}`}
                  className="link-slide text-sm text-ash hover:text-bone"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl border-t border-line">
          {sections.map((section) => (
            <section
              key={section.heading}
              id={slugify(section.heading)}
              className="scroll-mt-24 border-b border-line py-9"
            >
              <h2 className="font-display text-xl font-extrabold uppercase leading-tight tracking-[-0.025em] lg:text-2xl">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((para, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-ash">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}

          {footer && <div className="pt-9">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
