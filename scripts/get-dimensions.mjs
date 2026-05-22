import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = mupdf.Document.openDocument(data, "application/pdf");

// Get dimensions of first few pages
for (let i = 0; i < 5; i++) {
  const page = doc.loadPage(i);
  const bounds = page.getBounds();
  const scale = 3.0;
  const matrix = mupdf.Matrix.scale(scale, scale);
  const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
  console.log(`Page ${i+1}: PDF bounds [${bounds.map(v => Math.round(v)).join(',')}], rendered ${pixmap.getWidth()}x${pixmap.getHeight()}px`);
}
