#!/usr/bin/env node
/*
 * Generate AVIF + WebP variants of hero images at multiple widths.
 *
 * High quality (88 / 92): visually identical to the source on a calibrated
 * display, but ~80-95% smaller. The original PNG stays in place as the
 * <picture> fallback, so nothing breaks if AVIF/WebP fail to decode.
 *
 * Outputs go next to the source so existing imports keep working:
 *   public/herobg.png        →  public/herobg-{w}.avif | .webp
 *   public/photo.png         →  public/photo-{w}.avif  | .webp
 *   src/assets/hero-photo.png → src/assets/hero-photo-{w}.avif | .webp
 *
 * Widths target the breakpoints we actually use: 640 (mobile), 1024 (tablet),
 * 1600 (desktop). Past 1600 most viewports just upscale the same 1600 image.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");

/* Only source PNGs land here. The one hero image the app currently uses is
   already shipped as `src/assets/hero-photo-1024.webp` (a pre-optimized WebP);
   no PNG source exists. When a new hero PNG is added, list it here with the
   widths its consumers request. */
const TARGETS = [
  // { src: "src/assets/hero-photo.png", widths: [640, 1024, 1600] },
];

const AVIF = { quality: 70, effort: 6 };
const WEBP = { quality: 88, effort: 6 };

const human = (bytes) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1_048_576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1_048_576).toFixed(2)} MB`;

const stem = (p) => {
  const base = path.basename(p, path.extname(p));
  return { base, dir: path.dirname(p) };
};

async function run() {
  if (TARGETS.length === 0) {
    console.log("no PNG sources listed — nothing to convert.");
    console.log("add entries to TARGETS in this file when new hero PNGs land in src/assets or public.");
    return;
  }
  for (const target of TARGETS) {
    const fullSrc = path.join(ROOT, target.src);
    let srcStat;
    try {
      srcStat = await fs.stat(fullSrc);
    } catch {
      console.warn(`skip ${target.src} — not found`);
      continue;
    }
    console.log(`\n→ ${target.src} (${human(srcStat.size)})`);
    const { base, dir } = stem(target.src);
    const img = sharp(fullSrc).rotate();
    const meta = await img.metadata();
    const sourceW = meta.width || target.widths[target.widths.length - 1];

    for (const w of target.widths) {
      if (w > sourceW) continue;
      const pipeline = sharp(fullSrc).rotate().resize({ width: w, withoutEnlargement: true });

      const avifOut = path.join(ROOT, dir, `${base}-${w}.avif`);
      const webpOut = path.join(ROOT, dir, `${base}-${w}.webp`);

      await pipeline.clone().avif(AVIF).toFile(avifOut);
      await pipeline.clone().webp(WEBP).toFile(webpOut);

      const [a, web] = await Promise.all([fs.stat(avifOut), fs.stat(webpOut)]);
      console.log(
        `   ${w}w  avif ${human(a.size).padStart(8)}   webp ${human(web.size).padStart(8)}`
      );
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
