/**
 * For each catalog page:
 * 1. Parse the page's PDF content stream to find where each XObject is placed (x position)
 * 2. Identify which XObjects are JPEG product images (via the XObject dictionary)
 * 3. Sort product images left-to-right by x position
 * 4. Output a per-page ordered list of Im keys
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as mupdf from "mupdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH   = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";

const fileData = fs.readFileSync(PDF_PATH);
const doc      = new mupdf.PDFDocument(fileData);

/**
 * Parse a PDF content stream to find the placement position (x coordinate)
 * of each image XObject. Returns Map<imKey, x_position_in_pdf_points>.
 *
 * We look for sequences like:
 *   a b c d e f cm   (e=tx, f=ty)
 *   /ImX Do
 */
function getImagePositions(contentStr) {
  const positions = new Map();

  // Tokenise: numbers, names, operators
  const tokens = contentStr.match(/\/\S+|-?\d+\.?\d*|-?\.\d+|[A-Za-z_]+\*?/g) || [];

  // Track matrix stack; each entry is [a,b,c,d,e,f]
  const stack = [[1,0,0,1,0,0]];
  let nums = [];

  const multiply = (ctm, m) => {
    // CTM * M
    const [a1,b1,c1,d1,e1,f1] = ctm;
    const [a2,b2,c2,d2,e2,f2] = m;
    return [
      a1*a2 + b1*c2,
      a1*b2 + b1*d2,
      c1*a2 + d1*c2,
      c1*b2 + d1*d2,
      e1*a2 + f1*c2 + e2,
      e1*b2 + f1*d2 + f2,
    ];
  };

  let lastNameBefore = null;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (/^-?\d/.test(tok) || /^-?\.\d/.test(tok)) {
      nums.push(parseFloat(tok));
    } else if (tok.startsWith("/")) {
      lastNameBefore = tok.slice(1);
      nums = [];
    } else if (tok === "cm" && nums.length >= 6) {
      const m = nums.slice(-6);
      const cur = stack[stack.length - 1];
      stack[stack.length - 1] = multiply(cur, m);
      nums = [];
    } else if (tok === "q") {
      stack.push([...stack[stack.length - 1]]);
      nums = [];
    } else if (tok === "Q") {
      if (stack.length > 1) stack.pop();
      nums = [];
    } else if (tok === "Do" && lastNameBefore) {
      const ctm = stack[stack.length - 1];
      // Translation is ctm[4], ctm[5]
      positions.set(lastNameBefore, { x: ctm[4], y: ctm[5], sx: ctm[0], sy: ctm[3] });
      lastNameBefore = null;
      nums = [];
    } else {
      nums = [];
    }
  }

  return positions;
}

/** Get content stream text for a page */
function getPageContent(pageObj) {
  const contents = pageObj.get("Contents");
  if (!contents || contents.isNull()) return "";
  try {
    // Contents can be a stream or an array of streams
    if (contents.isStream()) {
      return contents.readStream().asString();
    }
    // Array of streams
    let text = "";
    const len = Number(contents.get("length") ?? 0) || 0;
    for (let i = 0; i < len; i++) {
      const stream = contents.get(i);
      if (stream && stream.isStream()) {
        text += stream.readStream().asString() + " ";
      }
    }
    return text;
  } catch {
    return "";
  }
}

/** Get all image XObjects from a page, return Map<imKey, {w,h,isJpeg}> */
function getPageImages(pageObj) {
  const images = new Map();
  const resources = pageObj.get("Resources");
  if (!resources) return images;
  const xobjects = resources.get("XObject");
  if (!xobjects) return images;

  for (let k = 0; k < 30; k++) {
    const key = `Im${k}`;
    const xobj = xobjects.get(key);
    if (!xobj || xobj.isNull()) { if (k > 25) break; continue; }
    const subtype = xobj.get("Subtype");
    if (subtype?.toString() !== "/Image") continue;
    const w = Number(xobj.get("Width"));
    const h = Number(xobj.get("Height"));
    const filter = xobj.get("Filter");
    const isJpeg = filter && filter.toString().includes("DCT");
    images.set(key, { w, h, isJpeg, xobj });
  }
  return images;
}

// Catalog pages by section
const sections = [
  { category: "niche",     pages: [...range(2,14)] },
  { category: "hommes",    pages: [...range(17,36)] },
  { category: "femmes",    pages: [...range(39,65)] },
  { category: "orientaux", pages: [...range(68,76)] },
];

function* range(a,b) { for (let i=a; i<=b; i++) yield i; }

const pageMap = [];

for (const { category, pages } of sections) {
  for (const pageNum of pages) {
    const pageObj = doc.findPage(pageNum - 1);
    const allImages = getPageImages(pageObj);

    // Filter to product images: JPEG and area >= 10000 (excludes tiny labels like 126×35)
    const productImages = [...allImages.entries()]
      .filter(([,v]) => v.isJpeg && v.w * v.h >= 10000);

    if (productImages.length === 0) {
      // console.log(`  [${category}] p${pageNum}: no product images found`);
      continue;
    }

    // Get content stream to determine x-positions
    const content = getPageContent(pageObj);
    const positions = getImagePositions(content);

    // Attach positions and sort left-to-right
    const withPos = productImages.map(([key, info]) => {
      const pos = positions.get(key) || { x: 0, y: 0 };
      return { key, ...info, x: pos.x, y: pos.y };
    }).sort((a, b) => a.x - b.x);

    pageMap.push({ category, page: pageNum, products: withPos.map(p => p.key) });
    console.log(`  [${category}] p${pageNum}: ${withPos.map(p => `${p.key}(x=${p.x.toFixed(0)})`).join(', ')}`);
  }
}

const outPath = path.join(__dirname, "page-product-map.json");
fs.writeFileSync(outPath, JSON.stringify(pageMap, null, 2));
console.log(`\n✓ Written ${pageMap.length} page entries to ${outPath}`);
