# Portfolio — project guide

A cinematic 3D portfolio ("Stellar") built as a scientifically-accurate solar
system. React + Vite + Three.js (@react-three/fiber v8, drei, postprocessing) +
Lenis + GSAP. The live experience lives under `src/stellar/`.

## Architecture — FOUR parts

From now on the portfolio is divided into **four** parts. Treat these as the
top-level structure for all future work; keep each one's concern separate.

1. **Content** — *My information + the planets'/bodies' information.* The data
   layer and single source of truth: résumé content (`src/content/`), planet &
   anomaly facts (`src/stellar/data/planetFacts.js`), and the normalized body
   registry (`src/stellar/data/bodies.js`, `config/objects.js`,
   `config/destinations.js`, `config/planetData.js`, `config/dwarfPlanets.js`).
   The other three parts are *views over this data* — adding a body or a section
   should be a data edit, not a code change wherever possible.

2. **Solar system model (DEFAULT mode)** — the scroll-tour résumé through the
   accurate solar system. This is what every visitor lands on (`gameMode ===
   "read"`). Mobile + reduced-motion are forced here. Keep it clean and minimal.

3. **Game** — the "Space Explorer" cockpit: free-look (mouse/trackpad) + WASD
   flight, live target scanning, voice command, autopilot. Opt-in via the hero
   "Become a Space Explorer" CTA; desktop-only (`gameMode === "game"`).
   `Scene/GameFlight.jsx` owns the camera here.

4. **Milky Way galaxy overview** — (planned) a galaxy-scale view: pull out from
   the solar system to the Milky Way. Not built yet; design it as a fourth
   top-level mode alongside read/game, reading from the Content layer.

## Hard constraints (do not break)

- **Single postprocessing `mainImage`.** Only ONE custom effect
  (`CinematicGrade`) plus `Bloom`. A second `mainImage` effect merges into the
  EffectPass and renders the whole frame WHITE. Never add a second post pass.
- **`multisampling={0}`** on the EffectComposer — MSAA breaks the additive
  sun/bloom compositing.
- **Scientific accuracy is the prime goal.** Radii, rotation, eccentricity,
  inclination, and 1:1 orbital distances are all real (NASA/JPL). The Sun is the
  one exception: size-capped (a true 109×-Earth Sun would engulf the inner
  orbits), but still the largest body. `AU_UNIT` in `config/destinations.js` sets
  scene-units-per-AU.
- **Reduced-motion + mobile → Read mode** always.

## Workflow

- Personal GitHub account: git-only via the `github.com-personal` SSH alias,
  never the `gh` CLI. Commit locally on the working branch; **push only with
  explicit approval** — no force pushes.
- Dev server is the real gate (the legacy `npm run build`/`lint` are red at
  baseline). Verify changes against the running app (Playwright headless with
  swiftshader works; emulate reduced-motion to skip the slow intro).
