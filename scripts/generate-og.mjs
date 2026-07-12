#!/usr/bin/env node
/*
 * Generates a static 1200x630 OG card for social previews (LinkedIn, Twitter,
 * Slack, iMessage). Ships as /public/og-image.png. Re-run whenever the hero
 * photo, palette, or headline text changes.
 *
 * Uses the v3 palette + type language (dark canvas + one warm-gold accent,
 * Fraunces-style serif display, editorial minimalism — no v2 purple).
 */

import sharp from "sharp";
import path from "node:path";
import { promises as fs } from "node:fs";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const HERO = path.join(ROOT, "src/assets/hero-photo-1024.webp");
const OUT = path.join(ROOT, "public/og-image.png");

/* v3 tokens (mirrored from src/stellar/v3/tokens.js — keep in sync). */
const BG_VOID = "#050609";
const BG_SURFACE = "#0a0c11";
const LINE = "rgba(255,255,255,0.10)";
const FG = "#f5f7fc";
const FG_DIM = "#b3b9c7";
const FG_MUTE = "#7c8391";
const GOLD = "#e9c675";

const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="18%" cy="30%" r="55%">
      <stop offset="0%"  stop-color="${GOLD}" stop-opacity="0.14"/>
      <stop offset="70%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rightFade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"  stop-color="${BG_VOID}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BG_VOID}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <!-- Canvas + brand glow -->
  <rect width="1200" height="630" fill="${BG_VOID}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Hairline frame (FUI restraint) -->
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="${LINE}" stroke-width="1"/>

  <!-- Kicker mono caption -->
  <text x="72" y="94" fill="${FG_MUTE}" font-family="Geist Mono, ui-monospace, monospace"
        font-size="18" font-weight="400" letter-spacing="6" text-transform="uppercase">
    Rugwed Patharkar
  </text>
  <line x1="72" y1="112" x2="120" y2="112" stroke="${GOLD}" stroke-width="2"/>

  <!-- Fraunces-style serif headline (system serif fallback if Fraunces isn't installed on the render host) -->
  <text x="72" y="260" fill="${FG}" font-family="Fraunces, DM Serif Display, Georgia, serif"
        font-size="88" font-weight="400" letter-spacing="-2">Backend &amp;</text>
  <text x="72" y="360" fill="${GOLD}" font-family="Fraunces, DM Serif Display, Georgia, serif"
        font-size="88" font-weight="400" font-style="italic" letter-spacing="-2">Agentic AI</text>
  <text x="72" y="460" fill="${FG}" font-family="Fraunces, DM Serif Display, Georgia, serif"
        font-size="88" font-weight="400" letter-spacing="-2">Engineer</text>

  <!-- Subheadline: proof, in one line -->
  <text x="72" y="522" fill="${FG_DIM}" font-family="Manrope, system-ui, sans-serif"
        font-size="22" font-weight="400">31-service Python/FastAPI/gRPC platform · LangGraph · Hybrid RAG · 96% p95 cut</text>

  <!-- Footer meta -->
  <text x="72" y="580" fill="${FG_MUTE}" font-family="Geist Mono, ui-monospace, monospace"
        font-size="15" font-weight="400" letter-spacing="3">
    PUNE · INDIA     ·     rugwedpatharkar.vercel.app
  </text>

  <!-- Right-side fade so the composited photo blends into the canvas -->
  <rect x="720" y="0" width="480" height="630" fill="url(#rightFade)"/>
</svg>
`);

async function run() {
  const photo = await sharp(HERO)
    .rotate()
    .resize({ width: 340, height: 440, fit: "cover", position: "top" })
    .png({ quality: 95 })
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: BG_VOID },
  })
    .composite([
      { input: overlay, top: 0, left: 0 },
      { input: photo, top: 95, left: 800 },
    ])
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(OUT);

  const stat = await fs.stat(OUT);
  console.log(`wrote ${path.relative(ROOT, OUT)} — ${(stat.size / 1024).toFixed(1)} KB`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
