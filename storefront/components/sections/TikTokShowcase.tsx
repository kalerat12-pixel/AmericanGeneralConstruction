import { Heart, Play, Quote, TrendingUp, Users } from "lucide-react";
import { TikTokIcon } from "@/components/ui/BrandIcons";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface Clip {
  id: string;
  caption: string;
  views: number;
  likes: number;
  duration: string;
  product: string;
  /** Tailwind grid span classes — drives the bento rhythm. */
  span: string;
  accent: "acid" | "cyber";
}

const CLIPS: Clip[] = [
  {
    id: "clip-hero",
    caption: "I sent 3 vials to an independent lab. Here's what came back.",
    views: 2_400_000,
    likes: 318_000,
    duration: "0:58",
    product: "BPC-157",
    span: "sm:col-span-2 sm:row-span-2",
    accent: "acid",
  },
  {
    id: "clip-2",
    caption: "Reading a COA in 60 seconds",
    views: 890_000,
    likes: 112_000,
    duration: "1:04",
    product: "Standards",
    span: "",
    accent: "cyber",
  },
  {
    id: "clip-3",
    caption: "Why co-lyophilized blends matter",
    views: 640_000,
    likes: 74_500,
    duration: "0:42",
    product: "CJC-1295",
    span: "",
    accent: "acid",
  },
  {
    id: "clip-4",
    caption: "Unboxing the cold-chain kit",
    views: 1_100_000,
    likes: 158_000,
    duration: "0:31",
    product: "Fulfilment",
    span: "sm:col-span-2",
    accent: "cyber",
  },
];

/* Spans are deliberate: 4 clips (4+1+1+2) + 2 quotes (1+3) = 12 cells, which
   fills the 3-column bento exactly with no orphan gap on any breakpoint. */
const TESTIMONIALS = [
  {
    quote:
      "Cold pack was still frozen on day three. Everything about the packaging says they take handling as seriously as the synthesis.",
    name: "Priya N.",
    role: "Verified buyer · Lot 2411-A",
    span: "",
  },
  {
    quote:
      "The first vendor I've found that publishes the full assay instead of a screenshot of one. I verified the lot number before I opened the box — the chromatogram matched the reference standard line for line.",
    name: "Marcus D.",
    role: "Verified buyer · Lot 2410-B",
    span: "sm:col-span-3",
  },
];

export default function TikTokShowcase() {
  return (
    <section id="trending" className="grain relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[26rem] w-[26rem] aurora-cyber opacity-60" aria-hidden />

      <div className="shell relative">
        {/* Header */}
        <Reveal className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-2">
              <TrendingUp className="size-3.5" strokeWidth={2.4} />
              Trending on @Lifting4Gains
            </p>
            <h2 className="max-w-xl text-[2rem] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[2.75rem]">
              The audience audits us in public.
            </h2>
            <p className="mt-4 max-w-lg text-[0.92rem] leading-relaxed text-fog">
              Every lot gets torn down on camera — third-party assays, cold-chain
              tests, and side-by-side comparisons, uncut. If a batch missed spec,
              you would have watched it happen.
            </p>
          </div>

          <a
            href="https://www.tiktok.com/@lifting4gains"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-steel bg-carbon/70 py-2 pr-5 pl-2 backdrop-blur-md transition-all duration-300 hover:border-acid/50 md:self-auto"
          >
            <span className="grid size-9 place-items-center rounded-full bg-acid text-[#04140a] transition-transform duration-300 group-hover:scale-105">
              <TikTokIcon className="size-4" />
            </span>
            <span className="text-left">
              <span className="block text-[0.85rem] font-semibold text-chalk">
                @Lifting4Gains
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-smoke uppercase">
                <Users className="size-3" strokeWidth={2} />
                <CountUp value={1_240_000} /> followers
              </span>
            </span>
          </a>
        </Reveal>

        {/* Bento grid */}
        <div className="grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          {CLIPS.map((clip, i) => (
            <Reveal
              key={clip.id}
              delay={i * 70}
              className={cn("group relative", clip.span)}
            >
              <article
                className={cn(
                  "border-gradient-acid relative flex h-full min-h-[16rem] flex-col justify-between overflow-hidden rounded-2xl border border-steel p-4 transition-all duration-500 sm:min-h-full",
                  "bg-gradient-to-br from-graphite via-carbon to-obsidian",
                  "hover:-translate-y-1 hover:border-transparent",
                )}
                /* Replace this block's background with a muted, looping
                   <video poster="…"> to drop real TikTok cuts straight in. */
                data-render-slot="tiktok-clip"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                  style={{
                    background:
                      clip.accent === "acid"
                        ? "radial-gradient(70% 50% at 50% 100%, rgba(0,255,102,0.18), transparent 70%)"
                        : "radial-gradient(70% 50% at 50% 100%, rgba(0,229,255,0.16), transparent 70%)",
                  }}
                  aria-hidden
                />

                {/* poster treatment — reads as a video still, not an empty box */}
                <span
                  className="pointer-events-none absolute -right-3 -bottom-6 font-display text-[7rem] leading-none font-extrabold text-chalk/[0.035] select-none"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.04)_50%,transparent_65%)]"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-obsidian/90 to-transparent"
                  aria-hidden
                />

                <div className="relative flex items-start justify-between">
                  <span className="rounded-md border border-steel bg-obsidian/80 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-fog uppercase backdrop-blur-sm">
                    {clip.product}
                  </span>
                  <span className="rounded-md bg-obsidian/80 px-2 py-1 font-mono text-[9px] text-fog backdrop-blur-sm">
                    {clip.duration}
                  </span>
                </div>

                {/* Play affordance */}
                <div className="relative flex flex-1 items-center justify-center">
                  <span
                    className={cn(
                      "grid size-14 place-items-center rounded-full border backdrop-blur-md transition-all duration-500 group-hover:scale-110",
                      clip.accent === "acid"
                        ? "border-acid/40 bg-acid/10 text-acid group-hover:bg-acid group-hover:text-[#04140a]"
                        : "border-cyber/40 bg-cyber/10 text-cyber group-hover:bg-cyber group-hover:text-[#04140a]",
                    )}
                  >
                    <Play className="size-5 translate-x-0.5 fill-current" strokeWidth={1.5} />
                  </span>
                  <span className="absolute size-14 animate-pulse-glow rounded-full bg-acid/20 blur-xl" aria-hidden />
                </div>

                <div className="relative">
                  <p className="mb-2.5 text-[0.88rem] leading-snug font-medium text-chalk">
                    {clip.caption}
                  </p>
                  <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.1em] text-smoke uppercase">
                    <span className="flex items-center gap-1.5">
                      <Play className="size-3 fill-current" strokeWidth={0} />
                      <CountUp value={clip.views} /> views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Heart className="size-3" strokeWidth={2.2} />
                      <CountUp value={clip.likes} />
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          {/* Testimonial tiles complete the bento */}
          {TESTIMONIALS.map((t, i) => (
            <Reveal
              key={t.name}
              delay={280 + i * 70}
              className={t.span}
            >
              <figure className="flex h-full flex-col justify-between rounded-2xl border border-steel bg-carbon/50 p-5 backdrop-blur-md transition-colors duration-500 hover:border-ash">
                <Quote className="mb-3 size-5 text-acid/60" strokeWidth={2} />
                <blockquote className="max-w-2xl text-[0.88rem] leading-relaxed text-mist">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 border-t border-steel pt-3">
                  <span className="block text-[0.8rem] font-semibold text-chalk">
                    {t.name}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.14em] text-smoke uppercase">
                    {t.role}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
