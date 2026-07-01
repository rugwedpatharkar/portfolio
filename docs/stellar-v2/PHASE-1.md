# PHASE 1 — THE ARRIVAL
*The headline. The visitor must **earn** the world — replace the cold load with the 8-beat intro.*
**Milestone M4 · Plan Part I**

## Why this is the priority after Phase 0
The original v2 thesis was "the world is never *earned*." It's still true: `StellarApp.jsx` has a
hardcoded `const shipWarpDone = true`, so the app drops straight into the tour. The tech to fix it
already exists as **dead code** — we just wire it into a real state machine.

## What already exists to reuse (DON'T rebuild from scratch)
- `CameraRig.jsx` — `establish` and `warp` cinematic launch branches are live (see `ESTABLISH_POS`,
  `WARP_DUR`, `launchPhase` handling). Drives the pull-back + dive.
- `HyperLoop.jsx` — the fresh-built warp streak tube, driven by `warpVelRef`.
- `WarpOpening.jsx` / `ShipWarp.jsx` — arrival decay / launch burst (exist, unmounted).
- `SoundManager` — already listens for `stellar:sound:hum/beep/jump/arrival`.
- `Navigator`/Lenis scroll-lock; `extrasPhase` tiered mount.

## Build principle (firm)
Rebuild the *crawl / countdown / arrival* **fresh in the new look** — git history is reference for
technique/spec only, not a verbatim restore. (HyperLoop was already done this way.)

## The 8 beats
black + bridge-hum → **opening crawl** → deep-space hold → **navicomputer countdown** → **hyperspace
tube** → **decel (collapse to points)** → **arrival + HUD boot** → hand to tour.

## Sub-phases (each viewable on `:5175`)
- **1A — Gate skeleton + skip.** Replace `shipWarpDone=true` with `const [introDone,setIntroDone]=
  useState(false)`; add `launchPhase` state + `warpVelRef`; `introEnabled = !(reducedMotion||isMobile)`.
  Minimal `IntroSequence` (1s black → `onDone`). Add `introDone` to the Lenis scroll-lock. Rename
  every `shipWarpDone`→`introDone` (incl. the hash-deep-link effect + the `{shipWarpDone && (…)}` UI
  block). *Check:* desktop 1s black→tour; RM/mobile instant tour.
- **1B — Camera cinematic.** Drive `onLaunchPhase("establish")` → `"warp"` → CameraRig flips back to
  `null` via its **clock-driven** `onLaunchComplete` (not a wall timer). *Check:* pull to oblique →
  dive into Sol → tube fills then collapses to points → lands on Sol framing; no mid-warp snap on a
  throttled refresh.
- **1C — Opening crawl.** `OpeningCrawl.jsx`: receding 3D-transform text (name/title/tagline from
  `personalInfo`) into a star layer; skippable (click/key/scroll/pill); auto-advance ~7s. *Check:*
  recedes into stars; all skip paths jump to countdown; RM skips.
- **1D — Countdown + arrival boot.** `NavicomputerCountdown.jsx` ("HYPERSPACE JUMP IN 3·2·1" +
  bracket reticle + coords-lock; per-tick `stellar:sound:beep`; `onComplete`→`stellar:sound:jump`).
  `HyperspaceArrival.jsx` (SVG canopy + reticle draw-in via `pathLength`; subtitle "Dropping out of
  hyperspace — Sol system"). Wire the full enum `idle→crawl→countdown→warp→decel→arrive→done`.
  *Check:* full flow end-to-end.
- **1E — Sound wiring.** Dispatch `stellar:sound:hum` (idle), `:beep` (each tick), `:jump` (warp
  start), `:arrival` (arrive); re-confirm planet-switch `stellar:whoosh`. *Check:* first gesture
  un-mutes hum; ticks beep; jump/arrival cue; no errors if SoundManager absent.

## Orchestration
Gate in `StellarApp`; `IntroSequence` owns the fine enum; StellarApp owns coarse `launchPhase` +
`introDone`. Reduced-motion/mobile: `IntroSequence` runs `useEffect(()=>onDone(),[])` and returns
null → `introDone` true first commit, `mode` stays `"tour"`, CameraRig initial Sol pose (identical to
today). Extend the WarpStreaks/HyperLoop gate to `!reducedMotion && !isMobile`.

## Critical gotchas (verified historically)
- Warp tube stays an **in-scene additive mesh, never a post pass** (EffectComposer stays
  `CinematicGrade + Bloom`, `multisampling=0`).
- **Gate `extrasPhase` tiered-mount on `introDone`** — don't build ~140k belt particles *during* the
  warp (freezes it). RM/mobile still jump to `extrasPhase=3` immediately.
- **Clock-driven handoff** (not wall-clock) prevents a mid-warp snap on slow loads. Keep a ~5s safety net.
- Scroll-lock: add `introDone` to the Lenis lock so crawl wheel-to-skip doesn't scrub the tour underneath.

## Files
- New: `src/stellar/IntroSequence.jsx`, `OpeningCrawl.jsx`, `NavicomputerCountdown.jsx`,
  `HyperspaceArrival.jsx`.
- Modify: `StellarApp.jsx` (gate + state + mount), `CameraRig.jsx` (confirm `warpVelRef` writer),
  `Scene/index.jsx` (intro-gate the streak/extras mounts).

## Pop-culture layer (taste)
Opening crawl + lightspeed nod (Star Wars), navicomputer countdown (Falcon jump), arrival drop
(Interstellar). Keep it original/trademark-safe (no SW logo/crawl font) per the locked creative frame.

## Verification
- Full crawl→arrival flow on desktop; RM + mobile → instant tour; no white frame; no mid-warp snap
  on throttled refresh; first gesture un-mutes the hum; hash deep-links still work after intro.
