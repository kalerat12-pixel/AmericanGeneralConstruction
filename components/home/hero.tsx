'use client';

import Link from 'next/link';
import { Photo } from '@/components/photo';
import { Parallax } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  // Always drive to the visible state — see the note in components/motion.tsx.
  const rise = (delay: number) =>
    reduced
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.2, ease: 'linear' as const },
        }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease: EASE, delay },
        };

  return (
    <section className="relative isolate">
      {/* Full-bleed coastal frame with a slow parallax drift. */}
      <Parallax className="h-[86svh] min-h-[560px] w-full lg:h-[92svh]" strength={12}>
        <Photo
          src="/images/hero-coast.jpg"
          alt="The Mediterranean at dusk, a low sun laying a path of light across still water"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </Parallax>

      {/* Dark overlay: deeper at the base so the type sits on quiet ground. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-midnight/35 via-midnight/28 to-midnight/80"
      />

      <div className="absolute inset-0 flex items-end">
        <div className="container-content pb-16 md:pb-24 lg:pb-28">
          <motion.p
            className="font-sans text-eyebrow uppercase tracking-eyebrow text-champagne"
            {...rise(0.1)}
          >
            Research Use Only — Not for Human Consumption
          </motion.p>

          <motion.span
            aria-hidden
            className="mt-5 block h-px w-14 bg-champagne/70"
            {...(reduced
              ? {
                  initial: { scaleX: 1, opacity: 0 },
                  animate: { scaleX: 1, opacity: 1 },
                  transition: { duration: 0.2, ease: 'linear' as const },
                }
              : {
                  initial: { scaleX: 0, opacity: 0 },
                  animate: { scaleX: 1, opacity: 1 },
                  transition: { duration: 0.9, ease: EASE, delay: 0.25 },
                })}
            style={{ transformOrigin: 'left' }}
          />

          <motion.h1
            className="mt-8 max-w-4xl text-balance font-display text-[2.75rem] font-light leading-[1.04] tracking-[0.02em] text-alabaster sm:text-display-md lg:text-display-lg"
            {...rise(0.2)}
          >
            Purity you can read, on paper, before you open the vial.
          </motion.h1>

          <motion.p
            className="mt-8 max-w-xl text-pretty text-[1rem] leading-[1.85] text-alabaster/75 md:text-[1.0625rem]"
            {...rise(0.32)}
          >
            Every lot arrives lyophilised, crimp-sealed and matched to an independent certificate
            of analysis. Nothing else, and nothing implied.
          </motion.p>

          <motion.div className="mt-11 flex flex-col gap-3 sm:flex-row" {...rise(0.42)}>
            <Button asChild size="lg" variant="outline-light" className="sm:min-w-[190px]">
              <Link href="/shop">View the catalogue</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-alabaster/70 hover-gold sm:min-w-[190px]">
              <Link href="/quality">How we test</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
