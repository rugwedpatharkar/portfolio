# Stellar v2 — Fixes & Backlog

Branch `claude/stellar-command` · 2026-06-28 · the working tracker for the live-review fixes
plus the remaining roadmap. This is the source of truth for the next execution pass.

Status legend: 🔴 not started · 🟡 in progress · ✅ done · ⬚ needs your decision

**Hard constraints (never break):** ONE custom post `mainImage` (`CinematicGrade`) + `Bloom`
(a 2nd full-screen pass = white frame); `multisampling={0}`; new shader `pow/sqrt/acos` clamped
(Metal-NaN→Bloom→black); reduced-motion + mobile → Read mode; scientific accuracy; **the
3rd→1st→3rd camera MOTION is locked** (framing offsets may be tuned, the motion may not);
personal `github.com-personal` SSH, push per batch.

---

## PART 1 — Live-review fixes — ✅ ALL DONE + verified 2026-06-28
(Saturn centred with full rings, no cut-off; planets centred both directions; nav pad + orrery
map removed; IoTorus/hexagon coplanar with rings; attached moons/probes clear of bodies+rings;
sound ON by default + discreet mute; sideways scroll cycles ←→ objects; planet hover-pop +
drag-to-rotate removed; orbit lines tour-hidden + fade edge-on. E2E desktop/RM/mobile: 0 errors.)

### 🪐 Planets — the priority (audit running → specifics fold into F10)

**F5 — Center every planet, fully visible incl. rings, in BOTH inward & outward views.**
- Problem: Saturn (and others) are cut off at the bottom; rings overflow; body not centered.
- Cause: the framing standoff is sized from planet *radius only* (ignores rings/oblateness),
  and the up-lift + look-ahead drag the body low.
- Plan (framing only — NOT the locked motion): a per-body **visual extent** =
  `max(radius, ringOuter, oblate)` feeds the standoff; look at the body center (drop/curb the
  look-ahead); minimal up-lift; keep `frameShift` modest. Same in inward + outward.
- Files: `Scene/CameraRig.jsx` (focus.live pose, `backDistFor`/`UP_FRAC`/`LOOK_FRAC`/`frameShift`),
  `config/destinations.js` (ring extents / oblateness).  Status 🔴

**F6 — Remove planet hover-pop + drag-to-rotate.**
- The hover scale (`targetHoverRef → 1.05`) makes the pole hexagon vanish; drag-to-spin unwanted.
- Plan: remove the hover scale-up and the drag handlers (`draggable`, `dragSpinRef`,
  `onPointerDown/Move/Up`). KEEP click-to-navigate + the natural axial rotation (scientific).
- Files: `Scene/Planet.jsx`.  Status 🔴

**F8 — Attached objects clip/merge into planets & rings.**
- Moons/geysers/probes sit inside the body or rings (Enceladus/Mimas/Titan on Saturn, Europa on
  Jupiter, Triton on Neptune, ISRO probes, ISS station).
- Plan: push every offset clear of body + ring extent and lift off the ring plane; audit all.
- Files: `Scene/index.jsx` (mount offsets), `MoonGeysers/MimasMoon/TitanLakes`, `IsroProbe`,
  `EarthStation`, `RocketLaunch`, `config/moons.js`.  Status 🔴

**F9 — Jupiter IoTorus ("aurora") not aligned to Jupiter's axial tilt.**
- Plan: align IoTorus to the equatorial plane / `axialTilt`; verify SaturnHexagon (pole) +
  NeptuneAurora too.
- Files: `Scene/IoTorus.jsx`, `SaturnHexagon.jsx`, `NeptuneAurora.jsx`.  Status 🔴

**F10 — Deep planet audit → fix EVERY planet** (tilt, rings, moons, phenomena alignment,
clipping, framing, lighting, rotation, oblateness, textures). F5/F8/F9 roll up here.
- Status 🟡 — a planet-audit agent is running; its per-planet findings + fixes append below
  when it lands, then we execute.

### 🛰️ UI / interaction

**F1 — Orbit-path lines look weird (edge-on "V").** `OrbitRings.jsx` (real orbits, overview-only).
Plan: remove from the tour; ⬚ fade them out near edge-on in the overview, OR remove entirely.
Files: `OrbitRings.jsx`, `Scene/index.jsx`.  Status 🔴

**F2 — Remove on-screen nav-pad buttons** (CockpitHUD ↑↓←→↵) **+ the ⊙ button** (identify when
solving). Nav stays keyboard + scroll. Files: `CockpitHUD.jsx`.  Status 🔴

**F3 — Sound ON by default** (armed to start on first interaction — autoplay policy). ⬚ keep a
discreet mute (recommended) vs remove all sound UI. Files: `sound/SoundToggle.jsx`,
`sound/SoundManager.js`.  Status 🔴

**F4 — Sideways scroll → ←→ side-object nav** (trackpad two-finger / Shift+wheel → `deltaX`,
debounced one-object-per-swipe). Files: `Navigator.jsx` (or a wheel listener) + `StellarApp` navItem.
Status 🔴

**F7 — Replace the orrery map (`Navicomputer`).** ⬚ recommended: a **planet sensor-readout**
(real facts + "wow", reusing `PLANET_FACTS`); alts: distance-from-Sun depth gauge / plain
name+distance label / remove. Files: `CockpitHUD.jsx`, new `SensorReadout` (reuse `data/planetFacts`).
Status 🔴

---

## PART 2 — Roadmap backlog (after the review fixes)

### 2A — Tractable autonomously (additive, low-risk)
- **Wave 3 remainder:** derelict generation ship · Heighliner/sandworm (Dune) · ship cameos
  (Rocinante, Normandy, Discovery One, Nostromo) · Perseverance/Ingenuity on Mars · interactive
  Voyager Golden Record.
- **Wave 2 leftovers:** gegenschein (extend `ZodiacalLight`) · Saturn moon-count note.
- **Phase 5 SAFE effects:** god-rays (additive cone mesh from the Sun — NOT a 2nd post pass) ·
  richer procedural gas-giant bands · solar surface polish · mesh comet-tail particles.
  *(AVOID: a 2nd full-screen post pass / multi-tap in CinematicGrade → white-frame risk.)*
- **Experience layer Tier 2/3 (safe subset):** dossier carousel · settle overshoot ·
  target-group framing (moon systems) · dolly-zoom on ONE hero arrival · comfort sliders ·
  spring damping. *(Warp post-FX folded into CinematicGrade = risky; weigh per-item.)*

### 2B — Needs YOUR design/content decision (held)
- **Left-panel removal + world-anchored holograms** — `ContentPanel` IS the recruiter résumé
  (hero portrait, stats, CTAs, detailed Experience/Skills/Projects); the ←→ `ItemDossier` is a
  *different per-item view* that does not replace it. Removing it needs a content-migration plan
  (what moves into ←→) first. ⬚
- **Phase 6 — Milky Way galaxy mode** — a 4th top-level mode; adds a camera branch (touches the
  locked camera). Project guide says "design it as a fourth mode." Needs design. ⬚

### 2C — Stretch (Phase 7) — later
WebXR/VR · real ephemeris ("planets now") + time-scrub · multiplayer cursors · QR card · PWA
offline · add-to-calendar (2026 eclipses) · gyro/gesture.

---

## PART 3 — Decisions (RESOLVED 2026-06-28)
1. **F1** — remove orbit lines from the tour; fade them out near edge-on in the overview. ✅
2. **F3** — sound ON by default + keep a discreet mute (autoplay-armed on first interaction). ✅
3. **F7** — **remove the orrery map entirely.** ✅
4. **F6** — remove drag-to-rotate; keep click-to-nav + the real axial spin. ✅
5. **Scope** — after the 10 fixes, **auto-proceed through all of 2A**; 2B/2C wait. ✅

## PART 4 — Execution order (proposed)
1. Planet-audit lands → finalize F10 specifics (append findings below).
2. Solve the 10 review fixes in one pass — **planets first** (F5, F6, F8, F9, F10), then UI
   (F1, F2, F3, F4, F7) — build + E2E (desktop/RM/mobile), commit + push per logical group.
3. Then **2A** backlog (on your go), each built + tested + pushed.
4. **2B / 2C** with you.

---

## APPENDIX — planet-audit findings (2026-06-28)

**Governing fact:** tour planets are framed by the `focus.live` block in `CameraRig.jsx`
(not `blendFrame`) — the dead `blendFrame`/`FRAME_DOLLY` planet code only runs for Sol. So the
single block `D = backDistFor(radius); cam = P − dir·D + upp·(D·UP_FRAC); look = P + dir·(D·LOOK_FRAC)`
causes BOTH the off-center and ring-overflow bugs.

Concrete changes (file refs approximate — re-locate before editing):
1. **Center** — focus.live: `_lookTarget.copy(_p)` (look AT body center); keep look-ahead only in the jump block. `LOOK_FRAC=1.15` puts the body ~6° above the axis → off-center.
2. **Ring-aware standoff** — `backDistFor` + focus `D`: `visualExtent = max(radius, rings?r*2.3:0, faintRings?r*2.12:0, r*(1+oblateness))`. Ring outer: Saturn `RingSystem` `r*2.3`=3.83; faint rings (`Planet.jsx`) `r*2.12`. Needed pull-back: Saturn ×1.42, Jupiter/Uranus/Neptune ×1.31.
3. **Right-shift margin** — focus.live frameShift: bump `D *= 1+frameShift*0.25` when `frameShift && k<0`.
4. **Phenomena plane** — rings use `Math.PI/2.05` (87.8°) but IoTorus/SaturnHexagon/NeptuneAurora use `Math.PI/2` (90°) → 2.2° lean. Share `RING_PLANE_TILT=Math.PI/2.05`. Hexagon: pass `oblateness`, place at `[0, r*(1-oblateness), 0]`.
5. **Attached-object offsets** (mounts in `index.jsx`, planet-local): Enceladus `[-4.3,1.1,1.7]`, Mimas `[4.6,1.0,-2.1]`, Titan `[4.4,1.2,0.9]` (past Saturn ring 3.83, lifted); Europa `[5.2,1.0,1.2]` (Jupiter ring 4.24); Triton `[2.0,0.8,0.6]` (Neptune ring 1.49); Mangalyaan `orbitRadius=r*2.4` (Phobos at r*1.9 collides).
6. **Duplicate moons / in-ring orbits** — generic `moonSet` moons orbit inside the rings (`Planet.jsx` orbit base `r*1.85`); for ringed planets use `max(r*1.85, ringOuter*1.08)`; drop the now-redundant moonSet entries that detailed components cover (Saturn, Jupiter Europa, Neptune Triton) in `destinations.js`.
7. Airless bodies (Mercury/Ceres/Pluto) correctly have no atmosphere preset; `frustumCulled={false}` is intentional; Saturn/Uranus/Jupiter authored dutch-`roll` is dead for the tour (focus forces roll 0) — fine.
