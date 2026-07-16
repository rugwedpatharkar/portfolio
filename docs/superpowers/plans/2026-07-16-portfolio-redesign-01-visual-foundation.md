# Portfolio Redesign — Phase 1: Visual Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap the portfolio's type system to Fraunces · Space Grotesk · Space Mono and add the design tokens (near-black color ladder + cinematic easings) that every later redesign phase depends on — with zero change to the 3D tour.

**Architecture:** All fonts and design values flow from one source — `src/stellar/v3/tokens.js` exports a `FONT` map, `COLOR` map, and `MOTION` map that `cssVars()` renders into `--v3-*` CSS custom properties consumed everywhere via `var(--v3-font-*)`. So the type swap is: load new families in `index.html`, repoint the `FONT` map, and add tokens. Nothing structural; the change cascades through the existing variable plumbing.

**Tech Stack:** Vite 5, React 18, Google Fonts (CSS2 API), CSS custom properties. No new dependencies.

## Global Constraints

- **Do NOT modify the 3D tour** — `Navigator.jsx`, `CameraRig.jsx`, `Scene/*` 3D layers, Milky-Way/solar-system/finale. This phase touches only `index.html` and `src/stellar/v3/tokens.js`.
- **Single postprocessing `mainImage`** (CinematicGrade) + Bloom — untouched this phase. Grain/vignette already live inside it; leave as-is.
- **Reduced-motion + mobile → snap** — unchanged; `<MotionConfig reducedMotion="user">` already wraps the app in `StellarApp.jsx`.
- **No control-surface UI.**
- **No unit-test runner in this repo.** Verification = `npm run lint` green + live browser check via a **foreground** chrome-devtools page (the in-app Browser pane backgrounds and freezes rAF — the 3D canvas goes black there; DOM/fonts still render but use chrome-devtools for reliable proof). Dev server: `mcp__Claude_Browser__preview_start {name:"stellar"}` (port 5174) or existing.
- **Push only on explicit approval.** Commit locally per task. Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- One display family only (Fraunces + its italic); Space Grotesk body; Space Mono instrument. Kill Instrument Serif / Satoshi / JetBrains Mono references.

---

### Task 1: Load the new font families (and prune unused)

**Files:**
- Modify: `index.html` (the `<link href="https://fonts.googleapis.com/css2?...">` line, currently ~line 71, and the Fontshare/Satoshi link ~line 72)

**Interfaces:**
- Produces: the three families available to CSS — `Fraunces` (with italic + `opsz`/`wght`/`SOFT` axes), `Space Grotesk` (300–700), `Space Mono` (400/700, roman+italic).

- [ ] **Step 1: Confirm no code references the families we're about to drop**

Run:
```bash
cd "$(git rev-parse --show-toplevel)" && grep -rniE "Instrument Serif|Satoshi|JetBrains|Martian|DM Serif|Manrope|Geist Mono" src/ | grep -viE "tokens\.js|// |/\*" || echo "NO direct references — safe to prune"
```
Expected: only matches inside `tokens.js` (handled in Task 2) or comments. If any component hard-codes one of these family names, note it and keep that family in the link until Task 2 repoints it. (The design uses `var(--v3-font-*)` everywhere, so expect "NO direct references".)

- [ ] **Step 2: Replace the Google Fonts link**

In `index.html`, replace the existing Google Fonts `<link ... css2?family=Fraunces...>` line with this exact line (adds Fraunces italic axis + Space Grotesk + Space Mono; drops the unused families):

```html
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,0..100;1,9..144,300..700,0..100&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Remove the Satoshi (Fontshare) link**

Delete the line:
```html
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
```
And update the adjacent explanatory HTML comment (the "Instrument Serif italic (accent) · Satoshi …" note ~lines 66-70) to read: `Fraunces (display + italic) · Space Grotesk (UI/body) · Space Mono (instrument/HUD).` Leave the `preconnect` hints for `fonts.googleapis.com` / `fonts.gstatic.com`; you may drop the `api.fontshare.com` preconnect (~line 64) since Satoshi is gone.

- [ ] **Step 4: Verify the fonts load (foreground browser)**

Ensure dev server is up (`mcp__Claude_Browser__preview_start {name:"stellar"}`). Open a **foreground** page and check the font requests succeed:
- `mcp__chrome-devtools__new_page` → `http://localhost:5174/`
- `mcp__chrome-devtools__list_network_requests` (or evaluate `document.fonts.ready`) and confirm `fonts.gstatic.com` requests for Fraunces / Space Grotesk / Space Mono returned 200, and no request for Satoshi/Instrument Serif/JetBrains remains.

Expected: 200s for the three families; no 404s; no console errors.

- [ ] **Step 5: Commit**

```bash
cd "$(git rev-parse --show-toplevel)" && git add index.html && git commit -m "feat(redesign): load Fraunces italic + Space Grotesk + Space Mono; drop unused font families

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Repoint the FONT map to the new triad

**Files:**
- Modify: `src/stellar/v3/tokens.js:29-46` (the `FONT` export)

**Interfaces:**
- Consumes: the families loaded in Task 1.
- Produces: `--v3-font-display` = Fraunces, `--v3-font-serif` = Fraunces (its italic used by callers that set `font-style: italic`), `--v3-font-ui` = Space Grotesk, `--v3-font-mono` = Space Mono — all already wired through `cssVars()` (lines 92-95) and consumed as `var(--v3-font-*)` across the app.

- [ ] **Step 1: Replace the `FONT` object and its comment**

In `src/stellar/v3/tokens.js`, replace lines 29-46 (the whole `export const FONT = {...};` block including the leading comment) with:

```js
/* ---- type ----------------------------------------------------------------- */
export const FONT = {
  /* Type triad (redesign 2026-07): one expressive display + neutral sans + instrument mono.
     Fraunces — variable serif (opsz/wght/SOFT); display + big numbers + its ITALIC for
       accents/quotes (replaces Instrument Serif so we never pair two characterful serifs).
     Space Grotesk — geometric sans with a subtle spacey edge; all body/UI/labels/buttons.
     Space Mono — the instrument voice; every readout, coordinate, metric label, eyebrow, HUD.
     Fallbacks preserve the AppErrorBoundary / read-mode stack if a webfont fails to load. */
  display: "'Fraunces', Georgia, 'Times New Roman', serif",
  serif: "'Fraunces', Georgia, serif",
  ui: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  mono: "'Space Mono', ui-monospace, 'SFMono-Regular', monospace",
};
```

- [ ] **Step 2: Lint**

Run: `cd "$(git rev-parse --show-toplevel)" && npm run lint 2>&1 | tail -5`
Expected: no errors (exit 0; only the npm banner printed).

- [ ] **Step 3: Verify the new type renders live (foreground)**

Reload the foreground chrome-devtools page (`mcp__chrome-devtools__navigate_page {type:"reload"}`), let the boot settle, then:
- `mcp__chrome-devtools__evaluate_script`: return `getComputedStyle(document.querySelector('h1')).fontFamily` for the hero name — expect it to contain `Fraunces`.
- Evaluate the computed `font-family` of a mono HUD element (e.g. an element inside the top-right stat block) — expect `Space Mono`.
- Evaluate a body element (e.g. the "Software Engineer · Pune, India" line) — expect `Space Grotesk`.
- `mcp__chrome-devtools__take_screenshot` of the hero; visually confirm the name is Fraunces, subhead is Space Grotesk, HUD readouts are Space Mono, and nothing fell back to Georgia/Times (which would mean a load failure).

Expected: all three families resolve; hero reads cleanly; no Times/Georgia fallback.

- [ ] **Step 4: Spot-check one planet stop (foreground)**

In the same page, drive to a section to confirm section headings/labels also pick up the triad:
```js
// evaluate_script
const press = k => window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}));
for (let i=0;i<4;i++){ press('ArrowDown'); await new Promise(r=>setTimeout(r,300)); }
await new Promise(r=>setTimeout(r,2500));
return document.title;
```
Then `take_screenshot`. Expect the section title in Fraunces, body copy in Space Grotesk, the "PLANET INFORMATION" / eyebrow labels in Space Mono. Confirm no layout breakage from the metric changes (Space Mono is wider than JetBrains Mono — check the HUD readouts and tag chips don't overflow their containers; if a fixed-width mono block clips, note it for the section-phase to address, but it should reflow fine).

- [ ] **Step 5: Commit**

```bash
cd "$(git rev-parse --show-toplevel)" && git add src/stellar/v3/tokens.js && git commit -m "feat(redesign): repoint FONT map to Fraunces / Space Grotesk / Space Mono triad

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Add color-ladder + cinematic-easing design tokens

**Files:**
- Modify: `src/stellar/v3/tokens.js` (the `COLOR` export ~lines 12-22, the `MOTION` export ~lines 64-78, and `cssVars()` ~lines 81-102)

**Interfaces:**
- Consumes: nothing new.
- Produces: new CSS vars for later phases — `--v3-bg-panel`, `--v3-bg-elevated` (dossier surface ladder), and `--v3-ease-cine`, `--v3-ease-silk` (named cinematic easings), plus JS `MOTION.easing.cine` / `MOTION.easing.silk` (bezier arrays for motion/react). Existing tokens unchanged (no visual regression to current chrome).

- [ ] **Step 1: Extend the `COLOR` map with the dossier surface ladder**

In `src/stellar/v3/tokens.js`, in `export const COLOR = { ... }`, add two entries after `bg1` (keep all existing entries as-is so current chrome is unaffected):

```js
  bgPanel: "#10131f", // dossier surface (elevated over the void)
  bgElevated: "#161a2b", // raised card within a dossier
```

- [ ] **Step 2: Add named cinematic easings to `MOTION`**

In `export const MOTION = { ... }`, inside the `easing` object add two curves (keep `smooth`/`sharp`/`bounce`):

```js
    cine: [0.25, 0.1, 0.25, 1], // cinematicSmooth — general content reveals
    silk: [0.45, 0.05, 0.55, 0.95], // cinematicSilk — slow, held beats
```

And below `cssSmooth`, add their CSS strings:

```js
  cssCine: "cubic-bezier(0.25,0.1,0.25,1)",
  cssSilk: "cubic-bezier(0.45,0.05,0.55,0.95)",
```

- [ ] **Step 3: Emit the new vars from `cssVars()`**

In the template literal returned by `cssVars()`, add these lines (after `--v3-bg-1` and after `--v3-ease-smooth` respectively):

```js
  --v3-bg-panel:${COLOR.bgPanel};
  --v3-bg-elevated:${COLOR.bgElevated};
```
```js
  --v3-ease-cine:${MOTION.cssCine};
  --v3-ease-silk:${MOTION.cssSilk};
```

- [ ] **Step 4: Lint**

Run: `cd "$(git rev-parse --show-toplevel)" && npm run lint 2>&1 | tail -5`
Expected: no errors.

- [ ] **Step 5: Verify the vars are emitted (foreground)**

Reload the foreground page and evaluate:
```js
// evaluate_script
const s = getComputedStyle(document.documentElement);
return {
  panel: s.getPropertyValue('--v3-bg-panel').trim(),
  elevated: s.getPropertyValue('--v3-bg-elevated').trim(),
  cine: s.getPropertyValue('--v3-ease-cine').trim(),
  silk: s.getPropertyValue('--v3-ease-silk').trim(),
};
```
Expected: `{ panel: "#10131f", elevated: "#161a2b", cine: "cubic-bezier(0.25,0.1,0.25,1)", silk: "cubic-bezier(0.45,0.05,0.55,0.95)" }`. Take a screenshot of the hero and confirm **no visual regression** (these tokens are defined but not yet applied to any surface, so the page must look identical to Task 2).

- [ ] **Step 6: Commit**

```bash
cd "$(git rev-parse --show-toplevel)" && git add src/stellar/v3/tokens.js && git commit -m "feat(redesign): add dossier color-ladder + cinematic-easing design tokens

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Phase 1 done — what's next

After these three tasks: the whole site renders in the new triad, the design tokens later phases need exist, and the 3D tour is untouched. Verify the hero + one planet stop + reduced-motion (emulate `prefers-reduced-motion` and confirm the type still renders and nothing animates) before moving on.

**Follow-on plans (their own docs, written when this is verified live):**
- **Phase 2 — Interaction foundation:** the Lenis→`useSyncExternalStore` scroll store, read-mode softening (`:has()` tint + ref-driven soften, no canvas re-render), and the shared `Dossier` (hero ⇄ read) shell, proven on one pilot section.
- **Phase 3 — High-value sections:** Experience (timeline + tabbed tracks), Projects (bento + case-study), Skills (constellation), Impact/Achievements (big-number tiles).
- **Phase 4 — Remaining sections:** Education, Testimonials, Notes, Hobbies, Pillars, Contact.
- **Phase 5 — Loading screen** ("systems online" telemetry boot).
- **Phase 6 — Polish:** per-planet tint, motion timing, reduced-motion + mobile pass.

## Self-review notes

- **Spec coverage (this phase):** type triad → Tasks 1-2; color depth ladder tokens → Task 3; cinematic easing tokens → Task 3. Texture (grain+vignette) already exists in `CinematicGrade` → no task needed (verified during planning). Reduced-motion config already present in `StellarApp` → no task. Scroll store / read-mode / section system / skills constellation / loading screen → explicitly deferred to Phases 2-5 (out of this plan's scope by design).
- **Placeholder scan:** none — every step has exact file/line, exact code, exact command, expected output.
- **Type consistency:** `bgPanel`/`bgElevated` and `--v3-bg-panel`/`--v3-bg-elevated`, `MOTION.easing.cine`/`silk` and `--v3-ease-cine`/`--v3-ease-silk`, `cssCine`/`cssSilk` — names consistent across Steps.
- **Verification adapted** to this repo's reality (lint + foreground chrome-devtools), since there is no unit-test runner and the Browser pane freezes the 3D canvas when backgrounded.
