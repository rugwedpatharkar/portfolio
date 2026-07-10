# docs/galaxy — Knowledge Foundation (Step 0 of "Stellar / Milky Way")

Accurate astronomy + technical knowledge for the cinematic **view-from-within**
Milky Way + solar-system portfolio. This folder is the single source of truth for
accuracy; the app-ready `.js` datasets (`config/galaxy.js`, `config/scaleRegimes.js`,
`data/brightStars.js` stride-5, and the solar-system gap-fills) implement what is
locked here.

Related: the approved Step-0 plan, and the original design spec
`docs/superpowers/specs/2026-06-22-3d-solar-system-portfolio-design.md`.

## Locked scope
1. **Milky Way = the view FROM our solar system** — accurate galactic band +
   Sagittarius core/bulge + Great Rift dust lanes + local stellar neighborhood;
   **never** an external whole-galaxy render.
2. **Both** human-readable reference docs (here) **and** app-ready data.
3. **Comprehensive** — new galactic knowledge + close the solar-system gaps +
   activate the dormant real J2000 ephemeris.

Hard constraints carried into every doc: **no floating-origin / log-depth** — a
staged powers-of-ten scale cut (solar AU regime → local-neighborhood ly regime)
inside the existing `far=14000`; exactly **one** custom postprocessing `mainImage`
(CinematicGrade) + Bloom; **`multisampling={0}`**.

## Status
| Doc / dataset | Purpose | Status |
|---|---|---|
| `00-MASTER.md` | index · sources · verification | sourced |
| `astronomy-milky-way.md` | galactic structure, view-from-within | sourced |
| `astronomy-solar-system.md` | accuracy lock + gap closure | sourced |
| `technical-scale-regimes.md` | staged scale strategy | sourced |
| `technical-interstellar-shots.md` | premium-shot feasibility | sourced |
| `data-schemas.md` | docs → data contract | sourced |
| `config/galaxy.js` | galactic-structure data | todo |
| `config/scaleRegimes.js` | solar → local handoff | todo |
| `data/brightStars.js` (stride-5) | star distances | todo |
| solar-system gap-fills | moons · comets · counts | todo |

Legend: **todo → drafting → sourced** (every number cited) **→ verified**
(spot-checked against a second source).

## Sources catalog
| Source | Authority | Used for |
|---|---|---|
| NASA/JPL Solar System Dynamics (SSD) + Horizons | primary ephemeris | planet/dwarf/moon radii, orbits, rotation, tilt |
| IAU Minor Planet Center (MPC) | official small-body registry | moon counts, comet orbital elements, dwarf/TNO designations |
| NASA GSFC Planetary Fact Sheets (D. Williams) | NASA | quick physical parameters |
| GRAVITY Collaboration 2019 / 2021 (ESO VLTI) | peer-reviewed | Sun galactocentric distance R₀, Sgr A* mass |
| Event Horizon Telescope 2022 | EHT | Sgr A* image / ring |
| ESA Gaia DR3 | ESA | stellar parallax / distance |
| HYG database v4.1 (Astronexus) | Hipparcos/Gaia/Yale BSC compilation | star catalog with distance (RA/Dec/mag/B–V/dist) |
| Reid et al. (BeSSeL/VERA); Vallée reviews | peer-reviewed | Milky Way arm geometry, the Sun's Orion Spur |

## Verification checklist
- [ ] Every quantitative claim carries an inline source tag.
- [ ] Currency-sensitive values (moon counts, latest measurements) checked against
      the source's current page, **not memory**.
- [ ] Each astronomy number tagged "→ feeds `<dataset>.<field>`" where it becomes data.
- [ ] ~10% of facts spot-checked against a second independent source.
- [ ] `galaxy.js`/`scaleRegimes.js` carry an assert self-check and are unimported by the scene.
- [ ] Star stride-5: solar-regime sky **pixel-stable** (before/after screenshot).
- [ ] All new/edited files ESLint-clean; per-phase dev-server check green; commit per
      phase; **no push without approval**.
