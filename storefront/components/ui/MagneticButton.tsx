"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "acid" | "ghost" | "outline";

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  /** Pull strength in px. Disabled entirely on touch devices. */
  strength?: number;
  type?: "button" | "submit";
  "aria-label"?: string;
}

const VARIANTS: Record<Variant, string> = {
  acid:
    "bg-acid text-[#04140a] hover:bg-[#3dff8a] shadow-[0_0_0_1px_rgba(0,255,102,0.5),0_10px_40px_-12px_rgba(0,255,102,0.65)] hover:shadow-[0_0_0_1px_rgba(0,255,102,0.8),0_14px_50px_-10px_rgba(0,255,102,0.9)]",
  outline:
    "text-chalk border border-ash bg-carbon/60 backdrop-blur-md hover:border-acid/60 hover:text-acid hover:bg-acid/[0.06]",
  ghost: "text-fog hover:text-chalk",
};

/**
 * Magnetic CTA: the button leans toward the cursor, then snaps back.
 * Pointer-fine only — on phones it degrades to a clean press state, which is
 * what ~95% of our traffic will actually see.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "acid",
  className,
  strength = 10,
  type = "button",
  ...rest
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength * 2;
    setOffset({ x, y });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 rounded-full",
    "px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.02em]",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-300",
    "will-change-transform active:scale-[0.97] select-none",
    VARIANTS[variant],
    className,
  );

  const style = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  } as React.CSSProperties;

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        style={style}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      className={classes}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
    </button>
  );
}
