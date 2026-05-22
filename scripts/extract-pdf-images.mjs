// Extract embedded product images from the PDF brochure
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as mupdf from "mupdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const OUT_DIR = path.join(__dirname, "..", "public", "pdf-extract");

fs.mkdirSync(OUT_DIR, { recursive: true });

const data = fs.readFileSync(PDF_PATH);
const doc = mupdf.Document.openDocument(data, "application/pdf");
const pageCount = doc.countPages();
console.log(`PDF has ${pageCount} pages`);

// Extract images by rendering each catalog page (skip cover/index pages)
// Catalog pages: NICHE 2-15, HOMMES 17-36, FEMMES 39-65, ORIENTAUX 68-76
const catalogPages = [];
for (let i = 1; i <= 15; i++) catalogPages.push(i);   // NICHE
for (let i = 17; i <= 36; i++) catalogPages.push(i);  // HOMMES
for (let i = 39; i <= 65; i++) catalogPages.push(i);  // FEMMES
for (let i = 68; i <= 76; i++) catalogPages.push(i);  // ORIENTAUX

let rendered = 0;
for (const pageNum of catalogPages) {
  if (pageNum > pageCount) continue;
  const page = doc.loadPage(pageNum - 1); // 0-indexed
  const pageLabel = String(pageNum).padStart(3, "0");

  try {
    // Render at 3x for high quality product images
    const scale = 3.0;
    const matrix = mupdf.Matrix.scale(scale, scale);
    const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
    const pngData = pixmap.asPNG();
    const outPath = path.join(OUT_DIR, `page-${pageLabel}.png`);
    fs.writeFileSync(outPath, pngData);
    console.log(`  Page ${pageNum}: ${Math.round(pngData.length / 1024)}KB`);
    rendered++;
  } catch (e) {
    console.log(`  Page ${pageNum}: error - ${e.message}`);
  }
}

console.log(`\nDone: ${rendered} pages rendered to ${OUT_DIR}`);
console.log("Next: run crop-products.mjs to extract individual product images");
