#!/usr/bin/env node
/*
 * Generate WebP siblings for every JPG/PNG in public/textures/.
 *
 * WebP: near-universal browser support (Chrome 32+ / Firefox 65+ / Safari 14+
 * / Edge / iOS 14+ — all ~2020 or older). At quality 85 it's ~30% of JPG size
 * with visually identical results for planet maps + skybox / nebulae. `sharp`
 * gives lossless-alpha handling for RGBA PNGs (earth_lights.png etc.).
 *
 * The script:
 *   1. Walks public/textures recursively.
 *   2. For every .jpg / .jpeg / .png, writes a .webp sibling next to it —
 *      idempotent unless --force is passed.
 *   3. Skips writes when the WebP would be LARGER than the source (rare, but
 *      happens on tiny/already-tiny files) — keeps the JPG path viable.
 *   4. Prints a per-file + total savings summary.
 *
 * The source JPG/PNG stays in place; a follow-up commit swaps paths and drops
 * the originals once we've verified WebP loads across the scene.
 *
 * Run: `node scripts/convert-textures.mjs`  (or `--force` to overwrite).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const TEX_DIR = path.join(ROOT, "public/textures");
const FORCE = process.argv.includes("--force");

/* Non-color maps (normal / bump / spec / roughness) should still be WebP — sharp
   defaults handle both. WebP quality 85 = near-identical to JPG for continuous
   surfaces; kept slightly higher on PNGs (which usually have alpha or lineart). */
const WEBP_JPG = { quality: 85, effort: 5 };
const WEBP_PNG = { quality: 90, effort: 5, alphaQuality: 90 };

const human = (b) =>
  b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1_048_576).toFixed(2)} MB`;

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, files);
    else files.push(full);
  }
  return files;
}

async function run() {
  let all;
  try {
    all = await walk(TEX_DIR);
  } catch (e) {
    console.error(`Could not read ${TEX_DIR}: ${e.message}`);
    process.exit(1);
  }
  const sources = all.filter((f) => /\.(jpe?g|png)$/i.test(f));
  if (!sources.length) {
    console.log("No JPG/PNG textures found under public/textures.");
    return;
  }
  console.log(`Found ${sources.length} textures under public/textures.\n`);

  let totalOld = 0;
  let totalNew = 0;
  let skipped = 0;
  let kept = 0;

  for (const src of sources) {
    const ext = path.extname(src);
    const isPng = ext.toLowerCase() === ".png";
    const outPath = src.replace(/\.(jpe?g|png)$/i, ".webp");
    const rel = path.relative(ROOT, src);

    const srcStat = await fs.stat(src);
    totalOld += srcStat.size;

    if (!FORCE) {
      try {
        await fs.stat(outPath);
        skipped++;
        console.log(`- skip  ${rel}  (webp already present; --force to overwrite)`);
        continue;
      } catch { /* ok — no existing webp */ }
    }

    try {
      const buf = await sharp(src)
        .webp(isPng ? WEBP_PNG : WEBP_JPG)
        .toBuffer();

      /* Guard: keep the JPG path if WebP would be BIGGER (tiny files or already-
         optimized JPGs). Sharp occasionally does this on <20KB assets. */
      if (buf.byteLength >= srcStat.size) {
        kept++;
        totalNew += srcStat.size;
        console.log(`- keep  ${rel}  (webp ${human(buf.byteLength)} ≥ src ${human(srcStat.size)})`);
        continue;
      }

      await fs.writeFile(outPath, buf);
      totalNew += buf.byteLength;
      const pct = ((1 - buf.byteLength / srcStat.size) * 100).toFixed(0);
      console.log(`  wrote ${path.relative(ROOT, outPath).padEnd(46)}  ${human(srcStat.size).padStart(9)}  →  ${human(buf.byteLength).padStart(9)}  (${pct}% smaller)`);
    } catch (e) {
      console.warn(`- fail  ${rel}: ${e.message}`);
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`sources:  ${sources.length}`);
  console.log(`written:  ${sources.length - skipped - kept}`);
  console.log(`skipped:  ${skipped}   (already present)`);
  console.log(`kept:     ${kept}      (webp wasn't smaller)`);
  console.log(`before:   ${human(totalOld).padStart(9)}`);
  console.log(`after:    ${human(totalNew).padStart(9)}   (${((1 - totalNew / totalOld) * 100).toFixed(1)}% savings)`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
