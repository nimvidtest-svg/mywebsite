import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = mupdf.Document.openDocument(data, "application/pdf");

const page = doc.loadPage(1); // page 2

// Check what methods Page has
const proto = Object.getPrototypeOf(page);
console.log("Page methods:", Object.getOwnPropertyNames(proto));

// Try to get structured text with images
try {
  const st = page.toStructuredText("preserve-images");
  console.log("\nStructuredText type:", typeof st);
  const proto2 = Object.getPrototypeOf(st);
  console.log("StructuredText methods:", Object.getOwnPropertyNames(proto2));
  const json = st.asJSON();
  const parsed = JSON.parse(json);
  console.log("\nStructuredText blocks:", parsed.blocks?.length);
  // Find image blocks
  const imageBlocks = parsed.blocks?.filter(b => b.type === "image") || [];
  console.log("Image blocks:", imageBlocks.length);
  imageBlocks.slice(0, 4).forEach((b, i) => {
    console.log(`  Image ${i}: bbox=${JSON.stringify(b.bbox)}, w=${b.width}, h=${b.height}`);
  });
} catch(e) {
  console.log("Error:", e.message);
}
