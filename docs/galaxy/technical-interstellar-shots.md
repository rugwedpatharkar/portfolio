# Technical — the Interstellar-shot catalog (under the hard constraints)

Which "famous movie shot" techniques we can achieve, given the two hard rules
(one custom `mainImage` + Bloom; `multisampling={0}` — see `technical-scale-regimes.md`
§6). Derived from the cinematic-pipeline audit of `CameraRig.jsx` / `Scene/index.jsx`
/ `CinematicGrade.jsx` / `Sun.jsx` / `LensFlare.jsx` / `BlackHole.jsx`.

**The rule of thumb:** anything that is fundamentally a **screen-space post pass**
(reads the rendered frame/depth) collides with the single-`mainImage` merge → added
as a sibling effect it renders the frame **WHITE**. Two escape hatches keep us safe:
**(A)** do it in **object/world space** as scene-graph meshes/sprites/shaders (the
codebase's existing pattern), or **(B)** fold it into `CinematicGrade`'s **one**
`mainImage`. Only abandoning `postprocessing`'s auto-merging `EffectComposer` (a
hand-rolled composer) unlocks true multi-pass — the one architectural line we don't
cross unless forced, and even then `multisampling=0` + additive HDR compositing must
be preserved.

## Feasibility table

| Shot (film reference) | Today | Verdict | How (within constraints) |
|---|---|---|---|
| **Gravitational lensing — Gargantua** *(Interstellar)* | faked object-space halo + photon ring (`BlackHole.jsx`); background NOT bent | ✅ **feasible** | Object-space **raymarch on a proxy sphere that samples the skybox cubemap** and bends the real starfield around the hole — no post pass (hatch A). Real *screen-space* bending of the scene = ❌ (2nd `mainImage`). |
| **Volumetric god-rays / crepuscular shafts** *(Interstellar, 2001)* | none (bloom-on-overbright only) | ✅ **feasible** | Additive "shaft" sprites at the Sun/backlit bodies (like `LensFlare`), OR analytic rays folded into `CinematicGrade` (march toward the sun's screen-pos). Stock `GodRays` pass = ❌. |
| **Anamorphic lens flare** *(J.J. Abrams et al.)* | **already implemented** — `LensFlare.jsx` object-space additive sprites (glare, starburst, blue anamorphic streak, ghosts) | ✅ **done** | Extend/tune the existing sprites. Free. |
| **Film grain** | none (only vignette-breathe) | ✅ **feasible** | ~3 lines inside `CinematicGrade`'s existing `mainImage` (`hash(uv+uTime)`), zero new passes (hatch B). Cleanest new film-look win. |
| **Star-field parallax pull-out** *(the "powers of ten" reveal)* | none (stars pinned to a sphere) | ✅ **feasible** | Enabled purely by the **stride-5 `distLy`** depth in the local regime — the camera move does the work, no post effect. |
| **Accretion-disk Doppler beaming** *(Gargantua's asymmetric disk)* | present in `BlackHole.jsx` (object-space) | ✅ **done/extendable** | Object-space shader; refine the beaming/redshift. |
| **Depth of field / bokeh** | deliberately removed (DPR raised instead) | ❌ **rework** | Stock `DepthOfField` = depth-sampling `mainImage` → WHITE. Also the additive `depthWrite:false` overlays wouldn't blur correctly. Only via folding into the one mainImage or a hand-rolled composer. |
| **Motion blur** | none (speed faked via FOV-widen + warp streaks + banking) | ❌ **rework (hardest)** | Needs a velocity buffer + resolve pass → WHITE, and MRT velocity fights `disableNormalPass` + additive overlays. Keep the warp-streak/FOV cheat. |
| **Real screen-space lensing of the whole scene** | — | ❌ **rework** | Inherently a post pass → 2nd `mainImage`. Use the object-space cubemap version instead. |

## What we lock for the render phases
**Green-light (no architecture change):** cubemap gravitational lensing, god-ray
shafts, film grain (in `CinematicGrade`), extended lens flare + Doppler disk, and the
star-field parallax pull-out. These deliver the premium "Interstellar" register
entirely through object-space fakes + the one grade pass.

**Off the table (unless we later hand-roll the composer):** true DOF/bokeh, motion
blur, real screen-space scene lensing. Their cinematic *intent* is substituted by the
green-lit techniques (e.g. warp streaks + FOV for speed; bloom + flare for glow).

## Camera (already strong — reuse)
`CameraRig.jsx` already gives asymmetric dwell, backlit hero framing, live orbital
tracking, slow push-in, dutch banking, and a 3rd→1st→3rd hyperspace fly-through — the
premium camera vocabulary the pull-back finale + shot passes will build on, not replace.

## Sources
Internal: the cinematic-pipeline audit (this repo). External technique references:
the `postprocessing` library `EffectPass` merge behavior; Interstellar VFX
(Double Negative / James et al. 2015, *"Gravitational lensing by spinning black
holes"*, Class. Quantum Grav.) for the Gargantua look.
