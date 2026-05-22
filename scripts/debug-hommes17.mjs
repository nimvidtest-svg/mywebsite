import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

for (const [label, pageIdx] of [["HOMMES p17", 16], ["HOMMES p18", 17], ["HOMMES p20", 19]]) {
  console.log(`\n=== ${label} ===`);
  const pageObj = doc.findPage(pageIdx);
  const resources = pageObj.get("Resources");
  const xobjects = resources.get("XObject");

  for (let k = 0; k < 35; k++) {
    const xobj = xobjects.get(`Im${k}`);
    if (!xobj || xobj.isNull()) { if (k > 30) break; continue; }
    const subtype = xobj.get("Subtype");
    if (subtype?.toString() !== "/Image") continue;
    const w = Number(xobj.get("Width"));
    const h = Number(xobj.get("Height"));
    const filter = xobj.get("Filter");
    const isJpeg = filter && filter.toString().includes("DCT");
    const area = w * h;
    console.log(`  Im${k}: ${w}x${h} area=${area} [${isJpeg ? "JPEG" : "PNG"}]`);
  }
}
