/**
 * Emits a placeholder certificate of analysis PDF per lot so every COA link on
 * the site resolves. Replace the files in /public/coa with the real
 * certificates as they are issued — the filenames are keyed off the product's
 * `coaUrl`, so nothing else needs to change.
 *
 * Run: npm run gen:coa
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { products } from '../data/products';

const OUT = path.join(process.cwd(), 'public', 'coa');
fs.mkdirSync(OUT, { recursive: true });

const esc = (s: string) => s.replace(/[\\()]/g, (c) => '\\' + c);

/** Minimal single-page PDF writer — enough for a typeset placeholder. */
function pdf(lines: { text: string; size: number; y: number; font: 'H' | 'R'; x?: number }[]) {
  const content =
    lines
      .map(
        (l) =>
          `BT /F${l.font === 'H' ? 1 : 2} ${l.size} Tf 1 0 0 1 ${l.x ?? 62} ${l.y} Tm (${esc(l.text)}) Tj ET`,
      )
      .join('\n') +
    '\n0.788 0.663 0.380 RG 0.8 w 62 726 m 533 726 l S\n' +
    '0.788 0.663 0.380 RG 0.8 w 62 96 m 533 96 l S\n';

  const stream = zlib.deflateSync(Buffer.from(content, 'latin1'));

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    null, // stream object, written separately
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n')];
  const offsets: number[] = [];
  let pos = chunks[0].length;

  objects.forEach((body, i) => {
    const n = i + 1;
    offsets.push(pos);
    let buf: Buffer;
    if (body === null) {
      buf = Buffer.concat([
        Buffer.from(`${n} 0 obj\n<< /Length ${stream.length} /Filter /FlateDecode >>\nstream\n`),
        stream,
        Buffer.from('\nendstream\nendobj\n'),
      ]);
    } else {
      buf = Buffer.from(`${n} 0 obj\n${body}\nendobj\n`);
    }
    chunks.push(buf);
    pos += buf.length;
  });

  const xrefStart = pos;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) xref += `${String(o).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  chunks.push(Buffer.from(xref));

  return Buffer.concat(chunks);
}

for (const p of products) {
  const rows: [string, string][] = [
    ['Material', p.name],
    ['Lot number', p.lotNumber],
    ['Category', p.category],
    ['Appearance', p.specs.find((s) => s.label === 'Appearance')?.value ?? '—'],
    ['Molecular formula', p.specs.find((s) => s.label === 'Molecular formula')?.value ?? '—'],
    ['Molecular weight', p.specs.find((s) => s.label === 'Molecular weight')?.value ?? '—'],
    ['CAS number', p.specs.find((s) => s.label === 'CAS number')?.value ?? '—'],
    ['Purity (RP-HPLC, 214 nm)', `${p.purity.toFixed(1)} %   [spec: >= 98.0 %]`],
    ['Identity (ESI-MS)', 'Conforms   [spec: +/- 1.0 Da]'],
    ['Water content (Karl Fischer)', '4.2 %   [spec: <= 8.0 %]'],
    ['Residual solvents (HS-GC)', 'Conforms   [spec: ICH Q3C]'],
    ['Net peptide content (AAA)', '81.4 %'],
    ['Storage', p.storage],
  ];

  let y = 690;
  const lines: Parameters<typeof pdf>[0] = [
    { text: 'L I F T I N G 4 G A I N S', size: 17, y: 740, font: 'H' },
    { text: 'CERTIFICATE OF ANALYSIS', size: 8, y: 706, font: 'R' },
    { text: p.name, size: 26, y: 664, font: 'H' },
    { text: `Lot ${p.lotNumber}`, size: 9, y: 640, font: 'R' },
  ];
  y = 596;
  for (const [k, v] of rows) {
    lines.push({ text: k, size: 8.5, y, font: 'R' });
    lines.push({ text: String(v).slice(0, 74), size: 9.5, y, font: 'H', x: 250 });
    y -= 30;
  }
  lines.push(
    { text: 'PLACEHOLDER DOCUMENT', size: 8, y: 168, font: 'R' },
    {
      text: 'Sample template only. Replace with the certificate issued by the testing laboratory.',
      size: 9,
      y: 150,
      font: 'H',
    },
    { text: 'RESEARCH USE ONLY - NOT FOR HUMAN CONSUMPTION', size: 8, y: 74, font: 'R' },
  );

  const file = path.basename(p.coaUrl);
  fs.writeFileSync(path.join(OUT, file), pdf(lines));
  console.log('  ✓ public/coa/' + file);
}
