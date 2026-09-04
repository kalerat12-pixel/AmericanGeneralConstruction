export type Accent = "acid" | "cyber";

export interface Product {
  id: string;
  slug: string;
  /** Brand-facing product name. */
  name: string;
  /** Technical compound identity — printed on the vial and the COA. */
  compound: string;
  category: "Recovery" | "Lean Muscle" | "Longevity" | "Metabolic" | "Cognitive";
  tagline: string;
  priceCents: number;
  compareAtCents?: number;
  /** Vial spec, exactly as it ships. */
  format: string;
  purity: string;
  /** Certificate of analysis lot reference. */
  lot: string;
  assay: string;
  accent: Accent;
  badges: string[];
  /** Research literature framing — never a consumer health promise. */
  benefits: string[];
  science: {
    class: string;
    mechanism: string;
    halfLife: string;
    storage: string;
    citations: number;
  };
  rating: number;
  reviewCount: number;
  unitsRemaining: number;
  bestSeller?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "l4g-rc-01",
    slug: "protocol-r",
    name: "Protocol R",
    compound: "BPC-157 · Pentadecapeptide",
    category: "Recovery",
    tagline:
      "The recovery reference standard. Synthesized at 99.8%+ and lot-verified before a single vial ships.",
    priceCents: 12900,
    compareAtCents: 15900,
    format: "5 mg lyophilized vial · 10-vial kit available",
    purity: "99.87%",
    lot: "L4G-R-2411-A",
    assay: "RP-HPLC + LC-MS",
    accent: "acid",
    badges: ["99.8% Purity Tested", "Third-Party Verified"],
    benefits: [
      "The single most requested compound in our lab — studied extensively in soft-tissue and tendon research models.",
      "Peer-reviewed literature examines its role in angiogenesis and connective-tissue signalling pathways.",
      "Supplied as a stable lyophilized powder for precise, repeatable reconstitution in research protocols.",
      "Every lot ships with a scannable COA: identity, purity, endotoxin, and residual solvent panels.",
    ],
    science: {
      class: "Synthetic pentadecapeptide (BPC-157)",
      mechanism:
        "A 15-amino-acid sequence derived from human gastric juice protein BPC. Investigated in preclinical models for its interaction with the VEGFR2–Akt–eNOS pathway and growth-factor expression at injury sites.",
      halfLife: "Approx. 4 hours (in vitro plasma stability models)",
      storage: "Lyophilized: 2–8 °C. Reconstituted: 2–8 °C, use within 30 days.",
      citations: 214,
    },
    rating: 4.9,
    reviewCount: 1284,
    unitsRemaining: 38,
    bestSeller: true,
  },
  {
    id: "l4g-lm-02",
    slug: "protocol-mass",
    name: "Protocol MASS",
    compound: "CJC-1295 (no DAC) + Ipamorelin · 2 mg / 2 mg",
    category: "Lean Muscle",
    tagline:
      "A precision-blended GHRP research stack, compounded in a single vial to eliminate ratio drift.",
    priceCents: 18900,
    format: "2 mg / 2 mg co-lyophilized vial",
    purity: "99.62%",
    lot: "L4G-M-2411-C",
    assay: "RP-HPLC + LC-MS",
    accent: "acid",
    badges: ["Co-Lyophilized Blend", "Batch Traceable"],
    benefits: [
      "Two of the most-studied growth-hormone secretagogues, blended to a fixed 1:1 ratio for protocol consistency.",
      "Co-lyophilization removes the reconstitution error that comes with mixing two separate vials by hand.",
      "Widely referenced in body-composition and pulsatile-release research literature.",
      "Sealed under nitrogen in USP Type I borosilicate with a 20 mm flip-off crimp seal.",
    ],
    science: {
      class: "GHRH analog + selective ghrelin receptor agonist",
      mechanism:
        "CJC-1295 is a modified GRF(1-29) analog studied for GHRH-receptor binding; Ipamorelin is a selective GHS-R1a agonist. Research examines their combined effect on pulsatile GH release without meaningful cortisol or prolactin elevation.",
      halfLife: "CJC-1295 (no DAC) ≈ 30 min · Ipamorelin ≈ 2 h",
      storage: "Lyophilized: −20 °C long term. Reconstituted: 2–8 °C.",
      citations: 168,
    },
    rating: 4.9,
    reviewCount: 942,
    unitsRemaining: 21,
    bestSeller: true,
  },
  {
    id: "l4g-lg-03",
    slug: "protocol-century",
    name: "Protocol CENTURY",
    compound: "Epitalon (Epithalon) · Tetrapeptide AEDG",
    category: "Longevity",
    tagline:
      "Our longevity flagship. Four amino acids, a decade of telomere-biology literature, one immaculate vial.",
    priceCents: 21900,
    format: "10 mg lyophilized vial",
    purity: "99.91%",
    lot: "L4G-C-2410-B",
    assay: "RP-HPLC + LC-MS + Karl Fischer",
    accent: "cyber",
    badges: ["Highest Purity Lot", "Cold-Chain Shipped"],
    benefits: [
      "The most rigorously characterized compound in our catalog — 99.91% by HPLC, with water content verified by Karl Fischer titration.",
      "Central to a long-running body of Russian and international research on pineal signalling and telomerase expression.",
      "Ships in insulated cold-chain packaging with a temperature indicator card in every box.",
      "Cycle-friendly 10 mg fill designed around the dosing intervals used in published protocols.",
    ],
    science: {
      class: "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
      mechanism:
        "A synthetic analog of the pineal peptide epithalamin. Investigated in cell-culture and animal models for effects on telomerase activity, circadian melatonin rhythm, and antioxidant gene expression.",
      halfLife: "Rapid — minutes in circulation; effects studied downstream",
      storage: "Lyophilized: −20 °C. Reconstituted: 2–8 °C, use within 20 days.",
      citations: 96,
    },
    rating: 5.0,
    reviewCount: 517,
    unitsRemaining: 12,
  },
  {
    id: "l4g-mt-04",
    slug: "protocol-shred",
    name: "Protocol SHRED",
    compound: "AOD-9604 · hGH Fragment 176-191",
    category: "Metabolic",
    tagline:
      "The metabolic research fragment — the lipolytic tail of hGH, isolated and purified without the rest.",
    priceCents: 16900,
    format: "5 mg lyophilized vial",
    purity: "99.74%",
    lot: "L4G-S-2411-D",
    assay: "RP-HPLC + LC-MS",
    accent: "cyber",
    badges: ["99.7% Purity Tested", "Endotoxin < 0.25 EU/mg"],
    benefits: [
      "A modified C-terminal fragment of human growth hormone, studied specifically for adipose-tissue pathways.",
      "Researched without the glucose-metabolism confounders associated with full-chain hGH.",
      "Bacteriostatic-water compatible; reconstitution card and sterile alcohol prep pads included in every order.",
      "Low endotoxin specification (< 0.25 EU/mg) verified by LAL assay on every production lot.",
    ],
    science: {
      class: "Modified hGH C-terminal fragment (176-191)",
      mechanism:
        "Investigated for stimulation of lipolysis and inhibition of lipogenesis in adipocyte models, reportedly via β3-adrenergic receptor pathways rather than the hGH receptor.",
      halfLife: "Approx. 30 minutes",
      storage: "Lyophilized: 2–8 °C. Reconstituted: 2–8 °C, use within 30 days.",
      citations: 74,
    },
    rating: 4.8,
    reviewCount: 706,
    unitsRemaining: 44,
  },
  {
    id: "l4g-cg-05",
    slug: "protocol-clarity",
    name: "Protocol CLARITY",
    compound: "Semax · N-Acetyl Heptapeptide",
    category: "Cognitive",
    tagline:
      "A nootropic research peptide with three decades of clinical literature behind it.",
    priceCents: 14900,
    format: "30 mg lyophilized vial",
    purity: "99.68%",
    lot: "L4G-CL-2410-A",
    assay: "RP-HPLC + LC-MS",
    accent: "cyber",
    badges: ["Research Grade", "Nitrogen Sealed"],
    benefits: [
      "Derived from ACTH(4-10) with the hormonal activity engineered out — a purely neuro-focused research target.",
      "Studied extensively for BDNF and NGF expression in cortical and hippocampal models.",
      "One of the few peptides in this catalog with an extensive human clinical literature base.",
      "Generous 30 mg fill — the best cost-per-milligram in the collection.",
    ],
    science: {
      class: "Synthetic ACTH(4-10) analog (Met-Glu-His-Phe-Pro-Gly-Pro)",
      mechanism:
        "Investigated for upregulation of BDNF and NGF expression, modulation of the dopaminergic and serotonergic systems, and neuroprotective effects in ischemia models.",
      halfLife: "Short in plasma; metabolites studied for extended activity",
      storage: "Lyophilized: 2–8 °C, protect from light.",
      citations: 131,
    },
    rating: 4.8,
    reviewCount: 389,
    unitsRemaining: 57,
  },
  {
    id: "l4g-rc-06",
    slug: "protocol-r-plus",
    name: "Protocol R+",
    compound: "TB-500 · Thymosin Beta-4 Fragment",
    category: "Recovery",
    tagline:
      "The systemic counterpart to Protocol R. Frequently studied alongside it in tissue-repair research.",
    priceCents: 17900,
    compareAtCents: 19900,
    format: "5 mg lyophilized vial",
    purity: "99.79%",
    lot: "L4G-RP-2411-B",
    assay: "RP-HPLC + LC-MS",
    accent: "acid",
    badges: ["Pairs With Protocol R", "Third-Party Verified"],
    benefits: [
      "A synthetic fragment of Thymosin Beta-4, the actin-binding protein central to cell-migration research.",
      "Studied for systemic distribution characteristics, in contrast to more locally-acting repair peptides.",
      "Bundled with Protocol R in our Recovery Stack at a lower combined cost per milligram.",
      "Identity and purity confirmed by mass spectrometry against a certified reference standard.",
    ],
    science: {
      class: "Synthetic Tβ4 active fragment (Ac-SDKP-based)",
      mechanism:
        "Investigated for actin sequestration, endothelial cell migration, and angiogenic signalling in wound-healing and cardiac-repair models.",
      halfLife: "Extended relative to BPC-157 in circulation models",
      storage: "Lyophilized: 2–8 °C. Reconstituted: 2–8 °C, use within 30 days.",
      citations: 152,
    },
    rating: 4.9,
    reviewCount: 611,
    unitsRemaining: 29,
  },
];

export const CATEGORIES = [
  "All",
  "Recovery",
  "Lean Muscle",
  "Longevity",
  "Metabolic",
  "Cognitive",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];
