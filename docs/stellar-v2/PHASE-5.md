# PHASE 5 — Director's Cut & Rich Effects
*Make every frame cinematic; lock the grade + sound identity; hit 60fps; production-harden.*
**Plan Part V / M5 · the visual WOW**

## Principle
Every "post" effect either **folds into the single `CinematicGrade` `mainImage`** (uniforms) or is an
**in-scene additive mesh** — never a 2nd fullscreen pass (white-frame bug). Bloom stays. Reuse the
GPU-particle and lensing work from Phase 4 where it overlaps.

## In-scene effect upgrades (no new post pass)
- **Volumetric raymarched nebulae** ★★★★★ — replace/augment image-sprite nebulae with 3D FBM-noise
  raymarching + Beer-Lambert absorption + blue-noise dither; in-scene quad/sphere, 64–128 steps,
  ~3–5ms (toggle/quality-tiered). Signature centrepiece.
- **Interstellar black-hole upgrade** ★★★★★ — geodesic raymarch with accretion disk + Doppler
  beaming + photon ring + background-star lensing; adaptive step for mobile. Upgrade the 2 holes.
- **God-rays** ★★★★ — additive cone mesh from the Sun (near-free) OR screen-space folded into grade.
- **Atmospheric scattering (Rayleigh/Mie)** ★★★★ — precomputed LUT (Bruneton) → <1ms; real
  sunrise/sunset on Earth + atmospheric worlds.
- **Ocean sun-glint + animated terminator** ★★★★ (Earth) — Fresnel + moving specular; sharp day/night.
- **Ring + eclipse shadows** ★★★★½ — extend the existing ring-shadow depth material.
- **Procedural gas-giant bands** (Jupiter/Saturn) + **lava/tidal worlds** ★★★½ — fBm latitude bands.
- **Solar convection/granulation + prominences + corona + sunspots** ★★★★.
- **GPU comet tails / accretion streams** ★★★★ (reuse the Phase-4 GPU-burst system).
- **Parallax-occlusion mapping** ★★★★ — close-up surface depth without geometry.

## Fold into the single CinematicGrade pass (uniforms; also power Photo Mode)
chromatic aberration · anamorphic lens-flare · vignette · film grain · **LUT color grade** · depth
fog. All near-free (a few extra texture samples). Driven by uniforms so Photo Mode + the grade
identity share them.

## Director's cut
- **Signature shots** per body — a `CameraRig` framing library (hero angles, dutch tilts, dolly-ins).
- **Grade identity** — tune `CinematicGrade` uniforms for a consistent filmic mood (one LUT).
- **Full sound-design pass** — comm-tones, ambience, per-body cues (extends `SoundManager`).
- **Guided cinematic auto-tours** — Bezier camera paths + optional narration (interactivity §D).

## Performance
LOD + frustum/occlusion culling (InstancedMesh2 + BVH), instancing discipline, adaptive DPR
(`PerformanceMonitor`, `dpr={[1, cap]}`), draw-call budget (<~20), real shadows on 1–2 key lights
only. Quality tiers so the volumetric/black-hole effects degrade gracefully on weak GPUs/mobile.

## Files
- `Scene/CinematicGrade.jsx` (new uniforms for the folded post). New effect components
  (`VolumetricNebula.jsx`, god-rays, atmosphere LUT, ocean, gas-giant material, solar shaders).
  `CameraRig.jsx` (shot library). `sound/SoundManager.js` (sound pass). Perf wiring in `Scene/index.jsx`.

## Effect sources (June 2026)
Maxime Heckel (volumetric raymarching, TSL/WebGPU), David Peicho (clouds), NVIDIA GPU Gems 3 ch.13
(god-rays), Bruneton precomputed scattering (github jeantimex), Three.js Roadmap (black-hole WebGPU,
TSL), Sangil Lee (Saturn), THRASTRO shaders, Three.js Journey (Earth/terrain), jbouny/ocean, Codrops
GPGPU (tympanus 2024-25), ektogamat R3F-Ultimate-Lens-Flare, Harry Alisavakis (LUT), InstancedMesh2
(discourse.threejs.org), Three.js adaptive-DPR (sbcode.net), Bruno Simon / NASA Eyes (signature feel).

## Verification
- 60fps desktop / graceful mobile; no white frame after any change; additive glows bloom; grade
  consistent across bodies; quality tiers degrade cleanly; deploy-ready build still green.
