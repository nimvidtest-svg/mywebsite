import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

// Extract specific images from various pages to understand their content
const tests = [
  { pageIdx: 19, key: "Im3", label: "hommes-p20-Im3" },  // HOMMES p20 suspicious "product"
  { pageIdx: 16, key: "Im3", label: "hommes-p17-Im3" },  // HOMMES p17 known product
  { pageIdx: 16, key: "Im22", label: "hommes-p17-Im22" }, // HOMMES p17 suspicious 155x209
  { pageIdx: 38, key: "Im3", label: "femmes-p39-Im3" },  // FEMMES p39 suspicious
  { pageIdx: 38, key: "Im15", label: "femmes-p39-Im15" }, // FEMMES p39 known product
];

for (const { pageIdx, key, label } of tests) {
  const pageObj = doc.findPage(pageIdx);
  const resources = pageObj.get("Resources");
  const xobjects = resources.get("XObject");
  const xobj = xobjects.get(key);
  if (!xobj || xobj.isNull()) { console.log(`${label}: not found`); continue; }

  const w = Number(xobj.get("Width"));
  const h = Number(xobj.get("Height"));
  const filter = xobj.get("Filter");
  const isJpeg = filter && filter.toString().includes("DCT");

  try {
    const stream = isJpeg ? xobj.readRawStream() : xobj.readStream();
    const bytes = Buffer.from(stream.asUint8Array());
    const ext = isJpeg ? "jpg" : "png";
    fs.writeFileSync(`C:\\Users\\pc\\Desktop\\Nouveau dossier (2)\\public\\pdf-extract\\debug-${label}.${ext}`, bytes);
    console.log(`${label}: ${w}x${h} ${isJpeg?"JPEG":"PNG"} ${Math.round(bytes.length/1024)}KB → saved`);
  } catch(e) {
    console.log(`${label}: error - ${e.message}`);
  }
}
