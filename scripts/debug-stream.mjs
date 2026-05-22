import * as fs from "fs";
import * as mupdf from "mupdf";

const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const data = fs.readFileSync(PDF_PATH);
const doc = new mupdf.PDFDocument(data);

const pageObj = doc.findPage(1); // page 2
const resources = pageObj.get("Resources");
const xobjects = resources.get("XObject");
const xobj = xobjects.get("Im7");

console.log("xobj type:", typeof xobj);
console.log("xobj constructor:", xobj?.constructor?.name);

// Check what methods are available
const proto = Object.getPrototypeOf(xobj);
console.log("Available methods:", Object.getOwnPropertyNames(proto));

// Try readStream
try {
  const stream = xobj.readStream();
  console.log("stream type:", typeof stream);
  console.log("stream constructor:", stream?.constructor?.name);
  console.log("stream methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(stream)));
} catch (e) {
  console.log("readStream error:", e.message);
}

// Try readRawStream
try {
  const raw = xobj.readRawStream();
  console.log("raw type:", typeof raw, raw?.constructor?.name);
} catch (e) {
  console.log("readRawStream error:", e.message);
}
