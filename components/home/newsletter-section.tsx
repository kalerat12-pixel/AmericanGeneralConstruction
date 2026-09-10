import { Photo } from '@/components/photo';
import { FadeUp } from '@/components/motion';
import { NewsletterForm } from '@/components/newsletter-form';

export function NewsletterSection() {
  return (
    <section className="relative bg-bone/60">
      <div className="container-content section">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <FadeUp>
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-[5/4]">
              <Photo
                src="/images/calm-water.jpg"
                alt="Still, pale water catching a low warm light near the shore"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="eyebrow">The Dispatch</p>
            <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
            <h2 className="mt-7 max-w-md text-balance font-display text-[2.25rem] font-light leading-[1.1] tracking-[0.015em] text-charcoal md:text-display-sm">
              New certificates, as they are published.
            </h2>
            <p className="mt-6 max-w-prose text-[0.9375rem] leading-[1.85] text-charcoal/65">
              A short note when a lot is released, when something returns to stock, and nothing
              else. No promotions, no claims, no cadence for its own sake.
            </p>
            <NewsletterForm className="mt-10" />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
