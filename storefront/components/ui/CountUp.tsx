"use client";

import { useEffect, useRef, useState } from "react";
import { compactNumber } from "@/lib/utils";

interface Props {
  value: number;
  /** "compact" -> 1.2M · "plain" -> 1,240,000 */
  format?: "compact" | "plain";
  suffix?: string;
  durationMs?: number;
  className?: string;
}

/** Odometer-style counter that only runs once the element is on screen. */
export default function CountUp({
  value,
  format = "compact",
  suffix = "",
  durationMs = 1400,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          // easeOutExpo — fast then settles, reads as "live data"
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setDisplay(value * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  const rounded = Math.round(display);

  return (
    <span ref={ref} className={className}>
      {format === "compact"
        ? compactNumber(rounded)
        : rounded.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
