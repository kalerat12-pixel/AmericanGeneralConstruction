import { FlaskConical, ShieldCheck, Truck } from "lucide-react";

const ITEMS = [
  { icon: FlaskConical, text: "Every lot third-party HPLC tested — COA in every box" },
  { icon: Truck, text: "Free cold-chain shipping on orders over $250" },
  { icon: ShieldCheck, text: "Research use only — not for human consumption" },
  { icon: FlaskConical, text: "Purity floor: 99.5% or the lot never ships" },
];

/**
 * Infinite marquee. Rendered twice with aria-hidden on the clone so screen
 * readers get the message exactly once.
 */
export default function AnnouncementBar() {
  return (
    <div className="relative z-50 overflow-hidden border-b border-line bg-surface-sunken">
      <div className="mask-edges flex">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 animate-marquee items-center gap-10 py-2 pr-10"
          >
            {ITEMS.map(({ icon: Icon, text }, i) => (
              <span
                key={i}
                className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] tracking-[0.18em] text-body uppercase"
              >
                <Icon className="size-3 text-brand" strokeWidth={2} />
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
