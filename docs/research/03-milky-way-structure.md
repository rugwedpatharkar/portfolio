# 03 — Milky Way Galaxy: Structure Reference (research paper)

**Scope.** A citation-backed reference for rendering the Milky Way two ways in the
"Stellar" portfolio: (a) the galaxy **from outside** (`SpiralGalaxy.jsx`, homepage
plate) and (b) the galactic **band from within** (`MilkyWay.jsx`). Every load-bearing
number below is verified against the primary literature (Bland-Hawthorn & Gerhard 2016;
Reid et al. 2019 BeSSeL; GRAVITY 2019; Wegg, Gerhard & Portail 2015; Churchwell et al.
2009 GLIMPSE; IAU/ESA/NASA), not memory. Inline URLs cite each figure.

Companion: `docs/galaxy/astronomy-milky-way.md` (existing project note) and the data file
`src/stellar/config/galaxy.js` (intended single source of truth). This paper supersedes
loose values in both where they disagree — see §4.

Unit convention: 1 kpc = 3,261.56 ly; 1 pc = 3.2616 ly. R₀ = 8.178 kpc = 26,673 ly.

---

## 1. Executive summary

- **Type.** The Milky Way is an **SB(rs)bc barred spiral** — a large ("L⋆") disk galaxy
  with a central **box/peanut (b/p) bulge**, a long stellar **bar**, a dominant thin +
  thick **disk**, and a diffuse stellar **halo**. (Bland-Hawthorn & Gerhard 2016,
  https://arxiv.org/abs/1602.07702).
- **Size.** Bright stellar disk ≈ **30 kpc diameter** (classic "100,000 ly"; the modern
  D25 photometric diameter is 26.8 ± 1.1 kpc ≈ 87,400 ly). Faint outer disk (H I + old
  stars) is traced to ~30 kpc **radius** (~100,000 ly) and stellar debris/streams to
  ~150,000–200,000 ly. Radial disk **scale length ≈ 2.6 kpc**; **thin-disk scale height
  ≈ 300 pc**, **thick-disk ≈ 900 pc**. The extreme thin-to-wide ratio (~1:8–1:10) is
  exactly **why the Galaxy reads as a BAND** from our seat inside the mid-plane.
- **Bar/bulge.** Box/peanut bar **half-length ≈ 5 kpc**, oriented **~27–30° to the
  Sun–Galactic-center line**, axis ratios ≈ **1 : 0.4 : 0.3** (Wegg, Gerhard & Portail
  2015, https://arxiv.org/abs/1504.01401).
- **Arms.** Best modern picture: **two dominant OLD-STAR arms — Scutum-Centaurus and
  Perseus — off the bar ends**, plus **gas/young-star arms Sagittarius-Carina, Norma, and
  the Outer arm**, with the **Sun on the Local Arm / Orion Spur** (Churchwell et al. 2009,
  https://iopscience.iop.org/article/10.1086/597811; Reid et al. 2019,
  https://arxiv.org/abs/1910.03357). Mean arm **pitch ≈ 10–13°**.
- **Sun.** Galactocentric distance **R₀ = 8.178 kpc = 26,673 ly** (GRAVITY 2019,
  0.3% precision, https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html);
  **~20 pc north** of the mid-plane; orbital speed ~230–247 km/s; **orbital period ≈ 230 Myr**.
- **Mass / stars.** Stellar mass ≈ **5 × 10¹⁰ M☉**; **100–400 billion stars**; total mass
  incl. dark-matter halo ≈ **1–1.5 × 10¹² M☉**.
- **Sgr A\*.** Central supermassive black hole ≈ **4.3 × 10⁶ M☉** (GRAVITY 2022; GRAVITY
  2019 gave 4.15 × 10⁶; EHT 2022 gave 4.1 × 10⁶), toward **Sagittarius** (RA 17ʰ45ᵐ40ˢ,
  Dec −29.0°).
- **Band on our sky.** Brightest toward the **center in Sagittarius/Scorpius**; the **Great
  Rift** dark dust lane splits the band from Cygnus → Aquila → Ophiuchus → Sagittarius;
  faint toward the **anticenter** (Auriga/Taurus). The galactic plane is a great circle
  tilted **~60.2° to the ecliptic** (~62.9° to the celestial equator).
- **Colors.** Old-star **bulge = yellow-white/gold**, young-star **arms = blue-white**,
  **dust lanes = brown/black**, **H II regions = pink (Hα)**. Integrated naked-eye band is
  a **pale desaturated cream-white** (color vision is below threshold at that surface
  brightness) — long-exposure imagery is what reveals the saturated hues.

**Bottom line for the portfolio:** the *data* in `galaxy.js` is scientifically sound and
closely tracks Reid 2019 / GRAVITY 2019 / Wegg 2015. The main problems are (1) the
renderer `SpiralGalaxy.jsx` **does not import** that data — it hard-codes a parallel,
partly-divergent set of constants; and (2) a **stale "~27% out" comment** in
`SpiralGalaxy.jsx` that contradicts the correct 53% the code actually uses. Details in §4.

---

## 2. Structure reference (cited)

### 2.1 Global type and sizes

| Property | Value | Source |
|---|---|---|
| Hubble type | SB(rs)bc barred spiral, box/peanut bulge | BHG 2016 [1] |
| Bright stellar-disk diameter | ~30 kpc (~100,000 ly); D25 = 26.8 ± 1.1 kpc (87,400 ± 3,600 ly) | BHG 2016 [1]; Goodwin/Wikipedia [7] |
| Outer disk (H I + faint stars) | detected to ~30 kpc **radius** (~100,000 ly); streams to ~150–200 kly | BHG 2016 [1] |
| Thin-disk radial scale length | **2.6 ± 0.5 kpc** (range 2–4 kpc across tracers) | BHG 2016 [1] |
| Thin-disk scale height | **~300 pc** (300 ± 50 pc) | BHG 2016 [1] |
| Thick-disk scale length | ~2.0 kpc | BHG 2016 [1] |
| Thick-disk scale height | **~900 pc** (900 ± 180 pc) | BHG 2016 [1] |
| Local disk surface density (Σ⊙) | ~50–70 M☉ pc⁻² (baryonic) | BHG 2016 [1] |
| Mean spiral-arm pitch angle | ~10–13° | Reid 2019 [2]; Vallée reviews |

**Why it reads as a BAND (physics).** The disk's radial extent (~15 kpc) dwarfs its
vertical thin-disk scale height (~0.3 kpc) by a factor of ~50; even including the thick
disk the aspect ratio is ~1:10. The Sun sits *inside* this thin sheet, only ~20 pc off the
mid-plane. Looking outward along the plane, we integrate through the full ~2R length of
disk stars and dust; looking perpendicular we punch out through only ~1 scale height. The
piled-up sightlines collapse onto the plane's **great circle** → a luminous band with a
sharply falling brightness away from the plane. Same reason a sheet of paper viewed
edge-on is a bright line. (BHG 2016 [1].)

### 2.2 Bulge and bar

| Property | Value | Source |
|---|---|---|
| Bulge morphology | box/peanut (b/p) pseudobulge, X-shaped in the near-IR | Wegg & Gerhard 2013; BHG 2016 [1] |
| Bulge in-plane extent | ~2–2.5 kpc; classical-bulge effective radius smaller (~0.7–1 kpc) | BHG 2016 [1] |
| Bulge + bar stellar mass | ~1.5–2 × 10¹⁰ M☉ | Portail et al. 2017; BHG 2016 [1] |
| **Bar (long-bar) half-length** | **~5 kpc** (long bar to ~4.6–5 kpc from center) | Wegg, Gerhard & Portail 2015 [3] |
| **Bar angle to Sun–GC line** | **28–33°** (bulge b/p ~20–27°) | Wegg 2015 [3]; MPE [3b] |
| Bar axis ratios (a:b:c) | ~1 : 0.4 : 0.3 | Wegg 2015 [3] |

The long bar and the box/peanut bulge are **one continuous structure** — the bulge is the
vertically-thickened inner part of the bar (Wegg, Gerhard & Portail 2015 [3], MPE press [3b]
https://www.mpe.mpg.de/6333402/News_20150521). The two dominant *stellar* spiral arms
(Scutum-Centaurus, Perseus) spring from the **two ends of the bar**.

### 2.3 Spiral arms — the real arms (Reid et al. 2019 BeSSeL, Table 2)

BeSSeL fit each arm as a **log-periodic spiral** with an optional "kink" where the pitch
angle ψ changes. The defining relation (used verbatim by `galaxy.js`):

```
ln(R/R_ref) = -(β - β_ref) · tan(ψ)      ⇔      R(β) = R_ref · exp[-tan(ψ)·(β - β_ref)]
```

where β is galactocentric azimuth (measured from the Sun's direction, increasing with
Galactic longitude) and ψ is the pitch angle. Representative parameters (Reid et al. 2019
[2], https://arxiv.org/abs/1910.03357 — Table 2; values rounded):

| Arm | Kink radius R_kink (kpc) | Pitch ψ (β below / above kink) | Width (kpc) | Role |
|---|---|---|---|---|
| 3-kpc (near+far) | ~3.5 | ~0° (near-circular, bar-driven) | ~0.2 | inner, bar-linked |
| **Norma / 4-kpc** | ~4.5 | −1° / +19.5° | ~0.3 | minor (gas) |
| **Scutum-Centaurus** | ~4.9 | **~14.1° / 12.1°** | ~0.2–0.5 | **major (old stars)** |
| **Sagittarius-Carina** | ~6.0–6.6 | **~17.1° / ~1°** | ~0.3–0.5 | minor (gas) |
| **Local / Orion Spur** (Sun) | ~8.26 | **11.4°** | ~0.3 | Sun's spur |
| **Perseus** | ~9.9 | **~9.4°** | ~0.4 | **major (old stars)** |
| Outer (Cygnus) | ~12–13 | ~3° / ~9.4° | ~0.6 | minor, outer |

Adopted global fit (Reid 2019 [2]): **R₀ = 8.15 ± 0.15 kpc**, **Θ₀ = 236 ± 7 km/s** — fully
consistent with GRAVITY's geometric R₀ = 8.178 kpc.

**Two-arm vs many-arm — how to read this.** Spitzer/GLIMPSE star counts (Churchwell et al.
2009 [4], https://iopscience.iop.org/article/10.1086/597811) show the **OLD stellar disk**
has essentially **two grand-design arms: Scutum-Centaurus and Perseus**, off the bar ends.
The **gas + young stars** add **Sagittarius-Carina and Norma** as secondary arms, plus the
**Outer** arm and the **Local Arm/Orion Spur** on which the Sun sits. Both descriptions are
"correct" for different tracers — a from-outside render can legitimately use **2 bright
stellar arms + 2–3 fainter gas arms**, which is exactly the modern consensus.

### 2.4 The Sun's place

| Property | Value | Source |
|---|---|---|
| **Galactocentric distance R₀** | **8.178 ± 0.013(stat) ± 0.022(sys) kpc = 26,673 ly** | GRAVITY 2019 [5] |
| Height above mid-plane | **~20 pc north** (z⊙ ≈ 17–25 pc) | BHG 2016 [1]; Karim & Mamajek 2017 |
| Host arm | **Local Arm / Orion Spur** (inner edge) | Reid 2019 [2]; Wikipedia [7] |
| Orbital speed (LSR + solar motion) | ~230–247 km/s | Reid 2019 [2]; GRAVITY 2019 [5] |
| **Orbital period (galactic year)** | **~230 Myr** (literature 220–250 Myr) | Reid 2019 [2] |
| Direction of Galactic center | Sagittarius; RA 17ʰ45.6ᵐ, Dec −28.94° (l=0, b=0) | IAU 1958 [8] |

### 2.5 Mass and star count

| Property | Value | Source |
|---|---|---|
| Stellar mass | **~5 × 10¹⁰ M☉** (range 4.6–6.4 × 10¹⁰) | BHG 2016 [1]; Wikipedia [7] |
| Number of stars | **100–400 billion** | Wikipedia/NASA [7] |
| Total mass incl. dark-matter halo | **~1.0–1.5 × 10¹² M☉** (within ~200 kpc) | Watkins et al. 2019; Wikipedia [7] |
| Dark-matter fraction | ~90% of total mass | Wikipedia [7] |

### 2.6 Sgr A\* and the galactic-center direction

| Property | Value | Source |
|---|---|---|
| Sgr A\* mass | **4.297 × 10⁶ M☉** (GRAVITY 2022); 4.154 × 10⁶ (GRAVITY 2019); 4.10 × 10⁶ (EHT 2022) | GRAVITY [5]; EHT 2022 [6] |
| Sgr A\* position (ICRS) | RA 17ʰ45ᵐ40.0ˢ (=17.7611ʰ), Dec −29.0078° | radio/VLBI [8] |
| Sky constellation | **Sagittarius** (the band's brightest point) | — |

### 2.7 Sky orientation of the galactic plane (IAU 1958 frame)

| Property | Value | Source |
|---|---|---|
| Galactic **North pole** | RA 12ʰ51.4ᵐ (=192.859°, 12.8573ʰ), Dec **+27.13°** | IAU 1958 [8] |
| Galactic **center** (l=0) | RA 17ʰ45.6ᵐ (=17.7611ʰ), Dec **−28.94°** | IAU 1958 [8] |
| Plane inclination to **ecliptic** | **~60.2°** | derived; Wikipedia [8] |
| Plane inclination to **celestial equator** | **~62.9°** (≈63°) | Wikipedia [8] |

---

## 3. Deep dive — colors and the band as seen from Earth

### 3.1 True colors, with hex + physics

Color in a galaxy is a **stellar-population thermometer**: hotter (more massive, shorter-lived)
stars are bluer, cooler (older, long-lived) stars are redder; dust reddens and absorbs;
ionized-hydrogen nebulae glow in discrete emission lines.

| Region | Physical cause | Appearance | Suggested hex |
|---|---|---|---|
| **Bulge / bar** | Old, metal-rich K/G giants; no short-lived O/B stars survive | warm **yellow-white → gold** | `#FFE9C4` core, `#FFD79A` mid, `#E8B36A` edge |
| **Spiral arms (young)** | Ongoing star formation → hot O/B main-sequence + blue-white A stars | **blue-white** | `#AEC6FF` / `#BCD4FF` |
| **Dust lanes** | Interstellar dust; extinction + reddening (Aᵥ high), scatters blue away | **brown → black** silhouette | `#3A2A1C` (thin), near-black (opaque) |
| **H II regions** | Hydrogen ionized by O/B stars; recombination emits **Hα 656.3 nm** (+ Hβ 486 nm) | **pink / rose-magenta** | `#FF6699` / `#FF5C9E` |
| **Integrated naked-eye band** | Blend of all disk stars at low surface brightness → below color-vision (cone) threshold | **pale desaturated cream-white** | `#F6ECD8` (toward core), `#D3D9E2` (mid), `#9199A6` (anticenter) |

Physics notes:
- **Yellow-white bulge**: the light is dominated by the tip of the old red-giant branch plus
  the integrated G/K main sequence — an old simple stellar population peaks yellow-orange
  (Las Cumbres Observatory, https://lco.global/spacebook/galaxies/the-milky-way-galaxy/).
- **Blue arms**: O/B stars are ~10–100× more luminous than the Sun and dominate arm light
  despite being rare; their ~20,000–40,000 K photospheres peak in the blue/UV.
- **Pink H II**: Hα (red) + Hβ (blue-green) mix, weighted by the eye and by typical exposure
  balance, to the characteristic **pink/rose** of star-forming knots (Orion, Lagoon, etc.).
- **Brown/black dust**: not a pigment — it is **absence** (extinction) plus preferential
  scattering of blue light (making the transmitted light redder), reading as brown silhouette.
- **Why the real band looks nearly white to the eye**: at the band's surface brightness the
  retina's color-sensitive cones are near threshold, so the integrated light desaturates to
  cream-white. Saturated blue/gold/pink only emerge in **long-exposure** photography. A
  scientifically honest *from-within* band should be **pale and warm-toward-the-core**, not
  vivid — which `MilkyWay.jsx` already does correctly (see §4).

### 3.2 The band on our sky

- **Brightest toward the center** — the **Sagittarius / Scorpius** region (Sagittarius Star
  Cloud, Scutum Star Cloud). This is the direction of the bulge and Sgr A\*; the greatest
  column of stars lies there.
- **The Great Rift** — a **dark dust lane** running along the band's spine from **Cygnus**,
  down the **Serpens/Aquila Rift**, through **Ophiuchus**, and into **Sagittarius** where it
  obscures the Galactic Center, petering out near **Centaurus**. It is nearby molecular-cloud
  dust silhouetted against the star clouds behind (Great Rift, Wikipedia,
  https://en.wikipedia.org/wiki/Great_Rift_(astronomy)).
- **Smaller dark markings** — e.g. the **Coalsack** near Crux (southern, l ≈ 300°).
- **Faintest toward the anticenter** — **Auriga / Taurus / Gemini** (l ≈ 180°); we look
  *outward* through less disk, and the Perseus arm is the last bright feature (~l 120–135°),
  not the anticenter itself.
- **Geometry on the sky** — the plane is a **great circle** tilted **~60.2° to the ecliptic**
  and **~63° to the celestial equator**; the galactic center is ~29° *below* the celestial
  equator, so the band's brightest part rides low for northern observers.

---

## 4. Discrepancies vs. the current portfolio

Files audited: `src/stellar/config/galaxy.js`, `src/stellar/Scene/SpiralGalaxy.jsx`,
`src/stellar/Scene/MilkyWay.jsx`.

Overall: **the science is in good shape.** `galaxy.js` closely matches Reid 2019 / GRAVITY
2019 / Wegg 2015, and both renderers use physically-correct colors. The findings below are
mostly **architecture / consistency**, with a couple of concrete accuracy nits.

### 4.1 `galaxy.js` (config — the intended single source of truth)

| Line(s) | Value | Verdict |
|---|---|---|
| 25 `diskRadiusLy: 50000` | bright-disk **radius** 50k ly (⌀100k ly) | ✅ classic value. Note the modern D25 gives radius ~43.7k ly; comment says "outer disk extends further" but no number — could add "outer disk to ~75–100k ly" for the finale. |
| 26 `scaleLengthLy: 8500` | 2.61 kpc | ✅ matches BHG 2.6 ± 0.5 kpc. |
| 27 `thinScaleHeightLy: 1000` | 305 pc | ✅ matches BHG ~300 pc. |
| 28 `thickScaleHeightLy: 2900` | 889 pc | ✅ matches BHG ~900 pc. |
| 30 `pitchAngleDeg: 12.5` | mean pitch | ✅ within the 10–13° consensus. |
| 32 `bulge.radiusLy: 10000` | 3.07 kpc | ⚠️ generous. That is the **b/p bulge + inner-bar** extent, not the classical-bulge effective radius (~0.7–1 kpc). Fine as a visual blob; label it "bulge/inner-bar" to avoid implying Rₑ. |
| 33 `bar.halfLengthLy: 16000` | 4.9 kpc | ✅ Wegg ~5 kpc. `angleDeg: 27` ✅ (Wegg 28–33°, bulge 20–27°). `axisRatio [1,0.4,0.3]` ✅. |
| 37 `galactocentricRadiusLy: 26670` | 8.178 kpc | ✅ **exact** GRAVITY 2019 (8.178 × 3261.56 = 26,673). |
| 38 `heightLy: 65` | 19.9 pc | ✅ ~20 pc north. |
| 44 `sgrA.massSolar: 4.3e6` | 4.3 M☉ | ⚠️ value ✅ (GRAVITY **2022** = 4.297e6), but the file **header (line 16) attributes "GRAVITY 2019"**, which actually measured **4.154e6**. Fix the citation (2022) or the value (4.15e6). |
| 44,50 `raHours 17.7611, decDeg −29.0078` | Sgr A\* ICRS | ✅. |
| 49 `galacticNorthPole 12.8573ʰ, +27.1283°` | IAU 1958 | ✅. |
| 51 `eclipticInclinationDeg: 60.2` | plane↔ecliptic | ✅. |
| 58–62 `arms[]` | log-spiral set | See below. |

**Arm list (lines 58–62).** Per-arm **radii and pitches are faithful to Reid 2019**:
Scutum-Centaurus 5.0 kpc/14.0° (Reid 4.9/14.1 ✅), Sagittarius-Carina 6.6 kpc/17.0° (Reid
6.0–6.6/17.1 ✅), Orion Spur 8.18 kpc/11.4° (Reid Local 8.26/11.4 ✅), Perseus 9.9 kpc/9.4°
(Reid 9.9/9.4 ✅). Two issues:
- **Line 58 "Norma/Outer" merges two distinct arms.** Reid keeps **Norma** (R_kink ~4.5 kpc)
  and **Outer** (~12–13 kpc) separate; the merged entry at refRadius 13 kpc/13.8° is really
  the **Outer** arm and drops Norma. Split them if the finale ever resolves individual arms.
- **`refAzimuthDeg` values (18/23/24/25/15) are placeholders**, not Reid β_kink — the file's
  own comment (line 56) admits "azimuths + density weights are tunable." As a result the arms
  are not clocked to their true on-sky longitudes, so `MilkyWay.jsx` cannot derive the band's
  arm peaks from this data (it hand-tunes them instead — §4.3).

### 4.2 `SpiralGalaxy.jsx` (from-outside plate)

| Line(s) | Finding | Severity |
|---|---|---|
| **7** (header) | "a Sol pin at **~27% out** on the Orion Spur" | 🔴 **Wrong / stale.** The code places the Sun at `SOL_R = 0.533 * DISC_RADIUS` (line 48) = **53%** of the disk radius (26,670/50,000). Reality is ~0.53 (classic) to ~0.61 (D25) — "**about halfway to two-thirds out**," never 27%. Fix the comment. |
| 16, 26–49 | **Does not import `galaxy.js`.** DISC_RADIUS(220), BULGE(44), BAR(70), ARM_PITCH(0.222=tan 12.5°), SOL_R(0.533), arm offsets — all **re-declared locally**. | 🟠 **Architecture.** Two sources of truth that already disagree (5 arms w/ per-arm pitch in config vs 4 arms w/ one global pitch here). This violates the project's stated "data edit wherever possible" principle and will drift. |
| 33–38 | 4 arms at offsets **0, π, π·0.5, π·1.5** (evenly 90° apart) | 🟡 Aesthetic symmetrization. Majors off bar ends ~180° apart is ✅; the minors are *not* really at exactly ±90°. Acceptable for a stylized plate, but not clocked to real β. |
| 30–32 | "2 MAJOR (Scutum-Centaurus, Perseus) + 2 MINOR (Norma, Sagittarius)" | ✅ **Scientifically defensible** (Churchwell 2009 GLIMPSE [4]). But note it disagrees with `galaxy.js`'s 5-arm inventory — pick one story. |
| 26–28, 48, 136 | Proportions: DISC 220=50k ly, BULGE 0.20R=10k ly, BAR 0.32R=16k ly, SOL 0.533R, thin-disk zSpread≈4.4u=1,000 ly | ✅ internally consistent and accurate. |
| 53–57 | Colors: CORE `#fff0cf` gold, ARM `#bcd4ff` blue-white, DUST `#3a2a1c` brown, HII `#ff5c9e` pink | ✅ all match §3.1 physics. |
| 197–229 | Bar aligned to local X; Sun pin dropped on the Sagittarius arm at `SOL_ARM_OFFSET` | 🟡 The real Sun sits ~27° off the **bar's long axis** as seen from the center; here the pin's azimuth relative to the bar is arbitrary. Immaterial for a top-down beauty plate; only matters if you ever show the Sun-to-bar geometry. |

### 4.3 `MilkyWay.jsx` (from-within band)

| Line(s) | Finding | Severity |
|---|---|---|
| 4, 78–86 | Imports `GALAXY.orientation` and builds the band on the **real galactic great circle** (pole + center directions), same RA/Dec→scene transform as `Stars.jsx` | ✅ **Excellent** — this is the correct, data-driven approach. |
| 114–116 | Band colors core `#f6ecd8` / mid `#d3d9e2` / edge `#9199a6` (pale, desaturated, warm-to-core) | ✅ **Correct restraint** — matches the true naked-eye band (§3.2), not the over-saturated cliché. |
| 126, 142 | `towardCore = 0.5+0.5cos(λ)` peaks at λ=0 (Sagittarius); Great Rift darkening strongest toward core | ✅ brightest toward center, rift Cygnus→Sagittarius — correct. |
| 61–67 | `ARM_PEAKS` longitudes are **hand-tuned**, not derived from `GALAXY.arms` | 🟠 **Decoupled from the arm data** (the §12.1 comment admits this). Values are *reasonable* (Cygnus ~75°, Carina/Vela ~−95° ✅) but **Perseus at λ=155°** over-brightens near the **anticenter**, where the real band is faintest (Perseus tangents are ~l 120–135°). Nudge Perseus peak to ~130°. |
| 70–74 | Coalsack dark nebula at λ=−58° (Crux) | ✅ nice touch, correct longitude. |
| 25 | `OBLIQUITY = 23.44°` matches `Stars.jsx` | ✅. Note `eclipticInclinationDeg` from config is **not used here** (the tilt falls out of the pole/center coords) — fine, it's informational. |

---

## 5. Implementation recommendations

Priority order (highest leverage first):

1. **Make `galaxy.js` the one source of truth for the from-outside plate.**
   `SpiralGalaxy.jsx` should import `DISC_RADIUS`, `BULGE_RADIUS`, bar length/angle,
   `pitchAngleDeg`, and the Sun radius fraction from `GALAXY` instead of re-declaring them
   (lines 26–49). This is the project's "adding a body/section is a data edit" principle;
   right now the two files can (and do) drift. *Low risk, mechanical.*

2. **Fix the stale comment** in `SpiralGalaxy.jsx` line 7: "~27% out" → "~53% out
   (about halfway-to-two-thirds to the rim)." One-line doc fix; the code is already correct.

3. **Reconcile the arm inventory (pick one story, document it).**
   - Option A (recommended, simplest + defensible): keep the **2 major + 2 minor** GLIMPSE
     model for the *from-outside* plate (it's the modern consensus and reads clean), and note
     in `galaxy.js` that its 5-arm log-spiral list is the *maser/gas* tracer set used for the
     *band* projection.
   - Option B (max accuracy): un-merge **Norma** and **Outer** in `galaxy.js` (line 58) and
     add real `refAzimuthDeg` = Reid β_kink so arms clock to true longitudes.

4. **If Option B: derive `MilkyWay.jsx` `ARM_PEAKS` from the data.** With correct arm azimuths
   you can project each log-spiral onto the Sun's sightline and compute where each arm crosses
   a given galactic longitude, replacing the hand-tuned peaks (lines 61–67). Ties band
   brightness to the same numbers as the disk. *Medium effort; current approximation already
   reads fine, so this is polish, not a bug.* As a cheap interim fix, move the **Perseus peak
   from λ=155° to ~130°** so the anticenter stays faint.

5. **Fix the Sgr A\* citation** in `galaxy.js` (header line 16 / field line 44): the value
   `4.3e6` is the **GRAVITY 2022** figure — update the attribution to 2022, or switch the
   value to `4.15e6` to match the cited 2019 paper. Either is defensible; just make them agree.

6. **Label the bulge blob** (`galaxy.js` line 32): rename intent to "bulge/inner-bar extent
   (~3 kpc)" so 10,000 ly isn't misread as a classical-bulge effective radius (~1 kpc).

7. **Optional finale polish:** add the outer-disk radius (~75–100k ly) as a faint extension
   beyond the 50k-ly bright disk, and note the two diameter conventions (classic 100 kly vs
   D25 87.4 kly) in a comment so future edits don't "correct" one into the other.

---

## References

[1] Bland-Hawthorn, J. & Gerhard, O. 2016, *The Galaxy in Context: Structural, Kinematic, and
Integrated Properties*, ARA&A 54, 529 — https://arxiv.org/abs/1602.07702 ·
https://www.annualreviews.org/doi/abs/10.1146/annurev-astro-081915-023441

[2] Reid, M. J. et al. 2019, *Trigonometric Parallaxes of High-Mass Star-Forming Regions:
Our View of the Milky Way* (BeSSeL), ApJ 885, 131 — https://arxiv.org/abs/1910.03357 ·
https://iopscience.iop.org/article/10.3847/1538-4357/ab4a11

[3] Wegg, C., Gerhard, O. & Portail, M. 2015, *The Structure of the Milky Way's Bar Outside
the Bulge*, MNRAS 450, 4050 — https://arxiv.org/abs/1504.01401
[3b] MPE press, *One long Milky Way bar and bulge* — https://www.mpe.mpg.de/6333402/News_20150521

[4] Churchwell, E. et al. 2009, *The Spitzer/GLIMPSE Surveys: A New View of the Milky Way*,
PASP 121, 213 (two major stellar arms Scutum-Centaurus + Perseus; Sagittarius + Norma minor)
— https://iopscience.iop.org/article/10.1086/597811

[5] GRAVITY Collaboration 2019, *A geometric distance measurement to the Galactic center
black hole with 0.3% uncertainty*, A&A 625, L10 (R₀ = 8178 ± 13 ± 22 pc) —
https://arxiv.org/abs/1904.05721 ·
https://www.aanda.org/articles/aa/full_html/2019/05/aa35656-19/aa35656-19.html

[6] Event Horizon Telescope Collaboration 2022, *First Sagittarius A\* EHT Results* (M ≈
4.1 × 10⁶ M☉) — https://iopscience.iop.org/journal/2041-8205 (ApJL 930 focus issue)

[7] *Milky Way*, Wikipedia (star count 100–400 billion; D25 26.8 kpc; masses) —
https://en.wikipedia.org/wiki/Milky_Way

[8] Galactic coordinate frame / IAU 1958 pole & center; *Great Rift* —
https://en.wikipedia.org/wiki/Galactic_coordinate_system ·
https://en.wikipedia.org/wiki/Great_Rift_(astronomy)

[9] Stellar-population colors (yellow bulge / blue arms / pink H II) — Las Cumbres Observatory,
https://lco.global/spacebook/galaxies/the-milky-way-galaxy/

*Verification note: all primary-source values above were fetched and cross-checked via web
search/fetch during this research pass (GRAVITY R₀ and Reid Θ₀ confirmed from the A&A HTML and
the arXiv render of Reid 2019 respectively); figures were not taken from memory.*
