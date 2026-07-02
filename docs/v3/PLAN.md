# Stellar v3 — Implementation Plan

> Branch: `stellar-v3` (cut from `origin/main`). Status: **awaiting design sign-off**.
> Prime directive (unchanged from CLAUDE.md): **scientific accuracy is the goal**; single postprocessing `mainImage` + Bloom only; `multisampling={0}`; reduced-motion + mobile → Read mode.
> One-line thesis: *radically minimal in layout, maximal in motion — a scientifically-accurate solar system that is my résumé, that a recruiter hires on sight.*

Research backing this plan lives in `scratchpad/research-portfolios.md` and `scratchpad/research-space.md` (2025–26 award portfolios, motion patterns, FUI restraint, R3F perf, living starfields; NASA/JPL/ESA/EHT/LIGO per-body specs). Key sources are cited inline.

---

## 0. The four pillars (what v3 is)

1. **Realistic solar system** — every body redesigned for accuracy (Tier-1/2/3 research below).
2. **Premium React motion** — GSAP+Lenis scroll choreography, SplitText reveals, magnetic micro-interactions, a living WebGL starfield.
3. **Radical minimalism** — near-mono dark canvas, editorial type, hairline HUD, generous whitespace, no fuigetry.
4. **The résumé is untouched content** — `/src/content/index.js` + the HoloBridge holograms render my info exactly as today.

---

## 1. Design system (sign-off item A)

Dark canvas, near-white type (**never pure `#fff`/`#000`**), **mono base + one per-body accent** (each stop's real color tints that section's hairlines, labels, active states). Reconciles: minimalist-skill (editorial contrast, flat, invisible motion), ui-ux-pro-max (a11y/timing), FUI restraint (Territory Studio: thin strokes, mono-for-data-only, one accent, purposeful motion, **no fuigetry**), Utopia fluid scales.

### Color tokens
```css
:root{
  /* canvas — layered dark (elevation via lighter surfaces, not shadow) */
  --bg-void:#050609;          /* deepest space */
  --bg-0:#0a0c11;             /* base surface */
  --bg-1:#111520;             /* raised (HUD panels) */
  --line:rgba(255,255,255,.08);/* hairline dividers/frames */
  --line-strong:rgba(255,255,255,.16);
  /* type */
  --fg:#f4f6fb;               /* primary (near-white, ~96%) */
  --fg-dim:#aeb4c2;           /* secondary */
  --fg-mute:#6b7280;          /* mono meta / captions */
  /* accent = per-body, injected as --accent at each stop (defaults to plasma) */
  --accent:#ff7a1a;           /* Sol plasma default */
  --accent-soft:color-mix(in oklab,var(--accent) 22%,transparent);
}
```
**Per-body accent map** (real colors, drives HUD tint per stop): Sun `#ff7a1a` · Mercury `#8a8079` · Venus `#e6c98a` · Earth `#3d7fd6` · Mars `#c1440e` · Jupiter `#d8a06a` · Saturn `#e3c07a` · Uranus `#a9dbe0` · Neptune `#3f66d6` · belts `#9a8f80` · comet `#7fd3ff` · black hole `#ffb14a` · wormhole `#8ea2ff` · nebula `#ff5a8a` · Milky Way `#e8ddc4`.

### Type (premium, elevated per sign-off — "bigger name, more premium, more wow, subtle+bold")
- **Hero display** — **Fraunces** (variable, high-contrast optical-size serif) for the giant name — more expressive/premium than Instrument Serif; italic soft-swash on the accent word. Hero name scale bumped (see `--step-6`), tighter tracking.
- **Section headlines** — **Instrument Serif** (editorial, calmer than the hero).
- **UI / body** — **Space Grotesk** (labels, résumé body, buttons).
- **Data / HUD** — **JetBrains Mono** (coordinates, stats, telemetry, tabular figures).
- All free Google fonts. "Premium" comes from *treatment*: larger scale contrast, tight tracking, generous leading, one italic accent, restraint — not ornament.

### Fluid scale (Utopia `clamp()` — type & space interpolate together)
```css
--step--1:clamp(.8rem,.76rem+.18vw,.9rem);   /* mono caption */
--step-0 :clamp(1rem,.94rem+.3vw,1.15rem);   /* body */
--step-2 :clamp(1.55rem,1.3rem+1.2vw,2.3rem);/* subhead */
--step-4 :clamp(2.7rem,2rem+3.4vw,4.6rem);   /* section head (serif) */
--step-6 :clamp(5.2rem,3rem+9.5vw,10.5rem);  /* hero name (Fraunces) — bumped bigger per sign-off */
--space:  /* 8pt grid: 4 8 12 16 24 32 48 64 96 128 */;
```

### Motion tokens (from motion-foundations; single source of truth)
`duration{instant .08, fast .18, normal .35, slow .6, crawl 1.0}` · `easing.smooth [.22,1,.36,1]` · springs `{snappy 300/30, gentle 120/14, release 200/20}`. **Rules:** transform+opacity only; `initial` matches SSR; **reduced-motion disables all transforms** (opacity ≤.2s fallback); tokens never inlined.

### HUD language (FUI restraint)
Hairline frames (1px `--line`), corner ticks, one accent, **mono only for data** (RA/DEC coordinates, distance-in-AU, rotation period readouts that tick live), a single slow scan sweep per stop. No blinking decoration that measures nothing.

---

## 2. Experience model (sign-off item B)

### First page — the "whole system" hero (SIGNED OFF)
The v2 **system-overview view, reversed** — Sun on the far right, planets revolving around it filling the **middle**, personal info **far-left**:
- **Full solar system from outside** (system-overview framing), not a single-body focus.
- **Sun on the FAR-RIGHT** — the orbits are centered on the Sun, so the visible orbital arcs + revolving planets **sweep across the middle** of the screen toward the left.
- **Planets revolve live** along those arcs (real orbital motion, small).
- **Personal info FAR-LEFT** — big Fraunces name, Space Grotesk role, mono availability + CTAs — content straight from `/src/content/index.js` (unchanged).
- Living starfield + pointer parallax behind everything.
- **Sun render = accurate white photosphere** (see §6.1), de-emphasized by scale/position, not by a false color.

### Scroll advances body-by-body (each stop shifts one ahead)
Scroll = the playhead. Sun → intro/overview, Mercury → fun facts, then every subsequent body shifts one section ahead. The camera scrubs between bodies using the **existing CameraRig framing (kept as-is)**; only the scroll→index driver and the hero framing change. GSAP ScrollTrigger scrubs a timeline that drives `scrollTRef` (ref-driven, no React state churn per frame).

### Modes retained
- **Read/tour** (default; mobile + reduced-motion forced here).
- **Pilot** (free-flight cockpit) — kept, warp removed from it.
- **Galaxy overview** — the hero framing *is* an overview; keep a pull-out to Milky Way as the final stop.

---

## 3. The tour map (sign-off item C — full extended stop list)

All natural + cosmic objects are stops. Résumé sections map to bodies (content unchanged); deep-space objects are **cosmic interludes** that carry space "wow" facts and act as chapter transitions. Order + section mapping (extends the previously signed-off map):

| # | Stop | Kind | Section (content) | Space payload (wow facts) |
|---|------|------|-------------------|---------------------------|
| 00 | **System** | hero | — (name/role/CTAs) | whole-system establishing shot |
| 01 | **Sun** | star | intro / overview | white-in-space vs 304Å look; 109× Earth; corona 200× hotter |
| 02 | **Mercury** | planet | fun facts | 88-day year; 600°C swing; polar ice |
| 03 | **Venus** | planet | about | hottest planet; spins backwards; day>year |
| 04 | **Earth + Luna** | planet+moon | education | Blue Marble; city-lit night side; tidally-locked Moon |
| 05 | **Mars + Phobos/Deimos** | planet+moons | experience | Olympus Mons 22km; Valles Marineris 4000km |
| 06 | **Asteroid Belt (Ceres/Vesta)** | belt | *interlude* → testimonials | "failed planet"; belt is mostly empty; Ceres salt spots |
| 07 | **Jupiter + Galileans** | planet+moons | flagship projects | GRS 300yr storm; Io volcanism; Europa ocean; Ganymede>Mercury |
| 08 | **Saturn + rings/Titan/Enceladus** | planet+rings+moons | skills | Cassini Division (real gap); would float; Titan methane seas |
| 09 | **Uranus + Miranda** | planet+moon | more projects / OSS | tipped 98°; vertical rings; coldest atmosphere |
| 10 | **Neptune + Triton** | planet+moon | achievements | 2000km/h winds; found by math; retrograde Triton |
| 11 | **Kuiper Belt (Pluto/Charon, Eris, Haumea, Makemake)** | belt | *interlude* → blog | Pluto's convecting heart; Haumea ring + egg shape |
| 12 | **Comet** | comet | writing / blog | two tails always anti-sunward (blue ion + curved dust) |
| 13 | **Heliopause / Oort Cloud** | boundary | *interlude* → the-edge | Voyager crossed at ~120 AU; Oort is a sphere to ~100,000 AU |
| 14 | **Black Hole** (Gargantua + Sgr A* contrast) | exotic | standout / signature | asymmetric ring + shadow; stellar-mass vs 4.3M☉ Sgr A* |
| 15 | **Wormhole** | exotic | *interlude* → connect | crystal-ball sphere showing elsewhere; theoretical |
| 16 | **Nebula** (Pillars / Orion) | nebula | hobbies / creative | 4 physically-distinct color types; star nursery |
| 17 | **Pulsar / Neutron star** | exotic | *interlude* → signal | city-sized; sugar-cube = humanity's mass; lighthouse beams |
| 18 | **Milky Way** | galaxy | contact | you-are-here (Orion Arm); 100k ly; pull-out finale |

~18 stops is long; **Q3** below asks whether to ship the full set or a condensed ~13. Interlude stops without résumé content show a mono space-fact card + one line tying to the next chapter.

---

## 4. What we REMOVE

### Warp effect — entirely (per your instruction)
Delete/retire: `WarpOpening.jsx`, `HyperspaceArrival.jsx`, `ShipWarp.jsx`, `HyperLoop.jsx`, `StellarDrift.jsx`, `BloomPulse.jsx`, and the `uWarp` tunnel inside `CinematicGrade.jsx`. Strip `warpVelRef` from `CinematicGrade`, `Scene/index.jsx`, `StellarApp.jsx`, `Navigator.jsx`, `CameraRig.jsx`. Replace `launchPhase` establish→warp with an instant/eased cut to the hero. Remove `stellar:whoosh`, `stellar:intro:warpdone` events. Keep `Bloom` directly in the EffectComposer (it was only *pulsed* by warp).

**Camera angle + lens stay identical** — CameraRig framing, FOV constants, backlit framing, dwell-ease, orbit-tracking, parallax, CameraShake, KeyLight, MouseParallax are **not touched**. Only the warp-driven camera *cinematics* (establish pull-back, warp dive) are swapped for a clean cut.

### UX clutter cut (from v3 direction)
⌘K command palette, Explorer ranks/achievements/discoveries HUD, overview-map chrome as a separate mode, sound toggle. Also (already decided) **all** spacecraft/probes/stations/pop-culture cameos/easter-eggs/aurora — solar system model = **natural objects only**.

---

## 5. What we KEEP untouched

- `/src/content/index.js` — all personal data (single source of truth).
- The **HoloBridge holograms** (`HeroHologram`, `FactsHologram`, `DossierHologram`) that render résumé sections — content + data flow unchanged; only their *skin* adopts the new tokens.
- **CameraRig.jsx** + camera/lens helpers — as-is.
- Postprocessing hard constraints: one custom `mainImage` (CinematicGrade, minus warp) + Bloom, `multisampling={0}`, `disableNormalPass`, ACES tone-map.
- The `config/destinations.js` real-AU scaling + `remapPosition()` system.

---

## 6. What we MODIFY (per the deep space research)

### 6.1 The Sun — accurate white photosphere (DEFAULT, per sign-off)
Accuracy wins (consistent with CLAUDE.md's prime directive). Keep `Sun.jsx`'s shader structure; default look = **near-white granulated photosphere** (5,778 K blackbody = white in space): rice-grain **granulation**, drifting **sunspots** (dark umbra + filamentary penumbra), **limb darkening** (I(μ)≈0.3+0.93μ−0.23μ²), faint bright **faculae** near the limb, thin reddish **chromosphere rim**. Uniforms shift toward white/very-faint-warm (not orange). Corona shells (subtly cooler/white) + pointLight stay. Over-bright base so Bloom halos it into a star; sunspots stay dark through Bloom.
**Optional "Active Sun" mode** — the SOHO/SDO **304Å orange-red EUV** look (your reference image): warm orange-red, prominence loop off the limb, stronger spots. Toggleable, clearly a stylized/false-color view, not the default.

### 6.2 Every planet — accuracy pass (shared `Planet.jsx` + per-body `destinations.js` config; no per-body components)
Data-driven edits to each destination entry (radius/tilt/rotation/eccentricity from the JPL table in `research-space.md`) + material/texture tuning:
- **Mercury** — muted grey-tan, Moon-like cratering, Caloris basin, scarps; tilt ~0°.
- **Venus** — featureless brilliant cream-yellow sulfuric cloud deck; optional UV-swirl reveal layer; retrograde slow spin.
- **Earth** — Blue Marble day map + **night-lights emissive** + cloud layer; 23.44° tilt; **Luna** grey maria/highlands, tidally locked.
- **Mars** — rust-orange, **Olympus Mons + Valles Marineris**, seasonal polar caps; Phobos/Deimos potatoes.
- **Jupiter** — banded zones/belts + **Great Red Spot**; oblate bulge (9.9h spin); Galileans distinct: **Io** sulfur-yellow, **Europa** ice + red lineae, **Ganymede** two-tone grooved, **Callisto** dark cratered.
- **Saturn** — butterscotch bands + **real ring gaps** (D/C/B/**Cassini Division**/A/**Encke**/F) as geometry, ring shadows, edge-on thinness; **Titan** haze globe, **Enceladus** white geysers, **Mimas** Herschel crater.
- **Uranus** — **desaturated pale cyan** (accuracy: not neon), 97.8° tilt, **near-vertical rings**; Miranda chaotic terrain.
- **Neptune** — **paler azure** (accuracy: not Voyager-neon), Great Dark Spot + white cirrus; **Triton** retrograde, cantaloupe terrain, N₂ geysers.
- **Dwarfs** — Pluto (Tombaugh heart, Sputnik Planitia) + Charon binary; Eris bright frost; **Haumea** egg + ring; Makemake red-brown.

### 6.3 New space objects (accuracy-critical rendering)
- **Asteroid & Kuiper belts** — **sparse, empty-looking** instanced tumbling rocks (drei `<Instances>`), never a Hollywood wall. Kuiper = icy, dimmer, wider ring.
- **Oort cloud** — faint spherical shell (not a ring), only readable on the Milky Way pull-out.
- **Comet** — dark nucleus + green coma + **two tails always anti-sunward** (straight blue ion + curved yellow-white dust). Points/shader tails.
- **Heliosphere/heliopause** — faint teardrop bubble (nose + heliotail), not a sphere.
- **Black hole** — orange-gold **asymmetric ring + dark shadow + photon ring**; Gargantua option: disk wrapping over/under + Einstein-ring halo (single-pass shader, respects postprocessing constraint). Content contrasts stellar-mass vs Sgr A* (4.3M☉) vs M87* (6.5B☉).
- **Wormhole** — refractive **sphere showing a warped starfield of elsewhere** + lensed rim (not a funnel).
- **Nebula** — layered transparent planes / FBM-noise shader; render the four types by color mechanism (emission red, reflection blue, dark silhouette, planetary shell). Feature Pillars/Orion.
- **Pulsar/neutron star** — tiny blue-white sphere + sweeping polar beams.
- **Milky Way** — barred-spiral backdrop, "you are here" in the Orion Arm; the finale pull-out.

### 6.4 Living background (all stops)
Single GPU `THREE.Points` starfield: per-star `sin`-phase **twinkle** (zero CPU), slow **drift**, **2–3 parallax depth layers** reacting to pointer + smoothed scroll, additive + `depthWrite:false` + Bloom halos, `sizeAttenuation` in-shader. Optional far FBM-nebula haze for depth. Reduced-motion → static field.

---

## 7. Motion system (the "premium effects")

- **Lenis ↔ GSAP single rAF** — `lenis.on('scroll',ScrollTrigger.update)`; `gsap.ticker.add(t=>lenis.raf(t*1000))`; `lagSmoothing(0)`; `autoRaf:false`. One loop drives smooth scroll, ScrollTrigger scrub, and the camera scrub. (darkroom/Lenis + GSAP docs.)
- **Camera scrub** — ScrollTrigger scrubs `scrollTRef`; CameraRig consumes it exactly as today (ref-driven, no per-frame React state).
- **Text reveals** — GSAP **SplitText** masked line/char reveals synced to each stop's arrival (`mask:"lines"`, stagger, `autoSplit` for font/resize safety).
- **Magnetic micro-interactions** — magnetic CTAs (`gsap.quickTo` x/y from pointer offset), spring cursor follower with hover label swap, hover physics on interactive HUD chips. `motion/react` for DOM component states.
- **Transitions** — section/chapter transitions via GSAP timelines (mono coordinate readout re-typing, hairline frame redraw, accent cross-fade); optional View-Transitions/Flip for any DOM grid→detail.
- **Parallax & depth** — starfield depth layers + pointer parallax (existing MouseParallax on camera stays); subtle scroll-velocity tilt on HUD.
- **Accessibility** — everything gated by `shouldAnimate()`; reduced-motion & mobile → static, opacity-only, Read mode.

---

## 8. Performance plan

`dpr={[1,2]}` clamp (kept) · `<PerformanceMonitor>` sheds DPR/post under load · **instancing** for belts/starfield · drei `<Detailed>` **LOD** for distant bodies · `THREE.Points` for stars (one draw call) · **KTX2** compressed textures where we add maps · Bloom restraint (`luminanceThreshold` high, only Sun/exotics opt-in via `toneMapped={false}`) · frame-rate-independent `delta` motion · consider `frameloop="demand"` for paused stops. Verify with r3f `<Perf>` during dev.

---

## 9. Build phases (each ends at a dev-server verification gate)

0. **Scaffold** — v3 behind `#v3` route; wire tokens (`holoTokens`/CSS vars), fonts, Lenis↔GSAP single-rAF loop. `#stellar` (v2) stays working.
1. **Warp removal** — delete the 6 files + strip `warpVelRef`/events; clean cut to hero; confirm camera/lens unchanged. *(one commit per pattern: "remove warp visuals", "strip warpVelRef", "clean intro cut".)*
2. **Hero composition** — full-system framing, Sun far-right, planets orbiting left, info far-left; starfield + parallax.
3. **Motion core** — SplitText reveals + magnetic interactions + camera scrub + chapter transitions.
4. **Sun restyle** — SOHO look (§6.1).
5. **Planet accuracy pass** — data + materials for all 8 + moons/rings/dwarfs (§6.2), one planet-group per commit.
6. **New objects** — belts, comet, heliopause, black hole, wormhole, nebula, pulsar, Milky Way (§6.3), tour-order wiring.
7. **Living background polish** + FUI HUD skin.
8. **Perf + a11y pass** — LOD/instancing/DPR/reduced-motion/mobile; verify Read-mode forcing.
9. **Full-tour QA** — every stop, scrub both directions, screenshot proof.

Commits local-only on `stellar-v3`; **push only on explicit approval** (personal GitHub, git-only via `github.com-personal`, never `gh`).

---

## 10. Decisions — SIGNED OFF (2026-07-01)

- **Design system** ✅ approved. Refinement: **bigger hero name, more premium type & wow (subtle + bold)** → Fraunces hero display, `--step-6` bumped, elevated treatment.
- **Hero composition** ✅ Sun far-right; orbits centered on it so planets revolve through the middle; info far-left (v2 system-overview, reversed).
- **Tour length** ✅ full ~18-stop tour (all cosmic objects).
- **Sun** ✅ **accurate white photosphere = default**; SOHO orange-red = optional "Active Sun" mode.

**Build is greenlit.** Next: Phase 0 scaffold (v3 route, tokens, fonts, Lenis↔GSAP single-rAF loop), then phases 1–9 with dev-server verification gates. Commits local-only; push only on explicit approval.
