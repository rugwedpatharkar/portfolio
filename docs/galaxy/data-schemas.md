# Data schemas — the docs → app-data contract

The `.js` datasets that implement the knowledge. Each schema names its **target
file**, its **provenance** (which doc/source the values come from), and its **reuse**
points. Units: solar side = scene-units via `AU_UNIT`; galactic side = **light-years**
(converted to scene-units only at render time via `LY_UNIT`).

---

## 1. `src/stellar/config/galaxy.js` (NEW) — galactic structure
Provenance: `astronomy-milky-way.md`. Pure data; **unimported by the running scene**
until the render phase. Drives (a) the band backdrop and (b) local-neighborhood
orientation — never an external disk mesh.

```js
export const GALAXY = {
  type: "SBbc",
  diskRadiusLy: 50000,
  scaleLengthLy: 8500,          // exp(-R/scaleLength) surface-brightness falloff
  thinScaleHeightLy: 1000,
  thickScaleHeightLy: 2900,
  pitchAngleDeg: 12.5,          // log-spiral
  bulge:  { radiusLy: 10000 },
  bar:    { halfLengthLy: 16000, angleDeg: 27, axisRatio: [1, 0.4, 0.3] },
  sun:    { galactocentricRadiusLy: 26670, heightLy: 65, arm: "Orion Spur" },
  sgrA:   { massSolar: 4.30e6, directionFromSun: /* unit vec ← RA 17h45m40s, Dec -29°00'28" */ },
  orientation: {                // fixes the band's great circle on our sky
    galacticNorthPole: { raHours: 12.8573, decDeg: 27.1283 },  // J2000
    galacticCenter:    { raHours: 17.7611, decDeg: -29.0078 },
    eclipticInclinationDeg: 60.2,
  },
  arms: [                       // log-spiral r(θ)=r0Ly*exp(tan(pitch)*(θ-θ0))
    { name: "Norma",              r0Ly, theta0Deg, spanDeg, densityWeight },
    { name: "Scutum-Centaurus",   /* … */ },
    { name: "Sagittarius-Carina", /* … */ },
    { name: "Orion Spur",         /* carries the Sun */ densityWeight },
    { name: "Perseus",            /* … */ },
  ],
};
```
Assert self-check (ships with the file): each arm's `r(θ)` monotonically increases in
θ; `sun.galactocentricRadiusLy` within `[0, diskRadiusLy]`; `directionFromSun` is unit-length.

## 2. `src/stellar/config/scaleRegimes.js` (NEW) — solar → local handoff
Provenance: `technical-scale-regimes.md`. **Imports `AU_UNIT` from `destinations.js`**
(single source for solar scale); `LY_UNIT` is the single source for galactic scale.

```js
import { AU_UNIT } from "./destinations";       // 95 su/AU
export const LY_UNIT = 6;                        // su/ly — TUNED in render phase (~5-8)
export const LOCAL_CAP_LY = 1500;                // local-neighborhood outer edge
export const SCALE_REGIMES = [
  { id: "solar", unit: "AU", scale: AU_UNIT, range: [0, 40],      anchor: [0,0,0] },
  { id: "local", unit: "ly", scale: LY_UNIT, range: [0, LOCAL_CAP_LY], anchor: "sun" },
];
export const REGIME_HANDOFF = { atSceneUnits: /* pull-back distance that triggers the cut */ };
// SUN stays at the origin in BOTH regimes (the vantage never leaves us).
```
Assert self-check: `LOCAL_CAP_LY * LY_UNIT < 14000` (fits the existing far-clip);
`LY_UNIT > 0`; regimes ordered solar→local. **No floating-origin.**

## 3. `src/stellar/data/brightStars.js` (EXTEND in place) — add distance
Provenance: **HYG database v4.1** (`dist` in parsecs → ×3.26156 → ly). Reuse
`Scene/Stars.jsx` + its `bvToColor()` untouched.

- Stride **4 → 5**: `[raRad, decRad, mag, ci, distLy]`.
- Add `export const STAR_STRIDE = 5;` (Stars.jsx reads this, not a hardcoded 4).
- `STAR_COUNT` unchanged (8,920).
- **Sentinel:** HYG unknown-parallax (`dist = 100000 pc`) → `distLy = 0` = "keep on
  the background sphere" (solar regime ignores `distLy` entirely).
- Regenerate via `scripts/build-star-catalog.mjs` (Node; HYG CSV → packed literal;
  NOT an app dependency). Never hand-edit 8,920 packed values.

**Regression gate:** in the solar regime the render output must be byte-identical to
today (distLy ignored → same fixed `R=6800` sphere). Verify with a before/after
screenshot.

## 4. Solar-system gap-fill shapes (edits to existing files)
Provenance: `astronomy-solar-system.md`. Reuse existing render paths.

- **Major moon** → `config/destinations.js`: append to the parent's `moonSet[]`
  `{ color: "#rrggbb", scale: <fraction of parent> }` **and** bump `moons: N`. Plus a
  scannable **`config/moons.js` `MOONS[]`** entry
  `{ id, parent, label, color, offset:[x,y,z], info, facts:{ diameter, day, wow } }`.
  (`data/bodies.js liveBodyPosition()` auto-orbits it on the live parent.)
- **Tiny moon** (Pluto's) → `config/moons.js` `MOONS[]` **only** (scannable hotspot;
  no `moonSet` mesh — too small to render around 0.034-radius Pluto).
- **Real comet** → `config/objects.js` `ANOMALY_RAW[]`
  `{ id, label, category:"Comet", color, position, info }`, reusing the parameterized
  `AtlasComet`/`Comet` components (add an instance in `Scene/index.jsx` only if a new
  visual pass is needed). Retire the invented `c2026a1` sungrazer.
- **Moon-count fix** → `data/planetFacts.js` `moons` string per the corrections table.

## 5. Reuse map (do not duplicate)
`AU_UNIT`/`remapRadius`/`remapPosition`/`frontOfSun` (`destinations.js`) · `getOrbit()`
(`orbits.js`, ephemeris seam) · `liveBodyPosition()` (`bodies.js`) · `bvToColor()`
(`Stars.jsx`) · `AtlasComet`/`Comet` · `Planet.jsx` moon loop · `CinematicGrade`
(film grain) · `LensFlare`.
