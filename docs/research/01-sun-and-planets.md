# The Sun & the Eight Planets — A Scientifically-Accurate Reference for the Stellar Portfolio

**Scope:** The Sun + Mercury → Neptune. Physical, orbital, atmospheric, ring, and — with
particular care — **true-colour** data, each value citation-backed. Followed by a line-by-line
audit of the current portfolio config against these numbers.

**Method:** Every value below was re-verified via web search against authoritative sources
(NASA/NSSDCA, ESA, IAU, the University of Oxford / Irwin et al. 2024 true-colour study,
peer-reviewed literature, and NASA-derived encyclopaedic infoboxes). Nothing here is from
memory. Where two authoritative sources disagree (e.g. Wikipedia infobox vs. NSSDCA
fact-sheet rounding), both are noted.

**Primary sources (used throughout, cited inline by short name):**
- NSSDCA planetary fact sheets — `https://nssdc.gsfc.nasa.gov/planetary/factsheet/` (host currently 307-redirects; values mirrored in the encyclopaedic infoboxes below)
- Sun: `https://en.wikipedia.org/wiki/Sun`
- Per-planet infoboxes (NSSDCA/JPL-sourced): `https://en.wikipedia.org/wiki/Mercury_(planet)` · `/Venus` · `/Earth` · `/Mars` · `/Jupiter` · `/Saturn` · `/Uranus` · `/Neptune`
- **Uranus/Neptune true colour:** Irwin et al. 2024, *MNRAS* 527(4):11521–11538, `https://doi.org/10.1093/mnras/stad3761`; Oxford press release (via) `https://www.sci.news/astronomy/uranus-neptune-true-colors-12589.html`, `https://phys.org/news/2024-01-images-reveal-neptune-uranus.html`
- Planet true colours (physics): The Planetary Society `https://www.planetary.org/articles/why-the-true-colors-of-the-planets-arent-what-you-think`; BBC Sky at Night `https://www.skyatnightmagazine.com/space-science/colours-solar-system-planets`
- Sun colour (white, not yellow): `https://www.scienceabc.com/nature/universe/whats-the-colour-of-the-sun-at-noon-in-space`; IAU nominal T_eff 5772 K
- Saturn's rings: `https://en.wikipedia.org/wiki/Rings_of_Saturn`; NASA Science `https://science.nasa.gov/resource/saturns-rings-2/`
- Moon counts (2026): IAU/MPC via `https://earthsky.org/space/more-moons-for-jupiter-and-saturn-total-satellite-discoveries/`

---

## 1. Executive Summary — the biggest corrections

The portfolio's *physical and orbital* numbers are, overwhelmingly, already correct (the config
was clearly built from NSSDCA). The corrections cluster in **colour** — exactly the axis the brief
flags — plus a few volatile counts.

| # | Priority | Body | What's wrong now | Correct |
|---|----------|------|------------------|---------|
| 1 | **HIGH (colour)** | **Sun** | Body `color: "#ff9a3c"` — a fire-orange. The Sun is a 5772 K blackbody: its true colour is **white** (faintly warm-white), not orange or yellow. | `≈ #FFF5EC` (essentially white). Keep the warm HUD `accent` for chrome; keep the corona/bloom warm if desired, but the *photosphere disc* should read white. |
| 2 | **HIGH (colour)** | **Sun** | `planetFacts.impact.body: "Sol — G2V yellow dwarf star"`. "Yellow dwarf" is a spectral nickname, but it's visually misleading and contradicts the white-Sun fact. | `"Sol — G2V main-sequence star"`; optionally add "(true colour: white)". |
| 3 | **HIGH (colour)** | **Venus** | Body `color: "#f8c555"` — a saturated marigold gold. Venus's sulphuric-acid cloud deck is **pale cream / off-white** (Bond albedo ≈ 0.76), with only a *subtle* yellow cast from a UV absorber. | `≈ #E3DAC2` (pale cream). The existing `tint:"#c9b48a"` partly compensates, but the base is too golden. |
| 4 | **MED (colour)** | **Uranus vs Neptune** | Base colours `#aad4cf` (Uranus) and `#7fb0c4` (Neptune) render Neptune noticeably darker/bluer than Uranus. Per Irwin 2024 the two are **nearly identical** pale greenish-cyan; Neptune is only *marginally* bluer. Neptune `#7fb0c4` is on the deep side. | Move Neptune paler/closer to Uranus, e.g. `≈ #9FC4D4`. Neptune is correctly *not* deep-azure already — this is a fine-tune, not a reversal. |
| 5 | **MED (data)** | **Jupiter** | `planetFacts.education.moons: "115 confirmed"`. As of March 2026 the IAU/MPC recognise **101** moons of Jupiter — 115 is too high. | `"101 confirmed"` (or "100+"). Note this number drifts. |
| 6 | **LOW (data)** | **Uranus** | `planetData.testimonials.eccentricity: 0.0457`. | `0.0472` (JPL/infobox; NSSDCA ≈ 0.046). |
| 7 | **LOW (data)** | **Neptune** | `planetData.whatsetsmeapart.eccentricity: 0.0113` — high. | `≈ 0.0090` (JPL 0.008678; NSSDCA ≈ 0.010). |
| 8 | LOW (colour) | **Mercury** | `color: "#7a7d85"` is a neutral blue-grey. Real Mercury is grey with a **subtle warm/tan** cast. | Optional nudge to `≈ #8A8078`. |

Everything else (radii, tilts, oblateness, rotation periods, masses, densities, Saturn's `285`
moons, Mars's butterscotch `#b06a48`, Uranus's `#aad4cf`) checks out. Saturn's moon count `285`
is, as of March 2026, **correct**.

---

## 2. Reference Tables

### 2.1 Physical characteristics

Radii are the modern IAU/NSSDCA figures. "Diameter" columns are equatorial unless noted.
Oblateness (flattening) *f* = (equatorial − polar) / equatorial.

| Body | Equatorial Ø (km) | Polar Ø (km) | Mean radius (km) | Oblateness *f* | Mass (kg) | Mass (⊕=1) | Density (g/cm³) | Surface g (m/s²) | Escape v (km/s) |
|------|-------------------|--------------|-------------------|-----------------|-----------|-------------|------------------|-------------------|------------------|
| **Sun** | 1,391,400 | 1,391,260 | 695,700 | 0.00005 | 1.9885×10³⁰ | 332,950 | 1.408 | 274 | 617.6 |
| **Mercury** | 4,879 | 4,879 | 2,439.7 | 0.0009 | 3.3011×10²³ | 0.0553 | 5.427 | 3.70 | 4.25 |
| **Venus** | 12,104 | 12,104 | 6,051.8 | ~0 | 4.8673×10²⁴ | 0.815 | 5.243 | 8.87 | 10.36 |
| **Earth** | 12,756 | 12,714 | 6,371.0 | 0.00335 | 5.9722×10²⁴ | 1.000 | 5.513 | 9.807 | 11.186 |
| **Mars** | 6,792 | 6,752 | 3,389.5 | 0.00589 | 6.4171×10²³ | 0.1074 | 3.934 | 3.721 | 5.027 |
| **Jupiter** | 142,984 | 133,708 | 69,911 | 0.06487 | 1.8982×10²⁷ | 317.8 | 1.326 | 24.79 | 59.5 |
| **Saturn** | 120,536 | 108,728 | 58,232 | 0.09796 | 5.6834×10²⁶ | 95.16 | 0.687 | 10.44 | 35.5 |
| **Uranus** | 51,118 | 49,946 | 25,362 | 0.02293 | 8.6810×10²⁵ | 14.54 | 1.270 | 8.69 | 21.3 |
| **Neptune** | 49,528 | 48,682 | 24,622 | 0.01708 | 1.0241×10²⁶ | 17.15 | 1.638 | 11.15 | 23.5 |

Notes:
- **Sun mean radius 695,700 km = 109.2 × Earth's mean radius.** (Wikipedia/Sun; IAU nominal solar radius R☉ = 6.957×10⁸ m.)
- Sun flattening is 8.5 ppm — visually a perfect sphere. (Wikipedia/Sun)
- Mercury & Venus are effectively spheres (slow rotators). Saturn is the *most* oblate planet (~10% flattened); Jupiter next (~6.5%). Both are visibly squashed. (Wikipedia infoboxes)
- Neptune surface gravity: NSSDCA lists **11.15 m/s²**; the Wikipedia infobox lists 11.27 m/s² (both are "1-bar" conventions). Either is defensible.
- Jupiter mean radius 69,911 km is the NSSDCA volumetric value; the Wikipedia infobox uses 69,886 km. Negligible difference.

### 2.2 Orbital & rotational characteristics

| Body | Semi-major axis (AU) | (10⁶ km) | Eccentricity | Inclination to ecliptic (°) | Orbital period | Sidereal rotation | Axial obliquity (°) | Spin sense |
|------|----------------------|----------|--------------|------------------------------|----------------|-------------------|----------------------|------------|
| **Sun** | — | — | — | 7.25 (equator to ecliptic) | ~230 Myr (galactic) | 25.05 d (equator), 34.4 d (pole) | 7.25 | prograde |
| **Mercury** | 0.387098 | 57.909 | 0.20563 | 7.005 | 87.969 d | 58.646 d | 0.034 | prograde |
| **Venus** | 0.723332 | 108.21 | 0.006772 | 3.395 | 224.701 d | **−243.025 d** | 177.36 | **retrograde** |
| **Earth** | 1.000000 | 149.598 | 0.016708 | 0.0 (reference) | 365.256 d | 0.99727 d (23ʰ56ᵐ) | 23.44 | prograde |
| **Mars** | 1.523680 | 227.939 | 0.09341 | 1.850 | 686.980 d | 1.02596 d (24ʰ37ᵐ) | 25.19 | prograde |
| **Jupiter** | 5.20380 | 778.479 | 0.04890 | 1.303 | 11.862 yr | 9.925 h | 3.13 | prograde |
| **Saturn** | 9.58260 | 1,433.53 | 0.05650 | 2.485 | 29.447 yr | 10ʰ33ᵐ38ˢ (10.56 h) | 26.73 | prograde |
| **Uranus** | 19.19126 | 2,870.97 | **0.04717** | 0.773 | 84.021 yr | **−17ʰ14ᵐ52ˢ** (−17.24 h) | 97.77 | **retrograde** |
| **Neptune** | 30.07000 | 4,500.0 | **0.008678** | 1.770 | 164.8 yr | 16ʰ06ᵐ36ˢ (16.11 h) | 28.32 | prograde |

Notes:
- **Retrograde bodies:** Venus (upside-down, spins backward), Uranus (rolled onto its side; 97.77° > 90° = technically retrograde), and the config's dwarf Pluto. Portfolio encodes this correctly with negative `rotationHours`.
- Venus obliquity is quoted two ways: **177.36° to its orbit** (config uses this) or 2.64° "for retrograde rotation." Same physical fact.
- Uranus obliquity 97.77° (prograde convention) = 82.23° (retrograde convention). Config's 97.8° is the standard quote.
- Earth's orbital inclination is 0° *by definition* (ecliptic = Earth's orbital plane).

### 2.3 True-colour reference — the appearance you should render

"True colour" = what a human eye would see in daylight-equivalent illumination, from space,
outside Earth's atmosphere. Hexes below are **representative disc-average** values, not
pixel-exact (real discs have banding/variation). The physics column is the *why*.

| Body | True colour (words) | Representative hex | Why (physics) |
|------|---------------------|--------------------|----------------|
| **Sun** | **White** (faintly warm-white) | `#FFF5EC` | 5772 K blackbody; broad emission across all visible λ integrates to white. Looks yellow *only from the ground* — Rayleigh scattering removes blue. From space: white. |
| **Mercury** | Grey with a subtle tan/brown cast | `#8A8078` | Airless, dark silicate/space-weathered regolith; Moon-like. Near-neutral, low reflectance. |
| **Venus** | Pale cream / near-white, faint yellow | `#E3DAC2` | Global sulphuric-acid cloud deck, Bond albedo ≈ 0.76 (brightest planet). Subtle yellow from an unidentified UV absorber + sulphur. |
| **Earth** | Blue + white (ocean/cloud), tan-green land | `#4E6E9E` (disc-avg blue) | Rayleigh scattering of the ocean/atmosphere → blue; clouds white; land brown-green. |
| **Mars** | **Butterscotch / ochre**, dusky rust — *not* fire-red | `#C0693F` | Iron(III) oxide (rust) dust. Ranges golden-tan → brown → dusky red; global dust muddies pure red. |
| **Jupiter** | Cream, tan, orange-brown bands | `#D6BE9A` (disc-avg) | Ammonia-ice clouds (white zones) over darker belts; chromophores (S, P, organics) give tan/orange/brown. |
| **Saturn** | Pale gold / butterscotch-beige, low contrast | `#E3C77E` | Same chemistry as Jupiter but a deeper, hazier ammonia layer mutes the bands to soft pastels. |
| **Uranus** | Pale greenish-cyan, near-featureless | `#C6E4E0` | Methane absorbs red → cyan-green residue. Thick photochemical haze pales/greys it. |
| **Neptune** | Pale greenish-blue — *only marginally* bluer than Uranus | `#9FC4D4` | Same methane physics; a *thinner* haze layer lets slightly more blue through. **Not** the deep azure of contrast-stretched Voyager images. |

**Colour caveats worth building around:**
- Sun/Mercury/Venus/Earth/Mars/Jupiter/Saturn true colours are well-established.
- **Uranus & Neptune are the headline correction of the last decade** (Irwin et al. 2024): the iconic deep-blue Neptune was *contrast-stretched* Voyager 2 data. Both worlds are pale greenish-cyan; Neptune is barely bluer. Render them as near-twins.

---

## 3. Per-Body Deep Dive (colour physics + notable features)

### 3.0 The Sun (`impact`)
- **Size:** mean radius 695,700 km, **109.2 × Earth**; equatorial Ø 1,391,400 km. Flattening 8.5 ppm — a near-perfect sphere. (Wikipedia/Sun)
- **Mass/energy:** 1.9885×10³⁰ kg (332,950 ⊕); luminosity **3.828×10²⁶ W**; effective temperature **5,772 K** (IAU nominal); core ≈ 15.7 million K. (Wikipedia/Sun)
- **Class:** **G2V** main-sequence star. The "yellow dwarf" label is a spectral-class nickname, *not* a description of its colour.
- **True colour — WHITE.** A 5772 K blackbody radiates across the whole visible band; the integrated colour is white (with the faintest warm bias). It *peaks* near green (~500 nm) but no single-wavelength peak dictates perceived colour — the eye integrates. It looks yellow/orange **from Earth's surface** only because Rayleigh scattering strips blue on the way down (the same physics that makes the sky blue). From space it is white. Representative sRGB ≈ `#FFF5EC`. (scienceabc; IAU 5772 K)
- **Surface phenomena to evoke:** *granulation* (convection cells, ~1000 km, bright centres/dark lanes); *limb darkening* (the disc edge is dimmer/redder because you see higher, cooler photosphere at grazing angles); *sunspots* (cooler ~3800 K magnetic regions, on an ~11-year cycle); *prominences/filaments* (plasma loops on magnetic field lines); the *corona* (million-K outer atmosphere, visible at eclipse, source of the solar wind).
- **Differential rotation:** equator 25.05 d, poles 34.4 d — the Sun is not a rigid body. (Wikipedia/Sun)

### 3.1 Mercury (`experience`)
- Mean radius 2,439.7 km (0.383 ⊕); mass 3.30×10²³ kg; density 5.43 g/cm³ (high — big iron core); g = 3.70; escape v 4.25 km/s. (Wikipedia/Mercury)
- Rotation 58.646 d in a **3:2 spin–orbit resonance** (rotates 3× per 2 orbits); solar day is 176 Earth-days. Obliquity ~0.034° (essentially upright). Eccentricity 0.2056 (highest of the planets); inclination 7.005° (highest of the planets). (Wikipedia/Mercury)
- **Colour:** near-neutral **grey with a faint tan/brown cast** — space-weathered silicate regolith, Moon-like. MESSENGER "enhanced-colour" maps (vivid blues/oranges) are *false-colour* mineralogy, not the eye's view. Representative `#8A8078`.
- Features: tenuous surface-bounded exosphere (Na, O, H, He, K, Ca); Caloris Planitia (1,550 km impact basin); no moons.

### 3.2 Venus (`projects`)
- Mean radius 6,051.8 km (0.95 ⊕ — Earth's near-twin in size); mass 4.87×10²⁴ kg; g = 8.87; escape v 10.36 km/s. (Wikipedia/Venus)
- **Retrograde:** sidereal rotation −243.025 d (a Venus day is *longer than its year*); obliquity 177.36°. Eccentricity 0.0068 (most circular orbit); inclination 3.39°. (Wikipedia/Venus)
- **Colour:** **pale cream / near-white** with a subtle yellow tint. The atmosphere is 96.5% CO₂ / 3.5% N₂ with a global cloud deck of **sulphuric acid** (~45–70 km up); Bond albedo ≈ 0.76 makes it the brightest planet. The yellow comes from an unidentified UV absorber + sulphur, but it is *subtle* — the disc reads cream, **not** the saturated gold often drawn. Representative `#E3DAC2`. (Wikipedia/Venus; Planetary Society)
- Features: 93-bar surface pressure (≈ 900 m underwater on Earth), 464 °C surface (hottest planet, runaway greenhouse); super-rotating clouds circle in ~4 days.

### 3.3 Earth (`achievements`)
- Equatorial Ø 12,756 km / polar 12,714 km; mean radius 6,371 km; flattening 1/298.26; mass 5.972×10²⁴ kg; g = 9.807; escape v 11.186 km/s. (Wikipedia/Earth)
- Sidereal day 23ʰ56ᵐ04ˢ (0.99727 d); obliquity 23.44°; eccentricity 0.0167; inclination 0° (defines the ecliptic). (Wikipedia/Earth)
- **Colour:** blue oceans (Rayleigh scattering + water absorption), white clouds, tan/green land. Atmosphere 78% N₂ / 21% O₂ / 0.93% Ar / 0.04% CO₂. The config's `#3b6ea8` is a good ocean-blue disc average.

### 3.4 Mars (`skills`)
- Equatorial Ø 6,792 km / polar 6,752 km (flattening 0.00589); mean radius 3,389.5 km (0.53 ⊕); mass 6.42×10²³ kg; g = 3.721; escape v 5.027 km/s. (Wikipedia/Mars)
- Rotation 24ʰ37ᵐ (1.026 d, a "sol"); obliquity 25.19° (near-Earth — gives seasons + polar caps); eccentricity 0.0934; inclination 1.85°. (Wikipedia/Mars)
- **Colour:** **butterscotch / ochre / dusky rust — not fire-engine red.** Fine iron(III)-oxide dust coats the surface; true colour ranges golden-tan → brown → muted red by region, season, and dust loading. Astronaut-eye and calibrated-camera views read butterscotch. Representative `#C0693F`; the config's `#b06a48` is an excellent match. (Planetary Society; Wikipedia/Mars)
- Features: Olympus Mons (~22 km, tallest known volcano); Valles Marineris; thin CO₂ atmosphere (95.97% CO₂, 1.93% Ar, 1.89% N₂, ~6 mbar); moons Phobos & Deimos (captured-asteroid-like).

### 3.5 Jupiter (`education`)
- Equatorial Ø 142,984 km / polar 133,708 km; **oblateness 0.0649** (visibly squashed by 9.9-h spin); mean radius 69,911 km (~11 ⊕); mass 1.898×10²⁷ kg (317.8 ⊕ — 2.5× all other planets combined); density 1.326; g = 24.79; escape v 59.5 km/s. (Wikipedia/Jupiter)
- Fastest rotation of any planet: 9.925 h; obliquity 3.13° (nearly upright); eccentricity 0.0489; inclination 1.30°. (Wikipedia/Jupiter)
- **Colour:** banded **cream/tan/orange-brown.** Upper atmosphere 89% H₂ / 10% He; white **zones** are high ammonia-ice clouds, darker **belts** are lower/warmer with chromophores (sulphur, phosphorus, photochemical organics) giving tan-orange-brown. Disc-average ≈ `#D6BE9A`; config's `#c9a06a` reads as a plausible mid orange-tan. (Wikipedia/Jupiter; Planetary Society)
- Features: the **Great Red Spot** — an anticyclone wider than Earth (~16,500 × 10,900 km), storming 350+ years; a **faint dusty ring** (halo + main + gossamer, discovered by Voyager); 101 confirmed moons (2026), including the 4 Galileans (Io, Europa, Ganymede, Callisto).

### 3.6 Saturn (`hobbies`)
- Equatorial Ø 120,536 km / polar 108,728 km; **oblateness 0.098 — the most oblate planet**; mean radius 58,232 km (~9.5 ⊕); mass 5.683×10²⁶ kg (95.16 ⊕); **density 0.687 g/cm³ — less than water** (it would float); g = 10.44; escape v 35.5 km/s. (Wikipedia/Saturn)
- Rotation 10ʰ33ᵐ38ˢ (Cassini-refined 2019); obliquity 26.73°; eccentricity 0.0565; inclination 2.485°. (Wikipedia/Saturn)
- **Colour:** **pale gold / butterscotch-beige**, very low contrast. Same H₂/He (96.3%/3.25%) + ammonia-cloud chemistry as Jupiter, but a deeper, hazier ammonia layer softens the bands into soft pastels. `#e3c485` (config) is a good match. (Wikipedia/Saturn)
- Features: the **north-polar hexagon** — a stable six-sided jet stream wider than two Earths, seen since Voyager 1981; broad banding.
- **The rings (render-critical spec):**
  - **Span:** main rings run from ~7,000 km to ~80,000 km *above* the equator (≈ 66,900 → 140,180 km from Saturn's centre); the full detectable system reaches far wider. (Rings-of-Saturn)
  - **Thickness:** astonishingly thin — typically **~10 m** (locally up to ~1 km at perturbed edges). A 1:1,000,000-scale model would be tissue-thin. (NASA Science; Rings-of-Saturn)
  - **Composition/colour:** ~95%+ **water ice** (+ ~7% amorphous carbon, tholins) → bright, near-white with a faint tan tint; high albedo (Bond ≈ 0.34–0.5, geometric ≈ 0.5+ for particles). Particles range dust-grain → ~10 m boulders. (Rings-of-Saturn)
  - **Cassini Division:** the prominent gap between the A and B rings, **~4,700 km wide**. (Rings-of-Saturn; Britannica)
- 285 confirmed moons (2026 — most of any planet), incl. Titan (thick orange haze, bigger than Mercury) and Enceladus (bright water-ice geysers).

### 3.7 Uranus (`testimonials`)
- Equatorial Ø 51,118 km / polar 49,946 km; oblateness 0.0229; mean radius 25,362 km (~4 ⊕); mass 8.68×10²⁵ kg (14.5 ⊕); density 1.27; g = 8.69; escape v 21.3 km/s. (Wikipedia/Uranus)
- **Rolled onto its side:** obliquity 97.77° (retrograde); sidereal rotation −17ʰ14ᵐ52ˢ. Each pole gets 42 yr of continuous day, then 42 yr of night. Eccentricity 0.04717; inclination 0.773°. (Wikipedia/Uranus)
- **Colour:** **pale, near-featureless greenish-cyan.** Atmosphere 83% H₂ / 15% He / 2.3% CH₄; **methane absorbs red light**, leaving a cyan-green residue, and a thick photochemical haze mutes/pales it further. Representative `#C6E4E0`; config's `#aad4cf` is good. (Irwin 2024; Wikipedia/Uranus)
- **Coldest planet by recorded temperature:** tropopause minimum 49 K (−224 °C). (Wikipedia/Uranus)
- **Rings:** an extremely dark, narrow ring system — 13 known rings reflecting only ~2% of light (charcoal-dark); ride near-vertical because of the axial tilt. 28–29 moons (Titania, Oberon, Umbriel, Ariel, Miranda).

### 3.8 Neptune (`whatsetsmeapart`)
- Equatorial Ø 49,528 km / polar 48,682 km; oblateness 0.0171; mean radius 24,622 km (~3.9 ⊕); mass 1.024×10²⁶ kg (17.15 ⊕); density 1.638 (densest giant); g = 11.15; escape v 23.5 km/s. (Wikipedia/Neptune)
- Rotation 16ʰ06ᵐ36ˢ; obliquity 28.32° (Earth-like); eccentricity **0.008678** (config 0.0113 is high); inclination 1.770°. (Wikipedia/Neptune)
- **Colour — the correction the brief cares about:** **pale greenish-blue, only marginally bluer than Uranus.** Same methane physics; Neptune's *thinner haze layer* lets slightly more blue through, so it is a touch bluer — but **not** the deep indigo of the famous Voyager 2 image, which was contrast-stretched and enhanced for feature visibility. Irwin et al. 2024: the two ice giants are "a rather similar shade of greenish blue." Representative `#9FC4D4`; render Uranus & Neptune as near-twins. (Irwin 2024 / sci.news / phys.org)
- Features: the **fastest winds in the solar system** (~2,100 km/h / 580 m/s, supersonic); transient dark storms (Great Dark Spot in 1989, gone by 1994); a faint, clumpy ring system with **arcs** (Adams ring: Liberté, Égalité, Fraternité); JWST (2025) imaged its aurora at *mid-latitudes* (magnetic axis tilted ~47° and offset). 16 confirmed moons, incl. retrograde Triton.

---

## 4. Discrepancies vs. Current Portfolio

Format: **body · field · current value @ file:line · correct value · source.** Files are under
`src/stellar/`. Line numbers are from the audited revision (branch `claude/portfolio-audit-dc9fb1`).

### 4.1 HIGH priority — colour (the brief's emphasis)

| Body | Field | Current @ file:line | Correct | Source |
|------|-------|---------------------|---------|--------|
| **Sun** | body `color` | `"#ff9a3c"` (fire-orange) @ `config/destinations.js:78` | **White**, `≈ #FFF5EC` (5772 K blackbody). Keep `accent:"#e9c675"` (HUD chrome) and warm bloom if wanted, but the disc should read white. | IAU T_eff 5772 K; scienceabc "the Sun is white" |
| **Sun** | facts `body` label | `"Sol — G2V yellow dwarf star"` @ `data/planetFacts.js:16` | `"Sol — G2V main-sequence star"` (drop/annotate "yellow dwarf" — visually misleading; the Sun is white) | Wikipedia/Sun; IAU |
| **Venus** | body `color` | `"#f8c555"` (saturated gold) @ `config/destinations.js:115` | **Pale cream**, `≈ #E3DAC2`. `tint:"#c9b48a"` (line 121) helps but the base is too golden. | Wikipedia/Venus (albedo 0.76, subtle yellow); Planetary Society |

### 4.2 MEDIUM priority

| Body | Field | Current @ file:line | Correct | Source |
|------|-------|---------------------|---------|--------|
| **Neptune** | body `color` | `"#7fb0c4"` @ `config/destinations.js:317` | Paler/greener, `≈ #9FC4D4` — nearly identical to Uranus, only *marginally* bluer. Current value renders Neptune too much darker/bluer than Uranus `#aad4cf`. (Direction is already right — not deep-azure — just over-separated from Uranus.) | Irwin et al. 2024, MNRAS 527:11521 |
| **Jupiter** | facts `moons` | `"115 confirmed"` @ `data/planetFacts.js:114` | `"101 confirmed"` (IAU/MPC, Mar 2026). 115 overshoots. Volatile — consider "100+". | earthsky / IAU-MPC 2026 |
| **Uranus** | `eccentricity` | `0.0457` @ `config/planetData.js:18` | `0.0472` (JPL/infobox; NSSDCA ≈ 0.046) | Wikipedia/Uranus |
| **Neptune** | `eccentricity` | `0.0113` @ `config/planetData.js:19` | `≈ 0.0090` (JPL 0.008678; NSSDCA ≈ 0.010). 0.0113 is high. | Wikipedia/Neptune |

### 4.3 LOW priority / optional refinements

| Body | Field | Current @ file:line | Note | Source |
|------|-------|---------------------|------|--------|
| **Mercury** | body `color` | `"#7a7d85"` @ `config/destinations.js:99` | Neutral blue-grey; real Mercury is grey with a faint *warm/tan* cast. Optional nudge `≈ #8A8078`. | Planetary Society |
| **Uranus** | body `color` | `"#aad4cf"` @ `config/destinations.js:281` | Good. If pairing tighter with Neptune per §4.2, can pale slightly to `≈ #C6E4E0`. | Irwin 2024 |
| **Mercury** | `axialTilt` | *(unset)* | Real 0.034° — negligible; fine to omit. | Wikipedia/Mercury |
| **Neptune** | facts `gravity` | `"11.15 m/s²"` @ `data/planetFacts.js:151` | Fine (NSSDCA). Infobox lists 11.27; both conventions valid. | NSSDCA / Wikipedia |
| **Sun** | facts `temp` | `"5,505 °C surface"` @ `data/planetFacts.js:23` | ≈ correct (5778 K). IAU nominal is 5772 K = 5499 °C. Negligible. | IAU |

### 4.4 Confirmed CORRECT (no change) — highlights

These were checked and are accurate; do **not** "fix" them:
- **All radii** in `destinations.js` (Sun 19.87 u = 109.2 ⊕; Mercury 0.07 / Venus 0.173 / Earth 0.182 / Mars 0.097 / Jupiter 2.0 / Saturn 1.666 / Uranus 0.726 / Neptune 0.704 — all track NSSDCA mean radii).
- **All axial tilts:** Venus 177.4°, Earth 23.4°, Mars 25.2°, Jupiter 3.1°, Saturn 26.7°, Uranus 97.8°, Neptune 28.3°.
- **All oblateness values:** Jupiter 0.065, Saturn 0.098, Uranus 0.023, Neptune 0.017.
- **All rotation periods** in `planetData.js` (incl. retrograde signs for Venus −5832.5 h, Uranus −17.24 h, Pluto −153.3 h) and eccentricities/inclinations *except* the two flagged above.
- **Mars colour `#b06a48`** (butterscotch — exemplary), **Uranus `#aad4cf`** (pale greenish-cyan), **Saturn `#e3c485`**, **Jupiter `#c9a06a`**.
- **Saturn moons `"285 confirmed"`** — matches the current (Mar 2026) IAU count.
- Retrograde/prograde flags, atmosphere compositions, and the "Neptune is NOT deep blue / pale greenish-blue" comment already in `destinations.js:317`.

---

## 5. Implementation Recommendations

1. **Fix the Sun colour first — it's the single most visible inaccuracy.** Set the photosphere
   disc to white (`≈ #FFF5EC`). If the current warm look is wanted for drama, keep it in the
   **bloom/corona/glow** layers, not the body albedo — a white disc with a warm halo is both
   accurate *and* cinematic. Update the `planetFacts` label away from "yellow dwarf."

2. **Desaturate Venus** from `#f8c555` toward `#E3DAC2`. Since a `tint` already exists, you may
   only need to lift the base toward cream; verify against the bloom pass (the brief notes Venus
   blooms to a featureless disc — a cream base will bloom to a *believable* pale disc, a gold
   base blooms to an unrealistic yellow one).

3. **Tighten the Uranus/Neptune pairing.** The brief explicitly wants them read as near-identical
   pale greenish-cyan. Keep Uranus `#aad4cf`; pale Neptune's base from `#7fb0c4` toward
   `#9FC4D4` so the two look like siblings with Neptune *just* a hair bluer. The existing
   `grade` tints (`#b8d6d0` / `#9ec6d6`) already push this direction — consider aligning the
   base colours to them.

4. **Update the two eccentricities** (`planetData.js:18` Uranus → 0.0472; `:19` Neptune →
   0.0090) and **Jupiter's moon count** (`planetFacts.js:114` → "101 confirmed" / "100+").
   These are one-token edits.

5. **Leave the physical/orbital core alone.** Radii, tilts, oblateness, rotation, masses, and
   densities are already NSSDCA-accurate — the config's science foundation is sound. The work is
   almost entirely on the colour axis, which is exactly where the brief pointed.

6. **Optional polish:** warm Mercury's grey slightly (`#8A8078`); consider storing Saturn's ring
   albedo/thickness/Cassini-gap as data if the ring shader ever needs it (§3.6 has the numbers).

---

*Compiled July 2026. Physical/orbital values: NSSDCA/JPL via encyclopaedic infoboxes. True-colour
science: Irwin et al. 2024 (MNRAS, doi:10.1093/mnras/stad3761), The Planetary Society, BBC Sky at
Night, IAU nominal solar constants. Moon counts: IAU/MPC, March 2026.*
