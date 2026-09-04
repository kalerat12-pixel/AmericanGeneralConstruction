import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FlaskConical, ShieldCheck, Star } from "lucide-react";
import VialRender from "@/components/ui/VialRender";
import { FlatVialLabel } from "@/components/brand/VialLabel";
import { PeptideBondDiagram, ResidueChain } from "@/components/product/PeptideBond";
import CertificateOfAnalysis from "@/components/product/CertificateOfAnalysis";
import AddToCartButton from "@/components/product/AddToCartButton";
import { PRODUCTS, getProduct, relatedProducts } from "@/lib/products";
import { cn, formatUSD } from "@/lib/utils";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Compound not found" };
  return {
    title: `${product.name} — ${product.chem.molecularWeight}`,
    description: `${product.name} (${product.synonyms}). ${product.purity} by RP-HPLC, lot ${product.lot}, certificate of analysis published. Research use only.`,
    openGraph: {
      title: `${product.name} · Lifting4Gains Research`,
      description: product.tagline,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const isGreen = product.accent === "green";
  const accentText = isGreen ? "text-brand" : "text-teal";
  const accentBorder = isGreen ? "border-brand/40" : "border-teal/40";
  const accentBg = isGreen ? "bg-brand/10" : "bg-teal/10";
  const related = relatedProducts(product);

  const chemRows: Array<[string, string]> = [
    ["Molecular formula", product.chem.formula],
    ["Molecular weight", product.chem.molecularWeight],
    ["CAS number", product.chem.cas],
    ["Residue count", `${product.residues.length}`],
    ["Appearance", product.chem.appearance],
    ["Solubility", product.chem.solubility],
    ["Storage (lyophilized)", product.chem.storageLyophilized],
    ["Storage (reconstituted)", product.chem.storageReconstituted],
  ];

  return (
    <>
      {/* ── Identity ─────────────────────────────────────────────────── */}
      <section className="relative border-b border-line">

        <div className="shell relative pt-8 pb-14 md:pt-10 md:pb-20">
          <Link
            href="/#collection"
            className="mb-8 inline-flex items-center gap-2 text-[0.78rem] font-medium text-muted transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.2} />
            All compounds
          </Link>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            {/* Render + label artwork */}
            <div className="flex flex-col gap-5">
              <div className="panel relative overflow-hidden rounded-md bg-surface-tint p-5">
                <div className="pointer-events-none absolute inset-0 hairline-grid" aria-hidden />
                <VialRender
                  name={product.name}
                  size={product.size}
                  lot={product.lot}
                  purity={product.purity}
                  accent={product.accent}
                  className="mx-auto max-w-[15rem]"
                />
              </div>

              <figure className="panel rounded-md p-5">
                <figcaption className="mb-3 font-mono text-[9px] tracking-[0.2em] text-subtle uppercase">
                  Label artwork · as applied to every vial
                </figcaption>
                <FlatVialLabel
                  name={product.name}
                  size={product.size}
                  lot={product.lot}
                  purity={product.purity}
                  accent={product.accent}
                  className="w-full"
                />
              </figure>
            </div>

            {/* Identity + buy */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-md border px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] uppercase", accentBorder, accentBg, accentText)}>
                  {product.category}
                </span>
                {product.badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[10px] font-medium text-muted">
                    <ShieldCheck className={cn("size-3", accentText)} strokeWidth={2.2} />
                    {b}
                  </span>
                ))}
              </div>

              <h1 className="text-[2.4rem] leading-[0.98] font-extrabold tracking-[-0.045em] sm:text-[3.2rem]">
                {product.name}
              </h1>
              <p className="mt-2 font-mono text-[0.78rem] tracking-[0.06em] text-subtle">
                {product.synonyms}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-3.5", i < Math.round(product.rating) ? "fill-brand text-brand" : "text-line")} />
                  ))}
                </span>
                <span className="font-mono text-[0.72rem] text-muted">
                  {product.rating.toFixed(1)} · {product.reviewCount.toLocaleString("en-US")} reviews
                </span>
              </div>

              <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-muted">
                {product.tagline}
              </p>

              {/* Spec rail */}
              <dl className="mt-6 grid grid-cols-2 gap-3 rounded-md border border-line bg-surface-sunken p-4 sm:grid-cols-4">
                {[
                  ["Purity", product.purity],
                  ["Fill", product.size],
                  ["Lot", product.lot.split("-").slice(-2).join("-")],
                  ["Residues", `${product.residues.length}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[8px] tracking-[0.18em] text-subtle uppercase">{k}</dt>
                    <dd className={cn("mt-1 font-mono text-[0.82rem] tabular-nums", accentText)}>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">
                    {product.format}
                  </p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-extrabold tracking-[-0.03em] text-ink">
                      {formatUSD(product.priceCents)}
                    </span>
                    {product.compareAtCents && (
                      <span className="font-mono text-[0.85rem] text-subtle line-through">
                        {formatUSD(product.compareAtCents)}
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-mono text-[9px] tracking-[0.12em] text-subtle uppercase">
                  <span className={accentText}>{product.unitsRemaining}</span> vials left in lot
                </p>
              </div>

              <AddToCartButton product={product} className="mt-4 w-full" />

              <p className="mt-3 text-center font-mono text-[9px] tracking-[0.14em] text-subtle uppercase">
                Ships cold · COA in every box · Research use only
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface-sunken py-14 md:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow mb-3">About the compound</p>
            <h2 className="text-[1.7rem] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[2.1rem]">
              What {product.name} actually is.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {product.about.map((para) => (
              <p key={para.slice(0, 24)} className="max-w-2xl text-[0.95rem] leading-relaxed text-muted">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Structure ────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="shell">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow mb-3">Structure</p>
            <h2 className="text-[1.7rem] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[2.1rem]">
              The chain, residue by residue.
            </h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">
              A peptide is amino acids joined end to end by peptide bonds — the
              amide linkage formed when one residue&rsquo;s carboxyl group
              condenses with the next one&rsquo;s amine group, releasing a
              molecule of water. Here is that chain for {product.name}, N-terminus
              first.
            </p>
          </div>

          {/* Sequence */}
          <div className="panel rounded-md p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
                Primary sequence · {product.residues.length} residues
              </h3>
              {product.oneLetter && (
                <code className={cn("max-w-full overflow-x-auto font-mono text-[0.72rem] break-all", accentText)}>
                  {product.oneLetter}
                </code>
              )}
            </div>

            <ResidueChain residues={product.residues} accent={product.accent} />

            {product.sequenceNote && (
              <p className="mt-5 border-t border-line pt-4 text-[0.8rem] leading-relaxed text-muted">
                <span className="font-semibold text-body">Note. </span>
                {product.sequenceNote}
              </p>
            )}
          </div>

          {/* Peptide bond */}
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <figure className="overflow-hidden panel rounded-md p-5 md:p-6">
              <figcaption className="mb-4 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
                The peptide bond
              </figcaption>
              <div className="overflow-x-auto">
                <PeptideBondDiagram accent={product.accent} className="w-full min-w-[30rem]" />
              </div>
              <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
                The highlighted C–N linkage is the peptide bond. It is planar and
                rigid, which is why a peptide&rsquo;s backbone can only fold in
                certain ways — and why sequence alone determines so much of what a
                compound does. {product.name} contains{" "}
                {product.residues.length - 1} of them.
              </p>
            </figure>

            <dl className="panel rounded-md p-5 md:p-6">
              <h3 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">
                Physicochemical data
              </h3>
              <div className="flex flex-col gap-3">
                {chemRows.map(([k, v]) => (
                  <div key={k} className="border-b border-line/60 pb-3 last:border-0 last:pb-0">
                    <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">{k}</dt>
                    <dd className="mt-0.5 text-[0.82rem] leading-snug text-body">{v}</dd>
                  </div>
                ))}
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Research focus ───────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface-sunken py-14 md:py-20">
        <div className="shell grid gap-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Research focus</p>
            <h2 className="mb-5 text-[1.7rem] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[2.1rem]">
              Why laboratories order it.
            </h2>
            <ul className="flex flex-col gap-3">
              {product.benefits.map((b) => (
                <li key={b.slice(0, 24)} className="flex gap-3 text-[0.88rem] leading-relaxed text-muted">
                  <FlaskConical className={cn("mt-0.5 size-4 shrink-0", accentText)} strokeWidth={1.9} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="panel rounded-md p-5 md:p-6">
            <div className="border-b border-line pb-4">
              <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Classification</dt>
              <dd className="mt-1 text-[0.88rem] text-body">{product.science.class}</dd>
            </div>
            <div className="border-b border-line py-4">
              <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Mechanism under study</dt>
              <dd className="mt-1 text-[0.88rem] leading-relaxed text-muted">{product.science.mechanism}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Half-life</dt>
                <dd className="mt-1 text-[0.82rem] text-body">{product.science.halfLife}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">Indexed papers</dt>
                <dd className={cn("mt-1 font-mono text-[0.82rem] tabular-nums", accentText)}>
                  {product.science.citations}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* ── COA ──────────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="shell">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow mb-3">Lot documentation</p>
            <h2 className="text-[1.7rem] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[2.1rem]">
              The paperwork for lot {product.lot}.
            </h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">
              This is the certificate that ships in the box. Results relate to
              this lot only — a different lot number means a different document.
            </p>
          </div>
          <CertificateOfAnalysis product={product} />
        </div>
      </section>

      {/* ── Related ──────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface-sunken py-14 md:py-20">
        <div className="shell">
          <h2 className="mb-6 text-[1.4rem] font-extrabold tracking-[-0.035em] sm:text-[1.75rem]">
            Studied alongside {product.name}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.slug}`}
                className="panel panel-hover group flex items-center justify-between gap-4 rounded-md p-5"
              >
                <span>
                  <span className="block font-display text-[1rem] font-bold text-ink">
                    {r.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[9px] tracking-[0.14em] text-subtle uppercase">
                    {r.category} · {r.size}
                  </span>
                  <span className="mt-2 block font-mono text-[0.8rem] text-body">
                    {formatUSD(r.priceCents)}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand" strokeWidth={2} />
              </Link>
            ))}
          </div>

          <p className="mt-10 border-t border-line pt-6 text-[0.72rem] leading-relaxed text-subtle">
            <span className="text-muted">Research Use Only.</span> {product.name} is
            supplied strictly for laboratory research and in-vitro
            experimentation by qualified professionals. It is not a drug, food,
            cosmetic, or dietary supplement, and is not for human or veterinary
            consumption. No statement on this page has been evaluated by the Food
            and Drug Administration, and nothing here is intended to diagnose,
            treat, cure, or prevent any disease. Research descriptions reference
            published literature about the compound class; they are not claims
            about outcomes in humans.
          </p>
        </div>
      </section>
    </>
  );
}
