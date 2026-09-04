import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  FileCheck2,
  Lock,
  Package,
  Scale,
  Snowflake,
  Undo2,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const PILLARS = [
  {
    icon: FileCheck2,
    title: "Third-Party Assay On Every Lot",
    body: "Independent RP-HPLC and LC-MS analysis on every production batch before release. Purity, identity, water content, residual solvents, and endotoxin — the full panel, not a summary line.",
    stat: "99.5% purity floor",
  },
  {
    icon: BadgeCheck,
    title: "Scannable Certificates of Analysis",
    body: "Each vial carries a lot code that resolves to its own COA. Scan the box, read the chromatogram, compare it to the reference standard. No login, no request form.",
    stat: "100% of lots published",
  },
  {
    icon: Snowflake,
    title: "Validated Cold-Chain Fulfilment",
    body: "Insulated mailers, phase-change gel packs, and a temperature indicator card in every parcel. Lyophilized product is stable in transit; the indicator proves it stayed that way.",
    stat: "48h transit window",
  },
  {
    icon: Package,
    title: "Pharmaceutical-Grade Presentation",
    body: "USP Type I borosilicate vials, nitrogen headspace, butyl rubber stoppers, and 20 mm aluminium flip-off crimp seals. Tamper evidence you can see before you open the box.",
    stat: "USP Type I glass",
  },
];

const CHECKOUT_BADGES = [
  { icon: Lock, label: "256-bit TLS Encryption" },
  { icon: CreditCard, label: "PCI-DSS Level 1 Processor" },
  { icon: Undo2, label: "30-Day Lot Guarantee" },
  { icon: Scale, label: "21+ Age Verified" },
];

const FAQS = [
  {
    q: "What does “research use only” actually mean for my order?",
    a: "It means these compounds are sold as laboratory reagents for in-vitro and preclinical research by qualified purchasers. They are not drugs, supplements, cosmetics, or food, they are not sterile injectables, and they are not sold for human or veterinary use. Placing an order confirms you are purchasing in that capacity and are responsible for lawful handling in your jurisdiction.",
  },
  {
    q: "How do I verify the certificate of analysis for my lot?",
    a: "The lot code is printed on the vial label and on the outer carton — for example L4G-R-2411-A. Enter it in the lot lookup and you will get the complete analytical package for that specific batch, including the raw chromatogram and the mass-spec identity confirmation, not a generic product-level document.",
  },
  {
    q: "What happens if a lot arrives outside of temperature spec?",
    a: "Every parcel ships with a temperature indicator card. If the indicator has been triggered, photograph it and contact support within 72 hours of delivery. We replace the affected vials at no cost and pull the shipping lane for review. That is the entire process — no restocking fee, no diagnostic argument.",
  },
  {
    q: "Do you ship internationally?",
    a: "We ship within the United States and to a limited set of international destinations where these compounds may lawfully be imported as research reagents. Import compliance is the purchaser's responsibility, and we will not falsify customs documentation for any order under any circumstances.",
  },
  {
    q: "Why is your purity higher than the number on a competitor's label?",
    a: "Often it is not — the difference is what the number describes. We report area-percent purity by RP-HPLC at 214 nm against a certified reference standard, and we publish the chromatogram so the integration is auditable. A purity claim without a visible chromatogram and a stated method is a marketing figure, not an analytical one.",
  },
];

export default function TrustCompliance() {
  return (
    <section id="standards" className="relative border-t border-steel bg-obsidian-2 py-16 md:py-24">
      <div className="shell">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <p className="eyebrow mb-3">Standards & Compliance</p>
          <h2 className="text-[2rem] leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-[2.75rem]">
            Trust is a document, not an adjective.
          </h2>
          <p className="mt-4 text-[0.92rem] leading-relaxed text-fog">
            Anyone can print “premium” on a vial. Here is the paperwork that
            makes the word mean something — and the disclaimers that keep this
            business honest.
          </p>
        </Reveal>

        {/* Pillars */}
        <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="border-gradient-acid group flex h-full flex-col rounded-2xl border border-steel bg-carbon/50 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-transparent">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-acid/30 bg-acid/[0.07] text-acid transition-colors duration-500 group-hover:bg-acid/15">
                    <p.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <span className="rounded-full border border-steel bg-obsidian px-3 py-1 font-mono text-[9px] tracking-[0.14em] text-acid uppercase">
                    {p.stat}
                  </span>
                </div>
                <h3 className="mb-2 text-[1.05rem] font-bold tracking-[-0.02em]">
                  {p.title}
                </h3>
                <p className="text-[0.85rem] leading-relaxed text-fog">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Checkout badges */}
        <Reveal delay={100}>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-steel bg-carbon/40 p-5 backdrop-blur-md md:grid-cols-4">
            {CHECKOUT_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-steel bg-obsidian text-acid">
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
                <span className="text-[0.75rem] leading-tight font-medium text-mist">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Disclaimer block */}
        <Reveal delay={140}>
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-amber-warn/25 bg-amber-warn/[0.04] p-6 sm:flex-row">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-warn/30 bg-amber-warn/10 text-amber-warn">
              <AlertTriangle className="size-5" strokeWidth={1.9} />
            </span>
            <div>
              <h3 className="mb-2 text-[1rem] font-bold tracking-[-0.02em] text-chalk">
                Medical & Research Disclaimer
              </h3>
              <p className="text-[0.82rem] leading-relaxed text-fog">
                Products sold by Lifting4Gains Research are supplied strictly for
                laboratory research use. They are not intended for human or
                veterinary consumption, and are not sterile pharmaceutical
                preparations. None of the statements on this site have been
                evaluated by the U.S. Food and Drug Administration, and nothing
                here is intended to diagnose, treat, cure, or prevent any
                disease. Research descriptions reference published literature
                about a compound class — they are not claims about outcomes in
                humans. Consult a licensed physician before making any decision
                about your health. Purchasers must be 21 or older and are solely
                responsible for compliance with applicable law.
              </p>
            </div>
          </div>
        </Reveal>

        {/* FAQ — native <details>, zero JS, fully indexable */}
        <div id="faq" className="mt-16 scroll-mt-24">
          <Reveal className="mb-8 text-center">
            <p className="eyebrow mb-3">Straight Answers</p>
            <h3 className="text-[1.6rem] leading-tight font-extrabold tracking-[-0.035em] sm:text-[2rem]">
              The questions worth asking a peptide vendor.
            </h3>
          </Reveal>

          <div className="mx-auto max-w-3xl divide-y divide-steel overflow-hidden rounded-2xl border border-steel bg-carbon/40 backdrop-blur-md">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[0.92rem] font-semibold text-chalk transition-colors duration-300 hover:text-acid">
                  {f.q}
                  <ChevronDown
                    className="size-4 shrink-0 text-smoke transition-transform duration-300 group-open:rotate-180 group-open:text-acid"
                    strokeWidth={2.2}
                  />
                </summary>
                <p className="pb-5 text-[0.85rem] leading-relaxed text-fog">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
