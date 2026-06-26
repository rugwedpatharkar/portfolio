# PHASE 6 — Milky Way Galaxy Mode
*Pull out from the solar system to a galaxy-scale overview, reading the Content layer.*
**Plan Part VI · the 4th top-level mode (stretch)**

## Goal
A new top-level mode (`gameMode === "galaxy"`) alongside `read` / `game` (and `overview`). Zoom out
from the Sol system to a galaxy-scale Milky Way, place the Sun in a real spiral arm (Orion Spur),
and let the deep-sky catalog (Phase 4) become navigable at galactic scale.

## Approach (gets its own deep-plan when reached)
- **Scale transition** — a smooth pull-back from the system to the galaxy (camera + LOD swap), not a
  hard cut. The existing `wide`/overview camera machinery (`wideRef`, `OverviewMap`) is the closest
  precedent to extend.
- **Galaxy render** — reuse `MilkyWay.jsx` (the band) as the basis; add a top-down/oblique galactic
  disk with spiral arms (instanced star points + dust lanes), the Sun's position marked, and
  navigable deep-sky markers (nebulae, clusters, the black holes, the cosmic-web objects from Phase 4).
- **Content-driven** — galactic objects come from the same registry; selecting one can fly back down
  into the system or to a deep-field framing.
- **Mode plumbing** — extend the `mode` state machine in `StellarApp.jsx`; a clean entry (a "zoom
  out" control / key) and exit (back to the system). Reduced-motion → static galaxy overview.

## Files (TBD at deep-plan time)
- Modify: `StellarApp.jsx` (mode), `Scene/index.jsx` (galaxy mount), `CameraRig.jsx` (galaxy framing),
  `MilkyWay.jsx` (upgrade to a navigable disk). New: `Scene/Galaxy.jsx`, `GalaxyMap.jsx`.

## Verification
- Smooth system→galaxy scale transition; the Sun sits in the correct arm; deep-sky objects navigable;
  reads the Content layer; reduced-motion → static; no white frame; perf holds (instanced disk).

## Note
This is a **stretch** — sequence it after Phases 1–5 are shipped, unless the user wants the galaxy
"wow" earlier. It will get a dedicated deep-plan + mockups before build.
