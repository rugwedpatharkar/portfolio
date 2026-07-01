# PHASE 8 — The Holo-Bridge
*The portfolio's information, fused with each world's real facts, as a holographic ship scan.*
**Replaces the M2 "lane objects + forced ←→ item-view" direction**

## Why
v1 showed the résumé in a flat side panel; v2 buried it in side "spatial objects" toured with ←→ —
too much friction, and it made the personal info feel secondary to the planets. The Holo-Bridge makes
the info co-equal with the world: the planet centers on the bridge, its real facts project as a
hologram on the LEFT, the résumé section as a hologram on the RIGHT — auto-revealed on arrival,
details-on-demand, never forced traversal.

## The experience
- Camera settles on a CENTERED planet → emitter fires → two holo-panels boot up flanking it.
- **LEFT — Tier A (cold cyan telemetry):** real facts from `PLANET_FACTS[id]` + a spinning wireframe
  **tactical globe** of that planet.
- **RIGHT — Tier B (warm "crew dossier"):** a **bespoke 1-line summary** + a pickable item **cluster**
  by default; **"open full dossier"** expands the rich section in place (reuses the existing renderers).
- Separation by register (cold/mono vs warm/humanist + a `// crew dossier` divider), not tabs.
- No forced ←→: arrow keys / sideways-scroll page the cluster in place; the 3D convoy is retired.

## The four WOW layers (all approved)
1. **Holographic boot-up** — emitter flash, panels assemble line-by-line from scanlines, reticle lock,
   fact values decode/count-in with a sound blip. (DOM/CSS + existing `SoundManager`.)
2. **Living holo material** — scanline drift, RGB-split glitch on flicker, rim glow, multi-layer
   mouse-parallax depth between header/globe/rows. (Pure CSS/SVG; no post pass.)
3. **Planet showcase** — a cyan scan-grid sweeps the planet on lock + slow hero rotation + bloom pulse.
   (In-scene additive; rides the EXISTING Bloom; shaderless or NaN-clamped.)
4. **Signature** — the spinning tactical globe, data conduits pulsing planet→panels, and a bespoke
   per-planet beat (Earth-for-scale at Jupiter, Saturn's rings as the divider, …).
Plus a subtle additive planet micro-tilt toward the cursor (position unchanged — no camera change).

## Decisions (locked)
- Summary copy = **bespoke per-section one-liners** (authored for approval first; new `holoSummary` field).
- ContentPanel = **retire & reuse** (extract `RENDERERS`/`CountUp`/`Stat` → `sectionRenderers.jsx`;
  retire the separate ContentPanel + forced ←→ everywhere; `ItemDossier` reused inside Tier B).
- RM/mobile → single-column stack (identity → facts → story), static, no boot/flicker/parallax.

## Key integration
- Mount replaces the `panelHidden` wrapper at `StellarApp.jsx:696-701`; `itemIdx` repurposed to
  in-panel paging (drop `applyFocus` from `navItem`).
- **Framing-center:** `Scene/index.jsx` `frameShift 0.3→0` — framing-only; the locked camera motion is untouched.
- New `src/stellar/holobridge/*` (HoloBridge, FactsHologram, DossierHologram, HoloFrame, TacticalGlobe,
  DossierCluster, useHoloParallax, useBootReveal, holoTokens) + in-scene
  `Scene/{ScanGrid,DataConduits,HoloEmitter}.jsx` + extracted `src/stellar/sectionRenderers.jsx`.

## Build order (commit + E2E per step; push on approval)
1. Author 12 bespoke `holoSummary` lines (`src/content/index.js`) → approval gate.
2. Extract `sectionRenderers.jsx` (pure move, no behavior change). 3. Framing-center. 4. Static dual
panels with real data; retire ContentPanel mount. 5. Expand/summary + cluster. 6. Retire lane convoy.
7. Boot-up (+ RM/mobile skip). 8. Living material. 9. In-scene showcase. 10. Signature moments.
11. Mobile/RM polish.

## Verification
Planet centered between balanced panels (fly down AND up); facts-left + dossier-right; boot-up settled;
expanded dossier; mobile single-column stack; RM static. E2E desktop/rm/mobile 0 errors, no black/white.

## Note
Depends on Phase 9 tokens/primitives + the Tactical-HUD font for final styling — build the structure
first, then restyle onto the unified system.
