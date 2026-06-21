#!/usr/bin/env node
/*
 * Generates a static 1200x630 OG card from the hero photo + brand colors.
 * Run once; ship the PNG in /public so social previews work without an
 * Edge Function. Re-run when you swap the hero photo.
 */

import sharp from "sharp";
import path from "node:path";
import { promises as fs } from "node:fs";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const HERO = path.join(ROOT, "src/assets/hero-photo.png");
const OUT = path.join(ROOT, "public/og-image.png");

const BG = "#050816";
const ACCENT = "#915eff";

// SVG background with brand gradient + headline. The hero photo composites on the right.
const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="15%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="85%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#00cea8" stop-opacity="0.20"/>
      <stop offset="60%" stop-color="#00cea8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>

  <!-- Brand mark + url -->
  <g transform="translate(72, 72)">
    <rect width="36" height="36" rx="10" fill="${ACCENT}"/>
    <text x="52" y="26" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="600" letter-spacing="1">Rugwed Patharkar · Portfolio</text>
  </g>

  <!-- Eyebrow -->
  <text x="72" y="290" fill="#b8a0ff" font-family="sans-serif" font-size="28" font-weight="600" letter-spacing="1">→ Backend &amp; Agentic AI Engineer</text>

  <!-- Headline -->
  <text x="72" y="380" fill="#ffffff" font-family="sans-serif" font-size="74" font-weight="800" letter-spacing="-2">Rugwed Patharkar</text>

  <!-- Subheadline (two lines) -->
  <text x="72" y="450" fill="#dfd9ff" font-family="sans-serif" font-size="28" font-weight="500">31-service Python/FastAPI/gRPC platform on GKE</text>
  <text x="72" y="488" fill="#dfd9ff" font-family="sans-serif" font-size="28" font-weight="500">LangGraph · MCP · Hybrid RAG · 96% p95 latency cut</text>

  <!-- Footer line -->
  <text x="72" y="570" fill="#aaa6c3" font-family="monospace" font-size="22">Pune · India     ·     github.com/rugwedpatharkar</text>
</svg>
`);

async function run() {
  const photo = await sharp(HERO)
    .rotate()
    .resize({ width: 360, height: 460, fit: "cover", position: "top" })
    .png({ quality: 95 })
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: BG },
  })
    .composite([
      { input: overlay, top: 0, left: 0 },
      // Photo positioned right side, vertically centered
      { input: photo, top: 85, left: 770 },
    ])
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(OUT);

  const stat = await fs.stat(OUT);
  console.log(
    `wrote ${path.relative(ROOT, OUT)} — ${(stat.size / 1024).toFixed(1)} KB`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
