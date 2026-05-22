// Try to extract embedded images from PDF XObjects
import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

// Test on page 2 (index 1)
const page = doc.loadPage(1);
const pdfPage = doc.addPage([0,0,720,403], 0, {}, "");

// Try to get the page's XObject resources
try {
  const pageObj = doc.findPage(1);
  console.log("pageObj type:", typeof pageObj);

  const resources = pageObj.get("Resources");
  console.log("Resources:", resources ? resources.toString().substring(0, 200) : "none");

  if (resources) {
    const xobjects = resources.get("XObject");
    console.log("XObjects:", xobjects ? "found" : "none");
    if (xobjects) {
      // Iterate XObjects
      const len = xobjects.length;
      console.log("XObject count:", len);
      for (let i = 0; i < Math.min(len, 10); i++) {
        const key = xobjects.getKey(i);
        const val = xobjects.get(key);
        console.log(`  XObject[${i}] key=${key}, type=${val ? val.get("Subtype") : "?"}`);
      }
    }
  }
} catch (e) {
  console.log("Error:", e.message);
}
