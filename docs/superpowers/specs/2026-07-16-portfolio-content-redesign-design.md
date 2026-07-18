# Portfolio content-layer redesign — "Constellation of Dossiers"

**Date:** 2026-07-16
**Status:** Superseded — see 2026-07-18 amendment below (spine simplified to
"editorial spread at every stop" after user rejected cards; state machine and
`Dossier` wrapper primitive dropped as YAGNI).
**Scope:** Redesign the CONTENT + CHROME layer only — fonts, loading screen, and every
information section (hero → contact). The 3D experience — Milky-Way view, solar-system
view, and the scroll tour (camera rig, planets, belts, finale) — is **kept exactly as-is**.

---

## Amendment 2026-07-18 — as-shipped state

The design shipped with the following differences from the original spec:

- **Spine simplified.** The hero-⇄-dossier two-state ("compact glanceable card
  that expands into a rich dossier") was dropped after the user rejected the
  card visual. Each section renders its full spread directly at its stop. The
  shared `Dossier` wrapper primitive and the `useSyncExternalStore` scroll-store
  were skipped as YAGNI — sections read data via direct imports.
- **Fonts.** Settled on **Syne · Sora · Space Mono** after a live comparison
  (the initially proposed Fraunces / Space Grotesk / Space Mono triad was
  swapped when the user asked for something more unique and eye-catching).
- **Section format = directory + featured detail.** All 12 sections use the
  same interaction pattern (left directory of items + right featured detail),
  with per-content-type variations (Experience track accordion, Skills Ranked
  Ladder, FunFacts editorial rows, Achievements year-grouped list, etc.). No
  cards, no boxes, no borders — hairlines only, transparent surfaces so the
  planet stays visible.
- **Skills** shipped as a proficiency **Ranked Ladder** (typography-only,
  4 tiers) rather than the originally-planned SVG star-field constellation
  (which crowded at 15+ skills per category). A single glowing hairline traces
  the tier-1 signature constellation on the left.
- **Read-mode softening** (CSS `:has()` tint + ref-driven DPR/bloom drop) was
  not implemented — the existing `V3Scrim` gradient behind the panel already
  gives sufficient text-substrate contrast, and every section already sits in
  its own hairline-bordered area on the left half of the viewport.
- **Ambient mission-control effects** (added 2026-07-18): `V3MissionClock`
  (bottom-left transit/stop readout), `V3ArrivalBeat` (top-right SIGNAL LOCK
  ping on each stop arrival), `V3SaganQuote` (bottom-right rotating cosmos
  quote), HUD reticle cursor (`V3Cursor`), starlight text-glow on Syne headings,
  numeric count-up on FunFacts values, kicker telemetry typewriter, ghost-R
  cursor parallax on Hero.
- **Mobile responsive fallback** — global media query at max-width: 1023px
  collapses every section's 2-column grid to a single stacked column and
  enables vertical scroll inside the panel.
- **Hero** shipped with the "Layered Cinematic" direction (giant ghost R,
  massive Syne name, italic Sol-gold surname, longer role sentence).
- **BootLoader** shipped as a full-viewport telemetry "systems online" screen
  with real progress checkpoints and Syne name reveal.

Total: 20+ commits landing the shipped redesign. See `feat(redesign)` and
`feat(effects)` in `git log`.

---

---

## 1. Goal & problem

The portfolio is a scientifically-accurate 3D solar-system/Milky-Way tour. The owner has a
large, complete senior-engineer résumé (9 skill categories / ~90 skills, a deep multi-track
current role, many projects, education, achievements, testimonials, fun-facts, pillars,
hobbies, notes, contact). Today each section is a bespoke left-column panel overlaid on the
live scene; it feels cramped, template-y, and secondary to the planet.

**The design must showcase the information AND the space tour equally**, at a rich, premium,
deep-space, elegant level — without touching the 3D tour.

**Success criteria**
- Every section can hold its full depth without feeling cramped, via a calm two-level reveal.
- The content reads as *one* premium editorial system (not 12 bespoke templates).
- At a stop, content gets a genuine hero moment; between stops the tour is fully cinematic.
- 60fps preserved; the 3D tour code and behavior are unchanged.
- Reduced-motion + mobile keep the existing snap behavior.

**Non-goals:** changing the camera/tour/3D scene; adding control-surface UI (per
`[[feedback_no_control_surface_ui]]`); routing/multi-page; a CMS.

---

## 2. Hard constraints (inherited)

- **Do not modify** the 3D tour: `Navigator.jsx`, `CameraRig.jsx` + `camera/*`, the Scene 3D
  layers, Milky-Way/solar-system/finale. Content reads scroll via the existing `scrollTRef`;
  it never becomes a second scroll owner.
- **Single postprocessing `mainImage`** (CinematicGrade) + Bloom. Grain/vignette fold INTO
  CinematicGrade — never a second post pass. `multisampling={0}` stays.
- **Reduced-motion + mobile → snap** (no fly-through); all content motion gates behind
  `useReducedMotion` / `MotionConfig reducedMotion="user"` and degrades to fades.
- **No control-surface UI** (no settings/quality/audio toggles). Perf handled by invisible
  adaptive logic.
- Lenis stays the sole scroll owner. **No GSAP, no drei `ScrollControls`** (both fight Lenis).

---

## 3. Design system (the foundation everything is drawn in)

### 3.1 Color — near-black depth ladder + one warm accent
Never `#000`. A layered blue-black depth hierarchy so surfaces read as *depth*, not flatness:

- `--space-void: #0a0b12` — root / behind everything
- `--space-panel: #10131f` — dossier surface
- `--space-elevated: #161a2b` — raised cards within a dossier
- `--space-line: rgba(255,255,255,0.10)` / `--space-line-strong: rgba(255,255,255,0.18)` — hairlines
- Text: `--fg #eef1f7`-class light, `--fg-dim`, `--fg-mute` (three steps); all AA+ over the ladder.
- **One warm "starlight" accent** — keep the existing gold `~#cdb891`/amber as `--accent`. Per-planet
  accent tint derived via `color-mix()` from each destination's existing accent, applied to eyebrows,
  focal numbers, active rail node, one focal glow. Everything else stays desaturated.
- **Text substrate:** copy always sits on its own guaranteed-contrast substrate (a soft radial
  vignette/tint or a static-tint panel), so the live scene behind never dictates legibility.

### 3.2 Type — the triad (one expressive display, neutral sans, instrument mono)
- **Display: Fraunces** (variable; `opsz`+`SOFT`+`wght`). Titles, planet names, big numbers, and
  **its italic** for accents/quotes. Single display family.
- **Body/UI: Space Grotesk.** All prose, labels, buttons, chips.
- **Instrument mono: Space Mono.** Every readout, coordinate, metric label, eyebrow/kicker, HUD.
- **Retired:** Instrument Serif (→ Fraunces italic), Satoshi (→ Space Grotesk), JetBrains Mono
  (→ Space Mono). Fallback stacks preserved for the AppErrorBoundary/read-mode path.
- **Editorial scale contrast** is the premium signal: large display (clamp up to ~5–8rem where it
  fits), body at ~16–19px / 1.55–1.65, generous ramp gap. Mono small + letter-spaced for labels.
- One `FONT` map in `src/stellar/v3/tokens.js` (already the single source) + one `<link>` swap in
  `index.html`. Change cascades via the `--v3-font-*` CSS variables already wired everywhere.

### 3.3 Texture & atmosphere (restraint)
- **Grain + vignette** added as uniforms inside the existing `CinematicGrade` `mainImage` (noise-based
  grain, subtle; vignette darkens edges → focuses eye + gives copy a substrate). No new pass.
- **Panels:** static semi-opaque tint (`--space-panel` at ~0.7–0.85) + hairline border. **No animated
  `backdrop-filter`** over WebGL (4–6× slower; ancestor `will-change`/`opacity` silently breaks it).
  A single small, static blur on one focal panel is acceptable; never animate it.
- One focal glow max per view (accent text-shadow / box halo). No scanlines/CRT overlays.

### 3.4 Motion primitives (motion/react + Lenis; no new deps)
- **Scroll-linked:** `useScroll({ target, offset })` → `useTransform` piped straight to
  `opacity`/`transform` so Motion runs it on the native ScrollTimeline (hardware-accelerated).
- **Entrances:** `whileInView` + `viewport={{ once:true, amount, margin }}`, staggered via parent
  variants (`delayChildren`/`staggerChildren`), `opacity 0→1` + `translateY(~24px→0)`, ~0.6–0.8s,
  named cinematic beziers (e.g. `cinematicSmooth (0.25,0.1,0.25,1)`).
- **Card swaps / expand-collapse:** `AnimatePresence` (`mode="wait"`).
- **One `layoutId`:** rail-item → dossier header "magic move" (used sparingly — heaviest feature).
- **Reduced motion:** `MotionConfig reducedMotion="user"` app-wide → transforms/layout disabled,
  opacity/color kept (reveals become fades). Honors the snap constraint.
- **Bundle:** migrate the content layer to `LazyMotion` + `m` (`domAnimation`) to shave JS on a
  3D-heavy page. `useSpring` is NOT applied to scroll progress (Lenis already smooths).

### 3.5 Scroll/section state — one source of truth
A tiny external store fed by Lenis, consumed via `useSyncExternalStore`, exposing
`{ scrollProgress, activeSection, sectionProgress, readModeOpen }`. Content components read scroll
**during render** (no post-paint `useEffect` jank, no prop-drilling `scrollTRef`). `CameraRig`
keeps reading `scrollTRef` in `useFrame` untouched.

---

## 4. The section system — browse ⇄ read (the spine)

Every section is the same **two-state**, **two-level-max** pattern (never a third nesting):

1. **Hero (browse state)** — a compact, glanceable card surfaced as the tour frames the body:
   `eyebrow (mono) · Fraunces title · one-line impact · 2–3 signal chips` (top stack or a headline
   metric). Spacious, cinematic. The scene is softened behind it.
2. **Dossier (read state)** — expands **in place** into the full content with a container chosen per
   content type, revealed with staggered motion. Closing returns to the hero and re-sharpens the scene.

### 4.1 Read-mode softening (no canvas re-render)
Opening a dossier must NOT re-render the R3F tree. Mechanism:
- CSS `body:has(.dossier--open)` toggles a semi-opaque gradient/tint layer over the canvas (pure CSS).
- Optionally a **ref-driven** DPR/bloom drop in a `useFrame` uniform (no prop change) for a true soften.
- Never live-blur the WebGL canvas. Static tint only.
- When parked in read mode, the tour can drop to `frameloop="demand"`; back to `always` to fly on.

### 4.2 Container per content type (shared grid, varied rhythm)
Uniform gutters (16–24px), one type ramp, hairline rules, eyebrows as labels throughout; the
*container* varies so it never reads as one template:

| Section (planet) | Hero | Dossier container |
|---|---|---|
| **Impact / Fun-facts** (Sun) | headline | **Big-number tiles** — oversized Fraunces figures, mono labels, count-up on scroll-in |
| **Experience** (Mercury) | role · company · headline metric · award | Latest-first **timeline** of roles; a role opens **tabs** for its tracks (Platform / Distributed / Integrations / Agentic AI / DevOps), each track a short bullet set; 4-metric big-number row; tech chips |
| **Projects** (Venus) | flagship name + highlight stat + Pro/Personal toggle | **Bento grid** (size = importance: flagship 2×2, others 1×1); card expands in place to a mini case-study (description · features · stats · highlight); Professional/Personal filter |
| **Achievements** (Earth) | count | **Big-number / milestone tiles** + short captions |
| **Skills** (Mars) | "9 categories · ~90 tools" | **Constellation** (see §5) |
| **Notes/Writing** (Ceres) | latest post | Editorial list; item expands to summary |
| **Education** (Jupiter) | latest degree · institution | Compact **timeline** |
| **Hobbies** (Saturn) | — | Editorial cards |
| **Testimonials** (Uranus) | — | **Hero quote** → wall grid (name · role · quote), fade-in |
| **Pillars / What sets me apart** (Neptune) | — | 3–4 pillar cards, one line each, expandable |
| **Contact** (Pluto) | — | One clear action + links (existing form kept, restyled) |

- **Tabs** for a-few-long sections; **accordions** only for many-short chunks (NN/G shape-of-content rule).
- **Wayfinding:** `V3Hud` rail upgraded to a true auto-updating **section index + progress** (constellation
  map); it never dominates. `layoutId` links the active rail node to the open dossier header.

---

## 5. Skills — the constellation

Keep the existing per-skill `level` (0–100); render each category as a small **constellation** where a
skill is a **star** whose **size + brightness = proficiency** (stellar magnitude analogy). 9 categories =
9 labelled constellations. Hover/focus reveals the skill name + a mono readout. Grouped, calm, on-theme;
no bars, no arbitrary-looking %s on the surface (the number informs magnitude, isn't shown as a bar).
Reduced-motion: static star field, names shown inline. Must stay legible and performant (SVG/CSS, not a
second WebGL context; drei `<View>` only if a real 3D inset is warranted later).

---

## 6. Loading screen — "systems online"

Rebuild `BootLoader` to the same telemetry language (Space Mono), replacing `PLOTTING STELLAR
COORDINATES · 23%`:
- A hairline progress rail + honest readouts coming online as they actually load/warm:
  `STAR CATALOG ✓ · EPHEMERIDES ✓ · SHADERS COMPILED ✓ · TOUR WARMED ✓`.
- The name resolves in Fraunces as the final beat; clean dissolve to the already-settled hero.
- Grain + vignette; one focal accent; no spinner clichés.
- Reduced-motion: instant (no sequence). Keeps the existing "freeze scroll until settled" behavior.

---

## 7. Technical approach & where it lands

- **Fonts:** `tokens.js` `FONT` map + `index.html` `<link>` (add Space Grotesk, Space Mono; keep Fraunces;
  drop unused families).
- **Color/texture tokens:** extend `tokens.js` CSS variables; grain/vignette uniforms in `CinematicGrade`.
- **Scroll store:** new small module (Lenis → external store) consumed via `useSyncExternalStore`.
- **Section shell:** a shared `Dossier` wrapper (hero ⇄ read, `AnimatePresence`, staggered variants,
  read-mode class toggle) that each section composes; replaces the ad-hoc `V3Panel` shell. Existing
  section components refactored to `hero` + `dossier` render slots.
- **Read-mode softening:** CSS `:has()` tint layer + optional ref-driven uniform; no R3F re-render.
- **Perf:** `content-visibility:auto` on long dossiers; `LazyMotion`+`m`; `useDeferredValue`/`useTransition`
  when opening a data-dense dossier so the frame loop stays smooth; CSS scroll-driven animations for
  purely decorative reveals (progressive enhancement; JS path for the rest).
- **CSS-native:** container queries for the narrow-column-fills-height rule (`[[feedback_v3_section_width_vs_height]]`),
  `text-wrap: balance/pretty`, `color-mix()` for per-planet tint.
- **`V3Hud`:** upgrade to section index + progress (data from the scroll store).

---

## 8. Build order (each step verified live; tour untouched)

1. **Foundation** — fonts, color ladder, grain/vignette in CinematicGrade, motion primitives, scroll
   store, read-mode softening. (Everything depends on it.)
2. **Section shell** — the hero ⇄ dossier `Dossier` wrapper + `V3Hud` section index.
3. **High-value sections** — Experience, Projects, Skills-constellation, Impact/Achievements.
4. **Remaining sections** — Education, Testimonials, Notes, Hobbies, Pillars, Contact.
5. **Loading screen.**
6. **Polish pass** — motion timing, per-planet tint, reduced-motion + mobile verification.

Each step: `npm run lint` green + live browser verification (foreground chrome-devtools page to avoid
the backgrounded-pane rAF freeze). Commit per step; push only on explicit approval.

---

## 9. Research basis (full citations kept with the research; key principles)

- **Visual:** layered near-blacks (never `#000`); one warm accent vs cool monochrome; NASA-grade
  display/sans/mono triad; kill Orbitron; grain+vignette in one pass; static glass over 3D; named
  cinematic easings; restraint is the premium tell.
- **IA:** two-level progressive disclosure (never three); bento where size = importance with uniform
  gutters; editorial rhythm on a shared grid; grouped skills over %-bars; big-number stats; sticky
  section rail as wayfinding; staggered reveals strictly for comprehension.
- **React/motion:** motion/react `useScroll`/`useTransform` + `whileInView` stagger + `AnimatePresence`
  + one `layoutId`; Lenis sole scroll owner; skip GSAP + drei ScrollControls; `useSyncExternalStore`
  scroll store; read-mode dim via `:has()` tint + ref-driven uniform (never live blur); `LazyMotion`+`m`;
  `content-visibility`; honor reduced-motion.

---

## 10. Open questions / risks

- **Constellation skills legibility:** ~90 stars across 9 groups must stay scannable and labelled, not
  a decorative blob. Prototype the densest category first; fall back to grouped tiers if it can't stay clear.
- **Backdrop blur:** confirmed avoided over WebGL; static tint only.
- **Section refactor surface:** 12 section components refactored to hero/dossier slots — done one at a
  time behind the shared shell to keep each diff reviewable and the tour untouched.
