# STELLAR COMMAND v2 — Master Index

*The realistic, feature-rich, pop-culture-rich, "best-of-everything" solar-system portfolio.*

This folder is the consolidated v2 implementation plan, split into per-phase files. Source of
truth was `~/.claude/plans/atomic-conjuring-planet.md`; this is the version-controlled, scannable
copy. Build cadence: **deep-plan a phase → build → review live on the dev server → next.**

## Files
| File | What |
|---|---|
| `00-MASTER.md` | This index — context, status, constraints, architecture, cross-cutting verification, the full research catalogs + sources. |
| `PHASE-0.md` | Stabilize, verify & **ship** (cleanup, fix prod build, push/deploy). |
| `PHASE-1.md` | **The Arrival** — the intro cinematic (M4 / Part I). |
| `PHASE-2.md` | Item dossiers & characterful worlds (M2 / Part III). |
| `PHASE-3.md` | Soul — reactive co-pilot, photo mode, sonification, discovery (M3). |
| `PHASE-4.md` | **The Living System** — new real objects + diegetic cameos (Part IV), in waves. |
| `PHASE-5.md` | **Director's Cut & rich effects** — visual WOW + perf + ship-quality (Part V / M5). |
| `PHASE-6.md` | Milky Way galaxy mode (Part VI). |
| `PHASE-7.md` | Immersion & reach — WebXR, real ephemeris, multiplayer, etc. (stretch). |

## North-star vision (locked)
A solar-system model that is simultaneously **(1) scientifically realistic**, **(2) feature-rich**
(interactive, gamified, sonified), **(3) pop-culture-movie-reference-rich** (diegetic homages to the
sci-fi canon), and **(4) the best of every technique we can ship in a browser** — without ever
breaking the science or the one-postprocessing-pass constraint.

## Status snapshot — M1–M5 ↔ Parts 0–VI (verified 2026-06-26)
| Milestone | Plan Part | Status | Gap |
|---|---|---|---|
| **M1** Cockpit HUD + 2-axis nav | II + nav | ✅ Done | — |
| **M2** Lane objects + item-view (board→dossier, characterful models, 3-beat scan) | III | ⚠️ Partial | item dossiers, characterful models, 3-beat arrival |
| **M3** Co-pilot + discovery meter + System Overview | IV-meta | ⚠️ Partial | reactive co-pilot (static line today); photo mode |
| **M4** The Arrival | I | ❌ Missing | whole intro (`shipWarpDone=true`) |
| **M5** Director's Cut + ship | V (+IV catalog) | ❌ Missing | rich effects, grade/sound, perf, **prod build** |
| **0** Foundation (tokens/fonts/motion/sound) | 0 | ✅ Done (`78734f5`) | — |
| **VI** Milky Way | VI | ❌ Not started | stretch |

Delivered beyond the M-plan: the 2-axis keyboard nav (↑↓ warp-hop, ←→ dolly), A/B/C/D (journey,
navicomputer orrery, co-pilot/HUD/sound, `StellarGlare` + `StellarDrift`), and 3 black-planet fixes
(eclipse `3a617c7`, focus-on-every-path `34a42c8`, frustum-cull `90f9371`), D `359e1f5`.
**All local on `claude/stellar-command`, UNPUSHED.**

## Hard constraints (never break)
- **ONE custom postprocessing `mainImage`** (`CinematicGrade`) + `Bloom`. A 2nd fullscreen pass =
  WHITE frame. New "post" effects fold into CinematicGrade or are in-scene additive meshes.
- `multisampling={0}`. Additive glows: `AdditiveBlending` + `toneMapped=false`.
- No per-frame React state in the Canvas — refs + `useFrame`. DOM overlays read `cameraRef`/`warpVelRef`.
- **Scientific accuracy is prime** — radii/distances/`AU_UNIT=95` untouched; new objects ride
  `remapPosition()` at true scale. Pop-culture cameos are diegetic in-world artifacts only.
- Reduced-motion + mobile → Read mode; skip intro/audio; motion effects gate off.
- Git via `github.com-personal` SSH (never `gh`); local commits per sub-phase; **push only on
  explicit approval**; dev server is the gate.

## Architecture — the four parts
1. **Content** (single source of truth): `src/content/`, `data/planetFacts.js`, `data/bodies.js`,
   `config/objects.js`, `config/destinations.js`, `config/dwarfPlanets.js`, `config/moons.js`,
   `data/sectionItems.js`. Adding a body/object should be a DATA edit.
2. **Solar-system model** (DEFAULT "read" mode) — the key/scroll tour. Clean + minimal.
3. **Game** (Space Explorer) — free-look + WASD (`Scene/GameFlight.jsx`).
4. **Milky Way galaxy** — 4th mode (Phase 6).

## Cross-cutting verification (every phase)
- Live per sub-phase on `:5175`; show the user before the next.
- Swiftshader Playwright harness for headless checks (JS-logic effects are GPU-faithful);
  `window.__dbg` exposes camera/warp state; mix-blend DOM overlays composite faithfully.
- Postprocessing safety: confirm NO white frame + additive glows bloom after any scene change.
- Reduced-motion + mobile emulation → intro/audio skipped, motion off, tour loads straight.
- Perf budget 16.7ms; watch draw calls + particle counts; adaptive DPR floor on weak GPUs.

---

## RESEARCH CATALOGS (June-2026) — the "add all the WOW" deliverable
Curated, prioritized, mapped to phases. Each phase file repeats its relevant slice; this is the hub.

### A · Rich effects / rendering → Phase 5 (some Phase 2/4)
| Effect | WOW | Technique (R3F, one-pass-safe) |
|---|---|---|
| Volumetric raymarched nebulae | ★★★★★ | 3D FBM noise + Beer-Lambert + blue-noise dither, in-scene quad/sphere |
| Interstellar black-hole (disk + photon ring + lensing) | ★★★★★ | geodesic raymarch, Doppler beaming, adaptive step |
| Volumetric god-rays | ★★★★ | additive cone mesh from Sun (free) OR folded into CinematicGrade |
| Atmospheric scattering (Rayleigh/Mie) | ★★★★ | precomputed LUT (Bruneton) → <1ms |
| Ocean sun-glint + animated terminator | ★★★★ | Fresnel + moving specular, smoothstep day/night |
| Ring + eclipse shadows | ★★★★½ | ray-through-ring-texture (extend existing ring-shadow depth mat) |
| Procedural gas-giant bands / lava worlds | ★★★½ | fBm latitude bands, emissive heat |
| Solar convection + prominences + corona + sunspots | ★★★★ | layered noise + arc tubes + Fresnel corona |
| GPU particles (GPGPU) — comet tails, kilonova bursts, 100k fields | ★★★★ | transform-feedback/FBO sim, billboards |
| Parallax-occlusion mapping | ★★★★ | tangent-space height raymarch |
| One-pass post (fold in): chromatic aberration, anamorphic flare, vignette, grain, LUT, depth-fog | ★★–★★★★ | uniforms in CinematicGrade; also power Photo Mode |
| HDRI/IBL, real shadow mapping (1–2 lights), TSL node shaders | ★★★★ | PMREM env, soft shadows, maintainable graphs |

**Effect sources:** Maxime Heckel volumetric raymarching (blog.maximeheckel.com), David Peicho cloud
raymarching, NVIDIA GPU Gems 3 ch.13 (god-rays), Bruneton precomputed atmospheric scattering
(github jeantimex), Three.js Roadmap black-hole-WebGPU + TSL articles, Sangil Lee realistic Saturn,
THRASTRO shaders, Three.js Journey Earth/terrain lessons, jbouny/ocean, Codrops GPGPU particle
pieces (tympanus.net 2024-25), ektogamat R3F-Ultimate-Lens-Flare, Harry Alisavakis LUT grading,
InstancedMesh2 (discourse.threejs.org), Bruno Simon portfolio (Awwwards), NASA "Eyes on the Solar
System", Spacekit (github typpo).

### B · Space objects / phenomena → Phase 4 (all real, 2025-26-current)
- **Solar-system signatures:** Neptune's aurora (mid-latitude, JWST Nat.Astro 2025) · Saturn's
  hexagon + JWST "dark beads" · Jupiter GRS spirals (JWST) · Io plumes + plasma torus (JWST Nov
  2025) · Enceladus geysers + new organics (Oct 2025) · Europa plumes · Titan methane lakes +
  convection (May 2025) + protocells (Aug 2025) · Triton geysers (Voyager) · Mimas subsurface ocean
  · Mars Olympus Mons / Valles Marineris / Jezero "leopard spots" (Sept 2025) · Venus volcanism
  (Akatsuki) · zodiacal light + gegenschein · 2026 eclipses (Feb 17 annular, Aug 12 total) ·
  sungrazer C/2026 A1 (MAPS) · new moons (Uranus S/2025 U1; Saturn → 292).
- **Extreme/exotic:** kilonova (r-process gold; AT2025ulz "superkilonova") · hypergiants
  (Stephenson 2-18, VY CMa, UY Scuti) · Betelgeuse + companion "Siwarha" (2025) · Eta Carinae
  Homunculus (JWST MIRI) · Wolf-Rayet / Thorne-Żytkow · FRBs (RBFLOAT/FRB 20250316A) ·
  quasar/blazar jets · rogue planet (2026 mass measurement).
- **Cosmological:** Boötes Void · Great Attractor + Laniakea · Hercules-Corona-Borealis Great Wall ·
  Omega Centauri (IMBH, Hubble) · gravitational-wave chirp (LIGO O4 GWTC-5.0; GW250114) · Einstein
  ring/cross (JWST PEARLS) · "little red dots" · cosmic web · JWST deep field.
- **Timely/biosignature:** 3I/ATLAS (enrich) · K2-18b DMS debate · Breakthrough Starshot lightsail.

**Object sources:** NASA Science (Webb/Hubble Saturn, Neptune auroras, eclipses), Nature Astronomy
s41550-025-02507-9, ScienceDaily (Enceladus Oct 2025, Titan Aug 2025, Mars Sept 2025, FRB Mar 2026,
little-red-dots Aug 2025), Phys.org (Io Nov 2025, rogue planet Jan 2026, blazar 2026), CNN/StarWalk
(Betelgeuse companion 2026), National Geographic (Mimas ocean), Sky&Telescope (C/2026 A1; 2026
eclipses), LIGO Caltech (GWTC-5.0 May 2026), ESA Hubble (Omega Centauri IMBH), Star-Facts
(hypergiants), Caltech (superkilonova), Wikipedia (Hercules-Corona-Borealis, S/2025 U1, Laniakea).

### C · Pop-culture references → diegetic cameos (Phase 2 lane-objects + Phase 4 Wave 3)
Star Wars (lightspeed, Star Destroyer ✓, derelict freighter) · 2001 (Monolith, Discovery One, HAL
eye, Star-Gate) · Interstellar (Gargantua ✓, Endurance dock, TARS probe, tesseract) · Star Trek
(Enterprise, warp signature, Borg cube) · The Expanse (Ring/Sol gate, Rocinante, protomolecule) ·
Dune (sandworm-world, Heighliner, spice glow) · Alien (LV-426 derelict / Space-Jockey) · Mass Effect
(Citadel, Normandy, mass relays) · Halo (Forerunner Ring) · Gundam (O'Neill cylinder) · Cowboy Bebop
(Swordfish II) · WALL-E (Axiom) · **Real:** Voyager + interactive Golden Record, JWST, ISS, Parker
Solar Probe, Apollo Saturn V, New Horizons. All scannable with in-universe explanations; never alter
physics (consistent with existing Death-Star / Star-Destroyer eggs).

**Reference sources:** SlashFilm/ScreenRant (iconic ships), Wikipedia (fictional spacecraft, 2001),
fandom wikis (Expanse Rocinante/Sol gate, Mass Effect Normandy/Citadel, Halopedia Halo Array, Dune
spice, Xenopedia LV-426, Pixar Axiom, Gundam space colony, Cowboy Bebop Swordfish), SIGGRAPH
(Interstellar VFX), NASA Science (Voyager Golden Record).

### D · Interactive functionalities → phases 3, 5, 7
- **Phase 3:** photo/cinematic mode + shareable postcards · reactive AI co-pilot (scripted + optional
  LLM) · voice command (Web Speech) · data sonification + spatial audio (PannerNode) · achievements/badges.
- **Phase 5:** guided cinematic auto-tours (Bezier camera paths + narration).
- **Phase 7:** real ephemeris ("planets now") + time-scrubbing · WebXR/VR/AR · multiplayer cursors ·
  gyro/gesture · deep-links · QR card · add-to-calendar (2026 eclipses) · Konami · PWA offline.
- **Always-on:** accessibility (keyboard, reduced-motion, ARIA/screen-reader, high-contrast), haptics.

**Functionality sources:** Photo Mode Awards 2026, Swiss Ephemeris / astronomy-engine / NASA JPL
Horizons, Upload VR + VR.org (WebXR Vision Pro/Quest 2026), MDN Web Audio spatialization,
CopilotKit + Turing (voice LLM), Mistral Voxtral (July 2025), Trophy (gamification), PartyKit/Ably
(multiplayer cursors), MDN (Vibration API, prefers-reduced-motion, ARIA), accessibility.com (2026 trends).

---

## Open choices (decide at first checkpoint — non-blocking)
- Build order after Phase 0 (default 1→2→3→4→5, narrative-first; or 4 earlier for visual WOW sooner).
- AI co-pilot: scripted-only vs optional LLM (Claude API + tiny serverless proxy).
- Pop-culture taste line: subtle handful vs rich "I-Spy" layer.
- Vocabulary going forward: M1–M5 or Parts 0–VI.
- Phase-7 scope: which of WebXR / multiplayer / real-ephemeris are in-scope vs later.
