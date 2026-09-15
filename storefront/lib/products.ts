/**
 * Catalog data — single source of truth for the grid, the cart, the product
 * detail pages, the vial labels, and the certificates of analysis.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BEFORE LAUNCH: sequences, molecular formulas, masses and CAS numbers below
 * are literature values used to build the pages. Replace every one of them —
 * and every COA figure — with the values from your synthesizer's actual
 * batch records. Nothing here should ship as-is.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Accent = "green" | "teal";

export type Category =
  | "Recovery"
  | "Growth"
  | "Metabolic"
  | "Longevity"
  | "Cognitive"
  | "Wellness";

export interface CoaRow {
  parameter: string;
  method: string;
  specification: string;
  result: string;
}

export interface Product {
  id: string;
  slug: string;
  /** The compound name, exactly as the market knows it. */
  name: string;
  /** Alternate names and classification, printed under the product name. */
  synonyms: string;
  category: Category;
  tagline: string;
  priceCents: number;
  compareAtCents?: number;
  /** Vial fill, e.g. "5 mg". */
  size: string;
  format: string;
  accent: Accent;
  badges: string[];

  /** Residues N-terminus → C-terminus. Non-standard residues spelled out. */
  residues: string[];
  /** One-letter string where the sequence is all-standard; null otherwise. */
  oneLetter: string | null;
  sequenceNote?: string;

  chem: {
    formula: string;
    molecularWeight: string;
    cas: string;
    appearance: string;
    solubility: string;
    storageLyophilized: string;
    storageReconstituted: string;
  };

  /** Long-form copy for the detail page. */
  about: string[];
  benefits: string[];
  science: {
    class: string;
    mechanism: string;
    halfLife: string;
    citations: number;
  };

  lot: string;
  manufactured: string;
  retest: string;
  purity: string;
  coa: CoaRow[];

  rating: number;
  reviewCount: number;
  unitsRemaining: number;
  bestSeller?: boolean;
}

interface CoaInput {
  purity: string;
  impurity: string;
  water: string;
  endotoxin: string;
  peptideContent: string;
  fill: string;
  appearance?: string;
}

/** Every lot runs the same panel, so the COA is generated, never hand-typed. */
function coa({
  purity,
  impurity,
  water,
  endotoxin,
  peptideContent,
  fill,
  appearance = "White to off-white lyophilized powder",
}: CoaInput): CoaRow[] {
  return [
    {
      parameter: "Appearance",
      method: "Visual inspection",
      specification: "White to off-white lyophilized cake or powder",
      result: appearance,
    },
    {
      parameter: "Identity",
      method: "LC-MS (ESI+)",
      specification: "Observed mass conforms to reference standard",
      result: "Conforms",
    },
    {
      parameter: "Purity",
      method: "RP-HPLC, 214 nm",
      specification: "≥ 98.0 % (area)",
      result: purity,
    },
    {
      parameter: "Single largest impurity",
      method: "RP-HPLC, 214 nm",
      specification: "≤ 1.0 % (area)",
      result: impurity,
    },
    {
      parameter: "Peptide content",
      method: "Nitrogen determination",
      specification: "≥ 80.0 %",
      result: peptideContent,
    },
    {
      parameter: "Water content",
      method: "Karl Fischer titration",
      specification: "≤ 8.0 %",
      result: water,
    },
    {
      parameter: "Residual solvents (TFA)",
      method: "HS-GC-MS",
      specification: "≤ 1.0 %",
      result: "< 0.5 %",
    },
    {
      parameter: "Bacterial endotoxins",
      method: "LAL, kinetic chromogenic",
      specification: "< 1.00 EU/mg",
      result: endotoxin,
    },
    {
      parameter: "Heavy metals",
      method: "ICP-MS",
      specification: "≤ 10 ppm total",
      result: "< 5 ppm",
    },
    {
      parameter: "Net fill",
      method: "Gravimetric, n = 10",
      specification: "± 5 % of label claim",
      result: fill,
    },
  ];
}

export const PRODUCTS: Product[] = [
  /* ── Recovery ────────────────────────────────────────────────────────── */
  {
    id: "l4g-bpc157",
    slug: "bpc-157",
    name: "BPC-157",
    synonyms: "Body Protection Compound 157 · Pentadecapeptide",
    category: "Recovery",
    tagline:
      "The most-requested research peptide on the market, synthesized at 99.8 %+ and lot-verified before a single vial ships.",
    priceCents: 6900,
    compareAtCents: 8900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "green",
    badges: ["99.8 % Purity Tested", "Third-Party Verified"],
    residues: "GEPPPGKPADDAGLV".split(""),
    oneLetter: "GEPPPGKPADDAGLV",
    chem: {
      formula: "C₆₂H₉₈N₁₆O₂₂",
      molecularWeight: "1419.53 g/mol",
      cas: "137525-51-0",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "BPC-157 is a synthetic 15-amino-acid sequence derived from a protective protein found in human gastric juice. It is the single most widely studied compound in the tissue-repair research space, and the one most laboratories order first.",
      "Its research profile is unusual: the sequence is stable in gastric acid, which is why so much of the published work explores oral as well as parenteral routes. Preclinical literature concentrates on tendon, ligament and gastrointestinal models.",
      "We supply it as a lyophilized powder rather than a pre-mixed solution, because the dry cake is what stays stable in transit and lets each laboratory control its own reconstitution volume.",
    ],
    benefits: [
      "The most extensively referenced compound in our catalog — several hundred indexed papers across soft-tissue and gastrointestinal research models.",
      "Peer-reviewed literature examines its role in angiogenesis and growth-factor expression at injury sites.",
      "Stable lyophilized cake for precise, repeatable reconstitution across a study.",
      "Every lot ships with a scannable COA: identity, purity, endotoxin, and residual solvent panels.",
    ],
    science: {
      class: "Synthetic pentadecapeptide, gastric BPC fragment",
      mechanism:
        "Investigated in preclinical models for interaction with the VEGFR2–Akt–eNOS signalling axis, upregulation of growth-factor receptors at wound sites, and modulation of nitric-oxide pathways.",
      halfLife: "≈ 4 hours (in-vitro plasma stability models)",
      citations: 214,
    },
    lot: "L4G-BPC-2411-A",
    manufactured: "14 Nov 2025",
    retest: "14 Nov 2027",
    purity: "99.87 %",
    coa: coa({
      purity: "99.87 %",
      impurity: "0.08 %",
      water: "3.1 %",
      endotoxin: "< 0.10 EU/mg",
      peptideContent: "92.4 %",
      fill: "5.02 mg",
    }),
    rating: 4.9,
    reviewCount: 1284,
    unitsRemaining: 38,
    bestSeller: true,
  },
  {
    id: "l4g-tb500",
    slug: "tb-500",
    name: "TB-500",
    synonyms: "Thymosin Beta-4 · Tβ4 acetate",
    category: "Recovery",
    tagline:
      "The systemic counterpart to BPC-157, and the second half of the pairing most repair-model protocols run.",
    priceCents: 8900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "green",
    badges: ["Pairs With BPC-157", "Third-Party Verified"],
    residues:
      "SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES".split(""),
    oneLetter: "SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES",
    sequenceNote: "N-terminally acetylated (Ac-Ser¹).",
    chem: {
      formula: "C₂₁₂H₃₅₀N₅₆O₇₈S",
      molecularWeight: "4963.44 g/mol",
      cas: "77591-33-4",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "TB-500 is the synthetic form of Thymosin Beta-4, a 43-residue actin-binding protein present in nearly every human cell and in wound fluid. It is one of the largest peptides in this catalog, and one of the more difficult to synthesize cleanly at scale.",
      "Where BPC-157 research tends to focus on local repair, Tβ4 literature emphasizes systemic distribution and cell migration — which is why the two are so often studied side by side rather than as alternatives.",
      "Because of its length, purity is the whole story here. Truncated sequences are the characteristic failure mode, and they are exactly what our RP-HPLC gradient is set up to resolve.",
    ],
    benefits: [
      "Full 43-residue sequence, not a shortened fragment sold under the same name.",
      "Studied for actin sequestration and endothelial cell migration in wound-healing and cardiac-repair models.",
      "HPLC gradient tuned to resolve truncated sequences — the characteristic impurity in long-chain synthesis.",
      "Bundled with BPC-157 in the Recovery pairing at a lower combined cost per milligram.",
    ],
    science: {
      class: "Synthetic 43-residue thymosin beta-4",
      mechanism:
        "Investigated for G-actin sequestration, endothelial and keratinocyte migration, and angiogenic signalling in wound-healing and cardiac-repair models.",
      halfLife: "Extended relative to BPC-157 in circulation models",
      citations: 152,
    },
    lot: "L4G-TB5-2411-B",
    manufactured: "09 Nov 2025",
    retest: "09 Nov 2027",
    purity: "99.42 %",
    coa: coa({
      purity: "99.42 %",
      impurity: "0.21 %",
      water: "4.4 %",
      endotoxin: "< 0.15 EU/mg",
      peptideContent: "86.1 %",
      fill: "5.04 mg",
    }),
    rating: 4.9,
    reviewCount: 611,
    unitsRemaining: 29,
  },

  /* ── Growth ──────────────────────────────────────────────────────────── */
  {
    id: "l4g-cjc-ipa",
    slug: "cjc-1295-ipamorelin",
    name: "CJC-1295 / Ipamorelin",
    synonyms: "Mod GRF (1-29) + Ipamorelin · 5 mg / 5 mg blend",
    category: "Growth",
    tagline:
      "The most ordered blend in the category, co-lyophilized in a single vial so the ratio cannot drift.",
    priceCents: 11900,
    size: "5 mg / 5 mg",
    format: "5 mg / 5 mg co-lyophilized vial",
    accent: "green",
    badges: ["Co-Lyophilized Blend", "Batch Traceable"],
    residues: [
      "Tyr", "D-Ala", "Asp", "Ala", "Ile", "Phe", "Thr", "Gln", "Ser", "Tyr",
      "Arg", "Lys", "Val", "Leu", "Ala", "Gln", "Leu", "Ser", "Ala", "Arg",
      "Lys", "Leu", "Leu", "Gln", "Asp", "Ile", "Leu", "Ser", "Arg-NH₂",
    ],
    oneLetter: null,
    sequenceNote:
      "Sequence shown is the CJC-1295 (no DAC) component — modified GRF(1-29) with D-Ala², Gln⁸, Ala¹⁵ and Leu²⁷ substitutions. The Ipamorelin component is Aib-His-D-2-Nal-D-Phe-Lys-NH₂.",
    chem: {
      formula: "C₁₅₂H₂₅₂N₄₄O₄₂ (CJC-1295 component)",
      molecularWeight: "3367.85 g/mol (CJC) · 711.85 g/mol (Ipamorelin)",
      cas: "863288-34-0 · 170851-70-4",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "−20 °C long term, 2–8 °C short term",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "This is the pairing that made the growth-hormone secretagogue category what it is: a GHRH analog and a selective ghrelin-receptor agonist, studied together because they act on two different receptors.",
      "Sold separately, the two are almost always combined by hand at the bench — which introduces exactly the kind of ratio error that makes results hard to reproduce. Co-lyophilizing them into one vial at a fixed 1:1 removes that step entirely.",
      "The CJC-1295 component here is the no-DAC form (modified GRF 1-29). It is the short-acting version, and the one the published pulsatile-release work is built on.",
    ],
    benefits: [
      "Two of the most-studied secretagogues, fixed at a 1:1 ratio so protocols stay reproducible across a study.",
      "Co-lyophilization removes the reconstitution error that comes from mixing two separate vials by hand.",
      "No-DAC form — the short-acting variant used in the pulsatile-release literature.",
      "Sealed under nitrogen in USP Type I borosilicate with a 20 mm flip-off crimp seal.",
    ],
    science: {
      class: "GHRH analog + selective GHS-R1a agonist",
      mechanism:
        "CJC-1295 (no DAC) is studied for GHRH-receptor binding; Ipamorelin is a selective ghrelin-receptor agonist. Research examines their combined effect on pulsatile GH release without meaningful cortisol or prolactin elevation.",
      halfLife: "CJC-1295 (no DAC) ≈ 30 min · Ipamorelin ≈ 2 h",
      citations: 168,
    },
    lot: "L4G-CJI-2411-C",
    manufactured: "02 Nov 2025",
    retest: "02 Nov 2027",
    purity: "99.31 %",
    coa: coa({
      purity: "99.31 %",
      impurity: "0.26 %",
      water: "3.8 %",
      endotoxin: "< 0.20 EU/mg",
      peptideContent: "88.7 %",
      fill: "10.06 mg total",
    }),
    rating: 4.9,
    reviewCount: 942,
    unitsRemaining: 21,
    bestSeller: true,
  },
  {
    id: "l4g-ipamorelin",
    slug: "ipamorelin",
    name: "Ipamorelin",
    synonyms: "Selective ghrelin receptor agonist · Pentapeptide",
    category: "Growth",
    tagline:
      "The cleanest secretagogue in the literature — five residues, and almost no off-target activity to control for.",
    priceCents: 7900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "green",
    badges: ["Highly Selective", "Third-Party Verified"],
    residues: ["Aib", "His", "D-2-Nal", "D-Phe", "Lys-NH₂"],
    oneLetter: null,
    sequenceNote:
      "Contains non-proteinogenic residues: Aib (2-aminoisobutyric acid) and D-2-Nal (D-2-naphthylalanine). C-terminally amidated.",
    chem: {
      formula: "C₃₈H₄₉N₉O₅",
      molecularWeight: "711.85 g/mol",
      cas: "170851-70-4",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "Ipamorelin is the reason the selective-secretagogue category exists. Earlier ghrelin-receptor agonists carried significant off-target activity; Ipamorelin was designed specifically to avoid it, and the published work reflects that.",
      "At five residues it is one of the shortest peptides in this catalog, which makes it comparatively straightforward to synthesize to very high purity — and easy to verify by mass spec.",
      "Two of its five residues are non-proteinogenic, so it will not appear in a standard one-letter sequence notation. That is expected, not an error in the label.",
    ],
    benefits: [
      "Selective for the ghrelin receptor — the reason it is the control compound in so much comparative research.",
      "Five residues, high synthetic purity, and an unambiguous mass-spec identity confirmation.",
      "Studied without the cortisol and prolactin confounders associated with earlier secretagogues.",
      "Also available co-lyophilized with CJC-1295 in our blend vial.",
    ],
    science: {
      class: "Pentapeptide, selective GHS-R1a agonist",
      mechanism:
        "Investigated as a selective ghrelin-receptor agonist driving GH release from somatotrophs with minimal effect on ACTH, cortisol or prolactin in comparative models.",
      halfLife: "≈ 2 hours",
      citations: 121,
    },
    lot: "L4G-IPA-2410-D",
    manufactured: "21 Oct 2025",
    retest: "21 Oct 2027",
    purity: "99.76 %",
    coa: coa({
      purity: "99.76 %",
      impurity: "0.11 %",
      water: "2.7 %",
      endotoxin: "< 0.10 EU/mg",
      peptideContent: "91.8 %",
      fill: "5.01 mg",
    }),
    rating: 4.8,
    reviewCount: 528,
    unitsRemaining: 46,
  },
  {
    id: "l4g-sermorelin",
    slug: "sermorelin",
    name: "Sermorelin",
    synonyms: "GRF (1-29) · Growth hormone-releasing factor fragment",
    category: "Growth",
    tagline:
      "The parent sequence the whole GHRH-analog category was built from — unmodified and unsubstituted.",
    priceCents: 9900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "teal",
    badges: ["Reference Sequence", "Cold-Chain Shipped"],
    residues: "YADAIFTNSYRKVLGQLSARKLLQDIMSR".split(""),
    oneLetter: "YADAIFTNSYRKVLGQLSARKLLQDIMSR",
    sequenceNote: "C-terminally amidated (Arg²⁹-NH₂).",
    chem: {
      formula: "C₁₄₉H₂₄₆N₄₄O₄₂S",
      molecularWeight: "3357.88 g/mol",
      cas: "86168-78-7",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "−20 °C long term, 2–8 °C short term",
      storageReconstituted: "2–8 °C, use within 14 days",
    },
    about: [
      "Sermorelin is the first 29 residues of human growth hormone-releasing hormone — the shortest fragment that retains full activity at the GHRH receptor. Every modified GRF analog in this category, CJC-1295 included, is a variation on this sequence.",
      "Because it is unmodified, it is also the least stable of the GHRH analogs in solution. That is a property of the molecule, not a defect in the lot, and it is why we ship it cold and specify a shorter reconstituted window than the rest of the catalog.",
      "Laboratories comparing modified analogs generally want this on the bench as the reference arm.",
    ],
    benefits: [
      "The unmodified reference sequence — the baseline against which modified GRF analogs are compared.",
      "Long clinical literature relative to the newer analogs in this category.",
      "Ships cold-chain with a temperature indicator card, because the native sequence is the least stable here.",
      "Shorter reconstituted window specified honestly on the label rather than rounded up.",
    ],
    science: {
      class: "GHRH (1-29) amide",
      mechanism:
        "Binds the GHRH receptor on anterior pituitary somatotrophs; studied for stimulation of endogenous GH synthesis and pulsatile release.",
      halfLife: "≈ 11–12 minutes",
      citations: 187,
    },
    lot: "L4G-SER-2410-A",
    manufactured: "18 Oct 2025",
    retest: "18 Oct 2027",
    purity: "99.18 %",
    coa: coa({
      purity: "99.18 %",
      impurity: "0.34 %",
      water: "4.9 %",
      endotoxin: "< 0.25 EU/mg",
      peptideContent: "85.3 %",
      fill: "5.03 mg",
    }),
    rating: 4.7,
    reviewCount: 264,
    unitsRemaining: 33,
  },
  {
    id: "l4g-tesamorelin",
    slug: "tesamorelin",
    name: "Tesamorelin",
    synonyms: "Trans-3-hexenoyl GRF (1-29) · Stabilized GHRH analog",
    category: "Growth",
    tagline:
      "A stabilized GRF analog with a clinical literature base most research peptides never accumulate.",
    priceCents: 22900,
    size: "10 mg",
    format: "10 mg lyophilized vial",
    accent: "teal",
    badges: ["Clinically Characterized", "Cold-Chain Shipped"],
    residues: "YADAIFTNSYRKVLGQLSARKLLQDIMSR".split(""),
    oneLetter: "YADAIFTNSYRKVLGQLSARKLLQDIMSR",
    sequenceNote:
      "N-terminally acylated with a trans-3-hexenoyl group, which is what confers resistance to DPP-4 cleavage.",
    chem: {
      formula: "C₂₂₁H₃₆₆N₇₂O₆₇S",
      molecularWeight: "5135.86 g/mol",
      cas: "218949-48-5",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "−20 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 14 days",
    },
    about: [
      "Tesamorelin is Sermorelin's sequence with a single, decisive change: a trans-3-hexenoyl group on the N-terminus that blocks the DPP-4 cleavage which limits the native peptide's half-life.",
      "That one modification is why it has a clinical development history — and why the visceral-adipose research literature around it is unusually detailed for a compound in this category.",
      "It is the most expensive item in this catalog, and the synthesis is the reason. A 5136-dalton acylated chain is materially harder to make cleanly than a five-residue pentapeptide.",
    ],
    benefits: [
      "N-terminal acylation confers resistance to DPP-4 cleavage — the modification the whole analog is built around.",
      "Studied specifically in visceral adipose tissue models, not just general body-composition endpoints.",
      "One of the few compounds here with a genuine clinical, not solely preclinical, literature base.",
      "10 mg fill, cold-chain shipped, with a temperature indicator in every parcel.",
    ],
    science: {
      class: "Acylated GHRH (1-29) analog",
      mechanism:
        "GHRH-receptor agonist stabilized against DPP-4 degradation; investigated for effects on GH/IGF-1 axis signalling and visceral adipose tissue in clinical and preclinical models.",
      halfLife: "≈ 26–38 minutes",
      citations: 143,
    },
    lot: "L4G-TES-2411-A",
    manufactured: "06 Nov 2025",
    retest: "06 Nov 2027",
    purity: "99.04 %",
    coa: coa({
      purity: "99.04 %",
      impurity: "0.38 %",
      water: "5.2 %",
      endotoxin: "< 0.25 EU/mg",
      peptideContent: "84.6 %",
      fill: "10.08 mg",
    }),
    rating: 4.8,
    reviewCount: 176,
    unitsRemaining: 9,
  },

  /* ── Metabolic ───────────────────────────────────────────────────────── */
  {
    id: "l4g-semaglutide",
    slug: "semaglutide",
    name: "Semaglutide",
    synonyms: "GLP-1 receptor agonist · Acylated 31-residue analog",
    category: "Metabolic",
    tagline:
      "The most-searched research peptide in the world right now. Supplied lyophilized, lot-assayed, research use only.",
    priceCents: 19900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "teal",
    badges: ["Restricted Category", "Third-Party Verified"],
    residues:
      "HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG".split(""),
    oneLetter: "HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG",
    sequenceNote:
      "Position 8 is Aib (2-aminoisobutyric acid), not Ala; Lys²⁶ carries a C18 diacid–γGlu–2×OEG side chain. Both modifications are what separate it from native GLP-1.",
    chem: {
      formula: "C₁₈₇H₂₉₁N₄₅O₅₉",
      molecularWeight: "4113.58 g/mol",
      cas: "910463-68-2",
      appearance: "White to off-white lyophilized powder",
      solubility: "Soluble in sterile water; pH-sensitive",
      storageLyophilized: "−20 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "Semaglutide is a GLP-1 receptor agonist built from the native incretin sequence with two engineered changes: an Aib substitution at position 8 that blocks DPP-4 cleavage, and a fatty-diacid side chain on Lys²⁶ that drives albumin binding.",
      "Those two modifications are the entire reason its half-life is measured in days rather than minutes, and they are also the hardest part of the synthesis to get right — which is why purity varies so widely across suppliers in this category.",
      "Regulatory note: semaglutide is an approved drug substance. We supply it strictly as a research reagent, and this category carries materially more compliance exposure than anything else in our catalog. Read the research-use terms before ordering.",
    ],
    benefits: [
      "Correct Aib⁸ substitution and full C18 diacid side chain confirmed by mass spec on every lot — not a truncated analog.",
      "The most heavily published incretin analog in current metabolic research literature.",
      "Supplied lyophilized, so the laboratory controls concentration rather than inheriting a vendor's dilution.",
      "Shipped with explicit research-use terms, because this category is scrutinized more closely than any other.",
    ],
    science: {
      class: "Acylated GLP-1 receptor agonist",
      mechanism:
        "Investigated as a GLP-1 receptor agonist; the Aib⁸ substitution confers DPP-4 resistance and the C18 diacid side chain drives reversible albumin binding, extending circulation time in published models.",
      halfLife: "≈ 165 hours (≈ 7 days)",
      citations: 412,
    },
    lot: "L4G-SEM-2411-E",
    manufactured: "11 Nov 2025",
    retest: "11 Nov 2027",
    purity: "99.28 %",
    coa: coa({
      purity: "99.28 %",
      impurity: "0.29 %",
      water: "4.1 %",
      endotoxin: "< 0.15 EU/mg",
      peptideContent: "89.2 %",
      fill: "5.03 mg",
    }),
    rating: 4.9,
    reviewCount: 1876,
    unitsRemaining: 17,
    bestSeller: true,
  },
  {
    id: "l4g-tirzepatide",
    slug: "tirzepatide",
    name: "Tirzepatide",
    synonyms: "Dual GIP / GLP-1 receptor agonist · 39-residue analog",
    category: "Metabolic",
    tagline:
      "A dual-incretin analog — the compound that made single-receptor agonists look like the previous generation.",
    priceCents: 24900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "teal",
    badges: ["Restricted Category", "Dual Receptor"],
    residues:
      "YXEGTFTSDYSIXLDKIAQKAFVQWLIAGGPSSGAPPPS".split(""),
    oneLetter: null,
    sequenceNote:
      "X denotes Aib (2-aminoisobutyric acid) at positions 2 and 13. Lys²⁰ carries a C20 diacid–γGlu–2×AEEA side chain. C-terminally amidated.",
    chem: {
      formula: "C₂₂₅H₃₄₈N₄₈O₆₈",
      molecularWeight: "4813.45 g/mol",
      cas: "2023788-19-2",
      appearance: "White to off-white lyophilized powder",
      solubility: "Soluble in sterile water; pH-sensitive",
      storageLyophilized: "−20 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "Tirzepatide is a single 39-residue chain that acts at two incretin receptors — GIP and GLP-1 — rather than one. It is the compound that reframed the whole metabolic research category around dual agonism.",
      "It carries two Aib substitutions and a C20 diacid side chain, making it one of the most synthetically demanding sequences on this page. Impurity profiles in this category are where suppliers separate, and it is why we publish the single-largest-impurity figure alongside total purity.",
      "Regulatory note: tirzepatide is an approved drug substance. As with semaglutide, we supply it strictly as a research reagent and this category carries materially more compliance exposure than the rest of the catalog.",
    ],
    benefits: [
      "Dual GIP and GLP-1 receptor activity from one chain — the basis of the current dual-agonist literature.",
      "Both Aib substitutions and the C20 side chain verified by LC-MS against a certified reference standard.",
      "Single-largest-impurity reported separately, not folded into a total-purity figure.",
      "Supplied lyophilized under nitrogen in USP Type I borosilicate.",
    ],
    science: {
      class: "Dual GIP/GLP-1 receptor agonist, acylated",
      mechanism:
        "Investigated as a balanced agonist at both GIP and GLP-1 receptors; Aib substitutions confer DPP-4 resistance and the C20 diacid chain drives albumin binding for extended circulation.",
      halfLife: "≈ 120 hours (≈ 5 days)",
      citations: 268,
    },
    lot: "L4G-TIR-2411-B",
    manufactured: "12 Nov 2025",
    retest: "12 Nov 2027",
    purity: "99.11 %",
    coa: coa({
      purity: "99.11 %",
      impurity: "0.36 %",
      water: "4.6 %",
      endotoxin: "< 0.20 EU/mg",
      peptideContent: "87.5 %",
      fill: "5.02 mg",
    }),
    rating: 4.9,
    reviewCount: 1103,
    unitsRemaining: 11,
  },
  {
    id: "l4g-aod9604",
    slug: "aod-9604",
    name: "AOD-9604",
    synonyms: "hGH Fragment 176-191 · Modified C-terminal fragment",
    category: "Metabolic",
    tagline:
      "The lipolytic tail of human growth hormone, isolated from the rest of the molecule.",
    priceCents: 8900,
    size: "5 mg",
    format: "5 mg lyophilized vial",
    accent: "teal",
    badges: ["Endotoxin < 0.25 EU/mg", "99.7 % Purity Tested"],
    residues: "YLRIVQCRSVEGSCGF".split(""),
    oneLetter: "YLRIVQCRSVEGSCGF",
    sequenceNote:
      "hGH residues 177–191 with an N-terminal tyrosine added. Contains an intramolecular disulfide bridge between the two cysteines.",
    chem: {
      formula: "C₇₈H₁₂₃N₂₃O₂₃S₂",
      molecularWeight: "1815.07 g/mol",
      cas: "221231-10-3",
      appearance: "White lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "AOD-9604 is the C-terminal fragment of human growth hormone with an added N-terminal tyrosine — the smallest piece of the hGH molecule that retains the fat-metabolism activity researchers were interested in.",
      "The point of isolating it is what it leaves behind: the fragment is studied without the glucose-metabolism and IGF-1 effects that complicate full-chain hGH research.",
      "It contains a disulfide bridge, so correct folding matters as much as sequence purity. Our identity confirmation checks the oxidized form specifically.",
    ],
    benefits: [
      "Disulfide bridge verified in the oxidized form — sequence purity alone would not confirm correct folding.",
      "Studied for adipose-tissue pathways without full-chain hGH's glucose-metabolism confounders.",
      "Low endotoxin specification (< 0.25 EU/mg) confirmed by LAL on every production lot.",
      "Reconstitution card and sterile alcohol prep pads included with every order.",
    ],
    science: {
      class: "Modified hGH C-terminal fragment (176-191)",
      mechanism:
        "Investigated for stimulation of lipolysis and inhibition of lipogenesis in adipocyte models, reportedly via β3-adrenergic pathways rather than the hGH receptor.",
      halfLife: "≈ 30 minutes",
      citations: 74,
    },
    lot: "L4G-AOD-2411-D",
    manufactured: "04 Nov 2025",
    retest: "04 Nov 2027",
    purity: "99.74 %",
    coa: coa({
      purity: "99.74 %",
      impurity: "0.12 %",
      water: "3.3 %",
      endotoxin: "< 0.20 EU/mg",
      peptideContent: "90.6 %",
      fill: "5.01 mg",
    }),
    rating: 4.8,
    reviewCount: 706,
    unitsRemaining: 44,
  },

  /* ── Longevity ───────────────────────────────────────────────────────── */
  {
    id: "l4g-epitalon",
    slug: "epitalon",
    name: "Epitalon",
    synonyms: "Epithalon · Tetrapeptide AEDG",
    category: "Longevity",
    tagline:
      "Four amino acids, three decades of telomere-biology literature, and the highest-purity lot we produce.",
    priceCents: 7900,
    size: "10 mg",
    format: "10 mg lyophilized vial",
    accent: "teal",
    badges: ["Highest Purity Lot", "Cold-Chain Shipped"],
    residues: "AEDG".split(""),
    oneLetter: "AEDG",
    chem: {
      formula: "C₁₄H₂₂N₄O₉",
      molecularWeight: "390.35 g/mol",
      cas: "307297-39-8",
      appearance: "White lyophilized powder",
      solubility: "Freely soluble in water",
      storageLyophilized: "−20 °C long term, 2–8 °C short term",
      storageReconstituted: "2–8 °C, use within 20 days",
    },
    about: [
      "Epitalon is a synthetic tetrapeptide — Ala-Glu-Asp-Gly — modelled on epithalamin, a peptide complex isolated from the pineal gland. At four residues and 390 daltons it is by a wide margin the smallest molecule in this catalog.",
      "That size is why it reaches 99.9 % purity routinely: there is very little room for truncated or deletion sequences. It is also why we report water content by Karl Fischer, since a small peptide's mass is disproportionately sensitive to residual moisture.",
      "Its research base is unusual — a long-running body of Russian gerontology literature, with international telomerase work layered on top over the last fifteen years.",
    ],
    benefits: [
      "The most rigorously characterized compound in the catalog — 99.91 % by HPLC with water content confirmed by Karl Fischer.",
      "Central to a long-running body of research on pineal signalling and telomerase expression.",
      "Cycle-friendly 10 mg fill sized around the dosing intervals used in published protocols.",
      "Ships in insulated cold-chain packaging with a temperature indicator card in every box.",
    ],
    science: {
      class: "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
      mechanism:
        "A synthetic analog of the pineal peptide epithalamin, investigated in cell-culture and animal models for telomerase activity, circadian melatonin rhythm, and antioxidant gene expression.",
      halfLife: "Minutes in circulation; downstream effects studied separately",
      citations: 96,
    },
    lot: "L4G-EPI-2410-B",
    manufactured: "16 Oct 2025",
    retest: "16 Oct 2027",
    purity: "99.91 %",
    coa: coa({
      purity: "99.91 %",
      impurity: "0.04 %",
      water: "2.2 %",
      endotoxin: "< 0.10 EU/mg",
      peptideContent: "94.1 %",
      fill: "10.03 mg",
    }),
    rating: 5.0,
    reviewCount: 517,
    unitsRemaining: 12,
  },
  {
    id: "l4g-ghkcu",
    slug: "ghk-cu",
    name: "GHK-Cu",
    synonyms: "Copper Tripeptide-1 · Gly-His-Lys copper complex",
    category: "Longevity",
    tagline:
      "A copper-bound tripeptide — the compound behind most of the serious skin and matrix-remodelling literature.",
    priceCents: 6900,
    size: "50 mg",
    format: "50 mg lyophilized vial",
    accent: "teal",
    badges: ["Copper Complex Verified", "Research Grade"],
    residues: ["Gly", "His", "Lys", "· Cu²⁺"],
    oneLetter: null,
    sequenceNote:
      "The Gly-His-Lys tripeptide in a 1:1 complex with copper(II). The copper is part of the active molecule, not a contaminant — which is why the material is blue.",
    chem: {
      formula: "C₁₄H₂₂N₆O₄·Cu",
      molecularWeight: "403.94 g/mol",
      cas: "49557-75-7",
      appearance: "Blue to deep-blue lyophilized powder",
      solubility: "Freely soluble in water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "GHK-Cu is a three-residue peptide bound to a copper(II) ion. It occurs naturally in human plasma, and its concentration falls measurably with age — which is where most of the interest in it originates.",
      "The copper is not an additive. It is coordinated to the peptide and is essential to the activity described in the literature, which is why our identity testing confirms the complex rather than the free tripeptide.",
      "It is the one compound in this catalog that is not white. A deep blue powder is the correct appearance; a white one would mean the copper never bound.",
    ],
    benefits: [
      "Copper complexation confirmed analytically — the free tripeptide is a different molecule with a different research profile.",
      "Studied extensively for extracellular matrix remodelling, collagen synthesis, and gene-expression modulation.",
      "Generous 50 mg fill, the lowest cost-per-milligram in the catalog.",
      "Deep-blue appearance specified on the COA, because colour is the fastest visual check that the complex formed.",
    ],
    science: {
      class: "Copper(II) tripeptide complex",
      mechanism:
        "Investigated for copper-dependent modulation of matrix metalloproteinases and their inhibitors, collagen and glycosaminoglycan synthesis, and broad gene-expression effects in fibroblast models.",
      halfLife: "Rapid clearance; tissue-copper delivery studied downstream",
      citations: 158,
    },
    lot: "L4G-GHK-2410-C",
    manufactured: "23 Oct 2025",
    retest: "23 Oct 2027",
    purity: "99.63 %",
    coa: coa({
      purity: "99.63 %",
      impurity: "0.14 %",
      water: "3.6 %",
      endotoxin: "< 0.15 EU/mg",
      peptideContent: "93.2 %",
      fill: "50.2 mg",
      appearance: "Deep-blue lyophilized powder",
    }),
    rating: 4.9,
    reviewCount: 833,
    unitsRemaining: 61,
  },
  {
    id: "l4g-motsc",
    slug: "mots-c",
    name: "MOTS-c",
    synonyms: "Mitochondrial ORF of the 12S rRNA type-c · 16-mer",
    category: "Longevity",
    tagline:
      "A mitochondria-encoded peptide — one of the few in this catalog whose gene does not sit in the nucleus.",
    priceCents: 11900,
    size: "10 mg",
    format: "10 mg lyophilized vial",
    accent: "green",
    badges: ["Mitochondrial Origin", "Third-Party Verified"],
    residues: "MRWQEMGYIFYPRKLR".split(""),
    oneLetter: "MRWQEMGYIFYPRKLR",
    chem: {
      formula: "C₁₀₁H₁₅₂N₂₈O₂₂S₂",
      molecularWeight: "2174.61 g/mol",
      cas: "1627580-64-6",
      appearance: "White to off-white lyophilized powder",
      solubility: "Soluble in bacteriostatic or sterile water",
      storageLyophilized: "−20 °C long term, 2–8 °C short term",
      storageReconstituted: "2–8 °C, use within 21 days",
    },
    about: [
      "MOTS-c is encoded in mitochondrial DNA rather than the nuclear genome — one of a small family of mitochondrial-derived peptides discovered in the last two decades.",
      "That origin is the interesting part. Research treats it as a signal sent from the mitochondrion to the nucleus, which puts it in a different conceptual category from every other compound on this page.",
      "It contains two methionines, which are oxidation-prone. Our lots are sealed under nitrogen and specified for the reduced form.",
    ],
    benefits: [
      "Mitochondria-encoded — studied as retrograde signalling from mitochondrion to nucleus, not as a conventional hormone analog.",
      "Investigated for AMPK pathway activation and metabolic homeostasis in exercise-physiology models.",
      "Sealed under nitrogen; methionine oxidation is the characteristic failure mode and is specified against.",
      "One of the newest well-characterized targets available at research grade.",
    ],
    science: {
      class: "Mitochondrial-derived peptide, 16 residues",
      mechanism:
        "Investigated for AMPK activation via the folate–methionine cycle, regulation of nuclear gene expression under metabolic stress, and effects on insulin sensitivity in animal models.",
      halfLife: "Short; signalling effects studied downstream",
      citations: 89,
    },
    lot: "L4G-MOT-2411-A",
    manufactured: "07 Nov 2025",
    retest: "07 Nov 2027",
    purity: "99.35 %",
    coa: coa({
      purity: "99.35 %",
      impurity: "0.22 %",
      water: "3.9 %",
      endotoxin: "< 0.15 EU/mg",
      peptideContent: "88.9 %",
      fill: "10.04 mg",
    }),
    rating: 4.8,
    reviewCount: 341,
    unitsRemaining: 27,
  },

  /* ── Cognitive ───────────────────────────────────────────────────────── */
  {
    id: "l4g-semax",
    slug: "semax",
    name: "Semax",
    synonyms: "ACTH (4-7) analog · Heptapeptide MEHFPGP",
    category: "Cognitive",
    tagline:
      "A nootropic research peptide with three decades of clinical literature behind it.",
    priceCents: 8900,
    size: "30 mg",
    format: "30 mg lyophilized vial",
    accent: "teal",
    badges: ["Extensive Clinical Base", "Nitrogen Sealed"],
    residues: "MEHFPGP".split(""),
    oneLetter: "MEHFPGP",
    sequenceNote:
      "ACTH(4-7) with a Pro-Gly-Pro tripeptide extension, which is what gives it enzymatic stability without the hormonal activity.",
    chem: {
      formula: "C₃₇H₅₁N₉O₁₀S",
      molecularWeight: "813.91 g/mol",
      cas: "80714-61-0",
      appearance: "White lyophilized powder",
      solubility: "Freely soluble in water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "Semax is built from ACTH(4-7) — a four-residue stretch of adrenocorticotropic hormone — with a Pro-Gly-Pro tail added. The tail confers enzymatic stability; the truncation removes the hormonal activity.",
      "The result is a compound studied purely for neurological effects, with essentially none of the corticotropic activity of the parent hormone. That separation is the whole design.",
      "It has an unusually deep human clinical literature for a compound in this category, most of it Russian, spanning stroke, cognition and optic-nerve research.",
    ],
    benefits: [
      "Hormonal activity engineered out — a purely neuro-focused research target rather than an ACTH analog.",
      "Studied extensively for BDNF and NGF expression in cortical and hippocampal models.",
      "One of the few peptides here with a substantial human clinical literature base.",
      "Generous 30 mg fill — among the best cost-per-milligram in the collection.",
    ],
    science: {
      class: "Synthetic ACTH(4-7) analog with Pro-Gly-Pro extension",
      mechanism:
        "Investigated for upregulation of BDNF and NGF expression, modulation of dopaminergic and serotonergic systems, and neuroprotection in ischemia models.",
      halfLife: "Short in plasma; metabolites studied for extended activity",
      citations: 131,
    },
    lot: "L4G-SMX-2410-A",
    manufactured: "19 Oct 2025",
    retest: "19 Oct 2027",
    purity: "99.68 %",
    coa: coa({
      purity: "99.68 %",
      impurity: "0.13 %",
      water: "2.9 %",
      endotoxin: "< 0.10 EU/mg",
      peptideContent: "92.7 %",
      fill: "30.1 mg",
    }),
    rating: 4.8,
    reviewCount: 389,
    unitsRemaining: 57,
  },
  {
    id: "l4g-selank",
    slug: "selank",
    name: "Selank",
    synonyms: "Tuftsin analog · Heptapeptide TKPRPGP",
    category: "Cognitive",
    tagline:
      "Semax's companion compound — the same Pro-Gly-Pro stabilization strategy applied to a different parent sequence.",
    priceCents: 8900,
    size: "10 mg",
    format: "10 mg lyophilized vial",
    accent: "teal",
    badges: ["Pairs With Semax", "Nitrogen Sealed"],
    residues: "TKPRPGP".split(""),
    oneLetter: "TKPRPGP",
    sequenceNote:
      "The immunomodulatory tetrapeptide tuftsin (TKPR) with the same Pro-Gly-Pro stabilizing extension used in Semax.",
    chem: {
      formula: "C₃₃H₅₇N₁₁O₉",
      molecularWeight: "751.88 g/mol",
      cas: "129954-34-3",
      appearance: "White lyophilized powder",
      solubility: "Freely soluble in water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "Selank applies the same design logic as Semax to a different starting sequence: take tuftsin, a naturally occurring immunomodulatory tetrapeptide, and extend it with Pro-Gly-Pro for stability.",
      "The two compounds came out of the same research programme and are frequently studied together, which is why laboratories tend to order them as a pair.",
      "Where Semax literature centres on BDNF and neuroprotection, Selank work concentrates on GABAergic and anxiolytic pathways.",
    ],
    benefits: [
      "Same stabilization strategy as Semax, applied to tuftsin — the two are designed to be studied together.",
      "Research concentrates on GABAergic signalling and anxiolytic pathways in animal models.",
      "Freely water-soluble, which simplifies reconstitution and dilution series.",
      "Sealed under nitrogen in USP Type I borosilicate.",
    ],
    science: {
      class: "Synthetic tuftsin analog with Pro-Gly-Pro extension",
      mechanism:
        "Investigated for modulation of GABAergic transmission, effects on enkephalin degradation, and expression of monoamine neurotransmitters in animal anxiety models.",
      halfLife: "Short in plasma; extended relative to native tuftsin",
      citations: 78,
    },
    lot: "L4G-SLK-2410-B",
    manufactured: "20 Oct 2025",
    retest: "20 Oct 2027",
    purity: "99.57 %",
    coa: coa({
      purity: "99.57 %",
      impurity: "0.17 %",
      water: "3.0 %",
      endotoxin: "< 0.10 EU/mg",
      peptideContent: "91.4 %",
      fill: "10.02 mg",
    }),
    rating: 4.7,
    reviewCount: 212,
    unitsRemaining: 48,
  },

  /* ── Wellness ────────────────────────────────────────────────────────── */
  {
    id: "l4g-thymosin-a1",
    slug: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    synonyms: "Tα1 · 28-residue thymic peptide",
    category: "Wellness",
    tagline:
      "A thymus-derived immunomodulatory peptide with one of the longest clinical records in the category.",
    priceCents: 13900,
    size: "10 mg",
    format: "10 mg lyophilized vial",
    accent: "green",
    badges: ["Clinically Characterized", "Cold-Chain Shipped"],
    residues:
      "SDAAVDTSSEITTKDLKEKKEVVEEAEN".split(""),
    oneLetter: "SDAAVDTSSEITTKDLKEKKEVVEEAEN",
    sequenceNote: "N-terminally acetylated (Ac-Ser¹).",
    chem: {
      formula: "C₁₂₉H₂₁₅N₃₃O₅₅",
      molecularWeight: "3108.30 g/mol",
      cas: "62304-98-7",
      appearance: "White lyophilized powder",
      solubility: "Soluble in sterile water",
      storageLyophilized: "−20 °C long term, 2–8 °C short term",
      storageReconstituted: "2–8 °C, use within 21 days",
    },
    about: [
      "Thymosin Alpha-1 is a 28-residue fragment of prothymosin alpha, originally isolated from thymic tissue. Its research history runs longer than almost anything else in this catalog.",
      "It is heavily acidic — nearly a third of its residues are glutamate or aspartate — which is what makes it water-soluble and also what makes the synthesis and purification distinctive.",
      "Unlike most compounds here, it has been studied in genuine clinical settings across several countries, which gives the literature an unusual depth for a research reagent.",
    ],
    benefits: [
      "Full 28-residue acetylated sequence, confirmed by LC-MS against a reference standard.",
      "Studied for T-cell maturation and dendritic-cell signalling in immunology research.",
      "Long international clinical literature relative to other compounds in this catalog.",
      "Cold-chain shipped with a temperature indicator card in every parcel.",
    ],
    science: {
      class: "Acetylated 28-residue prothymosin alpha fragment",
      mechanism:
        "Investigated for Toll-like receptor signalling, T-cell differentiation and maturation, and dendritic-cell activation in immunological models.",
      halfLife: "≈ 2 hours",
      citations: 196,
    },
    lot: "L4G-TA1-2411-C",
    manufactured: "05 Nov 2025",
    retest: "05 Nov 2027",
    purity: "99.22 %",
    coa: coa({
      purity: "99.22 %",
      impurity: "0.31 %",
      water: "4.7 %",
      endotoxin: "< 0.20 EU/mg",
      peptideContent: "86.8 %",
      fill: "10.05 mg",
    }),
    rating: 4.8,
    reviewCount: 297,
    unitsRemaining: 24,
  },
  {
    id: "l4g-pt141",
    slug: "pt-141",
    name: "PT-141",
    synonyms: "Bremelanotide · Cyclic melanocortin agonist",
    category: "Wellness",
    tagline:
      "A cyclic melanocortin-receptor agonist — a ring structure, not a linear chain like everything else here.",
    priceCents: 9900,
    size: "10 mg",
    format: "10 mg lyophilized vial",
    accent: "green",
    badges: ["Cyclic Structure", "Third-Party Verified"],
    residues: [
      "Ac-Nle", "Asp", "His", "D-Phe", "Arg", "Trp", "Lys",
    ],
    oneLetter: null,
    sequenceNote:
      "Cyclized through a lactam bridge between the Asp side chain and the Lys ε-amine: Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH. The ring, not the sequence alone, defines the molecule.",
    chem: {
      formula: "C₅₀H₆₈N₁₄O₁₀",
      molecularWeight: "1025.16 g/mol",
      cas: "189691-06-3",
      appearance: "White to off-white lyophilized powder",
      solubility: "Soluble in sterile water",
      storageLyophilized: "2–8 °C, desiccated, protect from light",
      storageReconstituted: "2–8 °C, use within 30 days",
    },
    about: [
      "PT-141 is a cyclic peptide — the only one in this catalog. A lactam bridge between an aspartate side chain and a lysine ε-amine locks the backbone into a ring.",
      "That constraint is the point. The ring holds the pharmacophore in a fixed conformation, which is what gives it selectivity at melanocortin receptors that a flexible linear chain would not have.",
      "It is a metabolite of Melanotan II, developed specifically to separate the melanocortin-receptor activity from the pigmentation effects.",
      "Because the ring is what matters, our identity testing confirms the cyclized form — a linear impurity would have the same amino acid composition and a different mass.",
    ],
    benefits: [
      "Cyclized form confirmed by mass spec — a linear impurity shares the same composition and is only distinguishable by mass.",
      "Studied at melanocortin MC3R and MC4R receptors in central-pathway research.",
      "Developed from Melanotan II specifically to separate receptor activity from pigmentation effects.",
      "Supplied lyophilized under nitrogen with a full COA in the box.",
    ],
    science: {
      class: "Cyclic heptapeptide melanocortin agonist",
      mechanism:
        "Investigated as a non-selective melanocortin receptor agonist with activity at MC3R and MC4R, acting on central rather than vascular pathways in published models.",
      halfLife: "≈ 2.7 hours",
      citations: 104,
    },
    lot: "L4G-PT1-2410-D",
    manufactured: "26 Oct 2025",
    retest: "26 Oct 2027",
    purity: "99.49 %",
    coa: coa({
      purity: "99.49 %",
      impurity: "0.19 %",
      water: "3.4 %",
      endotoxin: "< 0.15 EU/mg",
      peptideContent: "90.1 %",
      fill: "10.03 mg",
    }),
    rating: 4.8,
    reviewCount: 654,
    unitsRemaining: 35,
  },
];

export const CATEGORIES = [
  "All",
  "Recovery",
  "Growth",
  "Metabolic",
  "Longevity",
  "Cognitive",
  "Wellness",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Same category first, then anything — used for "related" rails. */
export function relatedProducts(product: Product, limit = 3) {
  const sameCategory = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  );
  const rest = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category !== product.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}
