import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Photo } from '@/components/photo';
import { FadeUp } from '@/components/motion';
import { SectionHeading } from '@/components/section';
import { Button } from '@/components/ui/button';

const figures = [
  { value: '100%', label: 'Lots tested by an outside laboratory' },
  { value: '≥ 98%', label: 'Minimum purity released for sale' },
  { value: '24 mo', label: 'Certificates kept in the public archive' },
];

export function TrustSection() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-midnight">
      <Photo
        src="/images/marble-dark.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-40"
      />

      <div className="container-content section">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <SectionHeading
            eyebrow="Third-Party Tested"
            tone="dark"
            title="We do not grade our own work."
            lede="Every lot is sampled and sent to an independent ISO/IEC 17025 accredited laboratory. Purity is determined by reversed-phase HPLC at 214 nm and identity confirmed by mass spectrometry. If a result comes back under specification, the lot is destroyed — it is not blended, re-tested until it passes, or quietly sold as a lower grade."
          />

          <FadeUp delay={0.1} className="lg:pt-4">
            <dl className="space-y-10">
              {figures.map((f) => (
                <div key={f.label} className="border-t border-champagne/25 pt-7">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <p className="font-display text-[3rem] font-light leading-none tracking-[0.01em] text-alabaster lining-nums md:text-[3.75rem]">
                      {f.value}
                    </p>
                    <p className="mt-4 max-w-xs font-sans text-eyebrow uppercase tracking-eyebrow text-alabaster/65">
                      {f.label}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>

            <Button asChild variant="outline-light" className="mt-12">
              <Link href="/quality#archive">
                Read the certificate archive
                <ArrowRight className="h-4 w-4" strokeWidth={1.25} aria-hidden />
              </Link>
            </Button>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
