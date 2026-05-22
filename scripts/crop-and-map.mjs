/**
 * Crop individual product images from rendered catalog pages
 * and extract text labels for product name mapping.
 *
 * Strategy:
 * 1. For each catalog page, get all JPEG product images from XObjects
 * 2. Deduplicate: images within 80 PDF pts of each other = same product slot
 * 3. Get the center x-position of each slot, sort left→right
 * 4. Crop that column region from the rendered page PNG
 * 5. Extract the text label below each product frame from the page's structured text
 * 6. Save mapping: label → filename
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import * as mupdf from "mupdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH  = "C:\\Users\\pc\\Downloads\\BROCHURE UNIQUE PARFUM MIN.pdf";
const PAGES_DIR = path.join(__dirname, "..", "public", "pdf-extract");
const OUT_DIR   = path.join(__dirname, "..", "public", "perfumes");

fs.mkdirSync(OUT_DIR, { recursive: true });

const fileData = fs.readFileSync(PDF_PATH);
const pdfDoc   = new mupdf.PDFDocument(fileData);
const viewDoc  = mupdf.Document.openDocument(fileData, "application/pdf");

// ── helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Get all JPEG XObjects with area >= 10000 and their positions from the content stream */
function getProductImages(pageIdx) {
  const pageObj   = pdfDoc.findPage(pageIdx);
  const resources = pageObj.get("Resources");
  if (!resources) return [];
  const xobjects  = resources.get("XObject");
  if (!xobjects)  return [];

  // Collect JPEG images
  const jpegImages = [];
  for (let k = 0; k < 40; k++) {
    const key  = `Im${k}`;
    const xobj = xobjects.get(key);
    if (!xobj || xobj.isNull()) { if (k > 35) break; continue; }
    const subtype = xobj.get("Subtype");
    if (subtype?.toString() !== "/Image") continue;
    const w      = Number(xobj.get("Width"));
    const h      = Number(xobj.get("Height"));
    const filter = xobj.get("Filter");
    if (!filter || !filter.toString().includes("DCT")) continue;
    if (w * h < 10000) continue; // skip tiny labels
    jpegImages.push({ key, w, h, xobj });
  }

  // Parse content stream for positions
  const positions = parseContentStreamPositions(pageObj);

  // Attach x positions
  return jpegImages.map(img => {
    const pos = positions.get(img.key) || { x: 0, y: 0, sx: img.w, sy: img.h };
    const centerX = pos.x + Math.abs(pos.sx) / 2;
    return { ...img, x: pos.x, centerX };
  });
}

function parseContentStreamPositions(pageObj) {
  const positions = new Map();
  try {
    const contents = pageObj.get("Contents");
    if (!contents || contents.isNull()) return positions;
    let text = "";
    if (contents.isStream()) {
      text = contents.readStream().asString();
    } else {
      // Try as array
      for (let i = 0; i < 20; i++) {
        const s = contents.get(i);
        if (!s || s.isNull()) break;
        if (s.isStream()) text += s.readStream().asString() + " ";
      }
    }
    const tokens = text.match(/\/\S+|-?\d+\.?\d*|-?\.\d+|[A-Za-z_]+\*?/g) || [];
    const stack  = [[1,0,0,1,0,0]];
    let nums = [], lastName = null;
    const mul = (ctm, m) => {
      const [a1,b1,c1,d1,e1,f1] = ctm, [a2,b2,c2,d2,e2,f2] = m;
      return [a1*a2+b1*c2, a1*b2+b1*d2, c1*a2+d1*c2, c1*b2+d1*d2,
              e1*a2+f1*c2+e2, e1*b2+f1*d2+f2];
    };
    for (const tok of tokens) {
      if (/^-?[\d.]/.test(tok)) { nums.push(parseFloat(tok)); continue; }
      if (tok.startsWith("/")) { lastName = tok.slice(1); nums = []; continue; }
      if (tok === "cm" && nums.length >= 6) {
        stack[stack.length-1] = mul(stack[stack.length-1], nums.slice(-6));
        nums = []; continue;
      }
      if (tok === "q")  { stack.push([...stack[stack.length-1]]); nums = []; continue; }
      if (tok === "Q")  { if (stack.length > 1) stack.pop(); nums = []; continue; }
      if (tok === "Do" && lastName) {
        const [a,,,,e,f] = stack[stack.length-1];
        positions.set(lastName, { x: e, y: f, sx: a, sy: stack[stack.length-1][3] });
        lastName = null;
      }
      nums = [];
    }
  } catch {}
  return positions;
}

/** Deduplicate product images: group those within 80 PDF pts of each other */
function deduplicateSlots(images) {
  if (images.length === 0) return [];
  const sorted = [...images].sort((a, b) => a.centerX - b.centerX);
  const slots  = [];
  let group    = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].centerX - group[group.length-1].centerX < 100) {
      group.push(sorted[i]);
    } else {
      slots.push(group);
      group = [sorted[i]];
    }
  }
  slots.push(group);

  // For each slot, pick the image with the largest area as the representative
  return slots.map(grp =>
    grp.reduce((best, img) => img.w * img.h > best.w * best.h ? img : best)
  );
}

/** Extract product name labels from the page text (bottom region) */
function getProductLabels(pageIdx, slotCount) {
  try {
    const page = viewDoc.loadPage(pageIdx);
    const st   = page.toStructuredText("preserve-whitespace");
    const parsed = JSON.parse(st.asJSON());
    // Product names are in text blocks near the bottom of the 403pt page
    // In PDF coords (y up), that's y < 100. In structured text JSON, y might be inverted.
    // Grab all text lines and filter by vertical position
    const textLines = [];
    for (const block of parsed.blocks || []) {
      if (block.type !== "text") continue;
      for (const line of block.lines || []) {
        const text = line.spans?.map(s => s.text).join("").trim();
        if (!text || text.length < 2) continue;
        const x = line.bbox?.x ?? 0;
        const y = line.bbox?.y ?? 0;
        // In mupdf structured text, bbox uses page coords (y increases downward from top)
        // Product names appear in lower portion of page (y > 280 in 403pt page at 1pt=1pt)
        if (y > 250) textLines.push({ text, x, y });
      }
    }
    if (textLines.length < slotCount) return [];
    // Sort by x to get left-to-right order
    textLines.sort((a, b) => a.x - b.x);
    // Group text lines into slotCount groups by x position
    // Simple approach: divide the x range into equal parts
    const labels = [];
    // Find natural clusters
    const xPositions = textLines.map(l => l.x);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const step = (maxX - minX) / slotCount;
    for (let i = 0; i < slotCount; i++) {
      const zone = textLines.filter(l =>
        l.x >= minX + i * step - step * 0.4 &&
        l.x <  minX + (i + 1) * step + step * 0.4
      );
      const words = zone.map(l => l.text).join(" ").replace(/\s+/g, " ").trim();
      labels.push(words);
    }
    return labels;
  } catch {
    return [];
  }
}

// ── crop settings (pixels in 3× rendered images) ───────────────────────────
const PAGE_W = 2160, PAGE_H = 1208;
const Y_TOP  = 148,  Y_BTM = 1065;
const CROP_H = Y_BTM - Y_TOP;

// ── catalog sections ─────────────────────────────────────────────────────────
const SECTIONS = [
  { cat: "niche",     pages: range(2, 14)  },
  { cat: "hommes",    pages: range(17, 36) },
  { cat: "femmes",    pages: range(39, 65) },
  { cat: "orientaux", pages: range(68, 76) },
];
function range(a, b) { const r=[]; for(let i=a;i<=b;i++) r.push(i); return r; }

const allMappings = []; // { category, page, col, label, file }
let counters = { niche: 0, hommes: 0, femmes: 0, orientaux: 0 };

for (const { cat, pages } of SECTIONS) {
  console.log(`\n=== ${cat.toUpperCase()} ===`);
  for (const pageNum of pages) {
    const pageIdx  = pageNum - 1;
    const pagePng  = path.join(PAGES_DIR, `page-${String(pageNum).padStart(3,"0")}.png`);
    if (!fs.existsSync(pagePng)) continue;

    const rawImages = getProductImages(pageIdx);
    const slots     = deduplicateSlots(rawImages);
    const n         = slots.length;
    if (n === 0) continue;

    // Sort slots left→right by centerX
    slots.sort((a, b) => a.centerX - b.centerX);

    // Get text labels
    const labels = getProductLabels(pageIdx, n);

    const colW = Math.floor(PAGE_W / n);
    const inset = 6;
    const pageFiles = [];

    for (let col = 0; col < n; col++) {
      counters[cat]++;
      const seq  = counters[cat];
      const file = `${cat}-${String(seq).padStart(3,"0")}.jpg`;
      const outPath = path.join(OUT_DIR, file);

      const cropLeft  = col * colW + inset;
      const cropWidth = colW - inset * 2;

      try {
        await sharp(pagePng)
          .extract({ left: cropLeft, top: Y_TOP, width: cropWidth, height: CROP_H })
          .jpeg({ quality: 90 })
          .toFile(outPath);

        const label = labels[col] || "";
        allMappings.push({ category: cat, page: pageNum, col: col+1, label, file });
        pageFiles.push(`${file}${label ? `[${label}]` : ""}`);
      } catch (e) {
        console.log(`  p${pageNum} col${col+1}: ${e.message}`);
      }
    }
    console.log(`  p${pageNum}(n=${n}): ${pageFiles.join(", ")}`);
  }
}

fs.writeFileSync(
  path.join(__dirname, "image-label-map.json"),
  JSON.stringify(allMappings, null, 2)
);

console.log("\n── Summary ──");
for (const [cat, n] of Object.entries(counters)) console.log(`  ${cat}: ${n}`);
console.log("✓ Saved scripts/image-label-map.json");
