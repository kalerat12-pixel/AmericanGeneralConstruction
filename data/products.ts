/**
 * Hand-edited catalogue. There is no CMS behind this — add, remove or reorder
 * entries here and the shop, PDPs, sitemap and JSON-LD all follow.
 *
 * Copy rules (these are compliance constraints, not style preferences):
 *   • Descriptions stay factual and chemical: sequence, class, form, handling.
 *   • No therapeutic, medical, dosing or outcome claims. Anywhere.
 *   • Categories are deliberately generic so a real catalogue can slot in.
 */

export const CATEGORIES = ['Recovery', 'Metabolic', 'Cosmetic', 'Cognitive'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface ProductSize {
  /** Human-readable fill quantity, e.g. "5 mg". */
  amount: string;
  /** Price in USD. */
  price: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  /** One or two lines. Shown on cards and in metadata. */
  description: string;
  /** Paragraphs for the PDP. Factual and chemical only. */
  longDescription: string[];
  sizes: ProductSize[];
  /** Displayed as a percentage, e.g. 99.1 */
  purity: number;
  /** Lot identifier tied to the linked certificate of analysis. */
  lotNumber: string;
  storage: string;
  /** Path to the certificate of analysis PDF. */
  coaUrl: string;
  /** Additional specification rows rendered on the PDP. */
  specs: { label: string; value: string }[];
  images: { src: string; alt: string }[];
  featured: boolean;
}

export const products: Product[] = [
  {
    id: 'p-001',
    name: 'BPC-157',
    slug: 'bpc-157',
    category: 'Recovery',
    description:
      'A 15-amino-acid synthetic peptide, supplied lyophilised under vacuum in a crimp-sealed amber vial.',
    longDescription: [
      'BPC-157 is a synthetic pentadecapeptide with the sequence Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val. It is produced by solid-phase peptide synthesis and purified by preparative reversed-phase HPLC.',
      'Each vial is filled and lyophilised in a controlled environment, then sealed with a butyl stopper and aluminium crimp. Identity is confirmed by mass spectrometry and purity by analytical RP-HPLC; both results appear on the certificate of analysis for the lot printed on your vial.',
      'Supplied as a white to off-white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '5 mg', price: 62, sku: 'L4G-BPC-005' },
      { amount: '10 mg', price: 108, sku: 'L4G-BPC-010' },
    ],
    purity: 99.2,
    lotNumber: 'L4G-2409-0117',
    storage: 'Store lyophilised at -20 °C, protected from light. Reconstituted material at 2–8 °C.',
    coaUrl: '/coa/bpc-157-L4G-2409-0117.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C62H98N16O22' },
      { label: 'Molecular weight', value: '1419.53 g/mol' },
      { label: 'CAS number', value: '137525-51-0' },
      { label: 'Sequence', value: 'GEPPPGKPADDAGLV' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water, bacteriostatic water' },
    ],
    images: [
      { src: '/images/bpc-157-01.jpg', alt: 'An amber crimp-sealed BPC-157 vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Gly-Glu-Pro peptide backbone drawn faintly across the background' },
      { src: '/images/bpc-157-02.jpg', alt: 'The same BPC-157 vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: true,
  },
  {
    id: 'p-002',
    name: 'TB-500',
    slug: 'tb-500',
    category: 'Recovery',
    description:
      'Synthetic 43-residue fragment analogue, lyophilised and sealed under inert gas.',
    longDescription: [
      'TB-500 is a synthetic peptide corresponding to the active region of thymosin beta-4. It is manufactured by solid-phase synthesis and purified to research grade by preparative HPLC.',
      'Vials are filled gravimetrically, lyophilised, and back-filled with inert gas before crimping. Each lot is assayed for peptide content, purity and residual solvents.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '5 mg', price: 74, sku: 'L4G-TB5-005' },
      { amount: '10 mg', price: 132, sku: 'L4G-TB5-010' },
    ],
    purity: 98.9,
    lotNumber: 'L4G-2409-0204',
    storage: 'Store lyophilised at -20 °C. Avoid repeated freeze-thaw cycles.',
    coaUrl: '/coa/tb-500-L4G-2409-0204.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C212H350N56O78S' },
      { label: 'Molecular weight', value: '4963.44 g/mol' },
      { label: 'CAS number', value: '77591-33-4' },
      { label: 'Sequence', value: 'Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water, bacteriostatic water' },
    ],
    images: [
      { src: '/images/tb-500-01.jpg', alt: 'An amber crimp-sealed TB-500 vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Ser-Asp-Lys peptide backbone drawn faintly across the background' },
      { src: '/images/tb-500-02.jpg', alt: 'The same TB-500 vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: true,
  },
  {
    id: 'p-003',
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    category: 'Metabolic',
    description:
      'Synthetic pentapeptide, supplied lyophilised with a certificate of analysis per lot.',
    longDescription: [
      'Ipamorelin is a synthetic pentapeptide with the sequence Aib-His-D-2-Nal-D-Phe-Lys-NH2. It is produced by solid-phase synthesis and purified by preparative reversed-phase HPLC.',
      'Identity is confirmed by ESI-MS and purity determined by analytical HPLC at 214 nm. Results for the lot on your vial are published in the certificate archive.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '5 mg', price: 58, sku: 'L4G-IPA-005' },
      { amount: '10 mg', price: 99, sku: 'L4G-IPA-010' },
    ],
    purity: 99.4,
    lotNumber: 'L4G-2408-0331',
    storage: 'Store lyophilised at -20 °C, protected from light and moisture.',
    coaUrl: '/coa/ipamorelin-L4G-2408-0331.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C38H49N9O5' },
      { label: 'Molecular weight', value: '711.85 g/mol' },
      { label: 'CAS number', value: '170851-70-4' },
      { label: 'Sequence', value: 'Aib-His-D-2-Nal-D-Phe-Lys-NH2' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water, bacteriostatic water' },
    ],
    images: [
      { src: '/images/ipamorelin-01.jpg', alt: 'An amber crimp-sealed Ipamorelin vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Aib-His-D-Nal peptide backbone drawn faintly across the background' },
      { src: '/images/ipamorelin-02.jpg', alt: 'The same Ipamorelin vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: true,
  },
  {
    id: 'p-004',
    name: 'CJC-1295 (no DAC)',
    slug: 'cjc-1295-no-dac',
    category: 'Metabolic',
    description:
      'Modified 29-amino-acid GRF analogue without the drug affinity complex, lyophilised.',
    longDescription: [
      'CJC-1295 without DAC, also catalogued as Mod GRF (1-29), is a 29-residue analogue of growth hormone releasing factor carrying four amino acid substitutions relative to the native sequence.',
      'Manufactured by solid-phase peptide synthesis and purified by preparative HPLC. Each lot is characterised by mass spectrometry and analytical HPLC before release.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '2 mg', price: 46, sku: 'L4G-CJC-002' },
      { amount: '5 mg', price: 88, sku: 'L4G-CJC-005' },
    ],
    purity: 98.7,
    lotNumber: 'L4G-2409-0088',
    storage: 'Store lyophilised at -20 °C. Reconstituted material at 2–8 °C, used within 30 days.',
    coaUrl: '/coa/cjc-1295-no-dac-L4G-2409-0088.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C152H252N44O42' },
      { label: 'Molecular weight', value: '3367.95 g/mol' },
      { label: 'CAS number', value: '863288-34-0' },
      { label: 'Sequence', value: 'YADAIFTNSYRKVLGQLSARKLLQDIMSR-NH2' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water, bacteriostatic water' },
    ],
    images: [
      { src: '/images/cjc-1295-no-dac-01.jpg', alt: 'An amber crimp-sealed CJC-1295 (no DAC) vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Tyr-Ala-Asp peptide backbone drawn faintly across the background' },
      { src: '/images/cjc-1295-no-dac-02.jpg', alt: 'The same CJC-1295 (no DAC) vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: false,
  },
  {
    id: 'p-005',
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    category: 'Cosmetic',
    description:
      'Copper tripeptide-1 complex, supplied as a deep blue lyophilised powder.',
    longDescription: [
      'GHK-Cu is the copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine. It is supplied as a lyophilised powder with a characteristic deep blue colour arising from the copper coordination.',
      'Copper content is verified by ICP-MS and peptide purity by analytical reversed-phase HPLC. Both figures are recorded on the certificate of analysis for the lot.',
      'Supplied for laboratory and formulation research use only.',
    ],
    sizes: [
      { amount: '50 mg', price: 54, sku: 'L4G-GHK-050' },
      { amount: '100 mg', price: 92, sku: 'L4G-GHK-100' },
      { amount: '200 mg', price: 158, sku: 'L4G-GHK-200' },
    ],
    purity: 99.0,
    lotNumber: 'L4G-2407-0455',
    storage: 'Store lyophilised at -20 °C, protected from light. Hygroscopic.',
    coaUrl: '/coa/ghk-cu-L4G-2407-0455.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C14H22CuN6O4' },
      { label: 'Molecular weight', value: '401.91 g/mol' },
      { label: 'CAS number', value: '89030-95-5' },
      { label: 'Sequence', value: 'Gly-His-Lys · Cu(II)' },
      { label: 'Appearance', value: 'Deep blue lyophilised powder' },
      { label: 'Solubility', value: 'Water' },
    ],
    images: [
      { src: '/images/ghk-cu-01.jpg', alt: 'A clear flint crimp-sealed GHK-Cu vial standing on a warm studio sweep, with a deep blue lyophilised cake settled in the base and the Gly-His-Lys peptide backbone drawn faintly across the background' },
      { src: '/images/ghk-cu-02.jpg', alt: 'The same GHK-Cu vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: true,
  },
  {
    id: 'p-006',
    name: 'GHK',
    slug: 'glycine-tripeptide-3',
    category: 'Cosmetic',
    description:
      'Uncomplexed glycyl-L-histidyl-L-lysine tripeptide, lyophilised and sealed.',
    longDescription: [
      'GHK is the tripeptide glycyl-L-histidyl-L-lysine supplied without copper coordination. It is produced by solid-phase synthesis and purified by preparative reversed-phase HPLC.',
      'Each lot is released against identity by mass spectrometry, purity by analytical HPLC, and water content by Karl Fischer titration.',
      'Supplied for laboratory and formulation research use only.',
    ],
    sizes: [
      { amount: '10 mg', price: 38, sku: 'L4G-GHKF-010' },
      { amount: '50 mg', price: 96, sku: 'L4G-GHKF-050' },
    ],
    purity: 99.5,
    lotNumber: 'L4G-2408-0512',
    storage: 'Store lyophilised at -20 °C in a tightly sealed container.',
    coaUrl: '/coa/glycine-tripeptide-3-L4G-2408-0512.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C14H24N6O4' },
      { label: 'Molecular weight', value: '340.38 g/mol' },
      { label: 'CAS number', value: '49557-75-7' },
      { label: 'Sequence', value: 'Gly-His-Lys' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water' },
    ],
    images: [
      { src: '/images/glycine-tripeptide-3-01.jpg', alt: 'An amber crimp-sealed GHK vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Gly-His-Lys peptide backbone drawn faintly across the background' },
      { src: '/images/glycine-tripeptide-3-02.jpg', alt: 'The same GHK vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: false,
  },
  {
    id: 'p-007',
    name: 'AOD-9604',
    slug: 'aod-9604',
    category: 'Metabolic',
    description:
      'Synthetic 15-residue fragment analogue of human growth hormone, lyophilised.',
    longDescription: [
      'AOD-9604 is a synthetic peptide corresponding to residues 176–191 of human growth hormone with an added tyrosine at the N-terminus. It is produced by solid-phase synthesis.',
      'Purification is by preparative reversed-phase HPLC. Identity and purity for each lot are confirmed by ESI-MS and analytical HPLC respectively.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '2 mg', price: 52, sku: 'L4G-AOD-002' },
      { amount: '5 mg', price: 104, sku: 'L4G-AOD-005' },
    ],
    purity: 98.6,
    lotNumber: 'L4G-2409-0139',
    storage: 'Store lyophilised at -20 °C, protected from light.',
    coaUrl: '/coa/aod-9604-L4G-2409-0139.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C78H123N23O23S2' },
      { label: 'Molecular weight', value: '1815.08 g/mol' },
      { label: 'CAS number', value: '221231-10-3' },
      { label: 'Sequence', value: 'YLRIVQCRSVEGSCGF' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water, bacteriostatic water' },
    ],
    images: [
      { src: '/images/aod-9604-01.jpg', alt: 'An amber crimp-sealed AOD-9604 vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Tyr-Leu-Arg peptide backbone drawn faintly across the background' },
      { src: '/images/aod-9604-02.jpg', alt: 'The same AOD-9604 vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: false,
  },
  {
    id: 'p-008',
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    category: 'Metabolic',
    description:
      'Trans-3-hexenoyl modified GRF (1-44) analogue, supplied lyophilised.',
    longDescription: [
      'Tesamorelin is a 44-amino-acid analogue of human growth hormone releasing factor bearing a trans-3-hexenoyl group on the N-terminal tyrosine.',
      'Manufactured by solid-phase peptide synthesis and purified by preparative HPLC. Each lot is characterised by mass spectrometry, analytical HPLC and Karl Fischer water determination.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '2 mg', price: 96, sku: 'L4G-TES-002' },
      { amount: '5 mg', price: 198, sku: 'L4G-TES-005' },
    ],
    purity: 98.4,
    lotNumber: 'L4G-2408-0277',
    storage: 'Store lyophilised at -20 °C. Protect from light and moisture.',
    coaUrl: '/coa/tesamorelin-L4G-2408-0277.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C221H366N72O67S' },
      { label: 'Molecular weight', value: '5135.85 g/mol' },
      { label: 'CAS number', value: '218949-48-5' },
      { label: 'Sequence', value: 'Hexenoyl-YADAIFTNSYRKVLGQLSARKLLQDIMSRQQGESNQERGARARL-NH2' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water, bacteriostatic water' },
    ],
    images: [
      { src: '/images/tesamorelin-01.jpg', alt: 'An amber crimp-sealed Tesamorelin vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Tyr-Ala-Asp peptide backbone drawn faintly across the background' },
      { src: '/images/tesamorelin-02.jpg', alt: 'The same Tesamorelin vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: false,
  },
  {
    id: 'p-009',
    name: 'Semax',
    slug: 'semax',
    category: 'Cognitive',
    description:
      'Synthetic heptapeptide ACTH (4-7) analogue with a C-terminal Pro-Gly-Pro extension.',
    longDescription: [
      'Semax is a synthetic heptapeptide with the sequence Met-Glu-His-Phe-Pro-Gly-Pro, derived from the ACTH (4-7) fragment with a proline-glycine-proline extension.',
      'Produced by solid-phase synthesis and purified by preparative reversed-phase HPLC. Identity is confirmed by ESI-MS and purity by analytical HPLC.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '10 mg', price: 68, sku: 'L4G-SEM-010' },
      { amount: '30 mg', price: 168, sku: 'L4G-SEM-030' },
    ],
    purity: 99.1,
    lotNumber: 'L4G-2409-0061',
    storage: 'Store lyophilised at -20 °C, protected from light.',
    coaUrl: '/coa/semax-L4G-2409-0061.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C37H51N9O10S' },
      { label: 'Molecular weight', value: '813.93 g/mol' },
      { label: 'CAS number', value: '80714-61-0' },
      { label: 'Sequence', value: 'MEHFPGP' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water' },
    ],
    images: [
      { src: '/images/semax-01.jpg', alt: 'An amber crimp-sealed Semax vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Met-Glu-His peptide backbone drawn faintly across the background' },
      { src: '/images/semax-02.jpg', alt: 'The same Semax vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: true,
  },
  {
    id: 'p-010',
    name: 'Selank',
    slug: 'selank',
    category: 'Cognitive',
    description:
      'Synthetic heptapeptide analogue of tuftsin with a Pro-Gly-Pro extension.',
    longDescription: [
      'Selank is a synthetic heptapeptide with the sequence Thr-Lys-Pro-Arg-Pro-Gly-Pro, an analogue of the endogenous tetrapeptide tuftsin.',
      'Manufactured by solid-phase peptide synthesis, purified by preparative HPLC, and released against identity, purity and water content specifications.',
      'Supplied as a white lyophilised powder. Sold for laboratory research use only.',
    ],
    sizes: [
      { amount: '10 mg', price: 72, sku: 'L4G-SLK-010' },
      { amount: '30 mg', price: 178, sku: 'L4G-SLK-030' },
    ],
    purity: 98.8,
    lotNumber: 'L4G-2408-0190',
    storage: 'Store lyophilised at -20 °C in a sealed container.',
    coaUrl: '/coa/selank-L4G-2408-0190.pdf',
    specs: [
      { label: 'Molecular formula', value: 'C33H57N11O9' },
      { label: 'Molecular weight', value: '751.88 g/mol' },
      { label: 'CAS number', value: '129954-34-3' },
      { label: 'Sequence', value: 'TKPRPGP' },
      { label: 'Appearance', value: 'White lyophilised powder' },
      { label: 'Solubility', value: 'Water' },
    ],
    images: [
      { src: '/images/selank-01.jpg', alt: 'An amber crimp-sealed Selank vial standing on a warm studio sweep, with a white lyophilised cake settled in the base and the Thr-Lys-Pro peptide backbone drawn faintly across the background' },
      { src: '/images/selank-02.jpg', alt: 'The same Selank vial turned slightly, showing the champagne flip-top, the fluted aluminium collar and the lot label' },
    ],
    featured: false,
  },
];

/* ---------------- helpers ---------------- */

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const featuredProducts = () => products.filter((p) => p.featured);

export const productsByCategory = (category: Category) =>
  products.filter((p) => p.category === category);

export const categoryCounts = () =>
  CATEGORIES.map((c) => ({ category: c, count: productsByCategory(c).length }));

/** Lowest listed price, used for cards and JSON-LD offer ranges. */
export const fromPrice = (p: Product) => Math.min(...p.sizes.map((s) => s.price));

export const relatedProducts = (p: Product, limit = 3) =>
  products
    .filter((o) => o.id !== p.id)
    .sort((a, b) => {
      const rank = (x: typeof a) => (x.category === p.category ? 0 : 1);
      return rank(a) - rank(b);
    })
    .slice(0, limit);
