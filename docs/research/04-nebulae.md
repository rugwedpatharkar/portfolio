# 04 — Nebulae: A Scientifically-Accurate Reference for the Stellar Backdrop

Research paper for the "Stellar" 3D portfolio. Goal: 100% accuracy on
positions (J2000 RA/Dec), angular sizes, Gaia-era distances, and — the hard
part — **true colours grounded in emission-line physics**, not the arbitrary
false-colour of Hubble-palette press images.

All coordinates are J2000 / ICRS. RA is given in **decimal hours**, Dec in
**decimal degrees**, to match `scenePos(raHours, decDeg)` in
`src/stellar/Scene/Nebulae.jsx`. Angular sizes are the **major axis in
arcminutes**. Distances are **light-years**, Gaia-era where the object is close
enough for parallax. Every value traces to a linked source; where sources
disagree the range is stated rather than a false-precision single number.

---

## 1. Executive Summary + The Colour-Physics Primer

### 1.1 Why this document exists

A nebula's colour is not a stylistic choice — it is a **spectrum**. Interstellar
gas does not emit a smooth blackbody continuum; it emits at a handful of
discrete **emission lines** set by atomic physics, plus (for dust) scattered
starlight or pure extinction. If you render a nebula's colour correctly, you are
rendering real photons at real wavelengths. If you render it as generic "space
purple," you have thrown away the one thing that makes it scientifically true.

The single most important fact for accuracy: **the green/teal you see in the
best real images is real** — it is the [O III] forbidden doublet — whereas the
lurid gold-and-teal of most "Hubble" posters is the **SHO false-colour palette**
(S II→red, Hα→green, O III→blue) and is *not* what the object looks like. Keep
these straight. ([Starizona narrowband tutorial](https://starizona.com/blogs/tutorials/narrowband-imaging),
[Cloudy Nights: true colour of emission nebulosity](https://cloudynights.com/topic/684820-the-true-colour-of-hydrogen-emission-nebulosity))

### 1.2 The five nebula types and the physics of their colour

| Type | Light source | Physics | Dominant true colours |
|---|---|---|---|
| **Emission / H II** | Ionised gas glowing | Recombination + forbidden-line emission from gas ionised by hot O/B stars | Hα **red** + Hβ **blue-green** → net **pink/magenta**; [O III] **teal** in high-excitation cavities |
| **Reflection** | Starlight scattered off dust | Rayleigh/Mie scattering ∝ λ⁻⁴, more efficient at short (blue) wavelengths; illuminating stars are usually blue B-types | **Blue** (cornflower/azure) |
| **Planetary** | Ionised shell of a dying star | Same forbidden lines, but very high excitation → [O III] dominates the hot core; Hα/[N II] at the cooler rim | **Teal-green core** + **red rim** |
| **Supernova remnant** | Shock-heated gas (+ synchrotron) | Radiative shock fronts emit Hα and [O III] on opposite edges; pulsar-wind SNRs add blue-white synchrotron continuum | **Red filaments** + **cyan [O III]** + (Crab) **blue-white synchrotron** |
| **Dark** | *None* — it blocks light | Dense dust column extinguishes background starlight/emission (extinction, not emission) | **Black** — rendered by **occlusion**, never additively |

### 1.3 The emission lines that actually matter — with true perceived colour

Perceived sRGB hex for each **monochromatic** emission line, via the standard
Dan Bruton wavelength→RGB algorithm (the algorithm nearly every online converter
uses).
([wavelength→RGB reference table](https://laserpointerforums.com/threads/reference-wavelength-to-rgb-color-codes-for-forum-signatures-spectrum.103048/),
[Dan Bruton / SFA](http://www.physics.sfasu.edu/astro/color/spectra.html))

| Line | λ (nm) | Ion / transition | Mono. hex | Perceived colour | Where it dominates |
|---|---|---|---|---|---|
| **Hα** | 656.3 | H, n3→2 (Balmer) | `#ff0000` | deep red | every H II region, SNR filaments |
| **Hβ** | 486.1 | H, n4→2 (Balmer) | `#00eaff` | cyan / blue-green | H II regions (with Hα → pink) |
| **Hγ** | 434.0 | H, n5→2 (Balmer) | `#2800ff` | violet-blue | faint, in bright H II |
| **[O III]** | 500.7 | O²⁺ forbidden | `#00ff87` | teal-green | planetaries, SNR, hot cavities |
| **[O III]** | 495.9 | O²⁺ forbidden | `#00ffc0` | teal-cyan | ″ (the fainter of the doublet) |
| **[N II]** | 658.4 | N⁺ forbidden | `#ff0000` | red (flanks Hα) | PNe rims, e.g. very bright in M57 |
| **[S II]** | 671.6 | S⁺ forbidden | `#ff0000` | deep/dark red | SNR shocks, PDR rims |
| **[O II]** | 372.7 | O⁺ forbidden | (near-UV) | violet, barely visible | H II (mostly lost to the eye) |
| **He I** | 587.6 | He neutral | `#ffe600` | yellow | high-excitation cores (minor) |

Two physics caveats that change how these should be **rendered**:

1. **The eye is nearly blind to Hα.** 656 nm is pure spectral red, but human
   photopic sensitivity there is very low, so visually a strong-Hα nebula looks
   *dim and greenish* through an eyepiece (the eye latches onto [O III]/Hβ
   instead). This is why M42 looks grey-green at the telescope but blood-red in
   photos. ([Clarkvision: colour of nebulae](https://clarkvision.com/articles/color.of.nebulae.and.interstellar.dust/))
   For a *cinematic* backdrop, render toward the **photographic** truth (red/pink
   dominant), not the eyepiece truth.

2. **H II regions are pink/magenta, not pure red.** Real true-colour (not
   narrowband) H II regions integrate Hα (red) + Hβ/Hγ (blue-green/violet) from
   the hydrogen Balmer series, so an unobscured hydrogen nebula reads
   **magenta-pink** — redder than magenta but pinker than pure red. Dust
   reddening and camera Hα-bias push individual images toward pure crimson.
   ([Cloudy Nights](https://cloudynights.com/topic/684820-the-true-colour-of-hydrogen-emission-nebulosity),
   [Balmer series — Wikipedia](https://en.wikipedia.org/wiki/Balmer_series))

### 1.4 Recommended *rendered* palette (integrated, not monochromatic)

Monochromatic line hex (§1.3) is the ground truth, but a nebula is a *blend* of
lines plus continuum. For the additive-sprite renderer, these integrated tints
read as "true colour" while staying bloom-safe:

| Process | Rendered hex | Notes |
|---|---|---|
| H II / Hα-dominant body | `#ff4a4a` → `#ff5a6e` | crimson→rose; lean pink for classic true colour |
| Hβ blue-green admixture | `#3bd6c6` | the blue-green that makes H II read pink, not red |
| [O III] teal (PNe/SNR/cavities) | `#2ad4c0` / `#33ccaa` | the real "nebulium" teal-green |
| Reflection blue | `#4a7fc8` / `#5a8fd6` | cornflower/azure (Rayleigh + blue B-stars) |
| PNe core / rim pair | core `#2fd0c0` + rim `#ff5a4a` | [O III] teal core, Hα/[N II] red rim |
| SNR filaments | red `#ff4a3a` + cyan `#35d0d0` | radiative-shock bicolour lacework |
| Crab synchrotron interior | `#b8c8e8` (blue-white) | pulsar-wind continuum, unique to Crab-type SNR |
| Dark nebula | `#050403` → `#000000` | occlusion only (multiply), never additive |

---

## 2. The Milky-Way Nebula Catalogue

Full catalogue of the iconic Milky-Way nebulae (the 25 in the portfolio plus
strong candidates to add). Distance flags: **[G]** = Gaia-era parallax
(reliable), **[±]** = real source disagreement / method-limited (state a range).

### 2.1 Catalogue table

| # | Name (catalog) | Type | RA (h) | Dec (°) | Size (′) | Distance (ly) | True colours | Descriptor |
|---|---|---|---|---|---|---|---|---|
| 1 | Orion (M42 / NGC 1976) | emission | 5.588 | −5.388 | 65 | 1,270–1,340 [G/±] | Hα red, [O III] teal, blue Trapezium reflection | red-green glow, blue core |
| 2 | Eagle (M16 / NGC 6611) | emission | 18.313 | −13.787 | 70 | 5,700 [±] | Hα pink-red, dark dust pillars | pink field, dark pillars |
| 3 | Lagoon (M8 / NGC 6523) | emission | 18.060 | −24.387 | 90 | 4,100 [±] | Hα pink-red, whitish Hourglass core, dark lane | pink cloud, dark central lane |
| 4 | Trifid (M20 / NGC 6514) | emission + reflection | 18.040 | −23.030 | 28 | 4,100 [G] | Hα red lobe + blue reflection lobe + dark trisecting lanes | red-blue split, dark lanes |
| 5 | Carina (NGC 3372) | emission | 10.752 | −59.868 | 120 | 7,500–8,500 [±] | Hα red-orange, [O III] teal cavities, dark Keyhole | vast orange field, dark keyhole |
| 6 | Rosette (NGC 2237 / C49) | emission | 6.563 | +4.998 | 78 | 5,200 [G] | Hα red ring, [O III] teal central cavity | red ring, hollow teal centre |
| 7 | Omega / Swan (M17 / NGC 6618) | emission | 18.341 | −16.177 | 11–40 | 5,000–6,800 [±] | Hα pink-red, pale white bar | bright pink swan bar |
| 8 | North America (NGC 7000 / C20) | emission | 20.988 | +44.529 | 120 | 2,590 [G] | Hα red, dark Gulf-of-Mexico dust lane | continent-shaped red cloud |
| 9 | Pelican (IC 5070) | emission | 20.847 | +44.350 | 60 | 2,590 [G/±] | Hα red, dark ridged filaments | red pelican, dark ridges |
| 10 | Cone (NGC 2264) | emission + dark | 6.688 | +9.35 | 3 (region larger) | 2,300–2,700 [±] | Hα red glow, dark dust cone silhouette | dark cone on red glow |
| 11 | Bubble (NGC 7635 / C11) | emission | 23.347 | +61.202 | 15 | 7,100–11,000 [±] | Hα red shell, [O III] teal wind-bubble cap | red shell, blue-capped bubble |
| 12 | Flame (NGC 2024) | emission | 5.698 | −1.85 | 30 | 1,350 | amber Hα, dark central dust lane | amber flame cleft by dust |
| 13 | Horsehead (B33, on IC 434) | **dark** on emission | 5.683 | −2.458 | 8 | 1,375 [G] | black dust silhouette on crimson IC 434 Hα | black horse on crimson glow |
| 14 | Cocoon (IC 5146 / C19) | emission + reflection | 21.891 | +47.267 | 12 | 2,500–3,300 [±] | Hα red core, blue reflection halo, dark tail (B168) | red core, blue halo, dark tail |
| 15 | Cave (Sh2-155 / C9) | emission | 22.955 | +62.476 | 50 | 2,400–3,300 [±] | Hα red arc, blue reflection patches, dark hollow | red arc over dark hollow |
| 16 | Elephant's Trunk (IC 1396 / A) | emission | 21.65 | +57.49 | 170 (region) | 2,400–3,000 [±] | Hα red field, bright-rimmed dark trunk | dark trunk on red glow |
| 17 | California (NGC 1499 / Sh2-220) | emission | **4.055** | **+36.42** | 150 | 1,300 [G] | deep Hα red, elongated streak | long crimson streak |
| 18 | Iris (NGC 7023 / C4) | **reflection** | 21.027 | +68.169 | 18 | 1,300 | blue Rayleigh scatter, dark dust filaments | blue petals, dark dust |
| 19 | Ring (M57 / NGC 6720) | planetary | 18.893 | +33.029 | 3.5 (halo) | 2,570 | [O III] teal ring, Hα/[N II] red rim | teal smoke ring, red halo |
| 20 | Helix (NGC 7293 / C63) | planetary | 22.494 | −20.837 | 25 | 655 [G] | [O III] teal disk, Hα/[N II] red rim + knots | blue-green eye, red-fringed ring |
| 21 | Cat's Eye (NGC 6543 / C6) | planetary | 17.976 | +66.633 | 5.8 (halo) | 3,000–3,600 [±] | [O III] green core, Hα/[N II] red shells | green whorled eye, red shells |
| 22 | Dumbbell (M27 / NGC 6853) | planetary | 19.993 | +22.721 | 8 | 1,360 [G] | [O III] teal apple-core, Hα/[N II] red wings | teal apple-core, red wings |
| 23 | Crab (M1 / NGC 1952) | supernova remnant | 5.575 | +22.017 | 7 | 5,000–8,000 [±] | blue-white synchrotron interior, red filament cage | blue glow, red filaments |
| 24 | Veil / Cygnus Loop (NGC 6960/6992) | supernova remnant | 20.85 | +30.70 | 180 | 2,400 [G] | Hα red + [O III] cyan filament lace | red-cyan filamentary lace |
| 25 | Coalsack (C99) | **dark** | 12.833 | −62.5 | 420 | ~600 | inky black extinction (no emission) | black void in the Milky Way |

**Strong candidates to add** (see §5.3):

| # | Name (catalog) | Type | RA (h) | Dec (°) | Size (′) | Distance (ly) | True colours | Descriptor |
|---|---|---|---|---|---|---|---|---|
| 26 | Pleiades / Merope neb. (M45, NGC 1435) | **reflection** | 3.79 | +24.12 | 30–120 | 444 [G] | blue Rayleigh scatter of hot B-stars | blue wisps around bright stars |
| 27 | Witch Head (IC 2118 / NGC 1909) | reflection | 5.033 | −7.9 | 180 | ~1,000 | blue scatter of Rigel's light | blue witch profile |
| 28 | Ghost of Jupiter (NGC 3242 / C59) | planetary | 10.413 | −18.642 | 0.7 | 4,800 | [O III] teal eye, faint red halo | blue-green eye, red halo |

### 2.2 JSON-ready block

Fields match the `CATALOG` schema (`name, type, ra, dec, arcmin`) plus
research-only fields (`distance_ly`, `colors[]`, `descriptor`). `core`/`halo`
are the **recommended** secondary-hue tints per §1.4 (hex the shader uses as a
gentle depth cue). Where a value differs from the current code it is called out
in §4.

```json
[
  { "name": "Orion (M42)", "type": "emission", "ra": 5.588, "dec": -5.388, "arcmin": 65, "distance_ly": "1270-1340", "core": "#ff4a4a", "halo": "#4fb9a8", "colors": ["Ha red 656nm", "OIII teal 500.7nm", "blue Trapezium reflection"], "descriptor": "red-green glow, blue core", "src": "https://en.wikipedia.org/wiki/Orion_Nebula" },
  { "name": "Eagle (M16)", "type": "emission", "ra": 18.313, "dec": -13.787, "arcmin": 70, "distance_ly": 5700, "core": "#ff5a6e", "halo": "#3bd6c6", "colors": ["Ha pink-red", "dark dust pillars", "faint OIII"], "descriptor": "pink field, dark pillars", "src": "https://en.wikipedia.org/wiki/Eagle_Nebula" },
  { "name": "Lagoon (M8)", "type": "emission", "ra": 18.060, "dec": -24.387, "arcmin": 90, "distance_ly": 4100, "core": "#ff4a5a", "halo": "#ff7a8a", "colors": ["Ha pink-red", "white Hourglass core", "dark lane"], "descriptor": "pink cloud, dark central lane", "src": "https://en.wikipedia.org/wiki/Lagoon_Nebula" },
  { "name": "Trifid (M20)", "type": "emission", "ra": 18.040, "dec": -23.030, "arcmin": 28, "distance_ly": 4100, "core": "#ff3b4a", "halo": "#6f9bd6", "colors": ["Ha red lobe", "blue reflection lobe", "dark trisecting lanes"], "descriptor": "red-blue split, dark lanes", "src": "https://en.wikipedia.org/wiki/Trifid_Nebula" },
  { "name": "Carina (NGC 3372)", "type": "emission", "ra": 10.752, "dec": -59.868, "arcmin": 120, "distance_ly": "7500-8500", "core": "#ff5a36", "halo": "#4fb9a8", "colors": ["Ha red-orange", "OIII teal cavities", "dark Keyhole"], "descriptor": "vast orange field, dark keyhole", "src": "https://en.wikipedia.org/wiki/Carina_Nebula" },
  { "name": "Rosette (NGC 2237)", "type": "emission", "ra": 6.563, "dec": 4.998, "arcmin": 78, "distance_ly": 5200, "core": "#ff3b2f", "halo": "#33ccaa", "colors": ["Ha red ring", "OIII teal central cavity"], "descriptor": "red ring, hollow teal centre", "src": "https://en.wikipedia.org/wiki/Rosette_Nebula" },
  { "name": "Omega / Swan (M17)", "type": "emission", "ra": 18.341, "dec": -16.177, "arcmin": 20, "distance_ly": "5000-6800", "core": "#ff4a5a", "halo": "#ff7a8a", "colors": ["Ha pink-red", "pale white bar"], "descriptor": "bright pink swan bar", "src": "https://en.wikipedia.org/wiki/Omega_Nebula" },
  { "name": "North America (NGC 7000)", "type": "emission", "ra": 20.988, "dec": 44.529, "arcmin": 120, "distance_ly": 2590, "core": "#ff3b2f", "halo": "#4fb9a8", "colors": ["Ha red", "dark Gulf dust lane", "faint OIII"], "descriptor": "continent-shaped red cloud", "src": "https://en.wikipedia.org/wiki/North_America_Nebula" },
  { "name": "Pelican (IC 5070)", "type": "emission", "ra": 20.847, "dec": 44.350, "arcmin": 60, "distance_ly": 2590, "core": "#ff3b2f", "halo": "#c62f2f", "colors": ["Ha red", "dark ridged filaments"], "descriptor": "red pelican, dark ridges", "src": "https://en.wikipedia.org/wiki/Pelican_Nebula" },
  { "name": "Cone (NGC 2264)", "type": "emission", "ra": 6.688, "dec": 9.35, "arcmin": 30, "distance_ly": "2300-2700", "core": "#ff3b2f", "halo": "#6f9bd6", "colors": ["Ha red glow", "dark dust cone", "blue reflection tip"], "descriptor": "dark cone on red glow", "src": "https://en.wikipedia.org/wiki/Cone_Nebula" },
  { "name": "Bubble (NGC 7635)", "type": "emission", "ra": 23.347, "dec": 61.202, "arcmin": 15, "distance_ly": "7100-11000", "core": "#ff3b2f", "halo": "#3bd6c6", "colors": ["Ha red shell", "OIII teal bubble cap"], "descriptor": "red shell, blue-capped bubble", "src": "https://en.wikipedia.org/wiki/Bubble_Nebula" },
  { "name": "Flame (NGC 2024)", "type": "emission", "ra": 5.698, "dec": -1.85, "arcmin": 30, "distance_ly": 1350, "core": "#ff5a36", "halo": "#c62f2f", "colors": ["amber Ha", "dark central dust lane"], "descriptor": "amber flame cleft by dust", "src": "https://en.wikipedia.org/wiki/Flame_Nebula" },
  { "name": "Horsehead (B33)", "type": "emission", "ra": 5.683, "dec": -2.458, "arcmin": 8, "distance_ly": 1375, "core": "#ff3b2f", "halo": "#6f9bd6", "colors": ["black dust silhouette", "crimson IC 434 Ha background"], "descriptor": "black horse on crimson glow", "note": "physically DARK; rendered via emission path because texture bundles the IC 434 red field", "src": "https://en.wikipedia.org/wiki/Horsehead_Nebula" },
  { "name": "Cocoon (IC 5146)", "type": "emission", "ra": 21.891, "dec": 47.267, "arcmin": 12, "distance_ly": "2500-3300", "core": "#ff3b2f", "halo": "#6f9bd6", "colors": ["Ha red core", "blue reflection halo", "dark tail B168"], "descriptor": "red core, blue halo, dark tail", "src": "https://en.wikipedia.org/wiki/Cocoon_Nebula" },
  { "name": "Cave (Sh2-155)", "type": "emission", "ra": 22.955, "dec": 62.476, "arcmin": 50, "distance_ly": "2400-3300", "core": "#ff3b2f", "halo": "#6f9bd6", "colors": ["Ha red arc", "blue reflection patches", "dark hollow"], "descriptor": "red arc over dark hollow", "src": "https://en.wikipedia.org/wiki/Cave_Nebula" },
  { "name": "Elephant's Trunk (IC 1396)", "type": "emission", "ra": 21.65, "dec": 57.49, "arcmin": 170, "distance_ly": "2400-3000", "core": "#ff3b2f", "halo": "#c62f2f", "colors": ["Ha red field", "bright-rimmed dark trunk"], "descriptor": "dark trunk on red glow", "src": "https://en.wikipedia.org/wiki/Elephant%27s_Trunk_Nebula" },
  { "name": "California (NGC 1499)", "type": "emission", "ra": 4.055, "dec": 36.42, "arcmin": 150, "distance_ly": 1300, "core": "#ff3b2f", "halo": "#c62f2f", "colors": ["deep Ha red", "elongated streak"], "descriptor": "long crimson streak", "src": "https://en.wikipedia.org/wiki/California_Nebula" },
  { "name": "Iris (NGC 7023)", "type": "reflection", "ra": 21.027, "dec": 68.169, "arcmin": 18, "distance_ly": 1300, "core": "#5a8fd6", "halo": "#4a7fc0", "colors": ["blue Rayleigh scatter", "dark dust filaments"], "descriptor": "blue petals, dark dust", "src": "https://en.wikipedia.org/wiki/Iris_Nebula" },
  { "name": "Ring (M57)", "type": "planetary", "ra": 18.893, "dec": 33.029, "arcmin": 3.5, "distance_ly": 2570, "core": "#2fd0c0", "halo": "#ff3b2f", "colors": ["OIII teal ring", "Ha/NII red rim"], "descriptor": "teal smoke ring, red halo", "src": "https://en.wikipedia.org/wiki/Ring_Nebula" },
  { "name": "Helix (NGC 7293)", "type": "planetary", "ra": 22.494, "dec": -20.837, "arcmin": 25, "distance_ly": 655, "core": "#3bd6c6", "halo": "#ff6b4a", "colors": ["OIII teal disk", "Ha/NII red rim + knots"], "descriptor": "blue-green eye, red-fringed ring", "src": "https://en.wikipedia.org/wiki/Helix_Nebula" },
  { "name": "Cat's Eye (NGC 6543)", "type": "planetary", "ra": 17.976, "dec": 66.633, "arcmin": 5.8, "distance_ly": "3000-3600", "core": "#3bd6c6", "halo": "#ff6b4a", "colors": ["OIII green core", "Ha/NII red shells"], "descriptor": "green whorled eye, red shells", "src": "https://en.wikipedia.org/wiki/Cat%27s_Eye_Nebula" },
  { "name": "Dumbbell (M27)", "type": "planetary", "ra": 19.993, "dec": 22.721, "arcmin": 8, "distance_ly": 1360, "core": "#3bd6c6", "halo": "#ff5a4a", "colors": ["OIII teal apple-core", "Ha/NII red wings"], "descriptor": "teal apple-core, red wings", "src": "https://en.wikipedia.org/wiki/Dumbbell_Nebula" },
  { "name": "Crab (M1)", "type": "snr", "ra": 5.575, "dec": 22.017, "arcmin": 7, "distance_ly": "5000-8000", "core": "#b8c8e8", "halo": "#ff5a4a", "colors": ["blue-white synchrotron interior", "red Ha/NII/SII filament cage", "green OIII"], "descriptor": "blue glow, red filaments", "src": "https://en.wikipedia.org/wiki/Crab_Nebula" },
  { "name": "Veil (Cygnus Loop)", "type": "snr", "ra": 20.85, "dec": 30.70, "arcmin": 180, "distance_ly": 2400, "core": "#ff4a3a", "halo": "#35d0d0", "colors": ["Ha red filaments", "OIII cyan filaments"], "descriptor": "red-cyan filamentary lace", "src": "https://en.wikipedia.org/wiki/Veil_Nebula" },
  { "name": "Coalsack", "type": "dark", "ra": 12.833, "dec": -62.5, "arcmin": 420, "distance_ly": 600, "colors": ["inky black extinction"], "descriptor": "black void in the Milky Way", "src": "https://en.wikipedia.org/wiki/Coalsack_Nebula" },

  { "name": "Pleiades (M45 / NGC 1435)", "type": "reflection", "ra": 3.79, "dec": 24.12, "arcmin": 110, "distance_ly": 444, "core": "#5a8fd6", "halo": "#4a7fc0", "colors": ["blue Rayleigh scatter of hot B-stars"], "descriptor": "blue wisps around bright stars", "src": "https://en.wikipedia.org/wiki/Merope_Nebula" },
  { "name": "Witch Head (IC 2118)", "type": "reflection", "ra": 5.033, "dec": -7.9, "arcmin": 180, "distance_ly": 1000, "core": "#5a8fd6", "halo": "#4a7fc0", "colors": ["blue scatter of Rigel"], "descriptor": "blue witch profile", "src": "https://en.wikipedia.org/wiki/Witch_Head_Nebula" },
  { "name": "Ghost of Jupiter (NGC 3242)", "type": "planetary", "ra": 10.413, "dec": -18.642, "arcmin": 0.7, "distance_ly": 4800, "core": "#3bd6c6", "halo": "#ff6b4a", "colors": ["OIII teal eye", "faint red halo"], "descriptor": "blue-green eye, red halo", "src": "https://en.wikipedia.org/wiki/NGC_3242" }
]
```

---

## 3. Extragalactic H II Regions (homepage candidates)

These are the "giant H II regions" of the Local Group — the same emission
physics as Galactic H II (Hα-red-dominant + [O III] teal near the hottest
stars), but scaled up 10–100× and seen from outside. Distances use
standard-candle methods (Cepheids, eclipsing binaries, TRGB) — Gaia cannot
resolve parallax at these ranges.

| Name (catalog) | Host galaxy | Type | RA (h) | Dec (°) | Size (′) | Distance (ly) | True colours | Descriptor |
|---|---|---|---|---|---|---|---|---|
| **Tarantula / 30 Doradus (NGC 2070)** | LMC | H II / starburst (R136 super-cluster) | 5.644 | −69.095 | 40 × 25 | **~162,000** (49.6 kpc) | Hα red filamentary web, [O III] teal near R136 | red glowing web, blue-hot core |
| **NGC 604** | M33 (Triangulum) | giant H II (~1,500 ly across) | 1.576 | +30.785 | 1.9 × 1.2 | **~2.7 million** (~840 kpc) | Hα red cavern threaded by O/WR-star cavities, [O III] teal | vast red star-forming cavern |

- Tarantula distance: LMC eclipsing-binary distance 49.59 ± 0.55 kpc, ~1%
  precision ([Pietrzyński et al. 2019, *Nature*](https://en.wikipedia.org/wiki/Tarantula_Nebula);
  [30 Doradus / NGC 2070](https://en.wikipedia.org/wiki/Tarantula_Nebula)). It is
  the most luminous H II region in the Local Group — if it were as close as
  Orion it would cast shadows and span 30°.
- NGC 604 distance: M33 at ~2.7 Mly ([NGC 604 — Wikipedia](https://en.wikipedia.org/wiki/NGC_604)).
  Second-largest H II region in the Local Group after 30 Dor.

For the homepage these read as **deep red glowing webs with a blue-white hot
core** — the colour signature that says "star factory" — and, being
extragalactic, justify sitting off the Milky-Way band as distinct luminous
patches.

---

## 4. Discrepancies vs the Current `CATALOG`

Cross-check against `src/stellar/Scene/Nebulae.jsx`, `CATALOG` array (lines
127–153). Verdict up front: **positions are excellent** — 23 of 25 RA/Dec are
accurate to a few arcminutes. The findings below are one real coordinate error,
two colour-physics corrections, and a handful of minor notes. Nothing here is
load-bearing for the current "fixed-shell" design (the code stores no per-object
distance), so distance is informational only.

### 4.1 Fix — real errors

- **California Nebula (NGC 1499) — line 141: coordinates wrong.**
  Code: `ra: 4.012, dec: 36.167`. Correct J2000: **`ra: 4.055, dec: 36.42`**
  (04h 03m 18s, +36° 25′). The current values put it ~0.5° low and ~0.6° west of
  the real nebula. This is the only genuine position error in the catalogue.
  ([NGC 1499 — Wikipedia](https://en.wikipedia.org/wiki/California_Nebula), confirmed via
  [In-The-Sky](https://in-the-sky.org/data/object.php?id=NGC1499))

- **Crab Nebula (M1) — line 136: core/halo colours inverted vs physics.**
  Code: `core: "#ff6b35"` (orange), `halo: "#5a8fd6"` (blue). Real Crab is the
  opposite structure: a **blue-white synchrotron continuum fills the interior**
  (pulsar-wind electrons) and the **red/orange Hα+[N II]+[S II] filaments form
  the outer cage**. Recommend swapping: **`core: "#b8c8e8"` (blue-white
  synchrotron), `halo: "#ff5a4a"` (red filaments)**. This is the one object whose
  interior is genuinely blue, so getting it backwards is scientifically visible.
  ([Crab Nebula — Wikipedia](https://en.wikipedia.org/wiki/Crab_Nebula),
  [NASA/ESA Hubble+Webb Crab](https://science.nasa.gov/missions/hubble/nasas-hubble-revisits-crab-nebula-to-track-25-years-of-expansion/))

### 4.2 Refine — colour accuracy nits (low priority)

- **Dumbbell (M27) — line 140: halo teal-on-teal.** Code `core: "#3bd6c6"`,
  `halo: "#4fb9a8"` — both teal. M27's outer wings are the red **Hα/[N II]** caps,
  so the halo should be red for the [O III]/Hα two-colour separation to read.
  Suggest `halo: "#ff5a4a"`. ([Dumbbell — Wikipedia](https://en.wikipedia.org/wiki/Dumbbell_Nebula))
- **Rosette — line 133: halo blue vs the real [O III] teal cavity.** Code
  `halo: "#6f9bd6"` (blue). The hollow centre glows teal from [O III], not blue
  reflection — `#33ccaa` is more accurate. Minor.
- **Iris (NGC 7023) — line 150: fine, but slightly washed.** `core: "#6f9bd6"` is
  a soft periwinkle; real Iris is a deeper cornflower/azure — `#5a8fd6` reads
  more like a true reflection nebula. Cosmetic.

### 4.3 Note — defensible choices, documented for the record

- **Horsehead (B33) — line 151: `type: "emission"` is physically a dark nebula**,
  but this is a *deliberate render-path label*, not an error. The texture bundles
  the red IC 434 background, and the additive luminance-threshold shows that red
  field while letting space through the dark horse — so the silhouette renders
  "for free." The existing code comment already explains this. Leave as-is; keep
  the note so a future editor doesn't "fix" it into a broken dark occluder.
- **Cone (NGC 2264) — line 148: `dec: 9.88` sits on the cluster / S Mon**, whereas
  the Cone pillar itself is at Dec ≈ **+9.35°**. If the intent is the whole NGC
  2264 region, 9.88 is fine; if it's the Cone specifically, drop to +9.35.
  Low-impact either way on a background shell.
- **Angular-size choices** (informational, not errors): Orion `85` vs
  bright-core 65′; Eagle `35` vs full-extent 70′. Both are "bright region vs
  faint total extent" judgement calls — the log-compressed `scaleFor()` mapping
  makes them cosmetically moot. Ring `3.5′`, Cat's Eye `5′`, Helix `25′` all use
  the halo-inclusive extent (the bright cores are far smaller: M57 1.4′, Cat's Eye
  0.3′), which is the right call for visibility.
- **Minor Dec offsets** (all < 4′, negligible on the shell): Trifid −22.972 vs
  −23.03; Cave 62.52 vs 62.48; Eagle −13.783 vs −13.787.
- **Veil `20.85 / 30.70`** is spot-on for the geometric centre of the ~3° Cygnus
  Loop (between the NGC 6960 western and NGC 6992 eastern arcs). No change.

### 4.4 Distance sanity table (informational — code has no distance field)

Reliable Gaia-era distances to prefer if a distance field is ever added; ranges
where sources genuinely disagree:

| Object | Best distance (ly) | Confidence |
|---|---|---|
| Helix | 655 [G] | high |
| Orion | 1,270–1,340 | high (radio+Gaia cluster) |
| California | 1,300 [G] | high |
| Flame | 1,350 | high |
| Horsehead | 1,375 [G] | high |
| Dumbbell | 1,360 [G] | high |
| Ring | 2,570 | high |
| Veil | 2,400 [G] | high |
| North America / Pelican | 2,590 [G] | high |
| Cone / NGC 2264 | 2,300–2,700 | medium |
| Trifid | 4,100 [G] | high |
| Lagoon | 4,100–6,000 | medium |
| Ghost of Jupiter | 4,800 | medium |
| Rosette | 5,200 | high |
| Eagle | 5,700 | high |
| Omega | 5,000–6,800 | low |
| Crab | 5,000–8,000 (6,500 ± 1,600) | low (kinematic) |
| Carina | 7,500–8,500 | medium |
| Cat's Eye | 3,000–3,600 | low (expansion parallax) |
| Bubble | 7,100–11,000 | low (worst-constrained) |

---

## 5. Implementation Recommendations

### 5.1 Immediate, cheap corrections (data-only edits to `CATALOG`)

1. **California (line 141):** `ra: 4.012 → 4.055`, `dec: 36.167 → 36.42`.
2. **Crab (line 136):** `core: "#ff6b35" → "#b8c8e8"`, `halo: "#5a8fd6" → "#ff5a4a"`
   (make the interior the blue synchrotron, the rim the red filaments).
3. (Optional) **Dumbbell (line 140):** `halo: "#4fb9a8" → "#ff5a4a"`;
   **Rosette (line 133):** `halo: "#6f9bd6" → "#33ccaa"`.

All are single-line edits in the data array — no shader or render-path change.

### 5.2 Dark nebulae need occlusion, not addition (already correct — keep it)

The code's split render path is physically right and should be preserved:
additive blending can only **add** light, so a dark cloud rendered additively
would be invisible or, worse, glow. Real dust is defined by **extinction** — it
**blocks** background starlight. The current `DarkNebula` uses `MultiplyBlending`
with a near-black core feathering to white at the rim, which multiplies the star
field toward black at the centre and by ×1 (no change) at the edge — i.e. it
**occludes**. That is the correct model and matches how Coalsack looks (a black
void punched in the Milky Way).

- Coalsack is the only pure-dark entry and correctly uses this path.
- Horsehead is a dark nebula rendered on the emission path *on purpose* (its
  texture carries the red IC 434 backdrop; the additive threshold shows the glow
  and lets the dark horse silhouette through). Do **not** convert it to the
  multiply occluder — it would lose the crimson field that makes it read.
- If you ever add a pure-dark cloud without a bundled emission backdrop (e.g. a
  Bok globule, the Pipe Nebula, LDN 1622 "Boogeyman"), route it through the
  `DarkNebula` multiply path, not the emission path.

### 5.3 Coverage gaps worth filling

- **No pure bright reflection nebula in the sky except Iris.** Adding **Pleiades
  (M45 / Merope, NGC 1435)** at `ra: 3.79, dec: 24.12` would put a signature blue
  reflection patch on the sky beside the Hyades/Taurus region — the cleanest
  textbook example of Rayleigh-blue, and instantly recognisable. **Witch Head
  (IC 2118)** near Rigel is a second candidate. Both use `type: "reflection"`,
  blue core/halo.
- **Extragalactic H II for the homepage:** Tarantula (30 Dor) and NGC 604 (§3)
  are ideal — red glowing webs with blue-hot cores. Being extragalactic, place
  them off the galactic band as distinct luminous patches (Tarantula in the LMC
  direction ~5.64h / −69°; NGC 604 toward M33 ~1.58h / +30.8°).

### 5.4 Colour-grading guidance for the shader

The renderer already carries true colour in each object's texture and uses
`core`/`halo` only as a 10–40 % secondary-hue depth cue (`uTintAmt` 0.1 core /
0.4 halo). Given that, the tint choices should follow the **integrated** palette
(§1.4), not the raw monochromatic line hex (§1.3) — the monochromatic values are
too saturated for a gentle depth wash. Rules of thumb by type:

- **Emission / H II:** red/pink core, teal or blue halo — never a second red on
  the halo unless the object is genuinely Hα-only (California, Pelican).
- **Planetary:** teal core (`#2fd0c0`–`#3bd6c6`) + red rim (`#ff5a4a`–`#ff6b4a`).
  This is the type's defining ionisation gradient — keep the two colours split.
- **SNR:** red + cyan lace (Veil); Crab is the exception with a blue-white
  synchrotron interior.
- **Reflection:** blue core + blue halo (cornflower `#5a8fd6` / azure `#4a7fc0`).
- **Dark:** no tint — occlusion only.

### 5.5 What is already right (don't touch)

- The `scenePos()` equatorial→scene transform is shared identically across
  `Stars.jsx` / `DistantGalaxies.jsx` / `MilkyWay.jsx` / `Nebulae.jsx`, so every
  sky-fixed layer agrees on where a real direction points. Placing nebulae by
  true RA/Dec correctly clusters them along the galactic plane (Cygnus,
  Sagittarius, Orion, Carina), reinforcing the Milky-Way band.
- The log-compressed `scaleFor()` size mapping (3.5′ Ring → 420′ Coalsack across
  a tight world-scale band) is the right approach — a linear map would make the
  giants featureless washes and the planetaries invisible.
- 23/25 positions are accurate; the fixed-shell distance abstraction is a
  deliberate, defensible design choice (true distances would put even the nearest
  nebula billions of units out).

---

## Sources

Positions, sizes, and distances (J2000 infoboxes, sourced to SIMBAD / SEDS
Messier / NASA):
Orion <https://en.wikipedia.org/wiki/Orion_Nebula> ·
Eagle <https://en.wikipedia.org/wiki/Eagle_Nebula> ·
Lagoon <https://en.wikipedia.org/wiki/Lagoon_Nebula> ·
Trifid <https://en.wikipedia.org/wiki/Trifid_Nebula> ·
Carina <https://en.wikipedia.org/wiki/Carina_Nebula> ·
Rosette <https://en.wikipedia.org/wiki/Rosette_Nebula> ·
Omega <https://en.wikipedia.org/wiki/Omega_Nebula> ·
North America <https://en.wikipedia.org/wiki/North_America_Nebula> ·
Pelican <https://en.wikipedia.org/wiki/Pelican_Nebula> ·
Cone <https://en.wikipedia.org/wiki/Cone_Nebula> ·
Bubble <https://en.wikipedia.org/wiki/Bubble_Nebula> ·
Flame <https://en.wikipedia.org/wiki/Flame_Nebula> ·
Horsehead <https://en.wikipedia.org/wiki/Horsehead_Nebula> ·
Cocoon <https://en.wikipedia.org/wiki/Cocoon_Nebula> ·
Cave <https://en.wikipedia.org/wiki/Cave_Nebula> ·
Elephant's Trunk <https://en.wikipedia.org/wiki/Elephant%27s_Trunk_Nebula> ·
California <https://en.wikipedia.org/wiki/California_Nebula> ·
Iris <https://en.wikipedia.org/wiki/Iris_Nebula> ·
Ring <https://en.wikipedia.org/wiki/Ring_Nebula> ·
Helix <https://en.wikipedia.org/wiki/Helix_Nebula> ·
Cat's Eye <https://en.wikipedia.org/wiki/Cat%27s_Eye_Nebula> ·
Dumbbell <https://en.wikipedia.org/wiki/Dumbbell_Nebula> ·
Crab <https://en.wikipedia.org/wiki/Crab_Nebula> ·
Veil <https://en.wikipedia.org/wiki/Veil_Nebula> (+ SIMBAD
<https://simbad.u-strasbg.fr/simbad/sim-id?Ident=NGC+6960>,
<https://simbad.u-strasbg.fr/simbad/sim-id?Ident=NGC+6992>) ·
Coalsack <https://en.wikipedia.org/wiki/Coalsack_Nebula> ·
Pleiades/Merope <https://en.wikipedia.org/wiki/Merope_Nebula> ·
Witch Head <https://en.wikipedia.org/wiki/Witch_Head_Nebula> ·
Ghost of Jupiter <https://en.wikipedia.org/wiki/NGC_3242> ·
Tarantula/30 Dor <https://en.wikipedia.org/wiki/Tarantula_Nebula> ·
NGC 604 <https://en.wikipedia.org/wiki/NGC_604>

Colour physics & emission lines:
Dan Bruton wavelength→RGB <http://www.physics.sfasu.edu/astro/color/spectra.html> ·
wavelength→hex reference table <https://laserpointerforums.com/threads/reference-wavelength-to-rgb-color-codes-for-forum-signatures-spectrum.103048/> ·
narrowband Hα/[O III]/[S II] lines <https://snowflakeskies.com/pages/what-are-narrowband-filters-h-alpha-oiii-sii> ·
true colour of emission nebulosity <https://cloudynights.com/topic/684820-the-true-colour-of-hydrogen-emission-nebulosity> ·
colour of nebulae & dust (Clark) <https://clarkvision.com/articles/color.of.nebulae.and.interstellar.dust/> ·
Balmer series <https://en.wikipedia.org/wiki/Balmer_series> ·
reflection-nebula Rayleigh physics (APOD) <https://apod.nasa.gov/apod/reflection_nebulae.html> ·
Starizona narrowband vs true colour <https://starizona.com/blogs/tutorials/narrowband-imaging> ·
Crab synchrotron (NASA) <https://science.nasa.gov/missions/hubble/nasas-hubble-revisits-crab-nebula-to-track-25-years-of-expansion/>
