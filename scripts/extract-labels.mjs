/**
 * Extract product name labels from each catalog page of the PDF.
 * Product names appear as text in the lower portion of each product frame
 * (y > 300 in mupdf structured text coords, where y increases downward).
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as mupdf from "mupdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH  = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";

const fileData = fs.readFileSync(PDF_PATH);
const doc      = mupdf.Document.openDocument(fileData, "application/pdf");

function getPageLabels(pageIdx) {
  const page   = doc.loadPage(pageIdx);
  const st     = page.toStructuredText("preserve-whitespace");
  const parsed = JSON.parse(st.asJSON());

  // Collect ALL text lines with their positions
  const lines = [];
  for (const block of parsed.blocks || []) {
    if (block.type !== "text") continue;
    for (const line of block.lines || []) {
      const text = line.spans?.map(s => s.text || "").join("").trim();
      if (!text || text.length < 2) continue;
      const x = line.bbox?.x ?? 0;
      const y = line.bbox?.y ?? 0;
      lines.push({ text, x, y, w: line.bbox?.w ?? 0 });
    }
  }

  return lines;
}

const SECTIONS = [
  { cat: "niche",     pages: [2, 3, 4, 5] },
  { cat: "hommes",    pages: [17, 18, 25, 36] },
  { cat: "femmes",    pages: [39, 40, 65] },
  { cat: "orientaux", pages: [68, 76] },
];

for (const { cat, pages } of SECTIONS) {
  console.log(`\n=== ${cat.toUpperCase()} ===`);
  for (const pageNum of pages) {
    const lines = getPageLabels(pageNum - 1);
    console.log(`\nPage ${pageNum} text lines:`);
    // Show all lines sorted by y to understand layout
    lines.sort((a, b) => a.y - b.y);
    lines.forEach(l => console.log(`  y=${l.y.toFixed(0)} x=${l.x.toFixed(0)} w=${l.w.toFixed(0)}: "${l.text}"`));
  }
}
