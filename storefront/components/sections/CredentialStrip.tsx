import { Atom, FlaskConical, Microscope, ShieldCheck, Snowflake, Thermometer } from "lucide-react";

const CREDENTIALS = [
  { icon: Microscope, label: "RP-HPLC Assay" },
  { icon: Atom, label: "LC-MS Identity" },
  { icon: ShieldCheck, label: "Endotoxin < 0.25 EU/mg" },
  { icon: FlaskConical, label: "USP Type I Borosilicate" },
  { icon: Snowflake, label: "Cold-Chain Fulfilment" },
  { icon: Thermometer, label: "Temp-Logged Transit" },
];

/**
 * Credibility band. Held by hairlines rather than a fill, so it separates the
 * hero from the social proof without introducing another block of colour.
 */
export default function CredentialStrip() {
  return (
    <section
      className="border-y border-line bg-surface py-4"
      aria-label="Testing and handling standards"
    >
      <div className="mask-edges flex overflow-hidden">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 animate-marquee-slow items-center gap-8 pr-8 md:gap-14 md:pr-14"
          >
            {CREDENTIALS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2.5 whitespace-nowrap text-body"
              >
                <Icon className="size-4 text-brand" strokeWidth={1.7} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase md:text-[11px]">
                  {label}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
