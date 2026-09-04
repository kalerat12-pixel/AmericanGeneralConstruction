import { ArrowRight, FileCheck2, Star } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import VialRender from "@/components/ui/VialRender";
import { PRODUCTS } from "@/lib/products";

const STATS = [
  { value: 41000, label: "Vials shipped", suffix: "+", format: "compact" as const },
  { value: 100, label: "Lots with published COA", suffix: "%", format: "plain" as const },
];

export default function Hero() {
  const flagship = PRODUCTS[0];

  return (
    <section id="top" className="relative border-b border-line">
      <div className="shell relative pt-12 pb-14 md:pt-16 md:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Copy column */}
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand-line bg-brand-tint py-1.5 pr-4 pl-1.5">
                <span className="rounded-full bg-brand px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.14em] text-white uppercase">
                  Lot 2411
                </span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-brand uppercase">
                  99.87% HPLC verified
                </span>
              </div>
            </Reveal>

            <Reveal delay={70}>
              <h1 className="text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.6rem]">
                The future of{" "}
                <span className="text-brand">physical optimization</span> starts
                with the certificate.
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-muted">
                Research-grade peptides synthesized to a purity floor of 99.5%,
                third-party assayed by RP-HPLC and mass spectrometry, and shipped
                cold with the certificate of analysis in the box. No proprietary
                blends. No unverifiable claims. Just the data.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <MagneticButton href="#collection" className="w-full sm:w-auto">
                  Shop the collection
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2.4}
                  />
                </MagneticButton>
                <MagneticButton
                  href="#standards"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <FileCheck2 className="size-4" strokeWidth={2} />
                  View lab results
                </MagneticButton>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
                <div className="flex -space-x-2">
                  {["#0f766e", "#00703a", "#4c5a8a", "#8a5a2b"].map((c) => (
                    <span
                      key={c}
                      className="size-7 rounded-full border-2 border-surface"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-brand text-brand" />
                    ))}
                    <span className="ml-1 font-mono text-[10px] text-ink">4.9</span>
                  </div>
                  <p className="text-[0.75rem] text-subtle">
                    4,449 verified reviews from the L4G community
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Product panel */}
          <Reveal delay={160}>
            <figure className="panel relative overflow-hidden rounded-2xl">
              <div className="relative border-b border-line bg-surface-tint px-6 pt-5 pb-2">
                <div className="pointer-events-none absolute inset-0 hairline-grid" aria-hidden />

                <figcaption className="relative flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.18em] text-subtle uppercase">
                      Flagship
                    </p>
                    <p className="font-display text-lg font-bold text-ink">
                      {flagship.name}
                    </p>
                  </div>
                  <span className="rounded-full border border-brand-line bg-brand-tint px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-brand uppercase">
                    In stock
                  </span>
                </figcaption>

                <VialRender
                  name={flagship.name}
                  size={flagship.size}
                  lot={flagship.lot}
                  purity={flagship.purity}
                  accent={flagship.accent}
                  className="mx-auto max-w-[14rem]"
                />
              </div>

              <dl className="grid grid-cols-3 divide-x divide-line">
                <div className="px-3 py-4 text-center">
                  <dt className="sr-only">Average lot purity</dt>
                  <dd className="font-display text-xl font-bold text-ink tabular-nums">
                    99.87%
                  </dd>
                  <p className="mt-1 text-[0.66rem] leading-tight text-subtle">
                    Avg. lot purity
                  </p>
                </div>
                {STATS.map((s) => (
                  <div key={s.label} className="px-3 py-4 text-center">
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-xl font-bold text-ink tabular-nums">
                      <CountUp value={s.value} format={s.format} suffix={s.suffix} />
                    </dd>
                    <p className="mt-1 text-[0.66rem] leading-tight text-subtle">
                      {s.label}
                    </p>
                  </div>
                ))}
              </dl>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
