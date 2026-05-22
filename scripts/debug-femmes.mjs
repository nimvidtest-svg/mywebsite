import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

// Compare a FEMMES 4-product page (39) with a NICHE 4-product page (2)
for (const [label, pageIdx] of [["FEMMES p39 (4 products)", 38], ["FEMMES p41 (products)", 40], ["NICHE p2 (4 products)", 1]]) {
  const pageObj = doc.findPage(pageIdx);
  const resources = pageObj.get("Resources");
  const xobjects = resources.get("XObject");

  console.log(`\n=== ${label} ===`);
  for (let k = 0; k < 25; k++) {
    const xobj = xobjects.get(`Im${k}`);
    if (!xobj || xobj.isNull()) {
      if (k > 20) break;
      continue;
    }
    const subtype = xobj.get("Subtype");
    if (subtype?.toString() !== "/Image") continue;
    const w = Number(xobj.get("Width"));
    const h = Number(xobj.get("Height"));
    const filter = xobj.get("Filter");
    const isJpeg = filter && filter.toString().includes("DCT");
    console.log(`  Im${k}: ${w}x${h} [${isJpeg ? "JPEG" : "other"}]`);
  }
}
