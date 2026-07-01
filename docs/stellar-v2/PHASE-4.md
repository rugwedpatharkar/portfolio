# PHASE 4 — THE LIVING SYSTEM
*Dense with real, beautiful, **learnable** wonders + diegetic sci-fi cameos.*
**Plan Part IV catalog · the content WOW, in waves**

## Principle
**Data-driven first.** Add to `config/objects.js` + `data/bodies.js` + `data/planetFacts.js` +
(for moons) `config/moons.js`. Every real object rides `remapPosition()` at true scale; deep-sky
sits on the deep-field/skybox layer (like the existing Crab / Sgr A* / Tabby's Star). Solar-system
phenomena attach to their parent body. New visuals reuse the effect components from Phase 5 where
they overlap (e.g., a kilonova uses the GPU-burst; an Einstein ring uses the lensing shader).

## What exists (don't duplicate)
8 planets + major moons w/ facts, dwarf planets, asteroid/Kuiper belts, 2 black holes (Gargantua +
Sgr A*), magnetar, pulsar (Morse), brown dwarf, rogue planet, TRAPPIST-1, image-sprite nebulae
(Crab, Pillars/Eagle, Helix, Carina, Orion), 3I/ATLAS, Tabby's Star, Einstein-ring lensing (via
black hole), real star catalogue, Milky Way band, Voyager, Death Star + Star Destroyer eggs.

## Waves (each a live review)

### Wave 1 — highest wow + 2025-26 currency
Neptune's aurora (mid-latitude, JWST 2025) · Saturn's hexagon (+ JWST "dark beads") · Jupiter's
Great Red Spot visual · Io plasma torus + plumes · Enceladus & Europa geysers · a **kilonova** event
(GPU burst + "where gold is born") · a **hypergiant** (Betelgeuse + 2025 companion "Siwarha") · an
**Einstein-ring** lens galaxy · **Eta Carinae** Homunculus · the **2026 eclipses** (Feb 17 annular,
Aug 12 total) · sungrazer **C/2026 A1**.

### Wave 2 — scale & mystery
Cosmic web — **Boötes Void**, **Great Attractor** + Laniakea, Hercules-Corona-Borealis Great Wall ·
**Omega Centauri** (IMBH) · an **FRB** localized burst · **"little red dots"** · a **gravitational-
wave** chirp event (LIGO O4) · Mars **Olympus Mons / Valles Marineris / Jezero "leopard spots"** ·
**Mimas** subsurface ocean (Death-Star wink) · **Titan** methane lakes · **Triton** geysers ·
**zodiacal light** + gegenschein · new moons (Uranus **S/2025 U1**).

### Wave 3 — megastructures & diegetic pop-culture
**Dyson swarm** (under construction) · **derelict generation ship** · **the Monolith** (2001) ·
**the Ring / Sol gate** (Expanse) · **Halo ring** (Forerunner) · **the Citadel** (Mass Effect) · a
**Heighliner / sandworm-world** (Dune) · ship cameos (Rocinante, Normandy, Enterprise, Discovery
One, Nostromo derelict) · real-spacecraft homages — **Voyager + interactive Golden Record**, JWST,
ISS, Parker Solar Probe, Perseverance/Ingenuity. Reframe Tabby's Star + Death Star as the
megastructure anchors. All scannable with in-universe explanations; physics untouched.

## Each object needs
- A registry entry (position via `remapPosition()`/parent-attach, radius/scale, color, type).
- A 1-line **"what you learn"** hook in `planetFacts.js`/`objects.js` (e.g., Neptune aurora: "why the
  auroras skipped the poles"; kilonova: "every gold atom you own was forged in one").
- A scan/dossier entry + radar blip + Explorer-Rank discoverable.
- A visual: reuse a Phase-5 effect, an image sprite (deep-sky), or a small procedural shader.

## Files
- `config/objects.js`, `data/bodies.js`, `data/planetFacts.js`, `config/moons.js` (data).
- `Scene/` new components only where a unique visual is needed (e.g., `SaturnHexagon.jsx`,
  `Kilonova.jsx`, `DysonSwarm.jsx`, `Monolith.jsx`); otherwise reuse `Nebulae`, `ExoticObjects`,
  `BlackHole` lensing, `DeepFieldMysteries`, the GPU-burst, the aurora ring (Earth's already in `Planet`).
- `data/explorer.js` (register the new discoverables + rank thresholds).

## Object catalog sources (June 2026)
NASA Science (Webb/Hubble Saturn + Neptune auroras + eclipses), Nature Astronomy s41550-025-02507-9
(Neptune), ScienceDaily (Enceladus Oct-25, Titan Aug-25, Mars Sept-25, FRB Mar-26, little-red-dots
Aug-25), Phys.org (Io Nov-25, rogue planet Jan-26, blazar 2026), CNN/StarWalk (Betelgeuse companion
2026), National Geographic (Mimas ocean), Sky&Telescope (C/2026 A1; 2026 eclipses), LIGO Caltech
(GWTC-5.0 May-26), ESA Hubble (Omega Centauri IMBH), Star-Facts (hypergiants), Caltech
(superkilonova), Wikipedia (Hercules-Corona-Borealis, S/2025 U1, Laniakea).
Pop-culture sources: fandom wikis (Expanse Sol gate, Mass Effect Citadel, Halopedia Halo Array, Dune
Heighliner/sandworm, 2001 Monolith/Discovery One, Xenopedia LV-426), NASA Voyager Golden Record.

## Verification
- Each object scannable with a real hook; on radar + Explorer Rank; deep-sky stays true-scale;
  no perf regression (instanced/LOD; watch particle counts); no white frame; reduced-motion safe.
