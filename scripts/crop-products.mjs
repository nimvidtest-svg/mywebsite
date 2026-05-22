/**
 * Crop individual product images from the rendered catalog pages.
 *
 * Each catalog page is 2160x1208 px at 3x scale (720x403 PDF pts × 3).
 * Products are arranged in 3 or 4 equal columns.
 * We crop the inner product area (excluding page title at top, product name at bottom).
 *
 * Crop regions (in pixels):
 *   - Title area: y = 0..155
 *   - Product image area: y = 155..1050
 *   - Product name area: y = 1050..1208
 *   - 4-col: columns at x = 0..540, 540..1080, 1080..1620, 1620..2160
 *   - 3-col: columns at x = 0..720, 720..1440, 1440..2160
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import * as mupdf from "mupdf";

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR   = path.join(__dirname, "..", "public", "pdf-extract");
const OUT_DIR     = path.join(__dirname, "..", "public", "perfumes");
const PAGE_MAP    = JSON.parse(fs.readFileSync(path.join(__dirname, "page-product-map.json"), "utf8"));

// Build a set of { category, page, count } for easy lookup
// Count = number of products on this page (from page-product-map.json)
const pageInfo = new Map(PAGE_MAP.map(p => [`${p.category}-${p.page}`, p.products.length]));

// Get the perfume data to build slug names
const PDF_PATH = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const fileData = fs.readFileSync(PDF_PATH);
const doc      = new mupdf.PDFDocument(fileData);

function slugify(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Crop parameters
const PAGE_W  = 2160;
const PAGE_H  = 1208;
const Y_TOP   = 145;   // start of product area (below title)
const Y_BTM   = 1060;  // end of product area (above product name)
const CROP_H  = Y_BTM - Y_TOP;

function getColBounds(n) {
  const w = Math.floor(PAGE_W / n);
  return Array.from({ length: n }, (_, i) => ({ x: i * w, w }));
}

// Read page-product-map to know ordering for each page
const pageMap = PAGE_MAP;

// Build ordered product slug list from perfumes.ts (read the data)
// We'll use the content stream positions to determine left→right order (from page-product-map)
// and match against the sequential product list

// Import product data inline (read from perfumes.ts at runtime)
// Instead, just read the slugs from a simpler source: the order we derived
// We'll crop and save as category-NNN.jpg (sequential per category)
// Then separately build the image mapping

let totalCropped = 0;
const output = []; // { category, page, col, file }

for (const { category, page, products } of pageMap) {
  const n = products.length; // number of products on this page
  if (n === 0) continue;

  const pagePng = path.join(PAGES_DIR, `page-${String(page).padStart(3, "0")}.png`);
  if (!fs.existsSync(pagePng)) {
    console.log(`  [${category}] p${page}: page PNG not found`);
    continue;
  }

  const cols = getColBounds(n);
  const pageImages = [];

  for (let col = 0; col < n; col++) {
    const { x, w } = cols[col];
    // Add small inset to avoid frame border
    const inset = 8;
    const cropLeft  = x + inset;
    const cropWidth = w - inset * 2;

    const seqNum    = totalCropped + col + 1;
    const fileName  = `${category}-${String(seqNum).padStart(3, "0")}.jpg`;
    const outPath   = path.join(OUT_DIR, fileName);

    try {
      await sharp(pagePng)
        .extract({ left: cropLeft, top: Y_TOP, width: cropWidth, height: CROP_H })
        .jpeg({ quality: 92 })
        .toFile(outPath);

      pageImages.push(fileName);
    } catch (e) {
      console.log(`  [${category}] p${page} col${col+1}: ${e.message}`);
    }
  }

  if (pageImages.length > 0) {
    totalCropped += pageImages.length;
    output.push({ category, page, images: pageImages });
    console.log(`  [${category}] p${page}: ${pageImages.join(", ")}`);
  }
}

const mapPath = path.join(__dirname, "cropped-image-map.json");
fs.writeFileSync(mapPath, JSON.stringify(output, null, 2));
console.log(`\n✓ ${totalCropped} product images cropped`);
console.log(`✓ Map saved to scripts/cropped-image-map.json`);
