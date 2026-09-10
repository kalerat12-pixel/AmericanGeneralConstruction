import { FlaskConical, FileCheck2, Snowflake } from 'lucide-react';
import { FadeUp } from '@/components/motion';

const props = [
  {
    icon: FlaskConical,
    title: 'Synthesised to spec',
    body: 'Solid-phase synthesis, preparative HPLC purification, and identity confirmed by mass spectrometry before a lot is released.',
  },
  {
    icon: FileCheck2,
    title: 'A certificate per lot',
    body: 'Every vial carries a lot number that resolves to an independent certificate of analysis you can read before you buy.',
  },
  {
    icon: Snowflake,
    title: 'Cold chain, kept',
    body: 'Lyophilised under vacuum, crimp-sealed, and shipped with insulation and gel packs so the material arrives as it left.',
  },
];

export function ValueProps() {
  return (
    <section aria-labelledby="value-props-heading" className="texture-marble relative bg-alabaster">
      <div className="container-content section">
        <h2 id="value-props-heading" className="sr-only">
          What every lot ships with
        </h2>
        <div className="grid gap-14 md:grid-cols-3 md:gap-10 lg:gap-16">
          {props.map(({ icon: Icon, title, body }, i) => (
            <FadeUp key={title} delay={i * 0.08} className="max-w-sm">
              <Icon
                className="h-7 w-7 text-champagne"
                strokeWidth={0.9}
                aria-hidden
              />
              <span aria-hidden className="mt-7 block h-px w-9 bg-champagne/45" />
              <h3 className="mt-7 font-display text-[1.625rem] font-light leading-snug text-charcoal">
                {title}
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-[1.85] text-charcoal/65">{body}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
