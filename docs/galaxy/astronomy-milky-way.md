# Milky Way — the view from our solar system

Everything here is aimed at rendering the galaxy **as it truly appears from the
Sun's position inside it**: the band across the sky, the bright core toward
Sagittarius, the dust lanes, and the local stellar neighborhood that gains real
depth in the pull-back finale. We never model the whole disk as an external object.

Values are tagged **→ `galaxy.js`.field** where they become app data. Sources are
inline; see `00-MASTER.md` for the catalog.

---

## 1. What the Milky Way *is* (so the band renders right)

- **Type:** barred spiral, **SBbc** (Bland-Hawthorn & Gerhard 2016, *ARA&A* review
  "The Galaxy in Context"). ~100–400 billion stars.
- **Stellar disk:** classic diameter ~**100,000 ly** (radius ~50,000 ly); the outer
  low-density disk extends further (~150,000–200,000 ly in some tracers, López-
  Corredoira 2018). Use radius ~**50,000 ly** as the bright-disk edge.
  → `galaxy.js`.diskRadiusLy ≈ 50000
- **Radial scale length:** ~**2.6 kpc** (≈8,500 ly) — disk surface brightness falls
  as `exp(−R/scaleLength)` (Bland-Hawthorn & Gerhard 2016). → `galaxy.js`.scaleLengthLy
- **Vertical scale heights:** thin disk ~**300 pc** (~1,000 ly); thick disk ~**900 pc**
  (~2,900 ly). This thinness is *why* the galaxy reads as a **band**, not a blob, from
  inside. → `galaxy.js`.thinScaleHeightLy / thickScaleHeightLy
- **Central bulge + bar:** boxy/peanut bar, half-length ~**5 kpc** (~16,000 ly),
  oriented ~**27°** to the Sun–center line (Wegg, Gerhard & Portail 2015). The bulge is
  the bright swelling toward the center. → `galaxy.js`.bulge / bar{halfLengthLy, angleDeg:27}
- **Spiral pitch angle:** ~**12–13.5°** log-spiral (Reid et al. 2019, BeSSeL).
  → `galaxy.js`.pitchAngleDeg ≈ 12.5

## 2. The spiral arms (as projected into our sky)

From the Sun outward/inward, the major arms (Reid et al. 2019, *ApJ* 885:131, BeSSeL
Survey trigonometric parallaxes):

| Arm | Position vs Sun | Notes |
|---|---|---|
| **Norma / Outer** | innermost + far outer | 3-kpc/Norma near the bar |
| **Scutum–Centaurus** (Scutum–Crux) | inner | a major arm |
| **Sagittarius–Carina** | just inward of us | the "next arm in" toward the center |
| **Orion Spur (Local Arm)** | **contains the Sun** | a substantial spur/branch, not a minor sliver (Xu et al. 2016) |
| **Perseus** | just outward of us | the "next arm out" |

→ `galaxy.js`.arms[] as log-spirals `r(θ)=r₀·e^(tan(pitch)(θ−θ₀))` with a `densityWeight`;
the **Orion Spur** carries the Sun anchor. These drive where arm brightness projects
onto the band (denser arms = brighter star clouds in that sky direction).

## 3. The Sun's place (anchors the whole view)

- **Galactocentric distance R₀ = 8.178 ± 0.026 kpc = ~26,670 ly** (GRAVITY
  Collaboration 2019, *A&A* 625 L10, S2-orbit geometric measurement, 0.3% uncertainty).
  → `galaxy.js`.sun.galactocentricRadiusLy ≈ 26670
- **Height above the mid-plane:** the Sun sits ~**20 pc (~65 ly) north** of the galactic
  plane (Bland-Hawthorn & Gerhard 2016; range ~5–30 pc in the literature).
  → `galaxy.js`.sun.heightLy ≈ 65
- **Arm:** the **Orion Spur / Local Arm**. → `galaxy.js`.sun.arm = "Orion Spur"
- **Orbital motion:** ~**230 km/s**, one galactic orbit ("galactic year") ≈ **225–250 Myr**
  (context only; not animated).

## 4. Sagittarius A* — the core *direction*

- **Sgr A\* mass ≈ 4.30 × 10⁶ M☉** (GRAVITY 2019, same S2 orbit). → `galaxy.js`.sgrA.massSolar
- **Imaged by the Event Horizon Telescope, 12 May 2022** (first Sgr A* image; the ring).
- In our sky it lies toward the **constellation Sagittarius**, equatorial
  **RA ≈ 17h 45m 40s, Dec ≈ −29° 00′ 28″** (J2000). This is the **direction** of the
  bright bulge — we render it as where the band peaks, NOT a place we fly to.
  → `galaxy.js`.sgrA.directionFromSun (unit vector toward RA/Dec above)

## 5. Orientation of the band on OUR sky (the make-or-break for accuracy)

The catalogue/skybox is equatorial (ICRS); the scene's planets orbit the ecliptic
(the xz-plane, tilted by Earth's 23.44° obliquity — already handled in `Stars.jsx`).
The galactic plane is a **third** plane:

- **Galactic plane ↔ ecliptic inclination ≈ 60.2°.** → `galaxy.js`.orientation
- **Galactic North Pole:** RA **12h 51m 26s**, Dec **+27° 07′ 42″** (J2000, IAU 1958 /
  updated). **Galactic center:** RA 17h45m40s, Dec −29°00′28″. These two fix the band's
  great circle on the celestial sphere.
- **The band is brightest & widest toward Sagittarius** (center/bulge: Sagittarius &
  Scutum Star Clouds) and **faintest toward the anticenter** (Auriga/Taurus/Gemini,
  opposite side of the sky) — because we look through the whole disk toward the center
  and out of it toward the anticenter.
- **The Great Rift** — dark dust lanes bisecting the band from **Cygnus (the Cygnus/
  Northern Rift) through Aquila to Sagittarius/Ophiuchus**, plus the Coalsack near
  Crux in the south. → the dark structure threaded through the band.
  → today's decorative `MilkyWay.jsx` haze band is *replaced/upgraded* by a band placed
  on this real great circle with center-biased brightness + dust-lane darkening.

## 6. The local stellar neighborhood (the pull-back's near depth)

The pull-back reveals the Sun as one star among its real neighbors. Nearest stars
(distances = Gaia/HYG; feed the stride-5 `distLy` axis in `brightStars.js`):

| Star | Distance | Note |
|---|---|---|
| Proxima Centauri | 4.24 ly | nearest star |
| α Centauri A/B | 4.37 ly | nearest Sun-like pair |
| Barnard's Star | 5.96 ly | fast proper motion |
| Wolf 359 | 7.86 ly | |
| Sirius A/B | 8.60 ly | brightest night-sky star |
| Procyon | 11.46 ly | |
| Altair | 16.7 ly | |
| Vega | 25.0 ly | |
| Arcturus | 36.7 ly | |
| Aldebaran | 65 ly | |
| Pleiades (M45) | ~444 ly | nearby OB cluster |
| Hyades | ~153 ly | nearest open cluster |

- **The Local Bubble:** a ~**300–1,000 ly** low-density cavity in the interstellar
  medium the Sun currently sits inside (Zucker et al. 2022, *Nature*, tied to the
  Local Bubble's supernova-swept shell). Defines the near-field scale of the pull-back.
- **Nearby OB associations:** **Scorpius–Centaurus** (the nearest, ~380–470 ly) — a
  natural "structure" to see in the pull-back.
- **Naked-eye reach:** most naked-eye stars lie within ~a few hundred to ~1,000 ly (a
  few luminous ones farther — Deneb ~2,600 ly, Rigel ~860 ly). → the local-neighborhood
  regime caps around the **local bubble → ~1,000–2,000 ly** (see `technical-scale-regimes.md`),
  NOT the 50,000 ly disk edge.

---

## Feeds-map (summary: doc → `galaxy.js`)
`diskRadiusLy 50000 · scaleLengthLy 8500 · thinScaleHeightLy 1000 · thickScaleHeightLy 2900 ·
bulge/bar{halfLengthLy 16000, angleDeg 27} · pitchAngleDeg 12.5 · sun{galactocentricRadiusLy
26670, heightLy 65, arm "Orion Spur"} · sgrA{massSolar 4.30e6, directionFromSun ←RA/Dec} ·
orientation{galacticPole RA/Dec, eclipticInclinationDeg 60.2} · arms[Norma, Scutum-Centaurus,
Sagittarius-Carina, Orion Spur, Perseus]`

## Sources
- Bland-Hawthorn & Gerhard 2016, *ARA&A* 54:529 — Galaxy structure review (disk/bulge/scale heights, z_sun).
- Reid et al. 2019, *ApJ* 885:131 (BeSSeL) — spiral-arm parallaxes, pitch angle.
- Xu et al. 2016, *Sci. Adv.* — the Local (Orion) Arm is a major structure.
- Wegg, Gerhard & Portail 2015, *MNRAS* — bar geometry/angle.
- GRAVITY Collaboration 2019, *A&A* 625:L10 — R₀ = 8.178 kpc, Sgr A* mass 4.30×10⁶ M☉.
- Event Horizon Telescope Collaboration 2022 — first image of Sgr A*.
- Zucker et al. 2022, *Nature* 601:334 — the Local Bubble.
- IAU 1958 galactic coordinate system — galactic pole / center directions.
