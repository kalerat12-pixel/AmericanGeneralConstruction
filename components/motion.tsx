'use client';

import * as React from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionProps,
} from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;

/**
 * These components never swap between a motion element and a plain one.
 * `useReducedMotion()` resolves to null on the first render and to a boolean
 * after, and swapping element types across that flip leaves React reusing the
 * same DOM node while framer's imperative `style="opacity:0"` stays behind —
 * the content is then invisible forever. Instead the element type is stable
 * and only the animation props change, so whichever branch wins always drives
 * the element to its visible state.
 */

export function FadeUp({
  children,
  className,
  delay = 0,
  distance = 18,
  as = 'div',
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'figure';
} & MotionProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  // Reduced motion: no travel, no scroll trigger — just present.
  const anim: MotionProps = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.2, ease: 'linear' },
      }
    : {
        initial: { opacity: 0, y: distance },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 0.6, ease: EASE, delay },
      };

  return (
    <Comp className={className} {...anim} {...rest}>
      {children}
    </Comp>
  );
}

/** Staggers FadeUp-style children without each one needing its own delay. */
export function Stagger({
  children,
  className,
  step = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(reduced ? { animate: 'shown' } : { whileInView: 'shown', viewport: VIEWPORT })}
      variants={{ shown: { transition: { staggerChildren: reduced ? 0 : step } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={
        reduced
          ? {
              hidden: { opacity: 0 },
              shown: { opacity: 1, transition: { duration: 0.2, ease: 'linear' } },
            }
          : {
              hidden: { opacity: 0, y: 18 },
              shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Gentle vertical parallax for hero imagery. `strength` is the total travel as
 * a percentage of the element's height across the scroll range. Under reduced
 * motion the style is set to explicit static values rather than removed, so
 * framer keeps ownership of the property instead of leaving a stale transform.
 */
export function Parallax({
  children,
  className,
  strength = 12,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${strength}%`]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduced ? { y: '0%', scale: 1 } : { y, scale: 1 + strength / 100 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
