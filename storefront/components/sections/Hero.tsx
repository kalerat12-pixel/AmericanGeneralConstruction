import { ArrowRight, FileCheck2, Star } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import VialRender from "@/components/ui/VialRender";
import { PRODUCTS } from "@/lib/products";

const STATS = [
  { value: 99.87, label: "Avg. lot purity", suffix: "%", format: "plain" as const, decimals: true },
  { value: 41000, label: "Vials shipped", suffix: "+", format: "compact" as const },
  { value: 100, label: "Lots with public COA", suffix: "%", format: "plain" as const },
];

export default function Hero() {
  const flagship = PRODUCTS[0];

  return (
    <section id="top" className="grain relative overflow-hidden">
      {/* Ambient light rig */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-[-14rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 aurora-acid animate-aurora" />
        <div className="absolute top-[6rem] -right-40 h-[28rem] w-[28rem] aurora-cyber" />
        <div className="absolute inset-0 grid-lines opacity-[0.5] [mask-image:radial-gradient(70%_60%_at_50%_35%,#000,transparent)]" />
      </div>

      <div className="shell relative pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Copy column */}
          <div className="text-center lg:text-left">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-acid/30 bg-acid/[0.07] py-1.5 pr-4 pl-1.5 backdrop-blur-md">
                <span className="rounded-full bg-acid px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.14em] text-[#04140a] uppercase">
                  Lot 2411
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-acid uppercase">
                  99.87% HPLC verified
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-[2.6rem] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[4.4rem]">
                <span className="text-gradient block">The Future of</span>
                <span className="text-gradient-acid block">Physical</span>
                <span className="text-gradient block">Optimization.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-lg text-[0.98rem] leading-relaxed text-fog lg:mx-0 lg:text-[1.05rem]">
                Research-grade peptides synthesized to a purity floor of 99.5%,
                third-party assayed by mass spectrometry, and shipped cold with
                the certificate of analysis in the box. No proprietary blends.
                No unverifiable claims. Just the data.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <MagneticButton href="#collection" className="w-full sm:w-auto">
                  Shop The Collection
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
                </MagneticButton>
                <MagneticButton
                  href="#standards"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <FileCheck2 className="size-4" strokeWidth={2} />
                  View Lab Results
                </MagneticButton>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex -space-x-2">
                  {["#00ff66", "#00e5ff", "#7c5cff", "#ff9f43"].map((c) => (
                    <span
                      key={c}
                      className="size-7 rounded-full border-2 border-obsidian"
                      style={{ background: `linear-gradient(140deg, ${c}, #101013)` }}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-acid text-acid" />
                    ))}
                    <span className="ml-1 font-mono text-[10px] text-chalk">4.9</span>
                  </div>
                  <p className="text-[0.72rem] text-smoke">
                    4,449 verified reviews from the L4G community
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Render column */}
          <Reveal delay={200} className="relative">
            <div className="border-gradient-acid relative rounded-[1.75rem] border border-steel bg-gradient-to-b from-carbon/80 to-obsidian/40 p-4 backdrop-blur-md sm:p-6">
              {/* scanline pass — reads as "lab imaging" */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden>
                <div className="h-16 w-full animate-scanline bg-gradient-to-b from-transparent via-acid/[0.07] to-transparent" />
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-smoke uppercase">
                    Flagship
                  </p>
                  <p className="font-display text-lg font-bold text-chalk">
                    {flagship.name}
                  </p>
                </div>
                <span className="rounded-full border border-acid/40 bg-acid/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-acid uppercase">
                  In Stock
                </span>
              </div>

              <VialRender
                name={flagship.name}
                size={flagship.size}
                lot={flagship.lot}
                purity={flagship.purity}
                accent={flagship.accent}
                className="mx-auto my-2 max-w-[15rem]"
              />

              <dl className="grid grid-cols-3 divide-x divide-steel border-t border-steel pt-4">
                {STATS.map((s) => (
                  <div key={s.label} className="px-2 text-center first:pl-0 last:pr-0">
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-lg font-bold text-chalk sm:text-xl">
                      {s.decimals ? (
                        <>99.87%</>
                      ) : (
                        <CountUp value={s.value} format={s.format} suffix={s.suffix} />
                      )}
                    </dd>
                    <p className="mt-1 text-[0.65rem] leading-tight text-smoke">
                      {s.label}
                    </p>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
