import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = mupdf.Document.openDocument(data, "application/pdf");

// Check page 2 (index 1)
for (let pageIdx of [1, 2, 38]) {
  const page = doc.loadPage(pageIdx);
  const st = page.toStructuredText("preserve-images");
  const parsed = JSON.parse(st.asJSON());
  const imageBlocks = parsed.blocks?.filter(b => b.type === "image") || [];
  console.log(`\nPage ${pageIdx+1}: ${imageBlocks.length} image blocks`);
  imageBlocks.forEach((b, i) => {
    const area = b.bbox ? b.bbox.w * b.bbox.h : 0;
    console.log(`  [${i}] x=${b.bbox?.x?.toFixed(0)}, y=${b.bbox?.y?.toFixed(0)}, w=${b.bbox?.w?.toFixed(0)}, h=${b.bbox?.h?.toFixed(0)}, area=${area.toFixed(0)}`);
  });
}
