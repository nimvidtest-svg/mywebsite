import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

// Page 65 (index 64) - 3 product page
const pageObj = doc.findPage(64);
const resources = pageObj.get("Resources");
const xobjects = resources.get("XObject");

console.log("Page 65 XObjects:");
for (let k = 0; k < 30; k++) {
  const xobj = xobjects.get(`Im${k}`);
  if (!xobj || xobj.isNull()) {
    if (k > 20) break;
    continue;
  }
  const subtype = xobj.get("Subtype");
  if (subtype?.toString() !== "/Image") continue;
  const w = Number(xobj.get("Width"));
  const h = Number(xobj.get("Height"));
  console.log(`  Im${k}: ${w}x${h}`);
}

// Also check Form XObjects
console.log("\nForm XObjects:");
for (let k = 0; k < 30; k++) {
  const xobj = xobjects.get(`Fm${k}`);
  if (!xobj || xobj.isNull()) {
    if (k > 5) break;
    continue;
  }
  console.log(`  Fm${k}: ${xobj.get("Subtype")}`);
}
