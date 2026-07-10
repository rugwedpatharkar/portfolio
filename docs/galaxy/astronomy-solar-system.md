# Solar system — accuracy lock & gap closure

The solar system is already NASA/JPL-accurate in the codebase (radii, orbits,
rotation, tilt, belts). This doc (a) locks the **corrections** to stale values and
(b) specifies the **gap-fill bodies** to add, with real data for Phase 4.

⚠️ **Moon counts are volatile** — the IAU MPC confirms new small moons continually.
Every count below carries an "as-of + source" tag; **re-verify the single number
against JPL SSD / IAU MPC at Phase-4 implementation time** and display it with an
"as of <month year>" note in-app rather than as a bare eternal fact.

---

## 1. Moon counts — corrections table (→ `data/planetFacts.js`.moons)

| Planet | App today | Current (as of) | Source | Action |
|---|---|---|---|---|
| Mercury | 0 | 0 | — | ok |
| Venus | 0 | 0 | — | ok |
| Earth | 1 | 1 (Luna) | — | ok |
| Mars | 2 | 2 (Phobos, Deimos) | — | ok |
| Jupiter | **95** | ~**97** (JPL SSD 2024); ≥101 w/ 2026 IAU additions | JPL SSD; IAU MPC 2026 | **update → 97** (note rising) |
| Saturn | **292** | ~**274** (NASA 2025) → **~285** (IAU MPC early 2026) | IAU MPC | **reconcile → 285** (King of Moons; rising) |
| Uranus | **28** | **29** (S/2025 U1, 19 Aug 2025) | IAU MPC 2025 | **update → 29** (matches `moons.js` S/2025 U1) |
| Neptune | **16** | **~18** (2024–2026, Magellan/Subaru) | IAU MPC | **update → 18** |
| Pluto (dwarf) | 5 | 5 (Charon, Nix, Hydra, Kerberos, Styx) | — | ok |

Note: Saturn's true total is a moving target (274→285→~292 across 2025–26). The clean
in-app value should be the current IAU MPC figure + "as of" tag; the *fact that
matters* is "Saturn has by far the most, several hundred."

## 2. Moon roster — bodies to ADD (Phase 4 gap-fill)

Diameters/periods are NASA/JPL. **Major** = add a visual `moonSet[]` mesh in
`destinations.js` (+ bump `moons:N`) AND a scannable `MOONS[]` entry in `moons.js`.
**Tiny** = `moons.js` scannable hotspot only (too small to render around the parent).

### Saturn — add 4 major (has Titan/Enceladus/Mimas already)
| Moon | Diameter | Period | Signature fact |
|---|---|---|---|
| **Rhea** | 1,527 km | 4.52 d | Saturn's 2nd-largest; tenuous O₂/CO₂ exosphere |
| **Iapetus** | 1,469 km | 79.3 d | two-tone (dark leading / bright trailing) + equatorial ridge |
| **Dione** | 1,123 km | 2.74 d | wispy ice-cliff terrain |
| **Tethys** | 1,062 km | 1.89 d | giant Odysseus crater; Ithaca Chasma canyon |

### Uranus — add 1 major (has Titania/Oberon/Miranda already; Ariel in moonSet)
| Moon | Diameter | Period | Signature fact |
|---|---|---|---|
| **Umbriel** | 1,169 km | 4.14 d | darkest Uranian moon; bright "Wunda" ring |

### Neptune — add 1 major (has Triton already)
| Moon | Diameter | Period | Signature fact |
|---|---|---|---|
| **Nereid** | ~340 km | 360 d | one of the most eccentric orbits of any moon (e≈0.75) |

### Pluto — add 4 tiny (scannable only; has Charon)
| Moon | Size | Period | Signature fact |
|---|---|---|---|
| **Nix** | ~50×35×33 km | 24.9 d | chaotic (tumbling) rotation |
| **Hydra** | ~51×33×31 km | 38.2 d | outermost; chaotic rotation |
| **Kerberos** | ~19×10 km | 32.2 d | tiny, dark, discovered 2011 |
| **Styx** | ~16×9×8 km | 20.2 d | smallest, discovered 2012 |

(Also *named-in-facts but optional*: Saturn has 274+ small moons; Jupiter's inner
Amalthea group; Uranus's inner shepherd moons — not needed for the "major visible
moon" goal.)

## 3. Comet dossiers (→ `config/objects.js` `ANOMALY_RAW`)

Add real comets; retire the invented `c2026a1` sungrazer. `H` = historical (not a
live flyby — render as a marker/note, not an active pass).

| Comet | Type / period | Orbit | Signature |
|---|---|---|---|
| **1P/Halley** *(exists)* | Halley-type, 76 yr | a=17.8 AU, e=0.967, **i=162° (retrograde)** | last perihelion 1986; next **2061**; parent of Orionids + η-Aquariids. **App forces i=24° for framing — keep, but note true 162°.** |
| **C/1995 O1 Hale-Bopp** | long-period, ~2,533 yr | e≈0.995 | Great Comet of 1997; huge ~60 km nucleus; naked-eye ~18 months |
| **C/2020 F3 NEOWISE** | long-period, ~6,800 yr | near-parabolic | brightest N-hemisphere comet since 1997 (Jul 2020) |
| **67P/Churyumov–Gerasimenko** | Jupiter-family, 6.44 yr | a=3.46 AU, e=0.64 | **Rosetta orbited + Philae landed, 2014–16** — first comet landing; bilobed "rubber duck" |
| **2P/Encke** | shortest known period, **3.3 yr** | a=2.22 AU, e=0.85 | parent of the Taurids; frequent returns |
| **D/1993 F2 Shoemaker–Levy 9** *(H)* | fragmented, captured by Jupiter | — | **impacted Jupiter Jul 1994** — 21 fragments; first observed collision. Render as a historical marker near Jupiter, not a live comet. |

## 4. Dwarf planets & small bodies — reconcile (already strong)

The codebase already carries all 5 IAU dwarf planets (Ceres, Pluto, Eris, Makemake,
Haumea) plus 17 TNO/belt/NEA bodies with current facts (`config/dwarfPlanets.js`).
**No additions required**; just confirm facts against IAU MPC during review. Known
deliberate deviations to keep documented (not "bugs"): Ceres radius inflated for
legibility; Sedna/TNO placements are distance-*class*, not true ephemeris; Halley
inclination artistic. These stay.

## 5. Real-ephemeris seam (→ activate the dormant `data/ephemeris.js`)

`data/ephemeris.js` already holds **real J2000 mean-longitude phases** (Standish
elements) for the 8 planets — currently unused (live orbits use cinematic-speed
`config/orbits.js`, whose `theta0` derives from the authored layout). The gap-fill
does **not** rewire this; it documents the single seam for a future optional "real
sky today" toggle: override `getOrbit(id).theta0` with `planetPhaseToday(id)` from
`ephemeris.js`. Source for the elements: NASA/JPL "Approximate Positions of the
Planets" (Standish). One integration point; wired in a later phase.

## Sources
- NASA/JPL Solar System Dynamics (ssd.jpl.nasa.gov) — planetary satellite physical + orbital data.
- IAU Minor Planet Center — official moon confirmations + comet orbital elements.
- NASA GSFC Planetary Fact Sheets (D. R. Williams) — quick physical parameters.
- ESA Rosetta mission — 67P.
- NASA/ESA Comet Shoemaker–Levy 9 impact archive (1994).
