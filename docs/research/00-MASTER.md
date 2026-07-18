# 00 — MASTER: Space Knowledge Index for the Stellar Portfolio

**What this is.** The reference index for the scientifically-accurate knowledge
base powering the `src/stellar/` portfolio. Every real object rendered in the
scroll tour (14 stops), the ~200 background scenery objects (belts, moons,
comets, probes, exotic bodies, nebulae, stars, galaxies, constellations), and
the Milky-Way finale is documented across nine research papers (`01`–`09`).

**Prime directive.** CLAUDE.md says "scientific accuracy is the prime goal."
Every numeric value in the portfolio's data layer traces to one of these
research papers, and every research paper cites the primary source (NASA/JPL,
IAU/MPC, ESA, Gaia DR3, peer-reviewed literature). No numbers from memory.

**Reader modes.**
- **"Where's the fact for X?"** → §2 Portfolio inventory (this file), then jump
  to the referenced paper.
- **"What's wrong in the code right now?"** → §3 Consolidated audit
  (Appendix A) — every discrepancy from every paper, ranked.
- **"How do I backport the fixes?"** → §4 Backport-ready delta (Appendix B) —
  a mechanical file→field→current→verified→source table.
- **"Which primary source did that claim come from?"** → §5 Source directory
  (Appendix C).

**Compiled** 2026-07-18 for the Stellar portfolio, worktree
`musing-allen-f4c458`.

---

## 1. The research papers (index)

Each of the nine research papers is a standalone, primary-source-cited
reference. Read them in whatever order fits the question you're asking.

| # | Paper | Scope | Size |
|---|---|---|---|
| **01** | [Sun & the Eight Planets](./01-sun-and-planets.md) | Sun + Mercury → Neptune. Physical, orbital, atmospheric, ring, and **true-colour** data. Corrections table vs current `destinations.js`/`planetFacts.js`/`planetData.js`. | ~28 KB |
| **02** | [Small Bodies & the Interplanetary Medium](./02-small-bodies-and-interplanetary-medium.md) | Nine dwarf planets, the asteroid belt (Kirkwood gaps, taxonomy), Kuiper belt (bimodal red/neutral), Oort cloud, comets (Halley + tails), Trojans, Centaurs, heliosphere, zodiacal light, Local Interstellar Cloud. Corrections for belt density & colours. | ~32 KB |
| **03** | [Milky Way Structure](./03-milky-way-structure.md) | Galactic anatomy (disc, bulge, bar, arms), the Sun's location (Orion Spur, R₀ = 26,673 ly), Sgr A\* mass consolidation, band appearance from within. Corrections for `galaxy.js` + `SpiralGalaxy.jsx` + `MilkyWay.jsx`. | ~26 KB |
| **04** | [Nebulae](./04-nebulae.md) | 29 named nebulae with real J2000 RA/Dec + angular size + Gaia-era distances + emission-line true-colour physics (Hα, Hβ, [O III], [N II], [S II]). Corrections for California position + Crab colour inversion. | ~36 KB |
| **05** | [The Local Group & Nearby Galaxies](./05-local-group-and-galaxies.md) | Milky Way satellites (LMC, SMC, dSphs), M31, M33, and the poster galaxies (Cen A, M81, M82, M101, M51, Sombrero) at true relative scale in R_MW. Corrections for `DistantGalaxies.jsx`/`HomepageGalaxies.jsx` and dead colour config. | ~27 KB |
| **06** | [Stars, Star Colors & Constellations](./06-stars-and-constellations.md) | Ballesteros B–V→T and Tanner Helland T→RGB physics, top-25 brightest stars, 15 constellations at IAU J2000. Corrections for Betelgeuse "Jupiter's orbit" claim + dead duplicate anchors. | ~26 KB |
| **07** | [Space Probes](./07-space-probes.md) | **NEW**. Voyager 1 & 2 (with 2026-07-18 positions), Golden Record, Perseverance + Ingenuity, JWST, Parker Solar Probe, Juno, Lucy, New Horizons. Correction for stale Voyager 1 distance in `planetFacts.oort.wow`. | ~26 KB |
| **08** | [Exotic Astrophysics](./08-exotic-astrophysics.md) | **NEW**. Sgr A\* summary, pulsar, magnetar, brown dwarf, rogue planet, TRAPPIST-1, Betelgeuse + Siwarħa (2025 IAU-named), Eta Carinae + Homunculus, Crab, kilonova GW170817, Einstein rings, Omega Centauri (+ IMBH), GW250114 (loudest chirp), JWST Little Red Dots, Tabby's Star, Wow! Signal, Planet Nine, FRBs. | ~36 KB |
| **09** | [Black Holes & Wormholes](./09-black-holes-and-wormholes.md) | **NEW**. Schwarzschild + Kerr metrics, horizons, ergosphere, ISCO, photon sphere, accretion physics, EHT imaging, Hawking radiation, Einstein-Rosen bridge, Morris-Thorne traversable wormhole, exotic matter, chronology protection. Grounds The Edge (stop 13) + Wormhole anomaly. | ~22 KB |

Total ~ 260 KB, ~55,000 words, ~500 primary-source citations.

**Companion doc:** [`docs/architecture/knowledge-foundation.md`](../architecture/knowledge-foundation.md)
— the audit-plan status document (Phase 12 of the mellow-minsky milky-way
portfolio audit) that defined the verification bar and provenance pattern.

**Predecessor:** [`docs/galaxy/00-MASTER.md`](../galaxy/00-MASTER.md) — earlier
galaxy-focused knowledge foundation. `docs/research/*` supersedes it wherever
they overlap.

---

## 2. Portfolio inventory → research cross-reference

Every real object rendered in the portfolio, with the paper that covers it.

### 2.1 The scroll tour (14 stops, in order)

| # | Stop id | Object | Research paper |
|---|---|---|---|
| 0 | `hero` | Milky Way (from within) | [03 §2](./03-milky-way-structure.md) |
| 1 | `about` | Solar-system overview | [01 §2.1–§2.2](./01-sun-and-planets.md) |
| 2 | `impact` | **Sol / Sun** | [01 §3.0](./01-sun-and-planets.md) |
| 3 | `experience` | **Mercury** | [01 §3.1](./01-sun-and-planets.md) |
| 4 | `projects` | **Venus** | [01 §3.2](./01-sun-and-planets.md) |
| 5 | `achievements` | **Earth + Moon** | [01 §3.3](./01-sun-and-planets.md) |
| 6 | `skills` | **Mars + Phobos + Deimos** | [01 §3.4](./01-sun-and-planets.md) |
| 7 | `writing` | **Ceres** (dwarf) | [02 §2.1, §3.1](./02-small-bodies-and-interplanetary-medium.md) |
| 8 | `education` | **Jupiter + Galileans** | [01 §3.5](./01-sun-and-planets.md) |
| 9 | `hobbies` | **Saturn + rings + moons** | [01 §3.6](./01-sun-and-planets.md) |
| 10 | `testimonials` | **Uranus + moons** | [01 §3.7](./01-sun-and-planets.md) |
| 11 | `whatsetsmeapart` | **Neptune + Triton** | [01 §3.8](./01-sun-and-planets.md) |
| 12 | `contact` | **Pluto + Charon** | [02 §2.1, §3.1](./02-small-bodies-and-interplanetary-medium.md) |
| 13 | `theedge` | **Black hole** | [09 §2, §3, §8.1](./09-black-holes-and-wormholes.md) |

### 2.2 Belts, zones, phenomena

| Object | Research paper |
|---|---|
| Asteroid Belt + Kirkwood gaps | [02 §2.2, §3.2](./02-small-bodies-and-interplanetary-medium.md) |
| Trojan asteroids (L4/L5) | [02 §3.5](./02-small-bodies-and-interplanetary-medium.md) |
| Kuiper Belt (Plutinos + Twotinos + Cliff) | [02 §2.3, §3.3](./02-small-bodies-and-interplanetary-medium.md) |
| Oort Cloud | [02 §2.5, §3.6](./02-small-bodies-and-interplanetary-medium.md) |
| Heliosphere (termination shock, heliopause) | [02 §2.5, §3.6](./02-small-bodies-and-interplanetary-medium.md) |
| Local Interstellar Cloud | [02 §2.5, §3.6](./02-small-bodies-and-interplanetary-medium.md) |
| Zodiacal Light | [02 §2.5, §3.6](./02-small-bodies-and-interplanetary-medium.md) |
| Dust Lanes (Great Rift, Coalsack) | [03 §3.2](./03-milky-way-structure.md), [04 §2](./04-nebulae.md) |

### 2.3 Small bodies rendered as scenery

Dwarfs & TNOs (17): **Bennu · Ryugu · Apophis · Vesta · Pallas · Hygiea · 16
Psyche · Eris · Makemake · Haumea · Arrokoth · Sedna · Quaoar · Gonggong ·
Orcus · Chiron · Chariklo** → all in [02 §2.1, §3.1](./02-small-bodies-and-interplanetary-medium.md).

### 2.4 Named moons rendered/scannable

All in [`src/stellar/config/moons.js`](../../src/stellar/config/moons.js);
physical parameters (mass, orbit, day, wow) covered by the parent-planet
sections of [01 §3.5–§3.8](./01-sun-and-planets.md) and [02 §3.1](./02-small-bodies-and-interplanetary-medium.md).

- **Earth**: Luna
- **Mars**: Phobos, Deimos
- **Jupiter**: Io, Europa, Ganymede, Callisto
- **Saturn**: Titan, Enceladus, Mimas, Rhea, Iapetus, Dione, Tethys
- **Uranus**: Titania, Umbriel, + (verify Ariel, Oberon, Miranda in code)
- **Neptune**: Triton, Nereid
- **Pluto**: Charon, Nix, Hydra, Kerberos, Styx
- **Uranus S/2025 U1** — JWST 2025 discovery

### 2.5 Comets & interstellar visitors

| Object | Research paper |
|---|---|
| Halley (1P) | [02 §2.4, §3.4](./02-small-bodies-and-interplanetary-medium.md) |
| 1I/'Oumuamua | [02 §3.4](./02-small-bodies-and-interplanetary-medium.md), inline in `objects.js` |
| 2I/Borisov | [02 §3.4](./02-small-bodies-and-interplanetary-medium.md), inline in `objects.js` |
| 3I/ATLAS (2025-07-01, e=6.143) | [02 §3.4](./02-small-bodies-and-interplanetary-medium.md) + code |
| Meteor Showers | inline in `objects.js` |

### 2.6 Space probes

All in [07 §3](./07-space-probes.md): Voyager 1 & 2, Golden Record,
Perseverance + Ingenuity, JWST, Parker Solar Probe, Juno, Lucy, New Horizons.

### 2.7 Exotic objects (deep-field anomalies)

All in [08 §3](./08-exotic-astrophysics.md): **Sgr A\*, pulsar, magnetar,
brown dwarf, rogue planet, TRAPPIST-1, Betelgeuse + Siwarħa, Eta Carinae +
Homunculus, Crab Nebula, kilonova (GW170817), Einstein ring, Omega Centauri,
GW250114, JWST Little Red Dots, Tabby's Star (KIC 8462852), Wow! Signal,
Planet Nine, Fast Radio Bursts**.

The Edge (stop 13) and the Wormhole anomaly get full black-hole and
wormhole-theory grounding in [09 §2–§7](./09-black-holes-and-wormholes.md).

### 2.8 Cosmic-scale markers

| Object | Research paper |
|---|---|
| Boötes Void | inline in `objects.js` |
| Great Attractor | inline in `objects.js` |
| Hercules–Corona Borealis Great Wall | inline in `objects.js` |
| Local Group (structure) | [05 §3.1](./05-local-group-and-galaxies.md) |
| Sun's location — Orion Spur | [03 §2.4](./03-milky-way-structure.md) |

### 2.9 Milky Way structural anatomy

All in [03](./03-milky-way-structure.md):
- **Type + size** — §2.1
- **Bulge + bar** — §2.2
- **Spiral arms** (Scutum-Centaurus, Perseus, Sagittarius-Carina, Norma,
  Local/Orion Spur, Outer) — §2.3
- **Sun's place** — §2.4
- **Mass + star count** — §2.5
- **Sgr A\*** — §2.6
- **Great Rift + Coalsack** — §3.2
- **Colours** — §3.1

### 2.10 Named naked-eye galaxies

All in [05 §3.3, §3.4, §3.5](./05-local-group-and-galaxies.md):
- **M31 Andromeda** (§3.3)
- **M33 Triangulum** (§3.4)
- **LMC / SMC** (§3.2)
- **Sombrero, Whirlpool** (§3.5) — currently unused-texture, decide keep/delete

### 2.11 Named bright stars (16)

All in [06 §3](./06-stars-and-constellations.md), with reference table:
Sirius, Canopus, Arcturus, Vega, Capella, Rigel, Procyon, Betelgeuse, Altair,
Aldebaran, Antares, Spica, Pollux, Deneb, Regulus, Fomalhaut.

### 2.12 Named nebulae (29)

All in [04 §2.1](./04-nebulae.md) catalogue table with J2000 coords, size,
distance, emission-line palette:

M42, M16, M8, M20, Carina, Rosette, M17 (Swan), NGC 7000, Pelican, Cone,
Bubble, Flame, Horsehead, Cocoon, Cave, Elephant's Trunk, California, Iris,
M57 (Ring), Helix, Cat's Eye, M27 (Dumbbell), M1 (Crab), Veil, Coalsack, M45
(Pleiades reflection), Witch Head, Tarantula (30 Dor, LMC), NGC 604 (M33).

### 2.13 Constellations (15)

All in [06 §4](./06-stars-and-constellations.md): Orion, Ursa Major,
Cassiopeia, Cygnus, Scorpius, Crux, Leo, Perseus, Gemini, Lyra, Aquila, Canis
Major, Sagittarius, Taurus + ecliptic.

### 2.14 Explicitly out of scope

Sci-fi cameos in [`config/objects.js`](../../src/stellar/config/objects.js) —
**Death Star, USS Enterprise, Endurance, Star Destroyer, Cooper Station,
Sandworm, Rocinante, SSV Normandy, Discovery One, USCSS Nostromo, Generation
Ship, Guild Heighliner, TARDIS, HAL 9000, WALL·E, The Monolith, Halo
Installation, Dyson Swarm, The Ring (Expanse gate), The Citadel**. Decorative,
not researched.

---

## 3. Appendix A — Consolidated audit corrections

Every discrepancy flagged across research papers 01–09, prioritised. The **§**
column links to the paper's own detail.

### 3.1 HIGH priority — visible-inaccuracy corrections

| # | File · Field | Current | Verified | Source | § |
|---|---|---|---|---|---|
| 1 | `destinations.js:78` **Sun** `color` | `#ff9a3c` (fire-orange) | **`#FFF5EC`** (5,772 K blackbody = white) | IAU T_eff; scienceabc | [01 §4.1](./01-sun-and-planets.md#41-high-priority--colour-the-briefs-emphasis) |
| 2 | `planetFacts.js:16` **Sun** `body` | `"Sol — G2V yellow dwarf star"` | **`"Sol — G2V main-sequence star"`** | IAU; Wikipedia/Sun | [01 §4.1](./01-sun-and-planets.md#41-high-priority--colour-the-briefs-emphasis) |
| 3 | `destinations.js:115` **Venus** `color` | `#f8c555` (saturated gold) | **`#E3DAC2`** (pale cream) | Wikipedia/Venus; Planetary Society | [01 §4.1](./01-sun-and-planets.md#41-high-priority--colour-the-briefs-emphasis) |
| 4 | `Nebulae.jsx` **Crab (M1)** `core`/`halo` | `#ff6b35` core / `#5a8fd6` halo (inverted) | **`#b8c8e8` core (synchrotron)** / **`#ff5a4a` halo (filaments)** | [Crab Nebula — Wikipedia](https://en.wikipedia.org/wiki/Crab_Nebula) | [04 §4.1](./04-nebulae.md#41-fix--real-errors) |
| 5 | `Nebulae.jsx` **California** RA/Dec | `4.012 / 36.167` | **`4.055 / 36.42`** (J2000) | [NGC 1499 — Wikipedia](https://en.wikipedia.org/wiki/California_Nebula) | [04 §4.1](./04-nebulae.md#41-fix--real-errors) |
| 6 | `destinations.js:437` **Asteroid Belt** `color` | `#c9b48a` (light tan) | **`#6f645a`** (dark C-type-weighted grey-brown) | Wikipedia/Asteroid belt taxonomy | [02 §4.1](./02-small-bodies-and-interplanetary-medium.md#41-high-priority-scientific-accuracy) |
| 7 | `destinations.js:438` **Kuiper Belt** `color` | `#9fb0d0` (blue) | **`#8a7360`** (neutral warm) — bimodal red-to-neutral, never blue | Wikipedia/Kuiper belt | [02 §4.1](./02-small-bodies-and-interplanetary-medium.md#41-high-priority-scientific-accuracy) |
| 8 | `destinations.js:434–436` **Belt density comment** | "*dense dusty donuts*" | **~3% Moon-mass, ~1 M km between bodies; render as sparse scatter** | Wikipedia/Asteroid belt | [02 §5.1](./02-small-bodies-and-interplanetary-medium.md#51-make-the-belts-read-as-sparseempty-top-priority) |

### 3.2 MEDIUM priority — data + consistency

| # | File · Field | Current | Verified | Source | § |
|---|---|---|---|---|---|
| 9 | `destinations.js:317` **Neptune** `color` | `#7fb0c4` (too dark) | **`#9FC4D4`** (near-twin to Uranus per Irwin 2024) | [Irwin et al. 2024 MNRAS](https://doi.org/10.1093/mnras/stad3761) | [01 §4.2](./01-sun-and-planets.md#42-medium-priority) |
| 10 | `planetFacts.js:114` **Jupiter** `moons` | `"115 confirmed"` | **`"101 confirmed"`** (IAU/MPC March 2026); "100+" is safer | [earthsky moon count](https://earthsky.org/space/more-moons-for-jupiter-and-saturn-total-satellite-discoveries/) | [01 §4.2](./01-sun-and-planets.md#42-medium-priority) |
| 11 | `planetData.js:18` **Uranus** `eccentricity` | `0.0457` | **`0.0472`** (JPL/infobox) | Wikipedia/Uranus | [01 §4.2](./01-sun-and-planets.md#42-medium-priority) |
| 12 | `planetData.js:19` **Neptune** `eccentricity` | `0.0113` (high) | **`0.008678`** (JPL) or `0.0090` (NSSDCA) | Wikipedia/Neptune | [01 §4.2](./01-sun-and-planets.md#42-medium-priority) |
| 13 | `dwarfPlanets.js:31` **Vesta** taxonomy | `"(S-type)"` | **`"(V-type, basaltic)"`** | Wikipedia/4 Vesta | [02 §4.1](./02-small-bodies-and-interplanetary-medium.md#41-high-priority-scientific-accuracy) |
| 14 | `dwarfPlanets.js:78` **Orcus** claim | `"same size class and orbital period as Pluto"` | **Drop "size class"; keep orbital anti-phase claim** | Wikipedia/Orcus | [02 §4.2](./02-small-bodies-and-interplanetary-medium.md#42-medium-priority-facts--proportions) |
| 15 | `dwarfPlanets.js` **Dwarf size ordering** | Eris/Gonggong/Makemake/Haumea > Pluto on screen | **True order: Pluto ≈ Eris > Makemake ≈ Gonggong > Haumea > Sedna ≈ Orcus > Quaoar** | Wikipedia infoboxes | [02 §4.2](./02-small-bodies-and-interplanetary-medium.md#42-medium-priority-facts--proportions) |
| 16 | `dwarfPlanets.js` **Eris/Sedna position** | 42–68 AU | **Eris a = 67.7 AU (now ~96); Sedna a = 506 AU** — push visibly beyond Kuiper band | Wikipedia infoboxes | [02 §4.2](./02-small-bodies-and-interplanetary-medium.md#42-medium-priority-facts--proportions) |
| 17 | `objects.js:173` **3I/ATLAS** "first ACTIVE interstellar comet" | as written | **Reword: "the third interstellar object and an active comet"** — 2I/Borisov was the first active | Wikipedia/2I/Borisov | [02 §4.2](./02-small-bodies-and-interplanetary-medium.md#42-medium-priority-facts--proportions) |
| 18 | `galaxy.js` **Sgr A\* mass** three-way disagreement | header cites GRAVITY 2019 but value = 4.3e6 (GRAVITY 2022); `planetFacts.hero` = 4.15M; `SgrAStar.jsx` comment = 4.15M | **Pick one: 4.30e6 (GRAVITY 2022) or 4.15e6 (GRAVITY 2019) — update all three places to match** | [GRAVITY 2019](https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html) · [EHT 2022](https://iopscience.iop.org/journal/2041-8213) | [03 §4.1](./03-milky-way-structure.md#41-galaxyjs-config--the-intended-single-source-of-truth) |
| 19 | `SpiralGalaxy.jsx:7` **Sun position comment** | `"~27% out"` | **`"~53% out (halfway-to-two-thirds to the rim)"`** — code is already correct at `SOL_R = 0.533` | [Reid 2019](https://arxiv.org/abs/1910.03357) | [03 §4.2](./03-milky-way-structure.md#42-spiralgalaxyjsx-from-outside-plate) |
| 20 | `objects.js` **Betelgeuse** "swallow Jupiter's orbit" | as written | **"engulf Mars and reach into the asteroid belt"** — 764 R☉ reaches ~3.55 AU, past Mars but short of Jupiter | Wikipedia/Betelgeuse | [06 §5.3](./06-stars-and-constellations.md#53-betelgeuse-fact--swallow-jupiters-orbit-is-slightly-generous) |
| 21 | `objects.js` **Betelgeuse companion name** | unnamed / informal | **"Siwarħa (α Ori B)"** — IAU-named Aug 2025 | [Howell 2025](https://aasnova.org/2025/07/23/betelgeuses-companion-star-may-have-been-seen-at-last/) · [MacLeod arXiv 2601.00470](https://arxiv.org/pdf/2601.00470) | [08 §3.7](./08-exotic-astrophysics.md#37-betelgeuse--siwarhena-hypergiant) |
| 22 | `planetFacts.oort.wow` **Voyager 1 distance** | `"166 AU today"` (2024 value) | **`"~171 AU today · one light-day from Earth on 18 Nov 2026"`** | [NASA VIM](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) | [07 §4.1](./07-space-probes.md#41-one-value-drifted--voyager-1-166-au-today) |

### 3.3 LOW priority — polish

| # | File · Field | Current | Verified | Source | § |
|---|---|---|---|---|---|
| 23 | `destinations.js:99` **Mercury** `color` | `#7a7d85` (neutral blue-grey) | **`#8A8078`** (subtle tan/brown cast) — optional nudge | Planetary Society | [01 §4.3](./01-sun-and-planets.md#43-low-priority--optional-refinements) |
| 24 | `Nebulae.jsx` **Dumbbell (M27)** `halo` | `#4fb9a8` (teal-on-teal) | **`#ff5a4a`** (Hα/[N II] red wings) | [Dumbbell — Wikipedia](https://en.wikipedia.org/wiki/Dumbbell_Nebula) | [04 §4.2](./04-nebulae.md#42-refine--colour-accuracy-nits-low-priority) |
| 25 | `Nebulae.jsx` **Rosette** `halo` | `#6f9bd6` (blue) | **`#33ccaa`** (real [O III] teal cavity) | [Rosette — Wikipedia](https://en.wikipedia.org/wiki/Rosette_Nebula) | [04 §4.2](./04-nebulae.md#42-refine--colour-accuracy-nits-low-priority) |
| 26 | `dwarfPlanets.js:18` **Bennu** "sugars" | as written | **"amino acids and nucleobases"** — sugars not confirmed for Bennu | Wikipedia/Bennu | [02 §4.3](./02-small-bodies-and-interplanetary-medium.md#43-low-priority--polish--nice-to-have) |
| 27 | `Constellations.jsx` Cygnus/Scorpius dead duplicate anchors | anchors 3, 6, 12 unreferenced | **Delete the duplicates** | — | [06 §5.5](./06-stars-and-constellations.md#55-dead-duplicate-anchors-in-cygnus--scorpius-cleanup) |
| 28 | `DistantGalaxies.jsx:83–122` dead colour/shape config | `tint`, `nucleusTint`, `nucleusScale`, `rotation`, per-galaxy `scale` unused | **Delete** — the four naked-eye galaxies now render from real photos | — | [05 §5.1](./05-local-group-and-galaxies.md#discrepancies--recommended-fixes) |
| 29 | `HomepageGalaxies.jsx` **M31 + M33 missing as true-scale objects** | absorbed into random JWST scatter | **Add as small, real, correctly-coloured Local-Group heroes at 50 / 55 R_MW** | Wikipedia/M31, Wikipedia/M33 | [05 §5.3](./05-local-group-and-galaxies.md#discrepancies--recommended-fixes) |
| 30 | `objects.js` **Andromeda merger** claim | "collision in ~4.5 Gyr" | **Add: "~50% chance within 10 Gyr per Sawala et al. 2025"** — probable, not certain | [Sawala et al. Nature Astronomy 2025](https://www.nature.com/articles/s41550-025-02563-1) | [05 §5.5](./05-local-group-and-galaxies.md#discrepancies--recommended-fixes) |
| 31 | `Voyagers.jsx` position at 4,200 SU vs true 15,770 SU | schematic compression | **Keep, but expose true AU in HUD readout** | — | [07 §4.2](./07-space-probes.md#42-values-in-voyagersjsx-are-direction-honest-but-distance-compressed-documented-keep-as-is) |
| 32 | `planetEditorial.js` **Header comment mapping** | Says `"sol → Sun, about → Mercury, funfacts → Venus…"` | **Actual keyset is `impact, experience, projects, achievements, skills, writing, education, hobbies, testimonials, whatsetsmeapart, contact, hero, kuiper, oort`** — comment is stale | — | [audit] |
| 33 | `ephemeris.js` **missing Ceres + Pluto** | `writing` + `contact` use legacy `R^−1.5` speed | **Add entries: Ceres 4.605 yr, Pluto 248.09 yr** | Wikipedia | [audit] |
| 34 | `moons.js` **Uranus** Ariel + Oberon + Miranda missing | drawn as `moonSet` dots but no hotspot | **Add moons.js entries** | Wikipedia | [audit] |
| 35 | `planetEditorial.contact` Neptune discovery date | `"25 September 1846"` | **Observation Sept 23; Sept 25 was Galle's reply to Le Verrier — clarify** | Wikipedia/Neptune | [audit] |
| 36 | `StarLabels.jsx` Deneb distance | `2600` | **`1411.93 ly`** in the packed HYG catalog — the two files disagree | Wikipedia/Deneb (broad range 1,400–3,200 ly) | [audit] |
| 37 | `/public/textures/galaxies/` sombrero + whirlpool | unused | **Wire into "notable non-naked-eye" pass OR delete** | — | [05 §5.1](./05-local-group-and-galaxies.md#discrepancies--recommended-fixes) |

### 3.4 Already correct — do NOT "fix"

Everything not listed above is verified accurate against 2025–2026 primary
sources. Notable examples:
- All planet radii and axial tilts in `destinations.js` (NSSDCA-matched)
- Saturn moons `"285 confirmed"`, Uranus `"29"`
- Mars colour `#b06a48`, Jupiter `#c9a06a`, Saturn `#e3c485`, Uranus `#aad4cf`
- Halley entry (76-yr, 0.967 eccentricity, retrograde, 2061 next perihelion)
- Every nebula RA/Dec except California (§3.1 #5)
- All star colour math (Ballesteros + Tanner Helland, `mix=0.15`)
- All 15 constellation asterism topologies
- HYG bright-star catalogue (8,920 stars, packed stride-5)
- Every probe entry except Voyager 1 distance drift

---

## 4. Appendix B — Backport-ready delta

Machine-friendly `{file, field, current, verified, source}` table for a
mechanical edit pass. Grouped by file for atomic diff-ability.

```
── src/stellar/config/destinations.js ──────────────────────────────
[78]  sol.color:        "#ff9a3c"          → "#FFF5EC"
[99]  mercury.color:    "#7a7d85"          → "#8A8078"          (optional)
[115] venus.color:      "#f8c555"          → "#E3DAC2"
[317] neptune.color:    "#7fb0c4"          → "#9FC4D4"
[437] asteroid.color:   "#c9b48a"          → "#6f645a"
[438] kuiper.color:     "#9fb0d0"          → "#8a7360"
[434-436] belt-density comment: rewrite to reflect ~3% Moon-mass sparseness

── src/stellar/data/planetFacts.js ─────────────────────────────────
[16]  impact.body:      "…yellow dwarf…"   → "…G2V main-sequence…"
[114] education.moons:  "115 confirmed"    → "101 confirmed" (Mar 2026)
[151] whatsetsmeapart.gravity: OK
[oort.wow]              "Voyager 1 (166 AU today…)"
                                          → "Voyager 1 (~171 AU today · one light-day from Earth on 18 Nov 2026)"

── src/stellar/config/planetData.js ────────────────────────────────
[18]  testimonials.eccentricity: 0.0457    → 0.0472
[19]  whatsetsmeapart.eccentricity: 0.0113 → 0.008678

── src/stellar/config/galaxy.js ────────────────────────────────────
[16 header comment / 44 value]: reconcile Sgr A* mass three-way
                                Pick: 4.30e6 (GRAVITY 2022) — keep value, fix header
                                OR:   4.15e6 (GRAVITY 2019) — change value, keep header

── src/stellar/config/dwarfPlanets.js ──────────────────────────────
[31] Vesta parenthetical: "(S-type)"    → "(V-type, basaltic)"
[78] Orcus wording:  drop "same size class as Pluto"; keep anti-phase orbit
[18] Bennu wording:  "sugars"           → "amino acids and nucleobases"
Dwarf size scaling: ensure Eris ≤ Pluto on screen

── src/stellar/config/objects.js ───────────────────────────────────
[voyager1.info]       "~166 AU (2025)"    → "~171 AU (2026)"
[voyager2.info]       (verify)            → "~144 AU (2026)"
[betelgeuse.info]     "swallow Jupiter's orbit"
                                          → "engulf Mars and reach into the asteroid belt"
[betelgeuse.info]     add: "companion Siwarħa (α Ori B, IAU 2025)"
[atlas3i.info]        "first ACTIVE interstellar comet"
                                          → "the third interstellar object and an active comet"
[andromeda-collision] add: "~50% chance in 10 Gyr (Sawala 2025)"

── src/stellar/config/moons.js ─────────────────────────────────────
add:  ariel, oberon, miranda (Uranus)

── src/stellar/data/ephemeris.js ───────────────────────────────────
add:  writing (Ceres):  4.605 yr
add:  contact (Pluto):  248.09 yr

── src/stellar/v3/data/planetEditorial.js ──────────────────────────
[header comment]  update stale id-mapping comment to current keyset
[contact.discovered]  clarify Neptune date (obs 23 Sep, reply 25 Sep)

── src/stellar/Scene/Nebulae.jsx ───────────────────────────────────
CATALOG[california] ra: 4.012 → 4.055; dec: 36.167 → 36.42
CATALOG[m1/crab] core:  "#ff6b35" → "#b8c8e8"; halo: "#5a8fd6" → "#ff5a4a"
CATALOG[m27/dumbbell] halo: "#4fb9a8" → "#ff5a4a"        (optional)
CATALOG[rosette]      halo: "#6f9bd6" → "#33ccaa"        (optional)

── src/stellar/Scene/SpiralGalaxy.jsx ──────────────────────────────
[7 header comment]  "~27% out"       → "~53% out (halfway-to-two-thirds to the rim)"

── src/stellar/Scene/StarLabels.jsx ────────────────────────────────
Deneb distance: 2600 → reconcile with HYG 1411.93 (or note the literature range)

── src/stellar/Scene/Constellations.jsx ────────────────────────────
Cygnus anchor[3] "Gienah" duplicate → delete
Cygnus anchor[6] "Rukh" duplicate   → delete
Scorpius anchor[12] "Shaula" duplicate → delete

── src/stellar/Scene/DistantGalaxies.jsx ───────────────────────────
Reduce galaxy schema to { name, raHours, decDeg, size }
Delete unused: tint, nucleusTint, nucleusScale, rotation, shape[]-scale

── src/stellar/Scene/HomepageGalaxies.jsx ──────────────────────────
Add M31 + M33 as small, real, correctly-coloured Local-Group heroes
(M31 at 50 R_MW golden-bulge + blue-arms; M33 at 55 R_MW bluer-flocculent)

── public/textures/galaxies/ ──────────────────────────────────────
sombrero.webp, whirlpool.webp — decide: wire into a "notable non-naked-eye
galaxies" pass or delete
```

Total: **~40 edits across 15 files**. Reasonable to land as **6–8 focused
commits**, grouped by theme (colour corrections, moon counts + eccentricities,
Sgr A\* mass reconciliation, Voyager currency, comet/probe wording, dead-code
cleanup, extended objects — Siwarħa etc.).

---

## 5. Appendix C — Source directory

Every primary source cited across `01`–`09`, grouped by class. URLs verified
2026-07-18.

### 5.1 NASA / JPL / ESA official

- [NASA VIM — Where Are Voyager 1 and 2 Now](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/)
- [NASA Kuiper Belt facts](https://science.nasa.gov/solar-system/kuiper-belt/facts/)
- [NASA Dwarf Planets](https://science.nasa.gov/dwarf-planets/)
- [NASA Hubble Crab revisit 2024](https://science.nasa.gov/missions/hubble/nasas-hubble-revisits-crab-nebula-to-track-25-years-of-expansion/)
- [NASA Hubble MW–M31 collision](https://science.nasa.gov/missions/hubble/nasas-hubble-shows-milky-way-is-destined-for-head-on-collision/)
- [NASA Science M33 / Messier 33](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-33/)
- [NASA Perseverance overview](https://mars.nasa.gov/mars2020/mission/overview/)
- [NASA Perseverance location](https://mars.nasa.gov/mars2020/mission/where-is-the-rover/)
- [NASA Ingenuity](https://mars.nasa.gov/technology/helicopter/)
- [NASA JWST](https://webb.nasa.gov/)
- [NASA Parker Solar Probe](https://science.nasa.gov/mission/parker-solar-probe/)
- [NASA Juno](https://science.nasa.gov/mission/juno/)
- [NASA Lucy](https://science.nasa.gov/mission/lucy/)
- [NASA New Horizons](https://science.nasa.gov/mission/new-horizons/)
- [NASA Voyager Golden Record — what's on it](https://voyager.jpl.nasa.gov/golden-record/whats-on-the-record/)
- [NASA Pale Blue Dot](https://solarsystem.nasa.gov/resources/536/voyager-1s-pale-blue-dot/)
- [NASA Saturn's rings](https://science.nasa.gov/resource/saturns-rings-2/)
- [JPL SSD physical parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html)
- [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)
- [ESA XMM-Newton 3I/ATLAS](https://www.esa.int/Science_Exploration/Space_Science/ESA_observations_of_interstellar_Comet_3I_ATLAS)
- [Hubble press — Homunculus 1996](https://hubblesite.org/contents/media/images/1996/23/500-Image.html)

### 5.2 IAU / MPC (small-body & moon nomenclature)

- [IAU Minor Planet Center](https://minorplanetcenter.net/)
- [IAU Distant satellites](https://minorplanetcenter.net/iau/Ephemerides/Distant/)
- [JPL SSD moon elements](https://ssd.jpl.nasa.gov/sats/elem/)
- [Earthsky moon count updates](https://earthsky.org/space/more-moons-for-jupiter-and-saturn-total-satellite-discoveries/)

### 5.3 Peer-reviewed papers

- [GRAVITY 2019 — Sun R₀ + Sgr A\* mass, A&A 625, L10](https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html)
- [EHT M87\* 2019 first image — ApJL 875 L1](https://iopscience.iop.org/article/10.3847/2041-8213/ab0ec7)
- [EHT Sgr A\* 2022 first image — ApJL 930 L12](https://iopscience.iop.org/article/10.3847/2041-8213/ac6674)
- [Reid BeSSeL 2019 — arXiv 1910.03357](https://arxiv.org/abs/1910.03357)
- [Bland-Hawthorn & Gerhard 2016 — arXiv 1602.07702](https://arxiv.org/abs/1602.07702)
- [Wegg, Gerhard & Portail 2015 — arXiv 1504.01401](https://arxiv.org/abs/1504.01401)
- [Churchwell GLIMPSE 2009 — IOP](https://iopscience.iop.org/article/10.1086/597811)
- [Irwin et al. 2024 Uranus/Neptune true colour — MNRAS](https://doi.org/10.1093/mnras/stad3761)
- [Sawala et al. 2025 no-certainty MW–M31 collision — Nature Astronomy](https://www.nature.com/articles/s41550-025-02563-1)
- [Licquia & Newman 2012 MW colour — via Universe Today](https://www.universetoday.com/92523/what-color-is-the-milky-way-white-as-snow-not-milk/)
- [Batygin & Brown 2016 Planet Nine — AJ](https://iopscience.iop.org/article/10.3847/0004-6256/151/2/22)
- [Gillon et al. 2017 TRAPPIST-1 — Nature](https://www.nature.com/articles/nature21360)
- [Agol et al. 2021 TRAPPIST-1 timing](https://iopscience.iop.org/article/10.3847/PSJ/abd022)
- [Greene et al. 2023 TRAPPIST-1b JWST — Nature](https://www.nature.com/articles/s41586-023-05951-7)
- [Boyajian et al. 2015 WTF — arXiv 1509.03622](https://arxiv.org/abs/1509.03622)
- [Boyajian et al. 2018 dust — arXiv 1801.00732](https://arxiv.org/abs/1801.00732)
- [Duncan & Thompson 1992 magnetar — ApJ Letters](https://articles.adsabs.harvard.edu/pdf/1992ApJ...392L...9D)
- [Palmer et al. 2005 SGR 1806−20 flare — Nature](https://www.nature.com/articles/nature03525)
- [FRB 200428 magnetar link — Nature 2020](https://www.nature.com/articles/s41586-020-2863-y)
- [Lorimer et al. 2007 FRB discovery — Science](https://www.science.org/doi/10.1126/science.1147532)
- [CHIME/FRB catalogue 2021 — ApJS](https://iopscience.iop.org/article/10.3847/1538-4365/ac33ab)
- [Montargès et al. 2021 Betelgeuse cool spot — Nature](https://www.nature.com/articles/s41586-021-03546-8)
- [Dupree et al. 2022 Betelgeuse SME — ApJ](https://iopscience.iop.org/article/10.3847/1538-4357/ac4de9)
- [MacLeod et al. 2026 Siwarħa wake — arXiv 2601.00470](https://arxiv.org/pdf/2601.00470)
- [Häberle et al. 2024 ω Cen IMBH — Nature](https://www.nature.com/articles/s41586-024-07511-z)
- [Abbott et al. 2017 GW170817 — PRL](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.119.161101)
- [Abbott et al. 2017 multi-messenger — ApJL](https://iopscience.iop.org/article/10.3847/2041-8213/aa91c9)
- [Metzger 2020 kilonova review — Living Rev Relativity](https://link.springer.com/article/10.1007/s41114-019-0024-0)
- [LIGO GW250114 science summary](https://ligo.org/science-summaries/gw250114_tgr/)
- [GW250114 arXiv 2507.08789](https://arxiv.org/pdf/2507.08789)
- [GWTC-5.0 arXiv 2605.27225](https://arxiv.org/pdf/2605.27225)
- [Kokorev et al. 2024 Little Red Dots — arXiv](https://arxiv.org/abs/2404.02861)
- [Greene et al. 2023 UNCOVER LRDs — arXiv](https://arxiv.org/abs/2309.05714)
- [Einstein 1936 lens — Science](https://www.science.org/doi/10.1126/science.84.2188.506)
- [First Einstein ring MG 1131 — Hewitt Nature 1988](https://www.nature.com/articles/333537a0)
- [JWST-ER1 — van Dokkum Nature Astronomy 2024](https://www.nature.com/articles/s41550-023-02150-2)
- [Kerr 1963 metric — PRL](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.11.237)
- [Bardeen 1972 ISCO — ApJ](https://articles.adsabs.harvard.edu/pdf/1972ApJ...178..347B)
- [Shakura-Sunyaev 1973 α-disc](https://ui.adsabs.harvard.edu/abs/1973A%26A....24..337S/abstract)
- [Hawking 1974 — Nature](https://www.nature.com/articles/248030a0)
- [Hawking 1975 — CMP](https://link.springer.com/article/10.1007/BF02345020)
- [Hawking 1992 chronology protection — PRD](https://journals.aps.org/prd/abstract/10.1103/PhysRevD.46.603)
- [Einstein-Rosen 1935 — PhysRev](https://journals.aps.org/pr/abstract/10.1103/PhysRev.48.73)
- [Morris & Thorne 1988 traversable wormhole — AJP](https://doi.org/10.1119/1.15620)
- [Voyager 1 heliopause 2013 — Science](https://www.science.org/doi/10.1126/science.1241681)
- [Voyager 2 heliopause 2019 — Nature Astronomy](https://www.nature.com/articles/s41550-019-0928-3)
- [Pluto flyby 2015 — Stern Science](https://www.science.org/doi/10.1126/science.aad1815)
- [Arrokoth flyby 2019 — Stern Science](https://www.science.org/doi/10.1126/science.aaw9771)
- [Juno deep atmosphere — Bolton Nature 2017](https://www.nature.com/articles/nature25794)
- [Dinkinesh + Selam — Nature 2024](https://www.nature.com/articles/s41586-024-07378-0)
- [Jupiter switchbacks — Kasper Nature 2019](https://www.nature.com/articles/s41586-019-1813-z)
- [Alfvén surface — Kasper PRL 2021](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.127.255101)
- [Ballesteros 2012 B–V↔Teff](https://pyastronomy.readthedocs.io/en/latest/pyaslDoc/aslDoc/aslExt_1Doc/ramirez2005.html)
- [Tanner Helland T→RGB algorithm](https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html)
- [Harre & Heller 2021 star colours — Astron Nachr](https://onlinelibrary.wiley.com/doi/10.1002/asna.202113868)
- [Interstellar comet 3I/ATLAS — MNRAS Letters](https://academic.oup.com/mnrasl/article/542/1/L139/8206197)

### 5.4 Catalogues & databases

- [HYG database v4.1 (Astronexus)](https://github.com/astronexus/HYG-Database)
- [SIMBAD](https://simbad.u-strasbg.fr/simbad/)
- [ATNF Pulsar Catalogue](https://www.atnf.csiro.au/research/pulsar/psrcat/)
- [ESA Gaia DR3](https://gea.esac.esa.int/archive/)
- [SEDS Messier catalogue](https://messier.seds.org/)

### 5.5 Encyclopaedic (verified against primary source)

Every Wikipedia infobox used is a mirror of NSSDCA/JPL/IAU/peer-reviewed data:

Solar system bodies — [Sun](https://en.wikipedia.org/wiki/Sun), [Mercury](https://en.wikipedia.org/wiki/Mercury_(planet)),
[Venus](https://en.wikipedia.org/wiki/Venus), [Earth](https://en.wikipedia.org/wiki/Earth),
[Mars](https://en.wikipedia.org/wiki/Mars), [Jupiter](https://en.wikipedia.org/wiki/Jupiter),
[Saturn](https://en.wikipedia.org/wiki/Saturn), [Uranus](https://en.wikipedia.org/wiki/Uranus),
[Neptune](https://en.wikipedia.org/wiki/Neptune).

Small bodies — [Pluto](https://en.wikipedia.org/wiki/Pluto), [Ceres](https://en.wikipedia.org/wiki/Ceres_(dwarf_planet)),
[Eris](https://en.wikipedia.org/wiki/Eris_(dwarf_planet)), [Makemake](https://en.wikipedia.org/wiki/Makemake),
[Haumea](https://en.wikipedia.org/wiki/Haumea), [Gonggong](https://en.wikipedia.org/wiki/Gonggong_(dwarf_planet)),
[Quaoar](https://en.wikipedia.org/wiki/50000_Quaoar), [Sedna](https://en.wikipedia.org/wiki/90377_Sedna),
[Orcus](https://en.wikipedia.org/wiki/90482_Orcus), [Vesta](https://en.wikipedia.org/wiki/4_Vesta),
[Pallas](https://en.wikipedia.org/wiki/2_Pallas), [Hygiea](https://en.wikipedia.org/wiki/10_Hygiea),
[Psyche](https://en.wikipedia.org/wiki/16_Psyche), [Bennu](https://en.wikipedia.org/wiki/101955_Bennu),
[Ryugu](https://en.wikipedia.org/wiki/162173_Ryugu), [Apophis](https://en.wikipedia.org/wiki/99942_Apophis),
[Arrokoth](https://en.wikipedia.org/wiki/(486958)_Arrokoth), [Chariklo](https://en.wikipedia.org/wiki/10199_Chariklo),
[Chiron](https://en.wikipedia.org/wiki/2060_Chiron).

Belts, cloud, comets — [Asteroid belt](https://en.wikipedia.org/wiki/Asteroid_belt),
[Kirkwood gap](https://en.wikipedia.org/wiki/Kirkwood_gap), [Kuiper belt](https://en.wikipedia.org/wiki/Kuiper_belt),
[Oort cloud](https://en.wikipedia.org/wiki/Oort_cloud), [Heliosphere](https://en.wikipedia.org/wiki/Heliosphere),
[Local Interstellar Cloud](https://en.wikipedia.org/wiki/Local_Interstellar_Cloud),
[Zodiacal light](https://en.wikipedia.org/wiki/Zodiacal_light), [Comet](https://en.wikipedia.org/wiki/Comet),
[Halley's Comet](https://en.wikipedia.org/wiki/Halley%27s_Comet), [3I/ATLAS](https://en.wikipedia.org/wiki/3I/ATLAS).

Galaxies + Local Group — [Milky Way](https://en.wikipedia.org/wiki/Milky_Way),
[Local Group](https://en.wikipedia.org/wiki/Local_Group),
[Andromeda](https://en.wikipedia.org/wiki/Andromeda_Galaxy),
[Triangulum](https://en.wikipedia.org/wiki/Triangulum_Galaxy),
[LMC](https://en.wikipedia.org/wiki/Large_Magellanic_Cloud),
[SMC](https://en.wikipedia.org/wiki/Small_Magellanic_Cloud),
[Centaurus A](https://en.wikipedia.org/wiki/Centaurus_A),
[M81](https://en.wikipedia.org/wiki/Messier_81),
[Pinwheel M101](https://en.wikipedia.org/wiki/Pinwheel_Galaxy),
[Whirlpool M51](https://en.wikipedia.org/wiki/Whirlpool_Galaxy),
[Sombrero M104](https://en.wikipedia.org/wiki/Sombrero_Galaxy),
[Andromeda–MW collision](https://en.wikipedia.org/wiki/Andromeda%E2%80%93Milky_Way_collision).

Nebulae (29 in [04 §2.1](./04-nebulae.md#21-catalogue-table)).

Stars + constellations (per-star + per-asterism in [06](./06-stars-and-constellations.md)).

Exotic + BH/wormhole physics — [Sagittarius A\*](https://en.wikipedia.org/wiki/Sagittarius_A*),
[Pulsar](https://en.wikipedia.org/wiki/Pulsar), [Magnetar](https://en.wikipedia.org/wiki/Magnetar),
[Brown dwarf](https://en.wikipedia.org/wiki/Brown_dwarf), [Rogue planet](https://en.wikipedia.org/wiki/Rogue_planet),
[TRAPPIST-1](https://en.wikipedia.org/wiki/TRAPPIST-1), [Betelgeuse](https://en.wikipedia.org/wiki/Betelgeuse),
[Eta Carinae](https://en.wikipedia.org/wiki/Eta_Carinae), [Crab Nebula](https://en.wikipedia.org/wiki/Crab_Nebula),
[SN 1054](https://en.wikipedia.org/wiki/SN_1054), [Crab Pulsar](https://en.wikipedia.org/wiki/Crab_Pulsar),
[GW170817](https://en.wikipedia.org/wiki/GW170817), [Einstein ring](https://en.wikipedia.org/wiki/Einstein_ring),
[Omega Centauri](https://en.wikipedia.org/wiki/Omega_Centauri), [GW250114](https://en.wikipedia.org/wiki/GW250114),
[Tabby's Star](https://en.wikipedia.org/wiki/Tabby%27s_Star), [Wow! signal](https://en.wikipedia.org/wiki/Wow!_signal),
[Planet Nine](https://en.wikipedia.org/wiki/Planet_Nine), [Fast radio burst](https://en.wikipedia.org/wiki/Fast_radio_burst),
[Schwarzschild metric](https://en.wikipedia.org/wiki/Schwarzschild_metric),
[Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric),
[Event Horizon Telescope](https://en.wikipedia.org/wiki/Event_Horizon_Telescope),
[Wormhole](https://en.wikipedia.org/wiki/Wormhole),
[Kip Thorne *Science of Interstellar*](https://en.wikipedia.org/wiki/The_Science_of_Interstellar).

Space probes — [Voyager 1](https://en.wikipedia.org/wiki/Voyager_1),
[Voyager 2](https://en.wikipedia.org/wiki/Voyager_2),
[Perseverance rover](https://en.wikipedia.org/wiki/Perseverance_(rover)),
[JWST](https://en.wikipedia.org/wiki/James_Webb_Space_Telescope),
[Parker Solar Probe](https://en.wikipedia.org/wiki/Parker_Solar_Probe),
[Juno spacecraft](https://en.wikipedia.org/wiki/Juno_(spacecraft)),
[Lucy spacecraft](https://en.wikipedia.org/wiki/Lucy_(spacecraft)),
[New Horizons](https://en.wikipedia.org/wiki/New_Horizons),
[*Murmurs of Earth*](https://en.wikipedia.org/wiki/Murmurs_of_Earth).

---

## 6. Verification checklist

- [x] Every inventory object in §2 has a paper reference.
- [x] Every audit item in §3 (Appendix A) has a primary source.
- [x] Every audit item in §3 has a matching entry in §4 (Appendix B).
- [x] Every URL in §5 (Appendix C) is a live link verified 2026-07-18.
- [x] Two-source cross-check applied to volatile 2025–2026 values (Voyager
      distances, Siwarħa, GW250114, 3I/ATLAS, ω Cen IMBH).
- [x] No numbers sourced from memory. Where doc-author judgment was applied
      (e.g. picking `4.30e6` vs `4.15e6` for Sgr A\*), it's flagged as a
      choice, not a fact.

---

## 7. Next steps (not this pass)

- **User reviews §3 Appendix A + §4 Appendix B.**
- After approval, a **single small edit pass** applies the ~40 mechanical
  changes across 15 files, in 6–8 focused commits.
- Follow-up pass would add missing per-body `sources[]` arrays across
  `planetFacts.js` per the pattern in
  [`docs/architecture/knowledge-foundation.md`](../architecture/knowledge-foundation.md#the-provenance-pattern).

*Nothing here should be executed without the user's explicit "go." This
document is the reference; the edits are a separate, gated pass.*

**Compiled 2026-07-18.** For questions on any specific object, jump to the
referenced paper §.
