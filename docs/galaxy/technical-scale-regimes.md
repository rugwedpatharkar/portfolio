# Technical — scale regimes (the view-from-within staged strategy)

How we render "the Milky Way from our solar system" **without** a floating-origin /
log-depth engine. This is the crux the whole vision hinges on.

## 1. Why one continuous coordinate space is impossible

`1 ly = 63,241 AU`. The solar regime uses `AU_UNIT = 95` scene-units/AU
(`config/destinations.js`), so a single linear space would put:
- Pluto at ~3,750 su (39.5 AU), the current Oort shell at ~6,800 su — fine.
- The **nearest star** (Proxima, 4.24 ly) at `4.24 × 63,241 × 95 ≈ 2.5×10⁷ su`.
- The galactic center at `26,670 ly × … ≈ 1.6×10¹¹ su`.

`float32` has ~7 significant digits. A single space spanning AU detail *and* even the
local neighborhood (~10⁷ su) loses all sub-planet precision → vertex jitter, z-fighting.
The current camera is `near 0.1, far 14000` (`Scene/index.jsx`) with **no** log-depth
buffer. **Conclusion:** we do NOT fly continuously from planets to stars.

## 2. The solution — discrete scale regimes + a cinematic powers-of-ten cut

Two regimes, each self-contained, both living inside the **existing `far=14000`**:

| Regime | Unit | Scale | Spans | Anchor |
|---|---|---|---|---|
| **solar** *(existing)* | AU | `AU_UNIT = 95` su/AU | 0 → ~40 AU (Pluto ~3,750 su); backdrop shells to ~7,000 su | origin (Sun) |
| **local** *(new)* | ly | `LY_UNIT ≈ 5–8` su/ly *(tuned)* | 0 → ~1,500–2,000 ly (→ ~10,000 su, < far) | Sun at origin |

→ `config/scaleRegimes.js` = `{ AU_UNIT (imported), LY_UNIT, SCALE_REGIMES[], REGIME_HANDOFF }`.

**The handoff is a cinematic cut, not a zoom.** In the pull-back finale the camera
retreats through the solar regime; at `REGIME_HANDOFF` (a pull-back distance /
scroll point) the AU-scale solar system **collapses to the Sun-as-a-sprite** and a
short **cross-dissolve** swaps in the local regime (nearby stars + the band). The
empty orders of magnitude between 40 AU and 4 ly are never traversed — the cut hides
them (the "powers of ten" jump). Reduced-motion → a plain fade, same end state.

Why `LY_UNIT ≈ 5–8`: nearest star 4.24 ly → ~21–34 su (visible separation from the
Sun); 1,000 ly → 5,000–8,000 su; ~1,500 ly → ≤12,000 su, safely inside `far=14000`.
**No far-clip change, no floating-origin, no log-depth.** Final value tuned against
the pull-back framing in the render phase.

## 3. The band is a BACKDROP, not geometry at true distance

The galaxy's disk extends 50,000+ ly — we never place those stars. Instead the
**band** is rendered as an accurate **sky backdrop** (a far dome/sphere at ~7,000–
13,000 su, in front of / replacing today's decorative `Scene/MilkyWay.jsx`):
- Its bright great circle is fixed by the **galactic pole + center directions**
  (`astronomy-milky-way.md` §5) → the band sits where it really is on our sky.
- Brightness is **center-biased** (peaks toward Sagittarius/the bulge, fades to the
  anticenter) using `galaxy.js` arm density projected along each sky direction.
- **Dust lanes** (Great Rift, Coalsack) darken it where they really are.
- This is view-locked to the Sun's vantage in BOTH regimes — it's the constant
  "we're inside the galaxy" cue.

## 4. Where the star catalog's distances go (`brightStars.js` stride-5)

- **Solar regime:** `distLy` is **ignored** — all 8,920 stars stay on the fixed
  `R=6800` celestial sphere exactly as today (the pixel-stable regression gate).
- **Local regime:** stars with a **known** `distLy` within the regime cap place at
  `distLy × LY_UNIT` (true 3D depth → the parallax pull-out). Stars with `distLy = 0`
  (unknown parallax) or beyond the cap stay on the far backdrop sphere as part of the
  band/faint sky.

## 5. Reuse & non-regression
- `remapRadius`/`remapPosition`/`frontOfSun`/`AU_UNIT` stay the **single source for
  solar scale**; `LY_UNIT` + `galaxy.js` are the **single source for galactic scale**.
  No existing call site changes.
- `galaxy.js` + `scaleRegimes.js` are **pure data, unimported by the running scene**
  until the render phase → they cannot regress the app; they ship with an assert
  self-check (see `data-schemas.md`).

## 6. The two hard postprocessing constraints (carried into all render phases)
- **Exactly ONE custom `mainImage` effect** (`CinematicGrade`) + Bloom. The
  `postprocessing` `EffectComposer` merges all `mainImage` effects into one shader;
  on this version, 2+ merged → the whole frame renders **WHITE**. New screen-space
  effects must fold into `CinematicGrade` or be done object-space. (Tone-mapping +
  auto-exposure are renderer-side for the same reason.)
- **`multisampling={0}`.** The scene composites additive `toneMapped:false` HDR
  overlays (Sun, corona, flares, black-hole disk); MSAA resolve breaks additive
  compositing → black flicker. AA stays DPR-based (2× supersample).

See `technical-interstellar-shots.md` for what this permits.
