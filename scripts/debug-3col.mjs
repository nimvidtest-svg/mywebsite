import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = mupdf.Document.openDocument(data, "application/pdf");

// Page 65 (index 64) has 3 products: HUGO WOMEN, VELVET ORCHID, MOON SPARKLE
const page = doc.loadPage(64);
const st = page.toStructuredText("preserve-images");
const parsed = JSON.parse(st.asJSON());
const imageBlocks = parsed.blocks?.filter(b => b.type === "image") || [];
console.log(`Page 65: ${imageBlocks.length} image blocks`);
imageBlocks.forEach((b, i) => {
  const area = b.bbox ? Math.round(b.bbox.w * b.bbox.h) : 0;
  console.log(`  [${i}] x=${b.bbox?.x?.toFixed(1)}, y=${b.bbox?.y?.toFixed(1)}, w=${b.bbox?.w?.toFixed(1)}, h=${b.bbox?.h?.toFixed(1)}, area=${area}`);
});

// Also check ORIENTAUX page 76 (3 products)
const page76 = doc.loadPage(75);
const st76 = page76.toStructuredText("preserve-images");
const parsed76 = JSON.parse(st76.asJSON());
const imageBlocks76 = parsed76.blocks?.filter(b => b.type === "image") || [];
console.log(`\nPage 76: ${imageBlocks76.length} image blocks`);
imageBlocks76.forEach((b, i) => {
  const area = b.bbox ? Math.round(b.bbox.w * b.bbox.h) : 0;
  console.log(`  [${i}] x=${b.bbox?.x?.toFixed(1)}, y=${b.bbox?.y?.toFixed(1)}, w=${b.bbox?.w?.toFixed(1)}, h=${b.bbox?.h?.toFixed(1)}, area=${area}`);
});
