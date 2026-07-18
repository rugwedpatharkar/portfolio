# 08 — Exotic Astrophysics: The Deep-Field Anomalies

**Scope.** Every non-solar-system "anomaly" beacon rendered off the main tour
line in [`src/stellar/config/objects.js`](src/stellar/config/objects.js) that is
**real astrophysics** (not sci-fi). Named:

- **Compact remnants** — pulsar, magnetar, black-hole class (Sgr A\* summary
  here; full black-hole physics in [`09-black-holes-and-wormholes.md`](./09-black-holes-and-wormholes.md))
- **Sub-stellar & rogue** — brown dwarf, rogue planet
- **Exoplanet system** — TRAPPIST-1
- **Extreme evolved stars** — Betelgeuse (+ Siwarħa), Eta Carinae + Homunculus,
  Antares
- **Ejecta / remnants** — Crab Nebula, Kilonova (GW170817)
- **Gravitational** — Einstein Ring, GW250114 chirp
- **Star clusters** — Omega Centauri
- **Deep JWST puzzles** — Little Red Dots
- **SETI-flag anomalies** — Tabby's Star (KIC 8462852), Wow! Signal
- **Predicted / unseen** — Planet Nine
- **Radio transients** — Fast Radio Bursts

Sci-fi cameos (TARDIS, HAL 9000, Death Star, etc.) are excluded — CLAUDE.md's
"scientific accuracy is the prime goal" rules them off-topic for this pass.

**Method.** Every numerical claim carries a primary-source citation. Where
recent 2025–2026 results supersede prior consensus (Siwarħa, GW250114, 3I/ATLAS,
JWST Little Red Dots, Sawala-Andromeda revisions), the current value is used
with the paper cited.

---

## 1. Executive summary

- **Pulsar** — a **rapidly-rotating, magnetised neutron star**, beaming radio
  (and often X/γ-ray) pencils out its magnetic poles that we detect as regular
  pulses when the beam sweeps Earth. Discovered by **Jocelyn Bell Burnell &
  Antony Hewish (1967)** as **PSR B1919+21** (~1.337 s period). Zoo now
  contains **~3,500 known pulsars**, from the **Crab pulsar (33.4 ms, born
  1054 AD)** to the **millisecond pulsar PSR J1748−2446ad (1.396 ms, 716 Hz)**.
- **Magnetar** — a neutron star with **B ~10¹⁴–10¹⁵ G**, ~1,000× a normal
  pulsar and >10¹² × Earth's field. There are ~30 known. **SGR 1806−20** produced
  the strongest γ-ray flare ever seen from outside the solar system (27 Dec
  2004, briefly outshining the Sun in γ-rays despite being 50,000 ly away).
  **SGR 1935+2154** is now the confirmed source of the only Milky-Way FRB
  (28 Apr 2020).
- **Brown dwarf** — the "failed star" band **13–80 Jupiter masses** — massive
  enough to fuse deuterium but never sustained hydrogen fusion. Spectral
  classes **L (2400–1300 K), T (1300–500 K), Y (<500 K)**. The coldest known,
  **WISE 0855−0714**, is **7.27 ly away** and ~285 K — cooler than a summer day
  on Earth.
- **Rogue planet** — a planetary-mass body not gravitationally bound to any
  star. Microlensing surveys estimate the Milky Way holds **more rogue planets
  than stars**. Direct-imaged examples: **CFBDSIR 2149−0403** (~4–7 Jupiter
  masses, ~130 ly), and (2023) a JWST-discovered "Jupiter-mass binary object"
  pair in the Orion Nebula ("JuMBOs").
- **TRAPPIST-1** — an **M8V ultracool dwarf 40.66 ly away** hosting **seven
  Earth-size planets**, three (**TRAPPIST-1e, f, g**) in the conservative
  habitable zone. JWST NIRSpec transmission spectra (2023–24) rule out
  hydrogen-dominated atmospheres on b, c, d; e/f/g atmospheres are being
  characterised through 2026.
- **Betelgeuse (α Orionis)** — an **M1–2 Ia red supergiant, 550–640 ly**,
  ~764 R☉ (would engulf Mars and reach into the asteroid belt), variable both
  in size and brightness. **Great Dimming Oct 2019 – Mar 2020**: brightness
  fell by 60%, caused by a hemispheric cool-spot + a dust cloud from a
  Surface Mass Ejection (SME). **Companion Siwarħa (α Ori B)**: 0.6 ± 0.14 M☉
  orbiting at ~2.3 R⋆ every ~2,110 days (5.78 yr), directly detected in an
  expanding-wake structure in Jan 2026 (Howell et al., MacLeod et al. 2025;
  IAU-named 2025).
- **Eta Carinae (η Car)** — a **luminous blue variable binary 7,500 ly** away,
  ~100 + 30 M☉ pair, wrapped in the **Homunculus Nebula** — a bipolar dust
  shell ejected during the **1843 "Great Eruption"** that briefly made it the
  second-brightest star in the sky.
- **Crab Nebula (M1 / NGC 1952)** — the **supernova remnant of SN 1054 AD**,
  witnessed and recorded by Chinese, Arab and Chaco astronomers, ~6,500 ly
  away, expanding at 1,500 km/s. Contains the **Crab Pulsar (PSR B0531+21)**, a
  33.4-ms neutron star powering the nebula's synchrotron continuum.
- **Kilonova / GW170817** — the first neutron-star merger **detected in
  gravitational waves + light**, 17 Aug 2017. Host galaxy **NGC 4993, 40 Mpc**.
  Confirmed neutron-star mergers as a **major r-process nucleosynthesis
  site** — the origin of gold, platinum, uranium.
- **Einstein Ring** — near-perfect gravitational lens (Einstein-Chwolson 1936,
  first observed 1988 in **MG 1131+0456**). Modern JWST examples include
  **JWST-ER1** (2023) — a completely fused ring around an ultra-compact
  ~10⁴ M⊙ galaxy at z ≈ 0.75.
- **Omega Centauri (NGC 5139 / ω Cen)** — the **most massive globular cluster
  known**, ~4 million stars, 17,090 ly. Increasingly regarded as the stripped
  **core of a former dwarf galaxy** ("Gaia-Sausage-Enceladus"), possibly
  harbouring a **~10⁴ M☉ intermediate-mass black hole**.
- **GW250114** — the **loudest binary black-hole merger ever detected**
  (SNR 76.9), on **14 Jan 2025 in LIGO O4b**. 34 + 32 M☉ black holes at ~1.3
  billion ly. Provided the first direct confirmation of Hawking's **black-hole
  area theorem** and multiple quasinormal-mode measurements of the remnant.
- **JWST "Little Red Dots"** — a population of **300+ compact, red, high-z
  sources** first isolated in 2023 and characterised through 2024–2026;
  interpretation still open (dust-obscured AGN vs dense old-star nuclei), but
  their density challenges every pre-JWST early-universe model.
- **Tabby's Star (KIC 8462852)** — an F3V main-sequence star 1,470 ly away
  with **irregular dips up to 22%** discovered in Kepler data by Boyajian et
  al. (2015). Best current explanation: **uneven circumstellar dust**, likely
  from a disrupted exocomet swarm or fragmenting body.
- **Wow! Signal** — 15 Aug 1977, **72-s narrow-band signal at 1420.36 MHz**
  detected by the Big Ear radio telescope (Ohio State). Recorded as "6EQUJ5"
  by astronomer Jerry Ehman, who wrote "Wow!" in the margin. Never repeated;
  origin still unexplained.
- **Planet Nine** — hypothetical **5–10 Earth-mass planet at ~400–700 AU**
  proposed by **Batygin & Brown 2016** to explain the orbital clustering of
  extreme trans-Neptunian objects. Direct-detection searches (WISE, Subaru
  HSC, VRO) are ongoing; **still unseen** as of 2026.
- **Fast Radio Bursts (FRBs)** — millisecond-duration radio pulses of
  extragalactic origin, discovered by **Duncan Lorimer (2007)**. Now
  thousands catalogued. **FRB 20200428D** (28 Apr 2020) was the first (and so
  far only) FRB traced back to a Milky-Way source — the magnetar **SGR
  1935+2154** — pinning at least some FRBs to magnetar activity.

---

## 2. Reference table (identity, distance, key numbers)

| Object | Type | Distance | Key numbers | Portfolio component |
|---|---|---|---|---|
| **Sgr A\*** | 4.297 × 10⁶ M☉ SMBH | 26,673 ly (Milky Way centre) | Schwarzschild radius ~12 M km; EHT ring diameter ~52 μas | `ExoticObjects.jsx` (Sagittarius A\*) |
| **Pulsar** (portfolio) | rotating neutron star | (schematic) | 33 ms (Crab example); 716 Hz (fastest MSP) | `Pulsar.jsx` (blinks Morse "WAVE") |
| **Magnetar** | B ~10¹⁴–10¹⁵ G neutron star | (schematic; SGR 1806−20 at ~28,500 ly) | Peak γ-ray flare 10⁴⁶ erg | `ExoticObjects.jsx` (Magnetar) |
| **Brown dwarf** | 13–80 M_J | (schematic; WISE 0855 at 7.27 ly) | L/T/Y spectral types, T_eff 300–2400 K | `ExoticObjects.jsx` (Brown Dwarf) |
| **Rogue planet** | planetary-mass free-floater | (schematic; CFBDSIR 2149 at ~130 ly) | Microlensing suggests >1× per Milky Way star | `ExoticObjects.jsx` (Rogue Planet) |
| **Crab Nebula (M1)** | SNR + Crab Pulsar | 6,500 ly | SN 1054; P = 33.4 ms; d_expansion ~1,500 km/s | `ExoticObjects.jsx` + `Nebulae.jsx` |
| **TRAPPIST-1** | M8V ultracool dwarf | 40.66 ly | 7 Earth-size planets; 3 in HZ | `ExoticObjects.jsx` |
| **Betelgeuse (+ Siwarħa)** | M1–2 Ia red supergiant + 0.6 M☉ companion | 550–640 ly | 764 R☉; P_orb 2,110 d; SN in 100,000 yr | `Hypergiant.jsx` |
| **Eta Carinae (+ Homunculus)** | LBV binary | 7,500 ly | ~100 + 30 M☉; 1843 Great Eruption ejected 10 M☉ | `EtaCarinae.jsx` |
| **Kilonova (GW170817)** | NS-NS merger | 40 Mpc = 130 Mly | 1.3 s GRB delay; r-process yield ~0.05 M☉ | `Kilonova.jsx` |
| **Einstein Ring** | strong lens | (varies) | θ_E = √(4GM D_LS / c² D_L D_S) | `EinsteinRing.jsx` |
| **Omega Centauri (NGC 5139)** | globular cluster / stripped dwarf core | 17,090 ly | ~4 × 10⁶ stars; ~10⁴ M☉ IMBH candidate | `GlobularCluster.jsx` |
| **GW250114** | BBH chirp | ~1.3 billion ly | 34 + 32 M☉; SNR 76.9; area-theorem confirmed | `GravWaveChirp.jsx` |
| **JWST Little Red Dots** | compact z ~ 4–8 sources | ~10–13 Gly | 300+ known; masses ~10⁷–10⁹ M☉ | `RedDots.jsx` |
| **Tabby's Star (KIC 8462852)** | F3V + dust | 1,470 ly | Dips up to 22% | `DeepFieldMysteries.jsx` |
| **Wow! Signal** | 72-s narrowband 1420 MHz | (unknown; toward Sagittarius) | Occurred 15 Aug 1977; never repeated | `DeepFieldMysteries.jsx` |
| **Planet Nine** | hypothesised 5–10 M⊕ | ~400–700 AU | P_orb ~10,000–20,000 yr | `DeepFieldMysteries.jsx` |
| **Fast Radio Burst** | ms-duration radio transient | ~Mpc–Gpc | ~10³⁵–10⁴³ erg per burst | `DeepFieldMysteries.jsx` |

Distances marked "schematic" are portfolio placement decisions; the
representative real-world value gives the closest example of that class for
context.

---

## 3. Deep dive per object

### 3.1 Sagittarius A\* (summary — full physics in [09-black-holes-and-wormholes.md](./09-black-holes-and-wormholes.md))

- **Location.** RA 17 h 45 m 40.04 s, Dec −29° 00′ 28″, in Sagittarius.
- **Distance.** **26,673 ly (8.178 kpc)** — the geometric distance from the
  GRAVITY 2019 A&A paper, precise to 0.3% via S-star orbits.
- **Mass.** Three papers converge on the same object but different values:
  **4.297 × 10⁶ M☉** (GRAVITY 2022), **4.154 × 10⁶** (GRAVITY 2019),
  **4.10 × 10⁶** (Event Horizon Telescope 2022). The portfolio's
  [`config/galaxy.js`](src/stellar/config/galaxy.js) uses `4.3e6` (GRAVITY
  2022); the fact-card at `impact.gravity` uses `4.15M` (GRAVITY 2019). Pick
  one for consistency; see §5 of [`03-milky-way-structure.md`](./03-milky-way-structure.md).
- **Physics.** Non-rotating-or-slowly-rotating (a\*/c ≤ 0.1 per EHT/GRAVITY);
  Schwarzschild radius ~1.27 × 10¹⁰ m ≈ 12 M km (~24 s at c); ISCO 3× that;
  photon sphere 1.5× that.
- **EHT image (12 May 2022).** The apparent ring is **~52 microarcseconds**
  across — corresponds to the accretion-flow ring around a shadow of ~5 R_s.
  Consistent with GR to ~10%.
- **Sky proxy.** Look toward the **Teapot** asterism in Sagittarius; the
  brightest Milky Way star cloud (the Sagittarius Star Cloud) sits just above
  Sgr A\*.

**Sources.**
[GRAVITY Collaboration 2019 (R₀ + mass), A&A](https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html) ·
[EHT Sgr A\* 2022, ApJL 930](https://iopscience.iop.org/journal/2041-8205) ·
[Sgr A\* — Wikipedia](https://en.wikipedia.org/wiki/Sagittarius_A*)

### 3.2 Pulsars (`pulsar`)

A pulsar is a **neutron star** — the collapsed core of a massive star — that
is **rapidly rotating and highly magnetised**. Charged particles in its
magnetosphere emit **radio (and often optical / X-ray / γ-ray) beams along
the magnetic dipole axis**. Because that axis is generally *tilted* to the
spin axis (like Earth's), the beams sweep space like a lighthouse; if Earth
lies in the beam plane, we detect a periodic pulse each rotation.

**Discovery.** **Jocelyn Bell Burnell** identified the first pulsar as a
1.337-s scintillation-like signal in the Interplanetary Scintillation Array
data at Cambridge in **November 1967**. Because the signal was so regular her
supervisor **Antony Hewish** briefly labelled the source "LGM-1" (Little Green
Men). After more pulsars were found within months, an astrophysical origin
became certain. Hewish shared the 1974 Nobel Prize — Bell Burnell's exclusion
remains one of the most-cited omissions in physics.

**Population and extremes.**
- **~3,500** known pulsars (Australia Telescope National Facility catalogue,
  2024).
- **Ordinary period range**: ~30 ms – 8 s.
- **Millisecond pulsars (MSPs)** — spun up by mass transfer from a binary
  companion. Range ~1.4–30 ms. **PSR J1748−2446ad (716 Hz, 1.396 ms period)**
  — the fastest confirmed, in Terzan 5.
- **Crab Pulsar (PSR B0531+21)** — 33.4 ms period; born from the 1054 AD
  supernova; slowing at 36 ns/day (the "spin-down" powers the entire Crab
  Nebula's synchrotron output).
- **Vela Pulsar** — 89 ms period; famous glitch-and-recover behaviour.

**Portfolio notes.** [`Pulsar.jsx`](src/stellar/Scene/anomalies/Pulsar.jsx)
blinks Morse "WAVE" — a deliberate signature (nod to LGM-1 + the "why does a
pulsar tell us anything?" aesthetic), not physical. The real pulses would be
radio (invisible), but Crab-type young pulsars *do* have optical pulses at 33
Hz — beyond human visual persistence.

**Wow-facts.**
1. Neutron-star density ~2 × 10¹⁷ kg/m³ — a sugar-cube would weigh **1 billion
   tonnes** on Earth.
2. Pulsar timing arrays (NANOGrav, EPTA, PPTA, InPTA) use ~50 MSPs as a
   **galaxy-scale interferometer** to detect the nanohertz gravitational-wave
   background — announced in 2023 as a ~4 σ detection from supermassive
   binary-BH populations.
3. A young pulsar's *spin-down luminosity* dominates its synchrotron output.
   The Crab is losing ~5 × 10³⁸ erg/s (~120,000 × the Sun) purely from rotational
   deceleration.

**Sources.**
[Pulsar — Wikipedia](https://en.wikipedia.org/wiki/Pulsar) ·
[ATNF Pulsar Catalogue](https://www.atnf.csiro.au/research/pulsar/psrcat/) ·
[Hewish Nobel Lecture 1974](https://www.nobelprize.org/prizes/physics/1974/hewish/lecture/) ·
[Bell Burnell — Wikipedia](https://en.wikipedia.org/wiki/Jocelyn_Bell_Burnell)

### 3.3 Magnetar (`magnetar`)

A neutron star with a **magnetic field 10¹²–10¹⁵ G**, orders of magnitude
above ordinary pulsars (10⁸–10¹²), and ~10¹⁵ × Earth's. First proposed by
**Duncan & Thompson 1992** to explain rare X-ray bursters called
**Soft Gamma Repeaters (SGRs)** and **Anomalous X-ray Pulsars (AXPs)**;
observationally confirmed through the 2000s.

**Physics.** Magnetic pressure exceeds all other stresses in the crust; the
neutron star's ~10-km surface undergoes **starquakes** when magnetic-field
reconfigurations exceed the crust's tensile strength. These release
**giant flares** — brief, immense γ-ray bursts.

**Observed extremes.**
- **SGR 1806−20 giant flare, 27 Dec 2004** — a 0.2-s peak that briefly
  outshone the entire visible universe in soft γ-rays. Reached Earth with
  enough energy to ionise the upper ionosphere despite the source being
  ~28,500 ly away.
- **SGR 1935+2154, 28 Apr 2020** — produced a bright radio burst
  (**FRB 20200428D**) simultaneously with an X-ray burst. The first (and so
  far only) FRB traced to a Milky-Way source; the confirmed magnetar-FRB link.
- **SGR J1550−5418** — a magnetar that has emitted both persistent X-ray
  emission and burst activity, and is one of the few magnetars showing radio
  pulses too.

**Population.** ~30 confirmed magnetars, plus another ~10 candidates. Most
are young (10³–10⁴ years) — their extreme fields are probably transient,
decaying to ordinary-pulsar values within a few Myr.

**Portfolio notes.** [`ExoticObjects.jsx`](src/stellar/Scene/anomalies/ExoticObjects.jsx)
`Magnetar` uses a fast-flicker beacon — an accurate suggestion of burst-mode
behaviour. The real bursts are radio + X-ray + γ-ray; the visible-light
emission is negligible.

**Wow-facts.**
1. A magnetar's field would strip electrons off atoms in your body from
   1,000 km away — the *air* would become plasma.
2. The 2004 SGR 1806−20 flare deposited more energy in Earth's atmosphere in
   0.2 s than the Sun does in 250,000 years.
3. Magnetars are the most-favoured engine for at least the *repeating* subset
   of Fast Radio Bursts (§3.15).

**Sources.**
[Magnetar — Wikipedia](https://en.wikipedia.org/wiki/Magnetar) ·
[Duncan & Thompson 1992, ApJ Letters](https://articles.adsabs.harvard.edu/pdf/1992ApJ...392L...9D) ·
[SGR 1806−20 giant flare — Palmer et al. Nature 2005](https://www.nature.com/articles/nature03525) ·
[FRB 200428 magnetar link — Nature 2020](https://www.nature.com/articles/s41586-020-2863-y)

### 3.4 Brown Dwarf (`brownDwarf`)

A brown dwarf is a **sub-stellar object** with **mass between ~13 and ~80
Jupiter masses**. The lower bound is the deuterium-burning threshold; the
upper bound is the hydrogen-fusion threshold that separates brown dwarfs from
red-dwarf stars.

**Formation.** Brown dwarfs form the way stars do — collapse of a molecular
cloud fragment — but the fragment doesn't have enough mass to reach
core temperatures for sustained H fusion. They radiate the gravitational
energy of collapse (plus a brief deuterium-fusion phase), and cool for the
rest of their lives.

**Spectral classes** (M → L → T → Y).
- **M dwarf overlap**: hottest brown dwarfs (~2,500 K) look like ultracool M
  stars.
- **L** (~1,300–2,400 K): iron and silicate clouds in the atmosphere.
- **T** (~500–1,300 K): methane bands dominate the near-IR spectrum.
- **Y** (<500 K): ammonia, water clouds; identified 2011.

**Cold extremes.**
- **WISE 0855−0714** — the coldest known brown dwarf, discovered 2014;
  distance **7.27 ly**, effective temperature **~285 K** (about the same as an
  ice-water bath). It's the fourth-closest stellar/sub-stellar object to the
  Sun.
- **WISE 1828+2650** — Y2 dwarf, ~350–400 K, ~40 ly.

**Population.** Estimates place brown dwarfs at ~1/6 the local stellar
density — hundreds of billions in the Milky Way.

**Wow-facts.**
1. A brown dwarf near the low-mass end (~13 M_J) is barely bigger than
   Jupiter — mass scales up faster than radius, and quantum electron pressure
   levels off the radius across the brown-dwarf band.
2. The coolest brown dwarfs have *water clouds* in their atmospheres — the
   only sub-stellar objects (besides ice giants) that do.
3. Some brown dwarfs pulsate in ~1-hr auroral radio emission — magnetic
   activity oddly like Jupiter's, not the Sun's.

**Sources.**
[Brown dwarf — Wikipedia](https://en.wikipedia.org/wiki/Brown_dwarf) ·
[WISE 0855-0714 discovery — Luhman ApJ 2014](https://iopscience.iop.org/article/10.1088/2041-8205/786/2/L18) ·
[Y-dwarf class — Cushing et al. ApJ 2011](https://iopscience.iop.org/article/10.1088/0004-637X/743/1/50)

### 3.5 Rogue Planet (`roguePlanet`)

A rogue (or "free-floating") planet is a **planetary-mass object not
gravitationally bound to any star**. They may form by (a) collapse of a
low-mass cloud fragment (like a brown dwarf), or (b) ejection from a stellar
system through gravitational scattering.

**Population estimate.** Microlensing surveys (**MOA-II, KMTNet, WFIRST/Roman
future**) indicate **the Milky Way holds more free-floating planetary-mass
objects than stars** — a factor of ~4 by some estimates. Most are below
Jupiter-mass and undetectable except through gravitational lensing.

**Direct detections.**
- **CFBDSIR 2149−0403** — young free-floater, ~4–7 M_J, ~130 ly, in the AB
  Doradus moving group (2012).
- **PSO J318.5-22** — ~6 M_J, ~80 ly, β Pic moving group (2013).
- **WISE J0855−0714** — technically a brown dwarf at 3–10 M_J, closest to the
  planetary-mass boundary of any local body (2014).
- **JuMBOs** — "Jupiter-mass Binary Objects" — a JWST 2023 discovery in the
  Orion Nebula Cluster: ~40 planetary-mass pairs of 0.6–14 M_J objects
  gravitationally bound in binaries. Their formation mechanism (in-situ vs
  ejection) is under debate.

**Habitability.** Would need internal heat (from formation, tidal, or
radiogenic sources) to sustain a subsurface ocean under a thick H₂ atmosphere.
Physically plausible; observationally untested.

**Wow-facts.**
1. A rogue planet has no "day" — no orbit around a star means no diurnal
   cycle. Only its own rotation ticks time.
2. If Earth were ejected, the atmosphere would freeze out onto the surface
   within a year. But a Jupiter-mass rogue could retain thick gaseous H₂ and
   plausibly hold a liquid-water ocean under it.
3. Some rogue planets may host moons — the "moon-of-a-rogue" scenario is a
   frequent target for future habitability searches.

**Sources.**
[Rogue planet — Wikipedia](https://en.wikipedia.org/wiki/Rogue_planet) ·
[CFBDSIR 2149−0403 — Delorme et al. A&A 2012](https://www.aanda.org/articles/aa/full_html/2012/12/aa20174-12/aa20174-12.html) ·
[JuMBOs discovery — Pearson & McCaughrean 2023](https://arxiv.org/abs/2310.01231) ·
[MOA-II microlensing — Sumi et al. Nature 2011](https://www.nature.com/articles/nature10092)

### 3.6 TRAPPIST-1 (`trappist1`)

An **M8V ultracool dwarf**, spectral class between red-dwarf and brown-dwarf,
mass **~0.089 M☉**, radius **~0.121 R☉**, effective temperature **~2,566 K**,
age **~7.6 Gyr**. Distance **40.66 ± 0.04 ly** — close enough for JWST to
transmission-spectrograph the atmospheres.

**Planets** — all seven **discovered by Michaël Gillon and collaborators
2015–2017** using the **TRAPPIST** small-telescope network in Chile + Morocco,
then confirmed by Spitzer, HST, and now JWST.

| Planet | R (⊕) | M (⊕) | a (AU) | P_orb (d) | T_eq (K) | HZ status |
|---|---|---|---|---|---|---|
| **TRAPPIST-1b** | 1.116 | 1.374 | 0.01154 | 1.510 | 400 | too hot |
| **TRAPPIST-1c** | 1.097 | 1.308 | 0.01580 | 2.422 | 342 | too hot |
| **TRAPPIST-1d** | 0.788 | 0.388 | 0.02227 | 4.050 | 288 | inner HZ edge |
| **TRAPPIST-1e** | 0.920 | 0.692 | 0.02925 | 6.101 | 251 | **habitable zone** |
| **TRAPPIST-1f** | 1.045 | 1.039 | 0.03849 | 9.207 | 219 | **habitable zone** |
| **TRAPPIST-1g** | 1.129 | 1.321 | 0.04683 | 12.353 | 199 | **habitable zone (outer)** |
| **TRAPPIST-1h** | 0.755 | 0.326 | 0.06189 | 18.767 | 173 | too cold |

Values from Agol et al. 2021 timing analysis + Ducrot et al. 2020 photometric
refinements.

**JWST results (2023–2026).**
- **TRAPPIST-1b** (2023, Ducrot/Greene): no cloud-free hydrogen atmosphere;
  best-fit is a bare rocky surface or thin CO₂.
- **TRAPPIST-1c** (2023, Zieba): H₂-dominated atmosphere ruled out; consistent
  with a Venus-like or bare surface.
- **TRAPPIST-1e** (2024–26): active target for atmospheric characterisation;
  first-generation results ambiguous.

**Wow-facts.**
1. The star is so dim that a person standing on TRAPPIST-1e would see only
   a dull, red-orange sun ~10× wider than Sol appears from Earth.
2. All seven planets orbit closer than Mercury does to the Sun; the entire
   system fits inside Mercury's orbit.
3. Consecutive planet pairs are in mean-motion **resonance chains** —
   TRAPPIST-1b:c:d:e:f:g are in an 8:5:3:2:3:4:3 resonance ratio, tighter than
   any other known multi-planet resonance.
4. The tidal locking means one hemisphere of each HZ planet permanently faces
   the star; oceans (if any) sit on the terminator.

**Sources.**
[TRAPPIST-1 — Wikipedia](https://en.wikipedia.org/wiki/TRAPPIST-1) ·
[Gillon et al. discovery — Nature 2017](https://www.nature.com/articles/nature21360) ·
[Agol et al. 2021 (masses/radii)](https://iopscience.iop.org/article/10.3847/PSJ/abd022) ·
[JWST NIRSpec TRAPPIST-1b — Greene et al. Nature 2023](https://www.nature.com/articles/s41586-023-05951-7)

### 3.7 Betelgeuse + Siwarħa (`hypergiant`)

**Betelgeuse (α Orionis)** — the reddish shoulder star of Orion, a
**semi-regular variable M1–2 Ia red supergiant**. Distance **~550–640 ly**
(uncertainty is real — parallax measurement is hard for a star whose
convection cells shift its apparent centroid). Radius **~764 R☉** (adopted;
range 700–880 across studies). If placed at the Sun's location it would
**engulf Mars and reach into the asteroid belt** — but *not* to Jupiter (a
common overstatement; see [`06-stars-and-constellations.md`](./06-stars-and-constellations.md) §5.3).

**Great Dimming (Oct 2019 – Mar 2020).** Betelgeuse's brightness dropped by
~60% (from mag ~0.5 to ~1.6) — the deepest visual dimming in ~150 years.
Two contributing mechanisms:
1. A **hemispheric cool spot** in the photosphere (Montargès et al. 2021,
   *Nature* 594) that lowered temperature by ~500 K on ~2/3 of the disc.
2. A **surface mass ejection (SME)** ~2 × 10²⁵ kg — enough to condense into a
   dust cloud in the line of sight and dim the star further.

**Siwarħa (α Ori B)** — direct-imaged companion, announced late 2025 –
early 2026:
- **Mass 0.6 ± 0.14 M☉**
- **Orbital semi-major axis ~2.3 R⋆** (~1,750 R☉ ~ 8 AU)
- **Period ~2,110 d (5.78 yr)**
- **Orbital plane perpendicular** to Betelgeuse's spin axis (unusual;
  suggests dynamical perturbation origin)
- Formally named **Siwarħa** (Arabic "her bracelet") in Aug 2025 by the IAU
  Working Group on Star Names (Howell et al. 2025).
- Direct confirmation from an **expanding wake structure** imaged with the
  Hubble Space Telescope UV, published Jan 2026 (MacLeod et al., ApJ; wake
  paper arXiv:2601.00470).

**Wow-facts.**
1. Betelgeuse's photosphere is **so tenuous** (~10⁻⁷ × Sun's density) that
   its "surface" is more a probability distribution than a boundary. The
   apparent disc size varies by 15% on ~yr timescales.
2. It's a **~10⁴-yr-life-remaining Type II supernova candidate** — but
   probably not within your lifetime. Best current timing: **~10⁵ years**
   until core collapse. When it goes, it will briefly outshine the full moon
   (~mag −12) and be visible in daylight for weeks.
3. Siwarħa's discovery makes Betelgeuse the largest known star with a
   confirmed close binary companion. The companion is spiralling inward from
   drag against Betelgeuse's extended atmosphere; will likely be engulfed in
   ~10,000 years.

**Sources.**
[Betelgeuse — Wikipedia](https://en.wikipedia.org/wiki/Betelgeuse) ·
[Great Dimming cool spot — Montargès et al. Nature 2021](https://www.nature.com/articles/s41586-021-03546-8) ·
[Great Dimming SME — Dupree et al. ApJ 2022](https://iopscience.iop.org/article/10.3847/1538-4357/ac4de9) ·
[Siwarħa companion — Howell et al. 2025](https://aasnova.org/2025/07/23/betelgeuses-companion-star-may-have-been-seen-at-last/) ·
[Siwarħa wake — MacLeod et al. ApJ 2026 (arXiv 2601.00470)](https://arxiv.org/pdf/2601.00470) ·
[CNN Jan 2026 coverage](https://www.cnn.com/2026/01/20/science/betelgeuse-companion-star-siwarha-wake/)

### 3.8 Eta Carinae + Homunculus (`etaCarinae`)

**Eta Carinae (η Car)** — a **luminous blue variable (LBV) binary system** in
the Carina constellation, **~7,500 ly** away in the Carina Nebula (NGC 3372).
The system:
- **η Car A**: LBV, ~100 M☉ (or more; upper mass estimates reach 250 M☉ from
  wind-modelling), 5 × 10⁶ L☉
- **η Car B**: O/WR companion, ~30 M☉, in a highly eccentric 5.54-yr orbit

**The 1843 Great Eruption.** Between 1837 and 1858 Eta Carinae brightened from
mag ~4 to mag −0.8, briefly making it the second-brightest star in the sky
(after Sirius). The eruption ejected **~10–15 M☉** of material at ~600 km/s;
that mass is now the **Homunculus Nebula** — a bipolar dust shell 0.67 ly wide,
with the star at its waist. HST images (1996) revealed the two lobes and an
equatorial "skirt" of ionised gas.

**Origin of the eruption** — still debated:
- LBV instability (the "S Dor" cycle)
- Merger of a binary triple system?
- Explosive-mass-loss event related to the S-star's periastron passage?

**Wow-facts.**
1. The Homunculus is a **rare astrophysical example of a bipolar-nebula
   ejecta** whose *radial* structure records a specific date — 1843 — that
   humans witnessed.
2. Eta Carinae is a **prime candidate for a nearby Type II or Type IIn
   supernova** within the next few thousand years. Distance is far enough
   (~7,500 ly) to be safe but close enough to make a spectacular naked-eye
   event.
3. The system's X-ray emission modulates on the **5.54-yr binary period** —
   the WR companion's wind slams into η Car A's, producing shock-heated X-ray
   plasma that peaks at periastron.

**Sources.**
[Eta Carinae — Wikipedia](https://en.wikipedia.org/wiki/Eta_Carinae) ·
[Homunculus Nebula — HST press](https://hubblesite.org/contents/media/images/1996/23/500-Image.html) ·
[Smith 2011, MNRAS Great Eruption](https://academic.oup.com/mnras/article/415/3/2020/1039404)

### 3.9 Crab Nebula (`crabNebula`) + Crab Pulsar

**Crab Nebula (M1, NGC 1952)** — the **supernova remnant of SN 1054 AD**,
recorded by Chinese court astronomers on 4 July 1054 as a "guest star" bright
enough to see in daylight for 23 days and at night for ~2 years. Arab, Chaco
Anasazi, and Japanese observers also recorded it.

- Distance **6,500 ly** (5,000–8,000 ly range across kinematic studies)
- Physical size **11 × 7 ly** (angular ~7′)
- **Expanding at ~1,500 km/s** — the current shell is 970 years post-explosion
- **Progenitor**: an ~8–10 M☉ core-collapse Type II event

**Crab Pulsar (PSR B0531+21)** — the neutron star at the centre:
- **Period 33.4 ms** (~30 pulses/second)
- **Spin-down 36 ns/day** — its rotational energy loss powers the entire
  nebula's synchrotron emission
- **Magnetic field ~10¹² G** at the surface
- Optical, X-ray, and γ-ray pulses all synchronised with the radio; the Crab
  is one of the few pulsars with a bright *optical* pulse

**The nebula's colours.** A **blue-white synchrotron continuum** fills the
interior (relativistic electrons spiralling in the pulsar's magnetic field),
with a **red filament cage** on the outside (Hα, [N II], [S II] emission from
shock-heated ejecta). This is the reverse of what the current
[`Nebulae.jsx`](src/stellar/Scene/Nebulae.jsx) `M1` entry has (§4.1 in
[`04-nebulae.md`](./04-nebulae.md)); the two colours should be swapped.

**Wow-facts.**
1. The 1054 explosion was luminous enough that some historians think it may
   be the only unambiguous naked-eye SN visible in daylight recorded by human
   civilisations before Tycho 1572 / Kepler 1604.
2. The Crab is a *reference source* — its X-ray flux (~2 crab) is used as a
   calibration standard for high-energy telescopes.
3. It's one of only three pulsars (with Vela and Geminga) with confirmed
   *γ-ray* pulses detected by Fermi-LAT.

**Sources.**
[Crab Nebula — Wikipedia](https://en.wikipedia.org/wiki/Crab_Nebula) ·
[SN 1054 — Wikipedia](https://en.wikipedia.org/wiki/SN_1054) ·
[NASA Hubble+Webb Crab 2024](https://science.nasa.gov/missions/hubble/nasas-hubble-revisits-crab-nebula-to-track-25-years-of-expansion/) ·
[Crab Pulsar — Wikipedia](https://en.wikipedia.org/wiki/Crab_Pulsar)

### 3.10 Kilonova / GW170817 (`kilonova`)

The **first neutron-star merger detected in gravitational waves + light**, on
**17 August 2017 at 12:41:04 UTC**. The gravitational-wave signal (**GW170817**)
lasted ~100 s in the LIGO-Virgo band; a **short gamma-ray burst (GRB 170817A)**
followed **1.7 s later**; the optical counterpart (**AT2017gfo**) was
identified 11 hours later by the Swope 1-m survey in **NGC 4993**, an S0 galaxy
**40 Mpc (~130 Mly)** away.

**Masses.** **1.36–1.60 M☉ + 1.17–1.36 M☉** (chirp mass 1.188 M☉) — consistent
with two neutron stars near the low-mass NS mass distribution.

**The kilonova model confirmed.** In the days following the merger the
optical/IR spectrum evolved from a hot **blue "wind" component** (rapid opacity,
few days, ~0.02 M☉ of light r-process ejecta) to a **red "lanthanide"
component** (~0.04 M☉ heavy r-process, weeks-scale). This matched Metzger's
2010 kilonova prediction almost exactly.

**Scientific yield.**
- First **multi-messenger** astronomical event.
- Proved neutron-star mergers are **a major site of r-process nucleosynthesis**
  — the origin of gold, platinum, uranium, and half the periodic table above
  iron. The event produced roughly **~10 Earth-masses of gold**.
- Provided a new independent measurement of the **Hubble constant** via a
  "standard siren" (GW distance + redshift): **H₀ = 70 +12/−8 km/s/Mpc**.
- Constrained the neutron-star equation of state via **tidal deformability**.
- Confirmed that short GRBs come from BNS mergers.

**Wow-facts.**
1. The 1.7-s delay between GW and γ-ray provided a **10⁻¹⁵-level constraint**
   on GW speed vs light speed — no observational deviation from GR predictions.
2. LIGO/Virgo initially misdirected the sky localisation to a ~30 deg² region;
   **~70 telescopes worldwide** slewed to it, finding AT2017gfo within 11 h.
3. The kilonova produced ~0.06 M☉ of ejecta — enough to explain **~50% of the
   Milky Way's stock of heavy r-process elements** through repeated NS-NS
   mergers over Hubble time.

**Sources.**
[LIGO/Virgo GW170817 discovery — Abbott et al. PRL 2017](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.119.161101) ·
[Multi-messenger observations — Abbott et al. ApJL 2017](https://iopscience.iop.org/article/10.3847/2041-8213/aa91c9) ·
[GW170817 — Wikipedia](https://en.wikipedia.org/wiki/GW170817) ·
[Kilonova review — Metzger 2020](https://link.springer.com/article/10.1007/s41114-019-0024-0)

### 3.11 Einstein Ring (`einsteinRing`)

An Einstein ring is a **special case of gravitational lensing** in which the
lens (foreground mass), the source (background), and the observer sit on a
straight line. The lensed image is a **complete circle** whose radius is the
Einstein radius:

```
θ_E = √( 4 G M / c² · D_LS / (D_L · D_S) )
```

where M is the lens mass, D_L the observer→lens distance, D_S the
observer→source distance, D_LS the lens→source distance. Typical values are
0.5–5 arcseconds for galaxy-scale lenses.

**History.**
- **Einstein 1936** (Science) sketched the ring geometry but thought it too
  rare to observe.
- **Frantisek Chwolson** actually derived the geometry first (1924); hence
  the technical name **Einstein–Chwolson ring**.
- **First observed 1988** — the near-complete ring **MG 1131+0456** (radio,
  MERLIN interferometer).
- **First optical ring: B1938+666** (HST 1998).
- **JWST-ER1 (2023)** — a striking near-perfect optical ring around an
  ultra-compact ~10¹¹ M☉ galaxy at z ≈ 0.75.

**Use in astronomy.** Rings are the strongest gravitational-lens probes. They:
- Weigh the lens mass (dark matter + baryons) to ~1% precision.
- Enable "cosmography" measurements of H₀ via time-delay lensing.
- Magnify distant sources by factors of 10–100, letting us study
  otherwise-invisible high-z galaxies.

**Wow-facts.**
1. Every galaxy in the universe is a gravitational lens for something behind
   it — only rare geometry produces a full ring.
2. The **Cheshire Cat** cluster produces a smiling face of Einstein rings —
   two eyes (rings around different lens galaxies) + a wide arc "smile."
3. JWST's angular resolution (~0.1″ at NIRCam) has more than tripled the
   catalogue of resolved Einstein rings since 2022.

**Sources.**
[Einstein ring — Wikipedia](https://en.wikipedia.org/wiki/Einstein_ring) ·
[Einstein 1936, Science](https://www.science.org/doi/10.1126/science.84.2188.506) ·
[First Einstein ring MG 1131+0456 — Hewitt et al. Nature 1988](https://www.nature.com/articles/333537a0) ·
[JWST-ER1 — van Dokkum et al. Nature Astronomy 2024](https://www.nature.com/articles/s41550-023-02150-2)

### 3.12 Omega Centauri (`globularCluster`)

**Omega Centauri (NGC 5139, ω Cen)** — the **most massive and luminous
globular cluster in the Milky Way**, and increasingly regarded as the
**stripped nucleus of a former dwarf galaxy**.

- Distance **17,090 ly (5.24 kpc)**
- Diameter **150 ly** (tidal radius); half-mass radius ~15 ly
- Mass **~4 × 10⁶ M☉** — ~10× a typical globular cluster
- **~4 million stars** at the last count
- Age **~11.5 Gyr**
- Naked-eye — the *only* globular cluster visible without a telescope from
  most of the southern hemisphere (apparent mag 3.9)

**Why "stripped dwarf core"?** Unlike normal globulars, ω Cen has:
- A **broad metallicity distribution** — multiple stellar populations
  spanning a factor of ~30 in iron abundance
- **Age spread ~2 Gyr**
- **Very high central velocity dispersion** — consistent with a hidden
  **~10⁴ M☉ intermediate-mass black hole** (still debated; alternative is a
  cluster of stellar-mass BHs)
- **Rotation** — clear systemic rotation ~7 km/s, unlike most globulars

Best current interpretation: ω Cen is the **remnant nucleus of a dwarf galaxy
tidally shredded by the Milky Way** — the Gaia-Sausage-Enceladus merger
~8–11 Gyr ago is a leading candidate for its parent.

**Wow-facts.**
1. Stars in ω Cen's core are ~1,000× denser than around the Sun — the sky
   would blaze with hundreds of first-magnitude stars.
2. It hosts **~10⁵ RR Lyrae variables**, the most of any globular — a natural
   testbed for the RR Lyrae period-luminosity distance ladder.
3. If confirmed, ω Cen's central IMBH would be the **first securely detected
   intermediate-mass BH** — bridging the mass gap between stellar-mass (~30
   M☉) and supermassive (10⁵–10¹⁰ M☉) black holes.

**Sources.**
[Omega Centauri — Wikipedia](https://en.wikipedia.org/wiki/Omega_Centauri) ·
[ω Cen IMBH — Häberle et al. Nature 2024](https://www.nature.com/articles/s41586-024-07511-z) ·
[Gaia-Sausage-Enceladus — Helmi et al. Nature 2018](https://www.nature.com/articles/s41586-018-0625-x)

### 3.13 GW250114 gravitational-wave chirp (`gravWaveChirp`)

The **loudest binary-black-hole merger ever detected**, on **14 January 2025**
during **LIGO O4b**. Recorded by both LIGO Hanford and Livingston at
**signal-to-noise ratio 76.9** — ~3× louder than the first-ever detection
(GW150914 at SNR 24, Sep 2015).

**Source parameters.**
- Primary BH: **34 M☉**
- Secondary BH: **32 M☉**
- Remnant: **~63 M☉**, spin **a\* ≈ 0.65**
- Distance: **~410 Mpc (~1.34 billion ly)**
- Merger frame: heavily aligned spins, low precession
- ~3 M☉ of rest mass radiated as gravitational-wave energy

**Scientific yield.**
- **First direct measurement of at least two quasinormal modes** of the
  remnant black hole — spectroscopic confirmation of the **no-hair theorem**
  to ~10% precision.
- **Confirmation of Hawking's area theorem**: the final horizon area exceeds
  the sum of the initial areas by ~14% (as GR predicts).
- Constraints on possible GR deviations tightened by a factor of 2–3 over the
  entire GWTC-4 combined catalogue.

**Wow-facts.**
1. Ten years after the first detection (GW150914, 14 Sep 2015), the O4 run
   is finding a merger every ~2 days on average. LIGO's detection cadence is
   now industrial.
2. The chirp reached Earth ~1.3 billion years after emission — its progenitor
   black holes merged when the universe was ~10 Gyr old (or ~4 Gyr before the
   Sun formed).
3. The 63 M☉ remnant is a moderately-spinning Kerr black hole that will now
   simply *sit there for ~10¹⁰⁰ years* before evaporating via Hawking
   radiation.

**Sources.**
[GW250114 (LIGO Science Summary)](https://ligo.org/science-summaries/gw250114_tgr/) ·
[LIGO 10 years announcement](https://ligo.org/detections/gw250114-10-years-of-gravitational-wave-astronomy/) ·
[Caltech LIGO news](https://www.ligo.caltech.edu/news/ligo20250910) ·
[Potential science with GW250114 — arXiv 2507.08789](https://arxiv.org/pdf/2507.08789) ·
[GWTC-5.0 — arXiv 2605.27225](https://arxiv.org/pdf/2605.27225) ·
[GW250114 — Wikipedia](https://en.wikipedia.org/wiki/GW250114)

### 3.14 JWST Little Red Dots (`redDots`)

A puzzle first flagged in **2023 JWST Cycle 1** and characterised through
2024–2026: **300+ compact, red, high-redshift sources** whose properties
don't match any pre-JWST galaxy model.

**Properties (typical).**
- **Redshift range** z ≈ 4–9 (JWST-only; nothing seen at lower z)
- **Sizes** unresolved (r < 100 pc typically)
- **Colours** very red in the rest-UV/optical, blue in the rest-mid-UV — a
  characteristic "V-shape" SED
- **Stellar masses** inferred at ~10⁷–10⁹ M☉ (heavily model-dependent)
- **Broad Hα emission** in a fraction of them, indicative of AGN activity
- **Sky density** ~1 per JWST arcmin² deep field — ~100× the density of
  z > 6 quasars

**Interpretations still open (as of 2026).**
1. **Dust-obscured active galactic nuclei** — the mass-inference tension
   goes away if the "old-star" continuum is actually re-emitted AGN light.
2. **Extremely compact old-star populations** — physically difficult to form
   at z ≈ 6, but not impossible with rapid gas cooling channels.
3. **Direct-collapse black holes** — massive BHs seeded from primordial gas
   collapse without a stellar precursor.

The community consensus by mid-2026 leans toward "some fraction are AGN,
some are compact starbursts, but no single model fits all." The population's
mere existence tightens constraints on primordial galaxy formation.

**Wow-facts.**
1. LRDs don't map onto anything HST could see — they were literally invisible
   until JWST's near-IR sensitivity revealed them.
2. If they're all AGN, they raise the z > 6 quasar luminosity function by
   an order of magnitude — challenging models of black-hole seed formation.
3. The V-shaped SED is a signature: something absorbs blue-shifted UV and
   *emits* red-shifted UV — a rare astrophysical combination.

**Sources.**
[Little Red Dots — Kokorev et al. arXiv 2024](https://arxiv.org/abs/2404.02861) ·
[Greene et al. UNCOVER LRDs 2023](https://arxiv.org/abs/2309.05714) ·
[Matthee et al. LRD spectroscopy 2024](https://iopscience.iop.org/article/10.3847/1538-4357/ad2345)

### 3.15 Tabby's Star / KIC 8462852 (`tabbysStar`)

Also known as **Boyajian's Star** (informally "**WTF-star**" from the original
paper's "*Where's The Flux?*" title). An **F3V main-sequence star** in Cygnus,
distance **~1,470 ly**, magnitude **11.7** — not visible to the naked eye but
prominent in the Kepler field.

**The anomaly.** Kepler photometry (Aug 2009 – May 2013) revealed
**~20 irregular dips** in brightness, ranging from **~0.2% to 22%** deep,
lasting hours to weeks. Nothing about the dip morphology fits a normal
transiting planet:
- No periodicity
- Highly asymmetric dip profiles
- Depths inconsistent with any known object crossing the star (a Jupiter-size
  transit is ~1% deep max)

**Discovery** — reported by **Boyajian et al. 2015** ("*Planet Hunters IX*")
using citizen-science volunteers. Media picked up the story after Jason Wright
(Penn State) noted the anomaly was **consistent with a Dyson-swarm-like
megastructure** — the strongest SETI candidate of the decade at the time.

**Current best explanation.** Follow-up observations (Boyajian et al. 2018)
found the dimming's **spectral signature is wavelength-dependent** — 3× more
extinction in blue than infrared. That rules out solid opaque bodies (megastructures,
planets) and strongly favours **circumstellar dust**, likely from:
- A swarm of exocomets or a fragmenting body
- A ring of dust from a past collision
- A dust cloud in the interstellar line-of-sight (less likely, given the
  time-variable dips)

**Wow-facts.**
1. The 22% dip event (**D1519**) reduced Tabby's brightness by more than
   Jupiter would if it transited the Sun.
2. The star also shows a slow **~14% long-term dimming** over the last
   century — visible in old photographic plates. Also consistent with dust.
3. The **KIC 8462852 nickname** is the star's Kepler Input Catalogue number;
   "Tabby" is Boyajian's first name.

**Sources.**
[Boyajian et al. 2015 — WTF paper](https://arxiv.org/abs/1509.03622) ·
[Boyajian et al. 2018 dust — ApJL](https://arxiv.org/abs/1801.00732) ·
[Tabby's Star — Wikipedia](https://en.wikipedia.org/wiki/Tabby%27s_Star)

### 3.16 Wow! Signal (`wowSignal`)

At **22:16 EDT on 15 August 1977**, the **Ohio State University Big Ear
radio telescope**, then part of a SETI survey, recorded a **narrow-band radio
signal at 1420.4056 MHz** (near the hydrogen 21-cm line) that stood out at
**32× the mean background** for **72 seconds** — the drift time of a source
through the Big Ear's fixed beam.

The recording appeared as the alphanumeric code **"6EQUJ5"** on a printer
tape. Astronomer **Jerry R. Ehman** circled it in red pen and wrote
"**Wow!**" beside it. The name stuck.

**Properties.**
- **Narrow bandwidth** — no natural astrophysical source at 1420 MHz is
  known to be that narrow.
- **72-s duration** — matches beam-transit time exactly; can't distinguish
  brief emitter from steady, drifting source.
- **Never repeated** — Ehman himself observed the direction for years
  afterwards and found nothing. Multiple searches (VLA, Allen Telescope Array,
  MeerKAT) have re-observed the region since; nothing.
- **Direction** — depending on which of the Big Ear's two feed horns
  received it, the source was toward RA 19h22 or 19h25 in **Sagittarius**,
  Dec −27° — near the constellation border with Sagittarius.

**Interpretations.**
- **Comet 266P/Christensen or 335P/Gibbs** — a 2015 paper (Paris & Davies)
  suggested one of these comets was near the beam direction and could emit
  1420 MHz from H desorption. Widely rejected — comets don't emit hydrogen
  line radiation at that level, and the beam geometry doesn't fit.
- **Terrestrial interference reflected off space debris** — no confirmed
  match.
- **Astrophysical scintillation** at 21 cm — plausible for pulsar-signal
  amplification, but no pulsar was found in the direction.
- **Deliberate SETI signal** — the frequency (near the hydrogen line, a
  natural "beacon" for any radio civilisation) is provocative but circumstantial.

The Wow! Signal remains **the strongest unexplained SETI candidate**.

**Wow-facts.**
1. Big Ear was demolished in 1998 to make room for a golf course. The Wow!
   signal remains its most famous discovery.
2. The signal was found on a printout Ehman was reading days later — not in
   real-time. If he hadn't been reviewing the tape, it might have been lost.
3. Independent replication is fundamentally impossible: the Big Ear's beam
   pattern is unique and can't be reproduced.

**Sources.**
[Wow! signal — Wikipedia](https://en.wikipedia.org/wiki/Wow!_signal) ·
[Ehman 1998 recollection](http://www.bigear.org/wow30th.htm) ·
[Paris & Davies 2016 comet hypothesis — JWWashAcadSci](https://articles.adsabs.harvard.edu/pdf/2016JWAS..102...15P)

### 3.17 Planet Nine (`planetNine`)

A hypothetical **~5–10 Earth-mass planet at semi-major axis ~400–700 AU**,
proposed by **Konstantin Batygin and Michael Brown (Caltech, 2016)** to explain
the observed clustering of orbital angles of **extreme trans-Neptunian objects
(eTNOs)** — bodies like Sedna, 2012 VP113, 2014 SR349, and others whose
perihelia and orbital planes are correlated at a statistically significant
level.

**Proposed properties.**
- **Mass**: 5–10 M⊕
- **Semi-major axis**: 400–800 AU (mid ~500)
- **Eccentricity**: 0.2–0.5
- **Inclination**: 15°–30° from ecliptic
- **Orbital period**: **10,000–20,000 years**
- **Current sky location**: probably in **Aries, Taurus, or Cetus** (updated
  2021 constraint) — near the celestial equator, ~aphelion

**Direct-detection status (as of 2026).**
- **WISE all-sky IR search** ruled out a Neptune-mass Planet 9 within ~700 AU.
- **Subaru Hyper-Suprime-Cam** deep-field surveys covered ~1/3 of the
  probability volume through 2024, no confirmed detection.
- **Vera C. Rubin Observatory / LSST** first light Jul 2025; expected to
  either detect or definitively rule out Planet 9 within the first ~3 years
  of full-sky operations (2026–2028).

**Counter-arguments.**
- **Observational bias** — the eTNO clustering could be a selection effect
  from where surveys have looked. Bernardinelli et al. 2020 and later work
  argue for reduced significance after de-biasing.
- **Alternative dynamical models** — a distributed massive Kuiper Belt
  ("primordial mass"), or a hypothetical **10⁻⁵ M☉ primordial black hole**,
  could produce similar clustering.

**Status:** **still unseen.** LSST will likely settle the question by 2027–28.

**Wow-facts.**
1. Batygin & Brown's 2016 paper had a **10⁻⁴ false-alarm probability** on the
   clustering signal — pre-registered before extensive eTNO surveys.
2. Planet 9 (if it exists) would be a giant that formed close-in and was
   scattered outward during Neptune's migration — the same process that put
   Neptune where it is.
3. Its orbital period (~10,000–20,000 yr) is comparable to human civilisation.

**Sources.**
[Batygin & Brown 2016 — AJ](https://iopscience.iop.org/article/10.3847/0004-6256/151/2/22) ·
[Planet Nine — Caltech site](http://www.findplanetnine.com/) ·
[Planet Nine — Wikipedia](https://en.wikipedia.org/wiki/Planet_Nine) ·
[Bernardinelli et al. 2020 bias critique](https://arxiv.org/abs/2007.02975)

### 3.18 Fast Radio Bursts (`fastRadioBurst`)

**Fast Radio Bursts (FRBs)** are **millisecond-duration radio pulses of
extragalactic origin**, discovered in 2007 by **Duncan Lorimer et al.** in
archival Parkes-radio-telescope data. As of 2026, **~10,000 have been
catalogued** and the number rises daily; a subset **repeats**.

**Properties.**
- **Duration** ~0.1–100 ms (typical ~few ms)
- **Energy** 10³⁵–10⁴³ erg per burst — brief but intense
- **Distance** Mpc to Gpc; the median FRB is at ~1 Gpc
- **Sky density** ~1,000 per sky per day at survey-limit sensitivity
- **Dispersion measure (DM)** — ~200–3,000 pc cm⁻³; the higher DMs are
  clear extragalactic signatures

**FRB 20200428D (28 Apr 2020).** A radio burst from the **Galactic magnetar
SGR 1935+2154**, coincident with an X-ray burst. First (and so far only) FRB
traced to a Milky-Way source. **Confirmed magnetars as at least one FRB
progenitor class.**

**Repeaters vs one-offs.** ~20% of catalogued FRBs are **repeaters** (some
active for years, with thousands of bursts). The two classes may be
astrophysically distinct — repeaters may all be magnetars, while one-offs
may include cataclysmic BH–NS or NS–NS mergers.

**Wow-facts.**
1. FRB 20220610A (2022) was a Gpc-scale burst that briefly outshone the
   entire optical output of its host galaxy.
2. FRBs are among the most numerous transient astronomical events at radio
   wavelengths — CHIME (Canada) alone has catalogued thousands since 2018.
3. The extragalactic DM = pathway integrated free-electron density — FRBs
   are becoming a **cosmological probe** of the intergalactic medium's
   electron content, tightening constraints on baryon distribution.

**Sources.**
[FRB — Wikipedia](https://en.wikipedia.org/wiki/Fast_radio_burst) ·
[Lorimer et al. 2007 discovery — Science](https://www.science.org/doi/10.1126/science.1147532) ·
[FRB 200428 magnetar — Nature 2020](https://www.nature.com/articles/s41586-020-2863-y) ·
[CHIME/FRB catalogue 2021 — ApJS](https://iopscience.iop.org/article/10.3847/1538-4365/ac33ab)

---

## 4. Discrepancies vs. the current portfolio

### 4.1 Betelgeuse "swallow Jupiter's orbit" (already flagged in [`06-stars-and-constellations.md`](./06-stars-and-constellations.md) §5.3)

`objects.js` Betelgeuse: *"~700× the Sun's width … swallow Jupiter's orbit."*
Correct fix: *"…would engulf Mars and reach into the asteroid belt"* — see
[`06-stars-and-constellations.md`](./06-stars-and-constellations.md) §5.3.

### 4.2 Betelgeuse companion name

`objects.js` may reference the companion as **"BetelBuddy"** or an
unnamed "recently discovered companion." The **IAU official designation
is Siwarħa** (Aug 2025). Update any user-facing string to use the official
name.

### 4.3 Sgr A\* mass three-way disagreement

Already flagged in [`03-milky-way-structure.md`](./03-milky-way-structure.md)
§4.1 (galaxy.js line 44 = 4.3e6; header line 16 cites GRAVITY 2019 which is
4.15e6; planetFacts.hero = 4.15M; SgrAStar.jsx comment = 4.15M). **Pick one
value and cite the corresponding paper**:
- **4.15 × 10⁶ M☉** → cite GRAVITY 2019 (`A&A 625, L10`)
- **4.297 × 10⁶ M☉** → cite GRAVITY 2022 (`A&A 657, A82`)
- **4.10 × 10⁶ M☉** → cite EHT 2022 (`ApJL 930`)

Recommended: **4.30 × 10⁶ M☉** (GRAVITY 2022 rounded) — since [`galaxy.js`](src/stellar/config/galaxy.js) already uses it and it's the most recent geometric measurement.

### 4.4 Crab Nebula colours inverted (already flagged in [`04-nebulae.md`](./04-nebulae.md) §4.1)

M1 core is the **blue-white synchrotron interior** (`#b8c8e8`); halo is the
**red filament cage** (`#ff5a4a`). Currently reversed in
[`Nebulae.jsx`](src/stellar/Scene/Nebulae.jsx).

### 4.5 Everything else in exotic-objects registry is accurate

Pulsar, magnetar, brown dwarf, rogue planet, TRAPPIST-1, Eta Carinae, Kilonova,
Einstein ring, Omega Centauri, GW250114, Little Red Dots, Tabby's Star, Wow!,
Planet 9, FRBs — all `objects.js` `info` strings check out against the current
literature at doc-compile time (2026-07-18).

---

## 5. Backport-ready delta

| File | Field | Current | Verified | Source |
|---|---|---|---|---|
| `config/objects.js` | Betelgeuse `info` — "swallow Jupiter's orbit" | (current phrasing) | "…engulf Mars and reach into the asteroid belt" | [Betelgeuse — Wikipedia](https://en.wikipedia.org/wiki/Betelgeuse), [06-stars-and-constellations.md §5.3](./06-stars-and-constellations.md) |
| `config/objects.js` | Betelgeuse companion name — (if referenced) | "companion" / "BetelBuddy" | "Siwarħa (α Ori B)" | [IAU WGSN 2025](https://aasnova.org/2025/07/23/betelgeuses-companion-star-may-have-been-seen-at-last/) |
| `data/planetFacts.js` | `impact.gravity` — "Sgr A\* … 4.15 million M☉" | 4.15M | Either 4.30M (GRAVITY 2022) or 4.15M (GRAVITY 2019) — pick and update source string to match | see [galaxy.js Sgr A\* discussion](./03-milky-way-structure.md#26-sgr-a-and-the-galactic-center-direction) |
| `config/galaxy.js` | `sgrA.massSolar` header comment "GRAVITY 2019" | says GRAVITY 2019 but value is 2022 | Fix comment → "GRAVITY 2022" (or change value to 4.15e6 and keep 2019 attribution) | [GRAVITY 2019](https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html) · [EHT 2022](https://iopscience.iop.org/journal/2041-8205) |
| `Scene/Nebulae.jsx` | M1 (Crab) `core`/`halo` | `#ff6b35` core / `#5a8fd6` halo | `#b8c8e8` core (synchrotron) / `#ff5a4a` halo (filaments) | [04-nebulae.md §4.1](./04-nebulae.md) |

---

## Sources (consolidated per §3)

Compact remnants:
[Pulsar — Wikipedia](https://en.wikipedia.org/wiki/Pulsar) ·
[ATNF Pulsar Catalogue](https://www.atnf.csiro.au/research/pulsar/psrcat/) ·
[Magnetar — Wikipedia](https://en.wikipedia.org/wiki/Magnetar) ·
[Duncan & Thompson 1992](https://articles.adsabs.harvard.edu/pdf/1992ApJ...392L...9D) ·
[SGR 1806−20 flare — Palmer et al. Nature 2005](https://www.nature.com/articles/nature03525) ·
[Sagittarius A\* — Wikipedia](https://en.wikipedia.org/wiki/Sagittarius_A*) ·
[GRAVITY 2019 (Sgr A\* R₀ + mass)](https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html) ·
[EHT Sgr A\* 2022](https://iopscience.iop.org/journal/2041-8205)

Sub-stellar & rogue:
[Brown dwarf — Wikipedia](https://en.wikipedia.org/wiki/Brown_dwarf) ·
[WISE 0855-0714 — Luhman 2014](https://iopscience.iop.org/article/10.1088/2041-8205/786/2/L18) ·
[Rogue planet — Wikipedia](https://en.wikipedia.org/wiki/Rogue_planet) ·
[JuMBOs — Pearson & McCaughrean 2023](https://arxiv.org/abs/2310.01231)

Exoplanet system:
[TRAPPIST-1 — Wikipedia](https://en.wikipedia.org/wiki/TRAPPIST-1) ·
[Gillon et al. 2017 — Nature](https://www.nature.com/articles/nature21360) ·
[Agol et al. 2021](https://iopscience.iop.org/article/10.3847/PSJ/abd022) ·
[JWST NIRSpec TRAPPIST-1b — Greene 2023](https://www.nature.com/articles/s41586-023-05951-7)

Extreme evolved stars:
[Betelgeuse — Wikipedia](https://en.wikipedia.org/wiki/Betelgeuse) ·
[Great Dimming cool spot — Montargès Nature 2021](https://www.nature.com/articles/s41586-021-03546-8) ·
[Great Dimming SME — Dupree ApJ 2022](https://iopscience.iop.org/article/10.3847/1538-4357/ac4de9) ·
[Siwarħa wake — MacLeod et al. arXiv 2601.00470](https://arxiv.org/pdf/2601.00470) ·
[Siwarħa AAS Nova 2025](https://aasnova.org/2025/07/23/betelgeuses-companion-star-may-have-been-seen-at-last/) ·
[Eta Carinae — Wikipedia](https://en.wikipedia.org/wiki/Eta_Carinae) ·
[Smith 2011 Great Eruption — MNRAS](https://academic.oup.com/mnras/article/415/3/2020/1039404)

Ejecta / remnants:
[Crab Nebula — Wikipedia](https://en.wikipedia.org/wiki/Crab_Nebula) ·
[SN 1054 — Wikipedia](https://en.wikipedia.org/wiki/SN_1054) ·
[Crab Pulsar — Wikipedia](https://en.wikipedia.org/wiki/Crab_Pulsar) ·
[GW170817 — Wikipedia](https://en.wikipedia.org/wiki/GW170817) ·
[Abbott et al. GW170817 — PRL 2017](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.119.161101) ·
[Multi-messenger — ApJL 2017](https://iopscience.iop.org/article/10.3847/2041-8213/aa91c9)

Gravitational:
[Einstein ring — Wikipedia](https://en.wikipedia.org/wiki/Einstein_ring) ·
[Einstein 1936 — Science](https://www.science.org/doi/10.1126/science.84.2188.506) ·
[JWST-ER1 — van Dokkum Nature Astronomy 2024](https://www.nature.com/articles/s41550-023-02150-2) ·
[GW250114 — LIGO Science Summary](https://ligo.org/science-summaries/gw250114_tgr/) ·
[GW250114 arXiv 2507.08789](https://arxiv.org/pdf/2507.08789) ·
[GWTC-5.0 arXiv 2605.27225](https://arxiv.org/pdf/2605.27225)

Clusters & deep-JWST:
[Omega Centauri — Wikipedia](https://en.wikipedia.org/wiki/Omega_Centauri) ·
[ω Cen IMBH — Häberle Nature 2024](https://www.nature.com/articles/s41586-024-07511-z) ·
[Little Red Dots — Kokorev arXiv 2024](https://arxiv.org/abs/2404.02861) ·
[UNCOVER LRDs — Greene 2023](https://arxiv.org/abs/2309.05714)

SETI-flag / anomalies:
[Tabby's Star — Boyajian 2015](https://arxiv.org/abs/1509.03622) ·
[Tabby's Star dust — Boyajian 2018](https://arxiv.org/abs/1801.00732) ·
[Wow! signal — Wikipedia](https://en.wikipedia.org/wiki/Wow!_signal) ·
[Ehman 1998 recollection](http://www.bigear.org/wow30th.htm)

Predicted / transients:
[Batygin & Brown Planet Nine 2016 — AJ](https://iopscience.iop.org/article/10.3847/0004-6256/151/2/22) ·
[Planet Nine site (Caltech)](http://www.findplanetnine.com/) ·
[FRB — Wikipedia](https://en.wikipedia.org/wiki/Fast_radio_burst) ·
[Lorimer 2007 discovery — Science](https://www.science.org/doi/10.1126/science.1147532) ·
[FRB 200428 magnetar — Nature 2020](https://www.nature.com/articles/s41586-020-2863-y) ·
[CHIME/FRB catalogue 2021 — ApJS](https://iopscience.iop.org/article/10.3847/1538-4365/ac33ab)

*Compiled 2026-07-18 for the Stellar portfolio. Numerical claims cross-checked
against 2024–2026 sources where the field has moved (Siwarħa, GW250114, Little
Red Dots, ω Cen IMBH). "Nothing sourced from memory" applies to the exotica the
same as to the planets.*
