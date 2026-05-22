// Extract embedded images from PDF XObjects
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as mupdf from "mupdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const OUT_DIR = path.join(__dirname, "..", "public", "pdf-xobjects");
fs.mkdirSync(OUT_DIR, { recursive: true });

const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

// Test on page 2 (index 1)
for (let pageIdx = 1; pageIdx <= 3; pageIdx++) {
  const pageObj = doc.findPage(pageIdx);
  const resources = pageObj.get("Resources");
  if (!resources) { console.log(`Page ${pageIdx+1}: no resources`); continue; }

  const xobjects = resources.get("XObject");
  if (!xobjects) { console.log(`Page ${pageIdx+1}: no XObjects`); continue; }

  // Iterate by key names (Im0, Im1, etc.)
  let found = 0;
  for (let k = 0; k < 20; k++) {
    const key = `Im${k}`;
    const xobj = xobjects.get(key);
    if (!xobj || xobj.isNull()) break;

    const subtype = xobj.get("Subtype");
    const subtypeStr = subtype ? subtype.toString() : "?";
    console.log(`Page ${pageIdx+1} ${key}: subtype=${subtypeStr}`);

    if (subtypeStr === "/Image") {
      const w = xobj.get("Width");
      const h = xobj.get("Height");
      console.log(`  Size: ${w}x${h}`);

      // Try to extract the image stream
      try {
        const imageObj = doc.getObject(xobj);
        const stream = imageObj.readStream();
        const filter = xobj.get("Filter");
        console.log(`  Filter: ${filter}`);

        // Save raw stream
        const ext = filter && filter.toString().includes("DCT") ? "jpg" : "bin";
        const outPath = path.join(OUT_DIR, `page${pageIdx+1}-${key}.${ext}`);
        fs.writeFileSync(outPath, Buffer.from(stream));
        console.log(`  Saved: ${path.basename(outPath)} (${Math.round(stream.length/1024)}KB)`);
        found++;
      } catch (e) {
        console.log(`  Error extracting: ${e.message}`);
      }
    }
  }
  console.log(`Page ${pageIdx+1}: found ${found} images`);
}
