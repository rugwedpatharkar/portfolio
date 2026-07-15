# 06 · Stars, Star Colors & Constellations

Research reference for the "Stellar" portfolio star field. Goal: 100 % accuracy
on the physics of star color, the brightest-star reference data, physical sizes,
and the constellation asterisms — then a discrepancy pass against the current
code.

All numeric values were verified against the sources cited inline (SIMBAD-backed
star pages, Wikipedia's Gaia/Hipparcos-derived lists, IAU asterism references,
and the primary blackbody/color papers). Where sources disagree (common for
supergiant radii and distances), the range is given and the adopted value noted.

---

## 1. Executive summary

- **The portfolio's color pipeline is physically correct.** `Stars.jsx`
  converts each catalogue star's **B–V color index → temperature** with the
  **Ballesteros (2012)** blackbody formula, then **temperature → RGB** with the
  **Tanner Helland** piecewise blackbody fit. Both are the right, standard tools.
  The coefficients in the code match the published formulas to the digit. No
  change needed to the math.
- **The catalogue is real and accurate.** `brightStars.js` is HYG v4.1
  (Hipparcos/Yale BSC), 8,920 naked-eye stars, packed `[raRad, decRad, mag, B–V,
  distLy]`, sorted brightest-first. Spot-checked B–V values match this report's
  independently-sourced table (Sirius 0.01, Canopus 0.16, Arcturus 1.24,
  α Cen 0.71, Vega 0.00). Trust it.
- **One real physics caveat: Ballesteros temperature saturates for hot stars.**
  For O/B stars (B–V ≲ −0.1) the formula returns ~13,000–15,000 K regardless of
  how hot the star truly is (Spica's true Teff ≈ 22,000 K → Ballesteros gives
  ~14,400 K). The *perceived color* it produces is still correctly blue-white,
  so the star field is fine — **but never surface a B–V-derived temperature
  number in the UI**; it will be wrong for the hottest stars.
- **Twinkle is an atmospheric effect and the scene is in space.** Scintillation
  is caused by Earth's atmosphere; from orbit/space stars are rock-steady. The
  code's twinkle is therefore an *aesthetic* choice, not physical accuracy. It's
  already tastefully scoped (amplitude scales with brightness; faint stars stay
  still), so keep it — but document it as artistic, and consider making it even
  subtler or vantage-aware.
- **The constellation asterisms are accurate.** All 12 patterns use real IAU
  J2000 RA/Dec and correct connection topology (Orion, Big Dipper, Cassiopeia's
  W, the Northern Cross, Scorpius's hook, the Southern Cross, etc.). The only
  issues are **dead duplicate anchor entries** in Cygnus and Scorpius (harmless,
  unreferenced) and a couple of stylistic notes.
- **Physical size (R☉) is irrelevant to the point-star field** — every catalogue
  star is an unresolved point, correctly sized by *apparent magnitude*. Physical
  radius only matters for the named "anomaly" beacons (Betelgeuse, Antares),
  where one fact needs a small correction (see §5).

---

## 2. Star-color physics and the B–V → hex mapping

### 2.1 Why stars have color: blackbody radiation

A star radiates approximately as a **blackbody**, so its surface (effective)
temperature sets the wavelength of peak emission and therefore its perceived
color. Hotter → bluer, cooler → redder — Wien's law in action. This is the
single fact behind everything in this section
([Ohio State, Lect. 3](https://www.astronomy.ohio-state.edu/weinberg.21/Intro/lec3.html);
[Penn State ASTRO 801](https://courses.ems.psu.edu/astro801/content/l4_p2.html)).

### 2.2 The spectral sequence O B A F G K M

The Harvard spectral classes are a temperature sequence. Representative
effective-temperature ranges and true perceived colors
([Penn State ASTRO 801](https://courses.ems.psu.edu/astro801/content/l4_p2.html);
[SUNY Stony Brook AST 101](https://www.astro.sunysb.edu/fwalter/AST101/spt.html)):

| Class | Teff range (K) | Perceived color | Blackbody hex* | Example |
|-------|----------------|-----------------|----------------|---------|
| **O** | 30,000–50,000  | blue / blue-white | `#98baff` (40,000 K) | Mintaka, Zeta Puppis |
| **B** | 10,000–30,000  | blue-white | `#abc6ff` (20,000 K) | Rigel, Spica, Regulus |
| **A** | 7,500–10,000   | white (faint blue tinge) | `#d7e2ff` (8,500 K) | Sirius, Vega, Deneb |
| **F** | 6,000–7,500    | white / yellow-white | `#ffffff` (6,600 K) | Procyon, Canopus |
| **G** | 5,200–6,000    | yellow-white | `#fff2e6` (5,772 K, Sun) | Sun, α Cen A, Capella |
| **K** | 3,700–5,200    | orange | `#ffd5b3` (4,300 K) | Arcturus, Aldebaran, Pollux |
| **M** | 2,400–3,700    | orange-red | `#ffb87b` (3,200 K) | Betelgeuse, Antares |

*Hex = the Tanner Helland blackbody color at the listed temperature, i.e. the
exact tint the portfolio pipeline produces at that Teff. Class boundaries vary a
few thousand K between textbooks; ranges above are representative.

**Three facts that matter for rendering:**

1. **There are no green, cyan, or purple stars.** A blackbody spectrum folded
   through human color perception never lands in those hues — the locus runs
   blue → white → orange → red only. The Sun peaks in green but reads *white*
   because it emits across the whole visible band. Confirmed by the definitive
   modern study of stellar color codes
   ([Harre & Heller 2021, *Astron. Nachr.*](https://onlinelibrary.wiley.com/doi/10.1002/asna.202113868)),
   which also finds the hottest stars converge to a fixed blue of linear RGB
   ≈ (90, 123, 255) rather than getting ever bluer.
2. **Color is subtle to the eye; most stars look white.** At night, starlight is
   faint enough that the eye's color cones are barely triggered — the monochrome
   **rod** system (scotopic vision) dominates, so we perceive most stars as
   white. Only the *brightest* stars deliver enough light to fire the cones, and
   only then do Betelgeuse's red or Rigel's blue become obvious
   ([Frosty Drew Observatory](https://frostydrew.org/observatory/columns/2004/jun.htm);
   [ASU Ask A Biologist — rods & cones](https://askabiologist.asu.edu/rods-and-cones)).
   **Implication:** a physically faithful field is mostly white with a *few*
   saturated standouts — not a rainbow. The portfolio's white-mix (§2.5) leans
   into this correctly.
3. **The reddest/bluest are the extremes.** The visual color contrast in the
   real sky is dominated by a handful of stars: red Betelgeuse/Antares/Aldebaran
   at one end, blue Rigel/Spica/Bellatrix at the other, everything else clustered
   near white.

### 2.3 B–V color index → temperature (Ballesteros 2012)

The **B–V color index** is the star's blue-minus-visual magnitude difference: a
direct, catalogued proxy for temperature. Negative/near-zero = hot & blue,
large positive = cool & red. HYG lists it per star, so it is the natural input.

Convert B–V to effective temperature with **Ballesteros' formula** (derived by
treating the star as a blackbody seen through the B and V filter bands
([Ballesteros 2012, EPL 97, 34008](https://pyastronomy.readthedocs.io/en/latest/pyaslDoc/aslDoc/aslExt_1Doc/ramirez2005.html))):

```
T_eff (K) = 4600 · ( 1 / (0.92·(B−V) + 1.7)  +  1 / (0.92·(B−V) + 0.62) )
```

This is exactly what `Stars.jsx → bvToColor()` implements (line ~101).

**Known limitation — saturation at the hot end.** Ballesteros is a two-band
blackbody approximation; it is excellent through the A–K range but *flattens*
for very hot stars. Worked values from the portfolio's own pipeline:

| Star | B–V | Ballesteros T | True Teff | Note |
|------|-----|---------------|-----------|------|
| Sun (ref) | +0.65 | ~5,760 K | 5,772 K | spot-on |
| Arcturus | +1.23 | 4,251 K | ~4,286 K | spot-on |
| Sirius | 0.00 | 10,125 K | ~9,940 K | close |
| Rigel | −0.03 | 10,516 K | ~12,100 K | low |
| Spica | −0.23 | 14,354 K | ~22,000 K | **saturated** |

The *color* stays correctly blue-white in every case (that's what we render), so
the field is fine — but the intermediate temperature is not trustworthy above
~10,000 K. **Do not display it as a fact.**

### 2.4 Temperature → RGB (Tanner Helland blackbody fit)

Turn the temperature into a screen color with Tanner Helland's widely-used
piecewise curve fit to the blackbody locus (valid 1,000–40,000 K, R² > 0.987
([Tanner Helland 2012](https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html))).
Let `k = T / 100`:

```
Red:
  k ≤ 66 :  R = 255
  k > 66 :  R = 329.698727446 · (k − 60)^(−0.1332047592)

Green:
  k ≤ 66 :  G = 99.4708025861 · ln(k) − 161.1195681661
  k > 66 :  G = 288.1221695283 · (k − 60)^(−0.0755148492)

Blue:
  k ≥ 66 :  B = 255
  k ≤ 19 :  B = 0
  else   :  B = 138.5177312231 · ln(k − 10) − 305.0447927307

(clamp every channel to [0, 255])
```

The code's rounded coefficients (`329.7`, `99.47`, `288.12`, `138.52`, `305.04`)
match this to within rounding. **Correct as written.**

### 2.5 The white-mix (perceptual correction)

`Stars.jsx` blends each raw blackbody RGB toward white by `mix = 0.15`:

```
out = raw · (1 − mix) + mix        // per channel, mix = 0.15
```

This is **physically defensible, not a hack.** Because faint stars read as white
to the dark-adapted eye (§2.2 fact 2), a fully-saturated blackbody field would
*over*-state real color. A 15 % white lift keeps Betelgeuse orange and Rigel
blue while pulling the mass of mid-range stars toward the near-white they
actually appear. Keep it. (Raw vs. mixed examples: Sirius `#c9daff`→`#d1dfff`,
Betelgeuse `#ffbc83`→`#ffc696`, Arcturus `#ffd4b1`→`#ffdabd`.)

---

## 3. Brightest-stars reference table

Top 25 by apparent visual magnitude. Columns: **Type** (MK spectral),
**Teff** (K), **Color hex** (perceived tint from this pipeline / physical color),
**Dist** (ly), **mV** (apparent), **MV** (absolute), **R☉** (radius in solar
radii). Giants/supergiants flagged **★**.

Sources per row are consolidated from:
[Wikipedia — List of brightest stars](https://en.wikipedia.org/wiki/List_of_brightest_stars)
(mag, distance, type),
[Star-Facts.com](https://www.star-facts.com/brightest-stars/) and its per-star
pages, and the physical-parameter searches cited in §3.1.

| # | Star (Bayer) | Type | Teff (K) | Color hex | Dist (ly) | mV | MV | R☉ | Class |
|---|--------------|------|----------|-----------|-----------|-----|-----|-----|-------|
| 1 | Sirius (α CMa) | A0–A1 V | ~9,940 | `#d1dfff` | 8.6 | −1.46 | +1.42 | 1.71 | main-seq |
| 2 | Canopus (α Car) | A9 II | ~7,400 | `#dce6ff` | 310 | −0.74 | −5.71 | ~71 | ★ bright giant |
| 3 | α Centauri A/B | G2 V + K1 V | 5,790 / 5,260 | `#fff1e5` | 4.34 | −0.27¹ | +4.38 | 1.22 / 0.86 | main-seq |
| 4 | Arcturus (α Boo) | K1.5 III | 4,286 | `#ffdabd` | 37 | −0.05 | −0.30 | 25.4 | ★ orange giant |
| 5 | Vega (α Lyr) | A0 V | 9,600 | `#d1dfff` | 25 | +0.03 | +0.58 | 2.36–2.8² | main-seq |
| 6 | Capella (α Aur) | G8 III + G1 III | 4,970 / 5,730 | `#ffeddd` | 43 | +0.08 | −0.48 | 12.0 / 8.8 | ★ giants |
| 7 | Rigel (β Ori) | B8 Ia | ~12,100 | `#cfdeff` | 860 | +0.13 | −7.0 | 78.9 | ★ blue supergiant |
| 8 | Procyon (α CMi) | F5 IV–V | ~6,530 | `#fcf8ff` | 11.5 | +0.34 | +2.66 | 2.05 | subgiant |
| 9 | Achernar (α Eri) | B6 Vpe | ~15,000 | `#c6d9ff` | 140 | +0.46 | −2.77 | 9.2 eq³ | main-seq (oblate) |
| 10 | Betelgeuse (α Ori) | M1–2 Ia-ab | ~3,600 | `#ffc696` | ~550–640 | +0.50v | −5.85 | ~764⁴ | ★★ red supergiant |
| 11 | Hadar (β Cen) | B1 III | ~25,000 | `#c2d6ff` | 390 | +0.61 | −5.42 | ~9 | ★ blue giant |
| 12 | Altair (α Aql) | A7 V | ~7,550 | `#e2e9ff` | 17 | +0.76 | +2.21 | 1.6–2.0² | main-seq (oblate) |
| 13 | Acrux (α Cru) | B0.5 IV + B1 V | ~28,000 | `#c1d5ff` | 320 | +0.76 | −4.2 | ~7.8 | ★ blue subgiant |
| 14 | Aldebaran (α Tau) | K5 III | ~3,900 | `#ffcfa9` | 65 | +0.86 | −0.64 | ~45 | ★ orange giant |
| 15 | Antares (α Sco) | M1.5 Iab-Ib | ~3,660 | `#ffc697` | 550 | +0.96v | −5.28 | ~680 | ★★ red supergiant |
| 16 | Spica (α Vir) | B1 III–IV | ~22,400 | `#c2d6ff` | 250 | +0.97 | −3.55 | 7.47 | ★ blue giant |
| 17 | Pollux (β Gem) | K0 III | ~4,860 | `#ffe4cd` | 34 | +1.14 | +1.08 | 8.8 | ★ orange giant |
| 18 | Fomalhaut (α PsA) | A3 V | ~8,590 | `#dce6ff` | 25 | +1.16 | +1.72 | 1.84 | main-seq |
| 19 | Deneb (α Cyg) | A2 Ia | ~8,500 | `#d7e3ff` | ~2,600 | +1.25 | −8.4 | ~203 | ★★ blue-white supergiant |
| 20 | Mimosa (β Cru) | B0.5 III | ~27,000 | `#c1d5ff` | 280 | +1.25 | −3.9 | ~8.4 | ★ blue giant |
| 21 | Regulus (α Leo) | B8 IVn | ~12,460 | `#cbdbff` | 79 | +1.39 | −0.57 | 4.2 eq | main-seq (oblate) |
| 22 | Adhara (ε CMa) | B2 II | ~22,900 | `#c3d6ff` | 430 | +1.50 | −4.1 | ~13.9 | ★ blue giant |
| 23 | Castor (α Gem) | A1 V | ~10,300 | `#d3e0ff` | 51 | +1.58 | +0.5 | ~2.4 | main-seq |
| 24 | Shaula (λ Sco) | B2 IV | ~25,000 | `#c2d6ff` | 570 | +1.63 | −5.0 | ~5–8 | ★ blue subgiant |
| 25 | Bellatrix (γ Ori) | B2 III | ~21,700 | `#c2d6ff` | 250 | +1.64 | −2.78 | 5.75 | ★ blue giant |

Notes:
¹ α Cen combined system magnitude; A alone is +0.01.
² Vega and Altair are rapid rotators, visibly **oblate** — equatorial radius
exceeds polar (Vega ~2.8/2.4 R☉; Altair ~2.0/1.6 R☉).
³ Achernar is the flattest known bright star (~9.2 R☉ equatorial vs ~7 polar).
⁴ Betelgeuse radius spans 700–880 R☉ across studies (adopted 764); distance
likewise 499–640 ly. It is variable in both size and brightness.

**Color hex** in the table is the pipeline output (`mix=0.15`) at that star's
catalogued B–V, i.e. what the portfolio actually renders. The takeaway visually:
blue-white hot stars cluster around `#c1d5ff`–`#d3e0ff`, the reddest
supergiants around `#ffc696`, and everything between hugs near-white — exactly
the subtle real-sky palette of §2.2.

### 3.1 Per-star physical-parameter sources

Radii/temperatures cross-checked at:
Betelgeuse ~764 R☉, 3,600 K, M1–2 Ia
([Star-Facts](https://www.star-facts.com/betelgeuse/));
Rigel 78.9 R☉, ~12,100 K
([Wikipedia — Rigel](https://en.wikipedia.org/wiki/Rigel));
Antares 680 R☉, 3,660 K
([search-sourced, VLTI/AMBER](https://arxiv.org/pdf/1304.4800));
Deneb ~203 R☉, ~8,500 K
([The Planets — Deneb](https://theplanets.org/stars/deneb-star/));
Aldebaran ~45 R☉, ~3,900 K; Arcturus 25.4 R☉, 4,286 K
([Wikipedia — Arcturus](https://en.wikipedia.org/wiki/Arcturus));
Spica 7.47 R☉, ~22,400 K; Achernar ~9.2 R☉ eq;
Regulus 4.2 R☉ eq, 12,460 K
([Star-Facts — Regulus](https://www.star-facts.com/regulus/));
Bellatrix 5.75 R☉, 21,700 K; Vega ~9,600 K, B–V 0.00; Altair ~7,550 K;
Procyon ~6,530 K, 2.05 R☉, B–V 0.42; Pollux 8.8 R☉; Capella 12.0 R☉
([Star-Facts brightest list](https://www.star-facts.com/brightest-stars/)).

### 3.2 The giants/supergiants (physical size flags)

For any feature that *resolves* a star as a disc (the anomaly beacons), the true
size ordering is what sells the drama:

- **Supergiants (hundreds of R☉):** Betelgeuse ~764, Antares ~680, Deneb ~203,
  Rigel ~79, Canopus ~71. Betelgeuse at the Sun's place reaches ~3.5 AU — past
  Mars, into the asteroid belt (see §5 correction).
- **Bright/normal giants (tens of R☉):** Arcturus 25, Adhara 14, Capella 12,
  Aldebaran ~45, Pollux 8.8, Spica 7.5.
- **Main-sequence (≈1–3 R☉):** Sirius 1.7, Vega ~2.4, Altair ~1.8, Procyon 2.0,
  Fomalhaut 1.8, α Cen A 1.2. These are the "normal" stars; in the point-field
  they are indistinguishable from giants — only *apparent magnitude* separates
  them on screen, which is exactly how the code sizes them.

---

## 4. Constellation asterisms

Every pattern below is verified against IAU J2000 positions and the standard
asterism line references. The portfolio's `Constellations.jsx` values are
**accurate**; the connection topology is correct in all 12.

### 4.1 The classic patterns (portfolio, verified)

**Orion** — shoulders Betelgeuse (α) + Bellatrix (γ); belt
Mintaka–Alnilam–Alnitak (δ-ε-ζ); feet Saiph (κ) + Rigel (β). The code connects
shoulders→belt→feet→sides — a correct stick figure.

**Ursa Major / Big Dipper** — bowl Dubhe–Merak–Phecda–Megrez (α-β-γ-δ), handle
Megrez–Alioth–Mizar–Alkaid (δ-ε-ζ-η). Correct.
([Constellation Guide — Big Dipper](https://www.constellation-guide.com/big-dipper/))

**Cassiopeia** — the W: Segin–Ruchbah–Navi–Schedar–Caph (ε-δ-γ-α-β). Correct.

**Cygnus / Northern Cross** — spine Deneb (α, tail) → Sadr (γ, chest) → Albireo
(β, beak); crossbeam Gienah/Aljanah (ε, east wing) → Sadr → Fawaris (δ, west
wing). The code's edges `[[0,1],[1,4],[5,1],[1,2]]` reproduce exactly this
spine + crossbeam. Correct topology
([Wikipedia — Northern Cross](https://en.wikipedia.org/wiki/Northern_Cross_(asterism))).
*Dead data:* anchors index 3 ("Gienah", duplicate of 2) and index 6 ("Rukh",
duplicate of 5 Delta) are never referenced in `edges` — harmless but should be
deleted.

**Scorpius** — head Graffias–Dschubba–Pi (β-δ-π) up through Sigma to Antares
(α), then the curving tail Antares–Larawag–Mu–Zeta–Eta–Sargas–Kappa–Shaula
(ε-μ-ζ-η-θ-κ-λ) to the stinger. Correct.
([Constellation Guide — Scorpius](https://www.constellation-guide.com/constellation-list/scorpius-constellation/))
*Dead data:* anchor index 12 ("Shaula") duplicates index 10 (Lambda); Lambda is
Shaula, and index 10 is the one actually used. Delete the duplicate.

**Crux / Southern Cross** — Acrux–Gacrux (α-γ, vertical) crossing Mimosa–Delta
(β-δ, horizontal). Correct.

**Leo** — the Sickle + triangle: Regulus–Chertan–Denebola / Zosma / Algieba /
Ras Elased. Correct.

### 4.2 The others (portfolio, verified)

Perseus, Gemini (Castor–Pollux), Lyra (Vega + parallelogram), Aquila (Altair
between Tarazed & Alshain), Canis Major (Sirius + Mirzam/Wezen/Adhara/Aludra) —
all use correct IAU positions and reasonable line figures.

### 4.3 Named-star labels (`StarLabels.jsx`) — cross-check

The 16 labelled stars' RA/Dec and distances check out against this report's
table (Sirius 8.6, Canopus 310, Vega 25, Rigel 860, Betelgeuse 550, Deneb 2600,
etc.). One attribution nit: the comment says "distances Gaia DR3 parallax," but
the very brightest stars (Sirius, Vega, Betelgeuse, Canopus, Antares) **saturate
Gaia** and are *not* in DR3 — their distances come from Hipparcos/VLBI/dedicated
studies. Values are fine; the *source label* is imprecise.

### 4.4 Star density & the real night sky (for tuning the field)

- **Naked-eye limit ≈ magnitude 6.5** in a dark sky; the whole celestial sphere
  holds ~9,000 stars to that limit (the catalogue's 8,920 is exactly this set).
  From any one spot at one time only ~1/3 are above the horizon in good
  conditions, i.e. **~2,000–3,000 visible**
  ([Sky & Telescope — naked-eye limit](https://skyandtelescope.org/astronomy-resources/astronomy-questions-answers/naked-eye-magnitude-limit/);
  [BAA — brightness of stars](https://britastro.org/2018/the-brightness-of-stars)).
  Rendering the full 8,920 for a full-sky wrap is therefore *more* than any real
  observer sees at once — correct for an all-sky backdrop, not a horizon view.
- **Twinkling is atmospheric — full stop.** Scintillation is refraction by
  turbulent pockets of air of differing temperature/density; it is strongest near
  the horizon (longest air path) and *absent from space*. Stars are steady when
  viewed from orbit
  ([Britannica — scintillation](https://www.britannica.com/science/scintillation-astronomy);
  [Scientific American](https://www.scientificamerican.com/article/what-makes-stars-twinkle/)).

---

## 5. Discrepancies vs. the current portfolio + recommendations

Ordered by importance. Most items are minor — the system is in good shape.

### 5.1 Twinkle is atmospheric; the scene is in space (design note)
`Stars.jsx` `VERT` shader pulses star size/brightness (`sin(uTime·2.6 + phase)`).
Physically, from the scene's in-space vantage there is **no atmosphere and no
twinkle** — real astronaut/ISS footage shows steady stars.
- **Recommendation:** This is a legitimate *aesthetic* call (a frozen sky reads
  dead), and it's already well-scoped — amplitude `× smoothstep(1,6,aSize)` means
  only bright stars pulse, faint ones stay still. **Keep it, but:** (a) add a code
  comment stating it's an artistic effect, not physical scintillation; (b)
  consider trimming the amplitude (currently ±0.20 size, 0.75–1.0 brightness) for
  a subtler shimmer; (c) if you ever want max accuracy, gate twinkle off in the
  deep-space/finale regime where the "from space" framing is strongest.

### 5.2 Never display a B–V-derived temperature (physics caveat)
Ballesteros saturates (~14,000 K) for the hottest stars (§2.3). The color is
right; a temperature *number* from it would be wrong for O/B stars.
- **Recommendation:** Keep using it for *color* only. If a future "star info"
  overlay wants to show Teff, pull it from a per-star field, not from B–V.

### 5.3 Betelgeuse fact — "swallow Jupiter's orbit" is slightly generous
`objects.js` Betelgeuse beacon: *"~700× the Sun's width … swallow Jupiter's
orbit."* At 764 R☉ its surface reaches ~3.55 AU — **past Mars (1.52 AU) and into
the asteroid belt (~2.7 AU), but short of Jupiter (5.2 AU).** Even the largest
radius estimates (~880–950 R☉ ≈ 4.1–4.4 AU) don't reach Jupiter's orbit.
- **Recommendation:** Change to *"…it would engulf Mars and reach into the
  asteroid belt"* or *"…nearly to Jupiter."* The "~700× the Sun's width" figure
  is correct and can stay.
- The 2025 close-companion ("Siwarħa") fact is current and correct.

### 5.4 Betelgeuse beacon color `#ff6a48` is over-saturated (minor)
The catalogue star renders Betelgeuse as `#ffc696` (a muted orange, per §2.5).
The beacon uses a hot red-orange `#ff6a48`. Real Betelgeuse is a *soft* orange,
not fire-engine red.
- **Recommendation:** Optional. For a stylized beacon this is acceptable license;
  if you want fidelity, shift toward `#ff9a66`/`#ffb07a`. (There is no separate
  Antares beacon in `objects.js` — only Betelgeuse.)

### 5.5 Dead duplicate anchors in Cygnus & Scorpius (cleanup)
`Constellations.jsx`: Cygnus anchors 3 & 6 and Scorpius anchor 12 are duplicate
positions never referenced by any edge (§4.1).
- **Recommendation:** Delete the three dead entries and their comments. Pure
  cleanup — no visual change (they don't render).

### 5.6 Comment/behavior drift (trivial)
The `Constellations.jsx` header says the classic seven are *"especially
prominent,"* but every constellation renders at the same `opacity={0.32}`. Either
implement the emphasis (higher opacity for the seven) or soften the comment.
- **Recommendation:** Lowest priority. If emphasis is wanted, split into two
  `lineSegments` groups at two opacities.

### 5.7 What's already correct — do not "fix"
- **Color math** (Ballesteros + Tanner Helland + coefficients): correct §2.3–2.4.
- **White-mix 0.15:** perceptually justified, keep §2.5.
- **Catalogue** (HYG v4.1, B–V-driven color, brightest-first, stride-5): correct.
- **Apparent-magnitude sizing** (`clamp(1.3 + (6.5−mag)·1.15, 1.3, 11)`):
  brighter = bigger is the right visual encoding; physical R☉ is irrelevant to
  unresolved points §3.2.
- **Equatorial→ecliptic tilt** (23.44° obliquity) so the constellations sit at
  the right angle to the planet plane: correct and a nice touch.
- **All 12 asterism geometries:** accurate §4.

---

## Appendix · Source list

Physics & color:
- [Penn State ASTRO 801 — colors, temperatures, spectral types](https://courses.ems.psu.edu/astro801/content/l4_p2.html)
- [Ohio State — colors, spectra, surface temperatures (Lect. 3)](https://www.astronomy.ohio-state.edu/weinberg.21/Intro/lec3.html)
- [SUNY Stony Brook AST 101 — spectral classification](https://www.astro.sunysb.edu/fwalter/AST101/spt.html)
- [Harre & Heller 2021 — Digital color codes of stars (Astron. Nachr.)](https://onlinelibrary.wiley.com/doi/10.1002/asna.202113868)
- [Ballesteros 2012 B–V↔Teff (via PyAstronomy docs)](https://pyastronomy.readthedocs.io/en/latest/pyaslDoc/aslDoc/aslExt_1Doc/ramirez2005.html)
- [Tanner Helland — temperature→RGB algorithm](https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html)
- [Frosty Drew — why most stars appear white](https://frostydrew.org/observatory/columns/2004/jun.htm)
- [ASU Ask A Biologist — rods & cones](https://askabiologist.asu.edu/rods-and-cones)

Star data:
- [Wikipedia — List of brightest stars](https://en.wikipedia.org/wiki/List_of_brightest_stars)
- [Star-Facts.com — brightest stars](https://www.star-facts.com/brightest-stars/) and per-star pages ([Betelgeuse](https://www.star-facts.com/betelgeuse/), [Regulus](https://www.star-facts.com/regulus/), [Arcturus](https://www.star-facts.com/arcturus/), [Aldebaran](https://www.star-facts.com/aldebaran/))
- [Wikipedia — Rigel](https://en.wikipedia.org/wiki/Rigel), [Arcturus](https://en.wikipedia.org/wiki/Arcturus), [Achernar](https://en.wikipedia.org/wiki/Achernar)
- [Canopus (Star-Facts)](https://www.star-facts.com/canopus/)

Constellations & sky:
- [Constellation Guide — Scorpius](https://www.constellation-guide.com/constellation-list/scorpius-constellation/), [Big Dipper](https://www.constellation-guide.com/big-dipper/), [Northern Cross](https://www.constellation-guide.com/northern-cross/)
- [Wikipedia — Northern Cross (asterism)](https://en.wikipedia.org/wiki/Northern_Cross_(asterism))

Scintillation & density:
- [Britannica — scintillation (astronomy)](https://www.britannica.com/science/scintillation-astronomy)
- [Scientific American — what makes stars twinkle](https://www.scientificamerican.com/article/what-makes-stars-twinkle/)
- [Sky & Telescope — naked-eye magnitude limit](https://skyandtelescope.org/astronomy-resources/astronomy-questions-answers/naked-eye-magnitude-limit/)
- [British Astronomical Association — brightness of stars](https://britastro.org/2018/the-brightness-of-stars)

*Compiled 2026-07-15 for the Stellar portfolio. Values are best-available
consensus; supergiant radii and distances carry real observational uncertainty
and are given as ranges where sources diverge.*
