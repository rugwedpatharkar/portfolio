# 05 — The Local Group & Nearby Galaxies

**Research target:** a scientifically-accurate 3D portfolio homepage showing the
Milky Way *seen from outside*, surrounded by its **true-scale** neighbours.
Every distance, diameter, morphology, colour, and — critically — every **relative
scale** below is sourced from NASA/ESA, Gaia-era measurements, peer-reviewed
distance work, and NED/Wikipedia catalogue values, verified by web search
(July 2026), not memory.

> **The one number that governs everything:** the Milky Way's stellar disc is
> ~**100,000 ly across** → radius **R_MW = 50,000 ly**. That is the unit of this
> document. Distances are quoted in **R_MW** and sizes as a **fraction of the MW's
> diameter**, so the homepage can place each object at honest relative scale.

---

## 1. Executive summary

- **The Local Group is mostly empty space with two big galaxies in it.** Two
  large spirals — the **Milky Way** and **Andromeda (M31)** — dominate, with
  **Triangulum (M33)** a distant third, and **~50–60 confirmed members** (up to
  **~134 within 1 Mpc** of the barycentre), the overwhelming majority tiny dwarf
  spheroidals. Total mass ≈ **2.5 × 10¹² M☉**; gravitational diameter
  ≈ **17 Mly** (5.11 Mpc); the tightly-bound core spans **~10 Mly**.
  ([Local Group — Wikipedia](https://en.wikipedia.org/wiki/Local_Group))

- **Scale is brutally non-intuitive, and it is the whole point of this homepage.**
  The MW's own satellites (LMC, SMC, the dwarf spheroidals) sit **1–9 R_MW** out —
  genuinely *nearby*, readable as companions hugging the disc. But **Andromeda is
  50 R_MW away** and **Triangulum ~55 R_MW**. And the famous "poster" galaxies —
  Sombrero, Whirlpool, Centaurus A, M81/M82, Pinwheel — are **230–620 R_MW** out.
  At true scale, seen from the Milky Way, they are *specks*: a galaxy the size of
  the MW placed 500 radii away subtends the same angle as a coin at ~2 km.

- **Only the satellites belong "near" the hero.** Everything at Mly distances must
  read as faint and far. Faking Andromeda or the Sombrero as large foreground
  objects would be the single biggest scientific lie the homepage could tell.

- **True colours are not "space blue."** Old-star **bulges and dwarf spheroidals
  are gold/amber**; **star-forming discs and arms are blue-white**; **HII regions
  are magenta-pink**; **dust lanes are near-black warm brown**. The Milky Way's
  own integrated colour is a measured **4,840 K "fresh-snow white,"** yellowing to
  the core, bluing to the arms.
  ([Universe Today / Licquia & Newman 2012](https://www.universetoday.com/92523/what-color-is-the-milky-way-white-as-snow-not-milk/))

- **The M31 approach and merger is real but no longer a certainty.** M31 closes on
  the MW at **~110–123 km/s**; the classic prediction is a merger in **~4.5 Gyr**,
  but a 2025 Gaia+Hubble Monte-Carlo study drops the 10-Gyr collision odds to
  **~50%**. Use "~4.5 Gyr, ~110 km/s" as the headline, footnote the new
  uncertainty. ([NASA/Hubble](https://science.nasa.gov/missions/hubble/nasas-hubble-shows-milky-way-is-destined-for-head-on-collision/),
  [Sawala et al. 2025, Nature Astronomy](https://www.nature.com/articles/s41550-025-02563-1))

- **The current portfolio's *reasoning* is already sound** — `HomepageGalaxies.jsx`
  correctly relegates M31/Sombrero/Whirlpool to the far deep-field and keeps only
  LMC + SMC near the hero, with accurate "3–4 galaxy-radii" / "50 radii" / "460–580
  radii" annotations. The gaps are (a) **dead colour/shape config** in
  `DistantGalaxies.jsx` now that the four naked-eye galaxies use real photos, and
  (b) **M31 and M33 are not represented as real, correctly-tiny true-scale
  objects** on the homepage — they're absorbed into a random JWST scatter. See §5.

---

## 2. Reference table

Unit conventions: **R_MW = 50,000 ly** (Milky Way radius). **MW diameter = 100,000 ly**
(classic stellar-disc value; the D25 isophotal diameter is 87,400 ly — see §3.0).
"Dist (R_MW)" = distance ÷ 50,000 ly. "Size (×MW)" = object diameter ÷ 100,000 ly.

| Object | Distance | Distance (R_MW) | Diameter | Size (×MW) | Morphology | True colour (hex) | Sources |
|---|---:|---:|---:|---:|---|---|---|
| **Milky Way** (ref) | 0 | 0 | 100,000 ly | 1.00 | SB(rs)bc barred spiral | disc `#FFF3E6` · bulge `#FFD9A0` · arms `#CFE0FF` · HII `#FF7A9C` | [W](https://en.wikipedia.org/wiki/Milky_Way), [color](https://www.universetoday.com/92523/what-color-is-the-milky-way-white-as-snow-not-milk/) |
| **Sagittarius dSph** | 65,000 ly | **1.3** | ~10,000 ly | 0.10 | dwarf spheroidal (disrupting) | `#E8DCC0` (old-star amber) | [W](https://en.wikipedia.org/wiki/Sagittarius_Dwarf_Spheroidal_Galaxy) |
| **LMC** | 163,000 ly | **3.3** | 32,200 ly | 0.32 | SB(s)m Magellanic spiral | body `#DCE4FF` · Tarantula `#FF6E9A` | [W](https://en.wikipedia.org/wiki/Large_Magellanic_Cloud) |
| **SMC** | 197,000 ly | **3.9** | 18,900 ly | 0.19 | SB(s)m pec (irregular) | `#DCE6FF` · pink HII `#FF83A6` | [W](https://en.wikipedia.org/wiki/Small_Magellanic_Cloud) |
| **Draco dSph** | 250,000 ly | **5.0** | ~2,700 ly | 0.03 | dwarf spheroidal | `#E8DCC0` | [UG](https://www.universeguide.com/galaxy/dracodwarfgalaxy) |
| **Sculptor dSph** | 290,000 ly | **5.8** | ~4,000 ly | 0.04 | dwarf spheroidal | `#E8DCC0` | [W](https://en.wikipedia.org/wiki/Sculptor_Dwarf_Galaxy) |
| **Carina dSph** | 330,000 ly | **6.6** | ~1,600 ly | 0.02 | dwarf spheroidal | `#E8DCC0` | [iop](https://iopscience.iop.org/article/10.1086/595586) |
| **Fornax dSph** | 450,000 ly | **9.0** | ~6,000 ly | 0.06 | dwarf spheroidal | `#EDE0C4` | [arXiv](https://arxiv.org/abs/0707.0521) |
| **Andromeda (M31)** | **2.5 Mly** | **50** | 152,000 ly | **1.52** | SA(s)b (bar in IR); i≈77° | bulge `#FFE0B0` · arms `#A8C4FF` · dust `#2A2018` | [W](https://en.wikipedia.org/wiki/Andromeda_Galaxy) |
| **Triangulum (M33)** | **2.73 Mly** | **54.6** | 60,000 ly | 0.60 | SA(s)cd flocculent | disc `#B8CCFF` · HII `#FF6B8A` · core `#FFE8C0` | [W](https://en.wikipedia.org/wiki/Triangulum_Galaxy) |
| **Centaurus A** | 12 Mly | **240** | ~90,000 ly | 0.90 | S0/E peculiar + dust lane | bulge `#FFE8C8` · lane `#241C14` | [W](https://en.wikipedia.org/wiki/Centaurus_A) |
| **M81 (Bode's)** | 11.8 Mly | **236** | 90,000 ly | 0.90 | SA(s)ab grand-design | core `#FFECC8` · arms `#B0C8FF` | [W](https://en.wikipedia.org/wiki/Messier_81) |
| **M82 (Cigar)** | 11.5 Mly | **230** | 37,000 ly | 0.37 | I0 edge-on starburst | disc `#E8C098` · Hα plume `#FF5A6E` | [arXiv](https://arxiv.org/pdf/0906.0757) |
| **M101 (Pinwheel)** | 20.9 Mly | **418** | 170,000 ly | **1.70** | SAB(rs)cd face-on | arms `#B8CCFF` · HII `#FF6B8A` · core `#FFF0D8` | [W](https://en.wikipedia.org/wiki/Pinwheel_Galaxy) |
| **M51 (Whirlpool)** | 23 Mly | **460** | 76,900 ly | 0.77 | SA(s)bc pec grand-design | arms `#A8C4FF` · HII `#FF7A9C` · core `#FFE8C0` | [W](https://en.wikipedia.org/wiki/Whirlpool_Galaxy) |
| **Sombrero (M104)** | 29.3 Mly | **586** | ~50,000 ly | 0.50 | SA(s)a edge-on (i≈6°) | bulge `#FFF0D0` · lane `#2A2018` | [W](https://en.wikipedia.org/wiki/Sombrero_Galaxy) |

> Colours are **art-directed true-colour approximations**: they encode the
> physically-correct *populations* (old-star gold, young-star blue, HII pink,
> dust near-black) as they appear in calibrated astrophotography, not a single
> catalogue "colour" value (galaxies don't have one). Dwarf-spheroidal diameters
> are half-light/tidal-scale order-of-magnitude values — these objects are
> extremely diffuse, low-surface-brightness swarms of old stars.

---

## 3. Deep dive

### 3.0 The scale baseline — the Milky Way itself

The MW is a **barred spiral, type SB(rs)bc / SABbc**. Its size depends on the
edge definition: the classic stellar-disc figure is **~100,000 ly** across; the
**D25 isophotal diameter is 26.8 kpc ≈ 87,400 ly**; the faint outer disc extends
to 120,000–180,000 ly. The thin-disc radius is ~13–15 kpc (42,000–49,000 ly),
which is why **50,000 ly is the right, honest radius unit**.
([Milky Way — Wikipedia](https://en.wikipedia.org/wiki/Milky_Way))

**Integrated colour (measured, not guessed):** Licquia & Newman (2012, U. Pitt)
matched SDSS twins of the MW's mass and star-formation rate and found a composite
colour of a **4,840 K blackbody** — "a very pure white, almost … a fresh spring
snowfall," *bluer* than a 3,000 K incandescent bulb, *redder* than a 6,500 K
noon-white. It **yellows toward the bulge and blues toward the arms.** In sRGB a
4,840 K white ≈ `#FFF3E6`. Bulge gold ≈ `#FFD9A0`; arms blue-white ≈ `#CFE0FF`;
star-forming HII knots magenta ≈ `#FF7A9C`; dust lanes near-black warm-brown.
([Universe Today](https://www.universetoday.com/92523/what-color-is-the-milky-way-white-as-snow-not-milk/),
[Pitt Chronicle](https://www.chronicle.pitt.edu/story/pitt-astronomers-determine-color-milky-way-galaxy))

### 3.1 The Local Group as a structure

- **Membership:** ~50–60 confirmed galaxies commonly cited; **134 known within
  1 Mpc** of the centre in the current census, *most of which are dwarfs*. The
  count keeps rising as surveys find ultra-faint dwarfs, and the true number is
  unknown because the MW's own disc hides part of the sky (the "zone of
  avoidance").
- **Mass:** **(2.47 ± 0.15) × 10¹² M☉**, essentially split between the MW's and
  M31's halos (~1 × 10¹² M☉ each).
- **Diameter:** **16.7 Mly (5.11 Mpc)** for the full gravitational domain
  (out to the zero-velocity surface); the **tightly-bound concentration is
  ~10 Mly** across — the value worth quoting for a "the Local Group" caption.
- **Shape:** a **dumbbell** — the MW + its satellites in one lobe, M31 + its
  satellites in the other, ~800 kpc (2.5 Mly) apart, with M33 near the M31 lobe.
- **Barycentre:** ~**450 kpc (1.5 Mly) from the MW**, i.e. shifted well toward
  M31 (M31 outweighs the MW slightly), roughly 57% of the way to Andromeda.
- **Kinematics / merger:** M31 approaches at **~110–123 km/s** (its heliocentric
  radial velocity is a strong blueshift of ~−300 km/s). Classic prediction:
  first passage/merger in **~4.5 Gyr**, forming "Milkomeda." **Caveat (2025):**
  Sawala et al. (Gaia DR3 + Hubble, 100,000 Monte-Carlo runs over 22 variables)
  find only a **~50% chance of collision within 10 Gyr** — the merger is likely,
  not certain.
  ([Local Group](https://en.wikipedia.org/wiki/Local_Group),
  [Andromeda–MW collision](https://en.wikipedia.org/wiki/Andromeda%E2%80%93Milky_Way_collision),
  [Nature Astronomy 2025](https://www.nature.com/articles/s41550-025-02563-1))

### 3.2 Milky Way satellites — the only genuinely "near" companions

**Large Magellanic Cloud (LMC)** — the showpiece satellite.
- Distance **163,000 ly (49.97 kpc)**, measured to **2.2%** via eclipsing binaries.
- Diameter **32,200 ly (9.86 kpc)**; **~20 billion stars**; mass **~10¹⁰ M☉**
  stellar, **~1.4 × 10¹¹ M☉** with dark matter.
- Type **SB(s)m** — a *Magellanic spiral* with a single off-centre bar, likely a
  barred dwarf spiral tidally disrupted by the SMC and MW.
- **Angular size on the sky: 10.75° × 9.17°** (≈20 Moon-diameters); apparent
  magnitude **0.13** — a naked-eye cloud from the south.
- Hosts the **Tarantula Nebula (30 Doradus)** — the most active star-forming
  region in the Local Group — which anchors its magenta-pink accent.
- **True colour:** overall pale blue-white (young, metal-poor stars) `#DCE4FF`
  with a vivid pink Tarantula/HII knot `#FF6E9A`.
  ([LMC — Wikipedia](https://en.wikipedia.org/wiki/Large_Magellanic_Cloud))

**Small Magellanic Cloud (SMC).**
- Distance **~197,000–200,000 ly (~62 kpc)**; diameter **~18,900 ly (D25 5.78 kpc)**;
  mass **~7 × 10⁹ M☉**; **several hundred million stars**.
- Type **SB(s)m pec** — disrupted, effectively irregular; part of the **Magellanic
  System** with the LMC and the **Magellanic Stream** (a >100°-long trailing
  ribbon of neutral hydrogen tidally pulled from the Clouds).
- **Angular size ~5.3° × 3.1°** (320′ × 185′); apparent magnitude **2.7**.
- **True colour:** faint, diffuse blue-white `#DCE6FF`.
  ([SMC — Wikipedia](https://en.wikipedia.org/wiki/Small_Magellanic_Cloud))

**The classical dwarf spheroidals** (old, gas-poor, low-surface-brightness — near-
invisible amber swarms, *not* discs):
- **Sagittarius dSph** — closest and being torn apart: **~65,000–70,000 ly** from
  us (~18 kpc from the Galactic centre, on a polar orbit), diameter ~10,000 ly,
  trailing the vast **Sagittarius Stream**.
- **Draco** ~250,000 ly (76 kpc); **Sculptor** ~290,000 ly (86 kpc); **Sextans**
  ~257,000 ly; **Carina** ~330,000 ly; **Fornax** ~450,000 ly (138 kpc) — the
  brightest classical dSph.
- **True colour** for all: pale amber/parchment `#E8DCC0`, effectively a faint
  glow of old stars with no blue star formation and no dust structure.
  ([Sgr dSph](https://en.wikipedia.org/wiki/Sagittarius_Dwarf_Spheroidal_Galaxy),
  [MW satellite list](https://simple.wikipedia.org/wiki/List_of_satellites_of_the_Milky_Way),
  [Fornax distance](https://arxiv.org/abs/0707.0521))

### 3.3 Andromeda (M31) — the twin, but 50 radii away

- Distance **2.5 Mly (765 kpc)**, averaging to **2.54 ± 0.11 Mly** across methods.
- **D25 diameter 152,000 ly (46.56 kpc)** — larger than the MW's disc; an extended
  stellar disc/halo reaches **~220,000 ly**.
- Mass **~1 × 10¹² M☉** (0.8–1.1 × 10¹²) — same order as the MW.
- Morphology **SA(s)b** in visible light; IR reveals a boxy bar → it's really a
  **barred spiral**. **Inclination ≈ 77°** to our line of sight (near edge-on),
  which is why it looks like a long thin ellipse from Earth.
- **Angular size ≈ 3.17° × 1°** (~6 full-Moon-widths long) — the largest galaxy on
  our sky; apparent magnitude **3.44**, naked-eye.
- **True colour:** a **golden-yellow bulge** of old stars `#FFE0B0` grading to
  **blue-white spiral arms** `#A8C4FF`, threaded by dark dust lanes `#2A2018` and
  studded with pink HII knots. Herschel already noted "a faint reddish hue in the
  core." ([Andromeda — Wikipedia](https://en.wikipedia.org/wiki/Andromeda_Galaxy))

> **Placement reality:** at 50 R_MW and 1.52× the MW's size, if the MW is drawn at
> radius r on screen, Andromeda sits **50 r away** and is drawn at radius ~0.76 r.
> It is a real, resolvable golden ellipse — but distinctly *out there*, not a
> co-equal foreground hero.

### 3.4 Triangulum (M33) — the blue flocculent third

- Distance **2.73 Mly** (range 2.38–3.07 Mly across methods); diameter **~60,000 ly**
  (angular major axis 73′); mass **~1–4 × 10¹⁰ M☉** — the Local Group's **third**
  galaxy and its **smallest spiral**, likely a satellite of M31.
- Morphology **SA(s)cd** — a **flocculent** spiral: knotty, patchy arms with no
  grand-design symmetry, emerging straight from a small nucleus.
- **True colour:** notably **bluer than M31** — a blue-white disc `#B8CCFF` rich in
  young stars, flecked with prominent **pink-red HII regions** (incl. the giant
  **NGC 604**) `#FF6B8A`, and only a modest warm core `#FFE8C0`.
  ([Triangulum — Wikipedia](https://en.wikipedia.org/wiki/Triangulum_Galaxy),
  [NASA M33](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-33/))

### 3.5 The "poster" galaxies — spectacular, and 230–620 radii away

These are the images people picture when they think "galaxy," but every one is
**10–30 million ly** distant — the reason they must read as *tiny and faint* at
true scale.

- **Centaurus A** — **12 Mly (3.8 Mpc)**, ~90,000 ly across, **240 R_MW**. A
  **peculiar S0/giant elliptical** (merger remnant) bisected by a dramatic dark
  **dust lane**. Angular size **25.7′ × 20′**; nearest radio galaxy. Colour: warm
  old-star elliptical glow `#FFE8C8` slashed by a near-black lane `#241C14` with
  blue/pink star-forming knots along it.
  ([Centaurus A](https://en.wikipedia.org/wiki/Centaurus_A))
- **M81 (Bode's)** — **11.8 Mly**, 90,000 ly, **236 R_MW**. A clean
  **SA(s)ab grand-design** spiral; angular **27′ × 14′**. Colour: yellow-white
  core `#FFECC8`, blue arms `#B0C8FF`; interacting with M82.
  ([M81](https://en.wikipedia.org/wiki/Messier_81))
- **M82 (Cigar)** — **11.5 Mly**, 37,000 ly, **230 R_MW**. **Edge-on I0 starburst**;
  angular **9′ × 4′**. Signature: a **red-pink Hα superwind** `#FF5A6E` erupting
  perpendicular from a dusty tan edge-on disc `#E8C098`.
  ([M82 morphology, arXiv](https://arxiv.org/pdf/0906.0757))
- **M101 (Pinwheel)** — **20.9 Mly**, **170,000 ly** (1.7× the MW — a genuine
  giant), **418 R_MW**. **Face-on SAB(rs)cd**; angular **28.8′ × 26.9′**. Colour:
  blue arms `#B8CCFF` with many pink HII regions `#FF6B8A`, small warm core.
  ([Pinwheel](https://en.wikipedia.org/wiki/Pinwheel_Galaxy))
- **M51 (Whirlpool)** — **23 Mly (8.58 Mpc)**, 76,900 ly, **460 R_MW**. The
  archetypal **SA(s)bc pec grand-design** spiral with companion NGC 5195; angular
  **11.2′ × 6.9′**. Colour: blue arms `#A8C4FF`, pink HII `#FF7A9C`, warm core
  `#FFE8C0`. ([Whirlpool](https://en.wikipedia.org/wiki/Whirlpool_Galaxy))
- **Sombrero (M104)** — **29.3 Mly** (newer SBF/Cepheid: 9.55 Mpc ≈ 31.1 Mly),
  ~50,000 ly optical, **586 R_MW** — the farthest. **SA(s)a nearly edge-on**
  (i ≈ 6°): a huge glowing bulge `#FFF0D0` bisected by a razor dark dust lane
  `#2A2018`; angular **8.7′ × 3.5′**.
  ([Sombrero](https://en.wikipedia.org/wiki/Sombrero_Galaxy),
  [distance to M104, AJ 2016](https://iopscience.iop.org/article/10.3847/0004-6256/152/5/144))

---

## 4. True-scale placement recommendations for the homepage

**Design law:** distance is the message. The homepage exists to make a viewer
*feel* that the MW's satellites are close, Andromeda is far, and the poster
galaxies are almost unreachably far. Do not flatten that.

**Three honest distance tiers** (all in R_MW; pick a screen radius `r` for the MW
and derive the rest):

1. **Companion tier (1–9 R_MW) — draw as resolvable neighbours near the disc.**
   - Sagittarius dSph (1.3), LMC (3.3), SMC (3.9), then Draco/Sculptor/Carina/
     Fornax (5–9). These are the *only* objects allowed to read as "with" the MW.
   - The LMC/SMC hang **below the galactic plane** (toward the south galactic
     pole), 0.2–0.3× the MW's size — exactly as the current homepage places them.
   - The dSphs are faint amber smudges; include 2–4 as low-opacity glows for
     honesty, not detail.

2. **Local-Group tier (50–55 R_MW) — draw M31 and M33 as small, real, distant
   galaxies.** This is the tier the homepage is currently *missing* as real
   objects. At 50 R_MW, if the MW spans 2r on screen, M31 (1.52×) spans ~1.5r but
   sits **50× further than its own radius** — so on any framing that includes the
   MW as a hero, M31 is a **small golden ellipse far across the field**, M33 a
   still-smaller blue flocculent speck near it. Place them together (they share
   the far lobe of the dumbbell), M31 with a golden bulge + blue arms, M33 bluer.

3. **Deep-field tier (230–620 R_MW) — the poster galaxies are essentially
   background.** Centaurus A, M81/M82, M101, M51, Sombrero at 230–620 R_MW are, at
   true scale, **1–3 px specks**. They belong in the faint distant scatter, *not*
   as heroes. If you want them recognisable, that is a deliberate,
   non-true-scale artistic choice — label it as such, and keep them small/faint so
   the lie is gentle.

**Concretely, if the MW is drawn with on-screen radius `r`:**

| Tier | Object | Place at (× r from MW centre) | Draw at radius (× r) |
|---|---|---:|---:|
| Companion | LMC | 3.3 | 0.32 |
| Companion | SMC | 3.9 | 0.19 |
| Local Group | **M31** | **50** | **0.76** |
| Local Group | **M33** | **55** | **0.30** |
| Deep field | Cen A / M81 | ~235 | ~0.45 |
| Deep field | M101 | ~418 | ~0.85 |
| Deep field | M51 | ~460 | ~0.38 |
| Deep field | Sombrero | ~586 | ~0.25 |

(Radius-on-screen uses size ÷ 2 relative to the MW's *radius* r, i.e. Size(×MW) ×
r. A "×50 distance" object is 50× further away than the MW's own radius — apply
your perspective/parallax so the far tiers genuinely recede.)

**Colour direction, applied:**
- Bulges & dSphs → gold/amber (`#FFD9A0`, `#FFE0B0`, `#E8DCC0`).
- Star-forming discs/arms → blue-white (`#A8C4FF`–`#CFE0FF`); M33/M101 the bluest.
- HII regions → magenta-pink accents (`#FF6B8A`, `#FF7A9C`); LMC's Tarantula the
  brightest.
- Dust lanes (Sombrero, Cen A, M31, edge-ons) → near-black warm brown
  (`#241C14`–`#2A2018`).
- Never use flat "sci-fi cyan/purple" fills — the whole galaxy family reads as one
  honest palette of old-gold + young-blue + HII-pink + dust-black.

---

## 5. Discrepancies vs. the current portfolio

Files reviewed:
`/Users/rugwedpatharkar/Projects/Portfolio/.claude/worktrees/goofy-chatelet-fa07fd/src/stellar/Scene/DistantGalaxies.jsx`
and `.../HomepageGalaxies.jsx`.

### What is already correct (keep it)

- **`HomepageGalaxies.jsx` true-scale reasoning is accurate.** Its header comment
  states LMC/SMC sit "3–4 galaxy-radii out" (verified: **3.3 / 3.9 R_MW**),
  Andromeda "2.5 Mly (50 radii)" (verified: **50 R_MW**), and
  "Sombrero/Whirlpool 23–29 Mly (460–580 radii)" (verified: **460 / 586 R_MW**).
  The decision to keep only LMC + SMC as near heroes and push everything at Mly
  distances into the faint deep-field is **scientifically right**.
- **`DistantGalaxies.jsx` sky coordinates are accurate.** RA/Dec for M31
  (00h42.7m, +41.27°), M33 (01h33.9m, +30.66°), LMC (05h23.6m, −69.76°), SMC
  (00h52.7m, −72.83°) all match catalogue values, and the header's angular-size
  notes (M31 ~3°, M33 ~1.2°, LMC ~10°, SMC ~5°) are correct.

### Discrepancies / recommended fixes

1. **Dead colour & shape config on the four naked-eye galaxies
   (`DistantGalaxies.jsx`, lines 83–122).** Now that named galaxies render from
   **real photos** (`NAMED_URLS`, sprite uses `map` only, no `color`), the
   per-galaxy `tint`, `nucleusTint`, `nucleusScale`, `rotation`, and the *shape*
   of `scale` (`[900,230,230]` etc.) are **unused** — only `Math.max(...g.scale)`
   is read (line 200). This is vestigial data from the pre-photo procedural era.
   *Fix:* reduce each entry to `{ name, raHours, decDeg, size }` (or keep a single
   `size` scalar), and drop the dead fields. Ponytail: deletion over addition.

2. **The dead tints were also scientifically wrong (moot, but note it).** The
   unused `tint` values are all warm cream/amber (`#fff2d0`, `#f2e8d0`,
   `#f8e8c8`, `#ecdcbc`). Two of those objects should read **blue**, not cream:
   **M33 is a blue flocculent spiral** and the **LMC/SMC are blue-white with pink
   HII**. Since real photos now carry the colour this doesn't render, but if any
   procedural fallback is ever reintroduced, use the §2 hex values, not warm
   cream for everything.

3. **M31 and M33 are not represented as real true-scale objects on the homepage.**
   `HomepageGalaxies.jsx` only instantiates **LMC + SMC** as real-photo heroes
   (`HERO_GALAXIES`, lines 218–221); Andromeda and Triangulum exist only as part
   of the *random* `makeField()` JWST scatter, i.e. not as themselves, not at
   their real 50 / 55 R_MW positions or golden/blue colours. For a homepage whose
   thesis is "the MW seen from outside with its true-scale neighbours," the two
   **actual** Local-Group companions after the Magellanic Clouds are missing.
   *Recommendation (per §4 tier 2):* add M31 and M33 as small, real, correctly-
   coloured objects in the far field — M31 a golden ellipse, M33 a bluer speck —
   placed together and far smaller/fainter than the LMC/SMC, so the scale story
   reads MW → Clouds (near) → M31/M33 (far) → poster galaxies (very far).

4. **Milky Way size unit — confirm consistency.** Both files reason in
   "galaxy-radii" implicitly using **R_MW = 50,000 ly** (MW diameter 100,000 ly);
   the verified numbers in this doc assume the same. Keep that unit everywhere so
   the annotations stay internally consistent (the D25 alternative, 87,400 ly,
   would shift every "R_MW" figure by ~13% — don't mix them).

5. **Optional accuracy caption for the merger.** If the homepage or tour ever
   captions the M31 approach, use "**~110 km/s, merger in ~4.5 Gyr**" as the
   headline but footnote the **2025 Gaia+Hubble ~50% result** — the head-on
   collision is now *likely, not certain*.
   ([Nature Astronomy 2025](https://www.nature.com/articles/s41550-025-02563-1))

---

## Sources

- [Local Group — Wikipedia](https://en.wikipedia.org/wiki/Local_Group)
- [Andromeda–Milky Way collision — Wikipedia](https://en.wikipedia.org/wiki/Andromeda%E2%80%93Milky_Way_collision)
- [NASA/Hubble — Milky Way destined for head-on collision](https://science.nasa.gov/missions/hubble/nasas-hubble-shows-milky-way-is-destined-for-head-on-collision/)
- [Sawala et al. 2025, "No certainty of a Milky Way–Andromeda collision," Nature Astronomy](https://www.nature.com/articles/s41550-025-02563-1)
- [Milky Way — Wikipedia](https://en.wikipedia.org/wiki/Milky_Way)
- [Licquia & Newman 2012, colour of the Milky Way — Universe Today](https://www.universetoday.com/92523/what-color-is-the-milky-way-white-as-snow-not-milk/) · [Pitt Chronicle](https://www.chronicle.pitt.edu/story/pitt-astronomers-determine-color-milky-way-galaxy)
- [Large Magellanic Cloud — Wikipedia](https://en.wikipedia.org/wiki/Large_Magellanic_Cloud)
- [Small Magellanic Cloud — Wikipedia](https://en.wikipedia.org/wiki/Small_Magellanic_Cloud)
- [Sagittarius Dwarf Spheroidal — Wikipedia](https://en.wikipedia.org/wiki/Sagittarius_Dwarf_Spheroidal_Galaxy)
- [List of satellites of the Milky Way — Simple Wikipedia](https://simple.wikipedia.org/wiki/List_of_satellites_of_the_Milky_Way)
- [Fornax dSph distance — arXiv 0707.0521](https://arxiv.org/abs/0707.0521) · [Sculptor Dwarf — Wikipedia](https://en.wikipedia.org/wiki/Sculptor_Dwarf_Galaxy)
- [Systemic proper motions of Carina/Fornax/Sculptor/Sextans — ApJ (IOP)](https://iopscience.iop.org/article/10.1086/595586)
- [Andromeda Galaxy (M31) — Wikipedia](https://en.wikipedia.org/wiki/Andromeda_Galaxy)
- [Triangulum Galaxy (M33) — Wikipedia](https://en.wikipedia.org/wiki/Triangulum_Galaxy) · [NASA Messier 33](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-33/)
- [Centaurus A — Wikipedia](https://en.wikipedia.org/wiki/Centaurus_A)
- [Messier 81 — Wikipedia](https://en.wikipedia.org/wiki/Messier_81) · [M82 morphology — arXiv 0906.0757](https://arxiv.org/pdf/0906.0757)
- [Pinwheel Galaxy (M101) — Wikipedia](https://en.wikipedia.org/wiki/Pinwheel_Galaxy)
- [Whirlpool Galaxy (M51) — Wikipedia](https://en.wikipedia.org/wiki/Whirlpool_Galaxy)
- [Sombrero Galaxy (M104) — Wikipedia](https://en.wikipedia.org/wiki/Sombrero_Galaxy) · [Distance to M104, AJ 2016 (IOP)](https://iopscience.iop.org/article/10.3847/0004-6256/152/5/144)
