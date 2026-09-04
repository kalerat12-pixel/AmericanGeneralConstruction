import { BadgeCheck, FileCheck2 } from "lucide-react";
import { LogoLockup } from "@/components/brand/Logo";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Certificate of Analysis, laid out as the document it is meant to be —
 * identity block, full test panel, release signature. Every figure comes from
 * the product's own lot record in lib/products.ts.
 */
export default function CertificateOfAnalysis({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const accentText = product.accent === "acid" ? "text-acid" : "text-cyber";

  const identity: Array<[string, string]> = [
    ["Product", product.name],
    ["Synonyms", product.synonyms],
    ["CAS number", product.chem.cas],
    ["Molecular formula", product.chem.formula],
    ["Molecular weight", product.chem.molecularWeight],
    ["Lot number", product.lot],
    ["Quantity per vial", product.size],
    ["Date of manufacture", product.manufactured],
    ["Retest date", product.retest],
    ["Storage", product.chem.storageLyophilized],
  ];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-steel bg-carbon/50 backdrop-blur-md",
        className,
      )}
      aria-labelledby={`coa-${product.slug}`}
    >
      {/* Document header */}
      <header className="flex flex-col gap-4 border-b border-steel px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <LogoLockup descriptor="Quality Control" />
        <div className="sm:text-right">
          <h2
            id={`coa-${product.slug}`}
            className="font-display text-[1.05rem] leading-tight font-bold text-chalk"
          >
            Certificate of Analysis
          </h2>
          <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-smoke uppercase">
            Doc {product.lot}-COA · Rev 01
          </p>
        </div>
      </header>

      {/* Identity block */}
      <dl className="grid gap-x-8 gap-y-3 border-b border-steel px-5 py-5 sm:grid-cols-2 md:px-7">
        {identity.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 border-b border-steel/50 pb-2 last:border-0 sm:border-0 sm:pb-0">
            <dt className="font-mono text-[9px] tracking-[0.16em] text-smoke uppercase">
              {k}
            </dt>
            <dd className="text-[0.82rem] leading-snug text-mist">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Test panel */}
      <div className="px-5 pt-5 md:px-7">
        <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-smoke uppercase">
          <FileCheck2 className={cn("size-3.5", accentText)} strokeWidth={2.2} />
          Analytical results
        </h3>
      </div>
      <div className="overflow-x-auto px-5 pb-5 md:px-7">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-steel">
              {["Parameter", "Method", "Specification", "Result"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="pb-2 font-mono text-[9px] tracking-[0.16em] font-medium text-smoke uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-steel/60">
            {product.coa.map((row) => (
              <tr key={row.parameter} className="align-top">
                <td className="py-2.5 pr-4 text-[0.8rem] font-medium text-chalk">
                  {row.parameter}
                </td>
                <td className="py-2.5 pr-4 text-[0.76rem] text-fog">{row.method}</td>
                <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-fog tabular-nums">
                  {row.specification}
                </td>
                <td className={cn("py-2.5 font-mono text-[0.74rem] font-medium tabular-nums", accentText)}>
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Release block */}
      <footer className="flex flex-col gap-4 border-t border-steel bg-obsidian-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border border-steel bg-obsidian", accentText)}>
            <BadgeCheck className="size-4" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[0.8rem] font-semibold text-chalk">
              Released — conforms to specification
            </p>
            <p className="font-mono text-[9px] tracking-[0.14em] text-smoke uppercase">
              QC release · {product.manufactured}
            </p>
          </div>
        </div>
        <p className="max-w-sm text-[0.68rem] leading-relaxed text-smoke">
          Results relate only to the lot tested. This document does not
          constitute a certificate of sterility or of fitness for human use.
          Supplied for laboratory research only.
        </p>
      </footer>
    </section>
  );
}
