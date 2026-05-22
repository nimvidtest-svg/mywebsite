/**
 * Extract product bottle images from the PDF brochure.
 * Each catalog page has 4 (or 3) product images embedded as XObjects.
 * Product images are at Im7, Im8, Im17, Im18 (determined by size analysis).
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as mupdf from "mupdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH   = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const OUT_DIR    = path.join(__dirname, "..", "public", "perfumes");

fs.mkdirSync(OUT_DIR, { recursive: true });

const fileData = fs.readFileSync(PDF_PATH);
const doc      = new mupdf.PDFDocument(fileData);

// Product image XObject indices (skip Im0=background, Im1-Im6=spray strips, Im9-Im16=decorations)
const PRODUCT_INDICES = [7, 8, 17, 18];

function extractImage(xobjects, imKey) {
  const xobj = xobjects.get(imKey);
  if (!xobj || xobj.isNull()) return null;
  const subtype = xobj.get("Subtype");
  if (!subtype || subtype.toString() !== "/Image") return null;
  const w = Number(xobj.get("Width"));
  const h = Number(xobj.get("Height"));
  if (w < 100 || h < 100) return null; // skip tiny decorative images
  return { xobj, w, h };
}

function range(a, b) {
  const r = [];
  for (let i = a; i <= b; i++) r.push(i);
  return r;
}

const sections = [
  { category: "niche",      pages: range(2, 14) },
  { category: "hommes",     pages: range(17, 36) },
  { category: "femmes",     pages: range(39, 65) },
  { category: "orientaux",  pages: range(68, 76) },
];

const results = [];
let totalSaved = 0;

for (const { category, pages } of sections) {
  let imgNum = 1;
  console.log(`\n=== ${category.toUpperCase()} ===`);
  for (const pageNum of pages) {
    const pageObj   = doc.findPage(pageNum - 1);
    const resources = pageObj.get("Resources");
    if (!resources) continue;
    const xobjects = resources.get("XObject");
    if (!xobjects) continue;

    const pageImages = [];
    for (const k of PRODUCT_INDICES) {
      const info = extractImage(xobjects, `Im${k}`);
      if (!info) continue;
      const { xobj, w, h } = info;

      const filter  = xobj.get("Filter");
      const isJpeg  = filter && filter.toString().includes("DCT");
      const ext     = isJpeg ? "jpg" : "png";
      const fileName = `${category}-${String(imgNum).padStart(3, "0")}.${ext}`;
      const outPath  = path.join(OUT_DIR, fileName);

      try {
        const stream = isJpeg ? xobj.readRawStream() : xobj.readStream();
        const bytes  = Buffer.from(stream.asUint8Array());
        fs.writeFileSync(outPath, bytes);
        pageImages.push(fileName);
        console.log(`  p${pageNum} Im${k} → ${fileName} (${w}×${h}, ${Math.round(bytes.length/1024)}KB)`);
        imgNum++;
        totalSaved++;
      } catch (e) {
        console.log(`  p${pageNum} Im${k}: ${e.message}`);
      }
    }
    if (pageImages.length > 0) {
      results.push({ category, page: pageNum, images: pageImages });
    }
  }
}

const summaryPath = path.join(__dirname, "pdf-image-map.json");
fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
console.log(`\n✓ ${totalSaved} images saved to public/perfumes/`);
console.log(`✓ Map written to scripts/pdf-image-map.json`);
