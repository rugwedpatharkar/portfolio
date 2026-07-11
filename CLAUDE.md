# Portfolio — project guide

A cinematic 3D portfolio ("Stellar") built as a scientifically-accurate solar
system. React 18 + Vite 5 + Three.js 0.163 (`@react-three/fiber` v8, `drei`,
`@react-three/postprocessing`) + Lenis (scroll) + `motion/react`. The live
experience lives under `src/stellar/`.

## Architecture — the layers

1. **Content** — the data layer, the single source of truth: résumé content
   (`src/content/`), planet & anomaly facts (`data/planetFacts.js`,
   `v3/data/planetEditorial.js`), and the normalized body registries
   (`data/bodies.js`, `config/objects.js`, `config/destinations.js`,
   `config/planetData.js`, `config/dwarfPlanets.js`). Adding a body or a
   section should be a data edit wherever possible.

2. **Solar-system tour (the runtime experience)** — a scroll-driven journey
   through the accurate system, from the Sun outward. `Navigator.jsx` (Lenis)
   writes `scrollTRef`; `CameraRig.jsx` reads it each frame and frames the
   active body. Mobile + reduced-motion collapse the fly-through to snaps.

3. **Overlay UI** — `HoloBridge` / `V3Panel` for the résumé content,
   `V3Hud` for the FUI chrome + clickable rail, `V3Reticle` for the tracked
   planet bracket, `V3Editorial` for the per-body info card, `V3Cursor` and
   `V3Hero` for the hero landing.

4. **Milky-Way finale** — scroll past Pluto triggers a "powers-of-ten" cut
   from the AU regime to a light-year regime: the system collapses to the
   Sun among its real neighbours (`LocalNeighborhood`) with the galactic
   band arching overhead (`MilkyWay`), camera pose derived from real
   galactic geometry. Gated by `?finale=1` for standalone preview.

## Hard constraints (do not break)

- **Single postprocessing `mainImage`.** Only ONE custom effect
  (`CinematicGrade`) plus `Bloom`. A second `mainImage` effect merges into the
  EffectPass and renders the whole frame WHITE. Never add a second post pass.
- **`multisampling={0}`** on the EffectComposer — MSAA breaks the additive
  sun/bloom compositing.
- **Scientific accuracy is the prime goal.** Radii, rotation, eccentricity,
  inclination, 1:1 orbital distances, AND the Sun's true ~109×-Earth size are
  all real (NASA/JPL). To fit the colossal true-size Sun, the whole system is
  scaled up: `AU_UNIT` (≈95) in `config/destinations.js` is scene-units-per-AU,
  putting Neptune ~2,900u out and the edge/anomalies ~5,000-6,000u. The one
  remaining compromise: orbital distances *relative to the Sun's radius* are
  compressed — a literal 1:1 would put Neptune ~127,000u away (unnavigable).
  Off-line objects (anomalies, easter-eggs) ride `remapPosition()` so they stay
  at true scale too. Background (skybox/stars/Milky Way), far-clip, and flight
  bounds/speed all scale with the system.
- **Reduced-motion + mobile → snap tour** always (no fly-through).

## Workflow

- Personal GitHub account: git-only via the `github.com-personal` SSH alias,
  never the `gh` CLI. Commit locally on the working branch; **push only with
  explicit approval** — no force pushes.
- Dev server is the real gate. `npm run lint` is green and expected to stay
  green; running `npm run dev` and verifying the affected flow in the browser
  is the source of truth (emulate `prefers-reduced-motion` to skip the intro).
- Texture pipeline: `npm run textures` regenerates .webp siblings; the tour
  loads WebP directly (universal browser support).
