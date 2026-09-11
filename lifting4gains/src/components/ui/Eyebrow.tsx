import type { ReactNode } from "react";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`type-eyebrow ${className}`}>
      <span aria-hidden="true" className="mr-3 inline-block h-px w-8 align-middle bg-ember" />
      {children}
    </p>
  );
}
