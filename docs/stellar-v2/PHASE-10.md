# PHASE 10 — Performance, Stability & Warp
*Lock 60fps, kill the jank, and fix the warp glitch.*
**Ship first — it makes everything feel better and fixes a visible bug before the big features land.**

## Why
The audit found two real jank sources plus a few structural costs, and a reproducible warp bug.
Snappiness / zero-lag is a stated goal; the warp glitch is user-visible.

## The warp fix (Saturn→Uranus runs 3× + breaks midway)
- **Root cause:** the magnetic snap (`Navigator.jsx` `lenis.scrollTo`, ~56-66) fires intermediate
  `onScroll` events → `Math.round(progress*(N-1))` (~75-79) oscillates across the .5 boundary →
  multiple `onDestinationChange` → `StellarApp` `applyFocus` re-applies (~329-347) → `CameraRig`
  re-inits the jump on each new `jmpKey` (~523-525), reversing the camera mid-flight.
- **Fix:** (a) `Navigator` `snapping` flag → suppress `onDestinationChange` during the snap animation;
  (b) deadband/hysteresis on `destIdx` (commit the snap-target index up front); (c) `CameraRig`
  active-jump guard → ignore/coalesce a new `jmpKey` while a jump is in flight. Do (a)+(c) minimum.

## Warp visual polish (requested)
- **Longer streaks:** `HyperLoop.jsx` `LEN` 2.6 → ~3.4.
- **Thicker streaks:** `lineBasicMaterial` ignores `linewidth` — swap to `Line2/LineSegments2` +
  `LineMaterial` (worldUnits linewidth) or instanced stretched quads/tubes with a width param.
- **Dark "smudged-black" tunnel:** add a `uWarp` term to `CinematicGrade` that, scaling with
  `warpVelRef`, darkens the frame periphery into a black circular tunnel around the streaks (radial
  `smoothstep`). Single-pass-safe. RM/mobile already skip warp (`HyperLoop` ~237).

## Performance (60fps, snappy)
- **`HomeMarker.jsx` HomeCallout (~98-105):** setState-in-`useFrame` → ref + edge-triggered effect;
  memoize the per-frame `new Date()`. *HIGH — kills 50-150ms stutter near Earth.*
- **`StellarApp.jsx` activeIdx/itemIdx cascade (127-133 / 217-234 / 329-347):** one `useReducer`/store →
  Scene reconciles once per nav, not twice. *HIGH — 30-80ms/nav.*
- **drei `<PerformanceMonitor>` + `dpr={[1,2]}`;** confirm Bloom `mipmapBlur` + high
  `luminanceThreshold` + medium kernel. *HIGH / Low effort.*
- **`BeltDust.jsx` gen (~92-113):** gate / offload the ~480k rejection-sample loop (requestIdleCallback
  or worker).
- **`Scene/index.jsx` (~243-515):** memoized tier wrappers (`<ExtrasTier>/<MidTier>/<EggTier>`) so 40+
  children don't re-evaluate per nav.
- No-alloc-in-`useFrame` sweep; disposal hygiene on belt/dust/ephemeral unmounts; KTX2/basis for big
  textures (8K skybox, planet maps) + prefetch; code-split game-only modules out of the Read bundle.

## Files
`Scene/Navigator.jsx`, `Scene/CameraRig.jsx`, `Scene/HyperLoop.jsx`, `Scene/CinematicGrade.jsx`,
`Scene/HomeMarker.jsx`, `StellarApp.jsx`, `Scene/BeltDust.jsx`, `Scene/index.jsx`.

## Verification
Saturn→Uranus (and every adjacent + skip transition) warps exactly once, no mid-flight reversal;
streaks visibly longer/thicker inside a dark tunnel; r3f-perf / `renderer.info` show steady 60fps
desktop; no setState-in-`useFrame`; E2E desktop/rm/mobile clean (`--use-angle=metal` for Metal-NaN).
