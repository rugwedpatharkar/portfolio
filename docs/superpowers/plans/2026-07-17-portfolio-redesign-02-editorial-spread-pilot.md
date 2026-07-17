# Portfolio Redesign — Phase 2: Editorial-Spread Primitives + Experience Pilot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the shared "editorial spread" primitives and prove them by refactoring the Experience section (the densest) end-to-end — same data, no cards, matches mockup Direction B.

**Architecture:** A tiny primitives module in `src/stellar/v3/editorial/` exports composable pieces (Spread, Masthead, MetaColumn, MetricRow, TrackList, StackLine, EyebrowRule). The section component composes them with its data — no boxed cards, hairline rules do the structure work, generous whitespace, huge Syne headings. Renders inside the existing `V3Panel` shell (which already handles the read-mode framing + scrollability) so no other plumbing changes.

**Tech Stack:** React 18, Vite 5, motion/react (for tracked entrance stagger — reuses existing patterns), the Syne · Sora · Space Mono tokens from Phase 1. No new dependencies.

## Global Constraints

- **Do NOT modify the 3D tour** — `Navigator.jsx`, `CameraRig.jsx`, `Scene/*` 3D layers, Milky-Way/solar-system/finale. This phase touches only new files in `src/stellar/v3/editorial/` + `src/stellar/v3/sections/Experience.jsx`.
- **Do NOT change section data or its shape** — the Experience data in `src/content/index.js` (line 123, `experiences[]`) is authoritative and stays exactly as-is. This phase only changes presentation.
- **Do NOT restructure other sections** — pilot is Experience only. The 11 other sections stay on their current V3Panel/card format until Phase 3 ports them one at a time.
- **No control-surface UI, reduced-motion → snap, single postprocessing mainImage** — all inherited from Phase 1.
- **No unit-test runner.** Verification = `npm run lint` green + live foreground chrome-devtools verification (the in-app Browser pane freezes the 3D canvas when backgrounded; the DOM/fonts still render but chrome-devtools is the reliable proof).
- **Push only on explicit approval.** Commit locally per task. Commit messages end with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Reference mockup for the target: `scratchpad/section-compare.html` (Direction B). Use it as the visual truth.

---

### Task 1: Create the editorial-spread primitives module

**Files:**
- Create: `src/stellar/v3/editorial/Spread.jsx` (all primitives exported from one file for now — small, no need to split)

**Interfaces:**
- Produces:
  - `<Spread>` — the outer container: 8pt vertical rhythm, uses `--v3-fg` on `--v3-bg-void` via V3Style, generous top padding.
  - `<Masthead meta={rows} title={jsx} accent={string} />` — 2-column top block: left = mono meta lines (label + value), right = huge Syne title (an `<em>` inside the title paints with the accent).
  - `<Subhead kicker eyebrow>` — a two-column row (eyebrow + short subheading) with a hairline top rule.
  - `<MetricRow metrics={[{n, l}]} />` — 4-column hairline-bordered numeric row (Syne big number, mono label).
  - `<TrackList tracks={[{n, title, body}]} />` — hairline-separated track rows: `n` label left-column, `title` + `body` right-column; `body` is a fragment of `<p>` paragraphs.
  - `<StackLine label items={string[]} />` — a labeled inline list with hairline dots as separators (label left, items right).
  - `<EyebrowRule>` — a labeled hairline divider used to introduce a section within a spread.
- Every primitive uses only the CSS vars from Phase 1 (`--v3-font-display / -ui / -mono`, `--v3-fg / -dim / -mute / -accent`, `--v3-line / -line-strong`, `--v3-bg-panel`) — no new colors, no new fonts.

- [ ] **Step 1: Create the primitives file**

Create `src/stellar/v3/editorial/Spread.jsx` with the following content:

```jsx
/*
 * Editorial-spread primitives — the SPINE format for every section (redesign 2026-07):
 * huge Syne masthead + mono meta column + hairline rules + generous whitespace.
 * Composable pieces; no cards, no boxes. See docs/.../02-editorial-spread-pilot.md
 * and scratchpad/section-compare.html (Direction B) for the visual target.
 */
import { memo } from "react";

const styles = {
  spread: {
    padding: "64px clamp(48px, 7vw, 120px) 24px",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
  },
  top: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 320px) 1fr",
    gap: 64,
    alignItems: "end",
    paddingBottom: 32,
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  meta: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    lineHeight: 2,
  },
  metaK: { color: "var(--v3-fg)", fontWeight: 500 },
  title: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(56px, 8.5vw, 132px)",
    lineHeight: 0.88,
    letterSpacing: "-.03em",
    color: "var(--v3-fg)",
    margin: 0,
  },
  titleEm: { fontStyle: "normal", color: "var(--v3-accent)" },
  subhead: {
    padding: "28px 0 40px",
    display: "grid",
    gridTemplateColumns: "minmax(220px, 320px) 1fr",
    gap: 64,
    alignItems: "baseline",
  },
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
  },
  lede: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 500,
    fontSize: "clamp(20px, 1.9vw, 26px)",
    lineHeight: 1.35,
    letterSpacing: "-.005em",
    color: "var(--v3-fg)",
    maxWidth: "36ch",
    margin: 0,
  },
  metricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    borderTop: "1px solid var(--v3-line)",
    borderBottom: "1px solid var(--v3-line)",
    padding: "22px 0",
  },
  metric: { padding: "0 24px", borderRight: "1px solid var(--v3-line)" },
  metricLast: { borderRight: 0 },
  metricN: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(30px, 3.4vw, 44px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "var(--v3-fg)",
  },
  metricNEm: { fontStyle: "normal", color: "var(--v3-accent)" },
  metricL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginTop: 8,
  },
  tracks: { marginTop: 48 },
  track: {
    display: "grid",
    gridTemplateColumns: "96px 1fr",
    gap: 24,
    padding: "26px 0",
    borderBottom: "1px solid var(--v3-line)",
  },
  trackLast: { borderBottom: 0 },
  trackN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    color: "var(--v3-accent)",
    letterSpacing: ".16em",
    paddingTop: 6,
  },
  trackH: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 600,
    fontSize: "clamp(18px, 1.8vw, 24px)",
    letterSpacing: "-.01em",
    color: "var(--v3-fg)",
    marginBottom: 12,
    marginTop: 0,
  },
  trackP: {
    color: "var(--v3-fg-dim)",
    fontSize: 15,
    lineHeight: 1.62,
    maxWidth: "75ch",
    margin: 0,
  },
  trackPGap: { marginTop: 10 },
  stack: {
    marginTop: 36,
    paddingTop: 28,
    borderTop: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 24,
    alignItems: "baseline",
  },
  stackL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  stackRow: {
    color: "var(--v3-fg-dim)",
    fontSize: 14,
    lineHeight: 1.9,
    letterSpacing: ".01em",
  },
  stackItem: { color: "var(--v3-fg)", fontWeight: 500 },
  stackSep: { color: "rgba(255,255,255,0.20)", margin: "0 8px" },
  rule: {
    borderTop: "1px solid var(--v3-line-strong)",
    padding: "18px 0 22px",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginTop: 32,
  },
};

export const Spread = memo(function Spread({ children }) {
  return <div style={styles.spread}>{children}</div>;
});

/*
 * Masthead — the top block: mono meta column on the left, huge Syne title on the right.
 *   meta: array of { k, v }  (k = label, v = value or JSX)
 *   title: string OR jsx (use <em> inside to accent-tint a fragment)
 */
export const Masthead = memo(function Masthead({ meta = [], title }) {
  return (
    <div style={styles.top}>
      <div style={styles.meta}>
        {meta.map((row, i) => (
          <div key={i}>
            <span style={styles.metaK}>{row.k}</span> · {row.v}
          </div>
        ))}
      </div>
      <h1 style={styles.title}>{title}</h1>
    </div>
  );
});

/* Emphasis span for masthead + metric big numbers — paints in the accent colour. */
export const Em = ({ children }) => <em style={{ fontStyle: "normal", color: "var(--v3-accent)" }}>{children}</em>;

export const Subhead = memo(function Subhead({ kicker, lede }) {
  return (
    <div style={styles.subhead}>
      <div style={styles.kicker}>{kicker}</div>
      <p style={styles.lede}>{lede}</p>
    </div>
  );
});

export const MetricRow = memo(function MetricRow({ metrics = [] }) {
  return (
    <div style={styles.metricRow}>
      {metrics.map((m, i) => (
        <div key={i} style={i === metrics.length - 1 ? { ...styles.metric, ...styles.metricLast } : styles.metric}>
          <div style={styles.metricN}>{m.n}</div>
          <div style={styles.metricL}>{m.l}</div>
        </div>
      ))}
    </div>
  );
});

/*
 * TrackList — hairline-separated rows. Each track has:
 *   n     — a short label like "01 / 05"
 *   title — the track heading
 *   body  — an array of paragraph strings (or JSX)
 */
export const TrackList = memo(function TrackList({ tracks = [] }) {
  return (
    <div style={styles.tracks}>
      {tracks.map((t, i) => {
        const rowStyle = i === tracks.length - 1 ? { ...styles.track, ...styles.trackLast } : styles.track;
        return (
          <div key={i} style={rowStyle}>
            <div style={styles.trackN}>{t.n}</div>
            <div>
              <h3 style={styles.trackH}>{t.title}</h3>
              {(Array.isArray(t.body) ? t.body : [t.body]).map((p, j) => (
                <p key={j} style={j === 0 ? styles.trackP : { ...styles.trackP, ...styles.trackPGap }}>{p}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export const StackLine = memo(function StackLine({ label = "Stack", items = [] }) {
  return (
    <div style={styles.stack}>
      <div style={styles.stackL}>{label}</div>
      <div style={styles.stackRow}>
        {items.map((it, i) => (
          <span key={i}>
            {i > 0 && <span style={styles.stackSep}>·</span>}
            <span style={styles.stackItem}>{it}</span>
          </span>
        ))}
      </div>
    </div>
  );
});

export const EyebrowRule = memo(function EyebrowRule({ children }) {
  return <div style={styles.rule}>{children}</div>;
});
```

- [ ] **Step 2: Lint**

Run:
```bash
cd "$(git rev-parse --show-toplevel)" && npm run lint 2>&1 | tail -6
```
Expected: exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
cd "$(git rev-parse --show-toplevel)" && git add src/stellar/v3/editorial/Spread.jsx && git commit -m "feat(redesign): editorial-spread primitives (Spread/Masthead/MetricRow/TrackList/StackLine)

Composable pieces for the new no-cards section format (Direction B from the live
mockup). Uses only Phase 1 CSS vars; no consumers yet — pilot section refactors
next. Data of every section stays exactly as authored; only presentation changes.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Refactor Experience section to use the editorial spread

**Files:**
- Read (understand current shape): `src/stellar/v3/sections/Experience.jsx` (401 lines), `src/content/index.js:123-213` (`experiences[]` data)
- Modify: `src/stellar/v3/sections/Experience.jsx` (rewrite the presentation entirely; still exports the same default component name so the routing in `V3Panel.jsx` works untouched)

**Interfaces:**
- Consumes: primitives from Task 1 (`Spread`, `Masthead`, `Em`, `Subhead`, `MetricRow`, `TrackList`, `StackLine`), and the section-header text from `sectionMeta.experience` in `src/content/index.js:787`.
- Produces: default export `Experience`, taking `{ activeCompany }` if the current signature does — inspect it first and preserve the same props/exports so nothing upstream changes.

- [ ] **Step 1: Read the current Experience component and its consumer**

Read both files so the refactor keeps the same public shape:
```bash
cd "$(git rev-parse --show-toplevel)" && grep -nE "export default|export const|function Experience|const Experience|onCompanyChange|activeCompany" src/stellar/v3/sections/Experience.jsx | head -12
grep -nE "Experience|experience\.jsx" src/stellar/v3/V3Panel.jsx | head -8
```
Expected: identify the default export name + any props it currently receives. The new implementation must keep the same public signature so `V3Panel.jsx`'s dynamic-import call site works unchanged.

- [ ] **Step 2: Write the refactored `Experience.jsx`**

Replace the entire contents of `src/stellar/v3/sections/Experience.jsx` with a component that:
1. Preserves the current default export name + any props identified in Step 1.
2. Reads `experiences` + `sectionMeta.experience` from `src/content/index.js`.
3. Handles the case of multiple roles (currently 2: Upswing + Tech Entrepreneurs Intern). Simple approach: render each experience as its own `<Spread>`, latest first, with a mono role-index (`ROLE · 01/02`) on the mid-column to differentiate.
4. Composes each role's data into the primitives, matching mockup Direction B:
   - `<Masthead>` — meta rows: Where / Role / Tenure / Recognition (Recognition line only when `achievement` is present). Title = `Ship <Em>Backend</Em>` for Upswing, or a role-appropriate two-word phrasing for others (fall back to `Software <Em>Engineer</Em>` derived from the role title + a highlight word — keep it deterministic; do NOT hard-code the second title, derive it: first word of `title` in the display face, `<Em>` the last word).
   - `<Subhead>` — kicker = `sectionMeta.experience.sub` uppercased for the FIRST role only; short lede sentence derived from the first bullet of the first `categories[0].points[0]` (truncated to ~2 lines / ~180 chars, ending on a full stop or word boundary).
   - `<MetricRow>` — the `metrics[]` array, mapped to `{ n: value with digits, l: label }`; wrap `%` / `→` / `M` symbols with `<Em>` for the accent tint (regex-based: last non-alphanumeric run becomes `<Em>`).
   - `<TrackList>` — each `categories[]` entry becomes a track: `n = "0N / TOTAL"`, `title = category.name`, `body = category.points` (array of paragraphs).
   - `<StackLine>` — `label="Stack"`, `items = tech`.
5. Motion: wrap each `<Spread>` in a `motion.div` with `initial={{ opacity: 0, y: 24 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.25 }}`, `transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}` (the `cine` easing from Phase 1). Children stagger comes from `TrackList` if we add it later — for now the whole spread reveals as one.

Full replacement content:

```jsx
/*
 * Experience — editorial-spread format (redesign 2026-07, Direction B).
 * Each role is a full spread: mono meta column + huge Syne masthead + hairline
 * metric row + hairline-separated Track rows + a StackLine. No cards, no boxes.
 *
 * Section data (experiences[] + sectionMeta.experience) is authored in
 * src/content/index.js and consumed here VERBATIM — this file is presentation only.
 */
import { memo } from "react";
import { motion } from "motion/react";
import { experiences, sectionMeta } from "../../../content";
import { Spread, Masthead, Em, Subhead, MetricRow, TrackList, StackLine } from "../editorial/Spread";

/* Derive a two-word "verb + object" title from the role's `title` string:
   first word plain, last word tinted — deterministic, no per-role hard-coding.
   "Software Engineer" -> "Software" + Em("Engineer"); "IT Trainee Intern" ->
   "IT Trainee" + Em("Intern"). Falls back to the whole string tinted if there's
   only one word. */
const splitTitle = (str) => {
  const parts = (str || "").trim().split(/\s+/);
  if (parts.length <= 1) return { head: "", tail: str };
  return { head: parts.slice(0, -1).join(" "), tail: parts[parts.length - 1] };
};

/* Wrap the last non-alphanumeric run of a metric value (%, →, ×, M, etc) with
   Em so it gets accent-tinted. `"96%"` → `96` + Em(`%`); `"5s→200ms"` → `5s→200`
   + Em(`ms`); pure numbers pass through unmodified. */
const emTail = (value) => {
  const s = String(value ?? "");
  const m = s.match(/^(.*?)([^\w]+|[a-zA-Z]+)$/);
  if (!m || m[1] === "") return s;
  return (
    <>
      {m[1]}
      <Em>{m[2]}</Em>
    </>
  );
};

/* Short lede derived from the first bullet of the first category — trimmed to a
   single readable sentence (~180 chars, cut at a sentence end or word boundary). */
const buildLede = (exp) => {
  const first = exp?.categories?.[0]?.points?.[0];
  if (!first) return "";
  const s = String(first);
  if (s.length <= 180) return s;
  const cut = s.slice(0, 180);
  const dot = cut.lastIndexOf(". ");
  if (dot > 60) return s.slice(0, dot + 1);
  const sp = cut.lastIndexOf(" ");
  return s.slice(0, sp) + "…";
};

const RoleSpread = memo(function RoleSpread({ exp, index, total, showKicker }) {
  const { head, tail } = splitTitle(exp.title);
  const meta = [
    { k: "Where", v: exp.companyName },
    { k: "Role", v: exp.title },
    { k: "Tenure", v: exp.date },
  ];
  if (exp.achievement) meta.push({ k: "Recognition", v: `★ ${exp.achievement}` });

  const tracks = (exp.categories || []).map((c, i, arr) => ({
    n: `${String(i + 1).padStart(2, "0")} / ${String(arr.length).padStart(2, "0")}`,
    title: c.name,
    body: c.points,
  }));

  const metrics = (exp.metrics || []).map((m) => ({ n: emTail(m.value), l: m.label }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Spread>
        <Masthead
          meta={meta}
          title={
            <>
              {head}
              {head ? " " : ""}
              <Em>{tail}</Em>
            </>
          }
        />

        {showKicker && (
          <Subhead
            kicker={`${(sectionMeta.experience?.sub || "Where I've Worked")} · Role ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
            lede={buildLede(exp)}
          />
        )}
        {!showKicker && (
          <Subhead
            kicker={`Role ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
            lede={buildLede(exp)}
          />
        )}

        {metrics.length > 0 && <MetricRow metrics={metrics} />}

        <TrackList tracks={tracks} />

        {(exp.tech || []).length > 0 && <StackLine label="Stack" items={exp.tech} />}
      </Spread>
    </motion.div>
  );
});

const Experience = memo(function Experience() {
  const roles = experiences || [];
  return (
    <>
      {roles.map((exp, i) => (
        <RoleSpread key={`${exp.companyName}-${i}`} exp={exp} index={i} total={roles.length} showKicker={i === 0} />
      ))}
    </>
  );
});

export default Experience;
```

- [ ] **Step 3: Lint**

Run: `cd "$(git rev-parse --show-toplevel)" && npm run lint 2>&1 | tail -6`
Expected: exit 0, no errors.

- [ ] **Step 4: Verify live (foreground chrome-devtools)**

Ensure dev server is up (`preview_start {name:"stellar"}`). Open a fresh foreground page:
- `mcp__chrome-devtools__new_page {url:"http://localhost:5174/"}`
- Wait for boot (`document.body.innerText.includes('PLOTTING STELLAR')` false + `window.__lenis` truthy).
- Drive to Experience with `evaluate_script`: dispatch three ArrowDown keydowns (hero → about → impact → experience), 300ms apart, then sleep ~2.8s.
- `take_screenshot`. Compare against the mockup Direction A/B/C image saved earlier — Experience should now look like Direction B (huge Syne "Software Engineer" title with the last word gold, mono meta column, hairline metric row, tracked bullets, stack line — NO cards).
- Also `evaluate_script`: `return { doc: document.documentElement.scrollWidth, win: window.innerWidth };` — the two must match (no horizontal overflow from long track paragraphs).
- Confirm reduced-motion still snaps (optional but recommended): `evaluate_script`: `matchMedia('(prefers-reduced-motion: reduce)').matches` — if true the motion.div will still render (opacity/color kept by MotionConfig), so the section is visible.

Expected: Experience renders as the editorial spread from mockup B; no console errors; no horizontal overflow.

- [ ] **Step 5: Verify the other 11 sections still render (regression check)**

Because we only refactored Experience, every other section should render unchanged. In the same foreground page, drive to Projects (Venus, `ArrowDown` from Experience) and take a screenshot — confirm it still renders in its previous card format (unchanged). Also drive back to Hero and confirm the hero still renders.

Expected: only Experience's presentation changed; all other sections + hero unchanged.

- [ ] **Step 6: Commit**

```bash
cd "$(git rev-parse --show-toplevel)" && git add src/stellar/v3/sections/Experience.jsx && git commit -m "feat(redesign): Experience section → editorial spread (no cards)

Refactors Experience.jsx to compose the new editorial-spread primitives — huge
Syne masthead + mono meta column + hairline metric row + hairline-separated
tracks + inline Stack line. Every field of the authored experiences[] data
(companyName, title, date, achievement, metrics, categories, tech) is rendered
verbatim; only presentation changes. Pilot for Phase 3 which ports the other
11 sections one at a time.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Tune the scene backdrop under the spread (readability without killing the tour)

**Files:**
- Read: `src/stellar/StellarApp.jsx` (the `<V3Scrim>` sub-component ~lines 40-46, and any scrim wiring)
- Modify (only if needed after visual check): `src/stellar/StellarApp.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: no interface change. Only a CSS-token/opacity tweak on the existing scrim (if the pilot verification shows the editorial spread is hard to read over the busy 3D scene).

- [ ] **Step 1: Assess readability against the pilot**

In the foreground page from Task 2, take a full-page screenshot of the Experience spread and answer: is every paragraph readable against the live 3D scene behind, or do bright areas (Sun glare, HII regions, Milky-Way band) fight the text? Look especially at the middle tracks that sit over the brightest scene areas.

- [ ] **Step 2: If readable → skip to commit; if not, tune V3Scrim**

Only if the spread is hard to read: adjust `V3Scrim`'s gradient in `src/stellar/StellarApp.jsx` (~line 43-44) — increase the max opacity on the info-column side (currently `0.96` desktop / `0.95` mobile) or widen the gradient's dark band. Do NOT add any animated `backdrop-filter` (research-flagged: 4-6× slower over WebGL). Do NOT change the scrim's `zIndex` or `pointerEvents`.

If a tune is needed, apply the smallest possible change (raise 0.96 → 0.98, and/or widen the 26% stop out to 30%). Re-verify by taking a fresh screenshot.

- [ ] **Step 3: Lint (only if the file was modified)**

`cd "$(git rev-parse --show-toplevel)" && npm run lint 2>&1 | tail -6`

- [ ] **Step 4: Commit (only if the file was modified)**

```bash
cd "$(git rev-parse --show-toplevel)" && git add src/stellar/StellarApp.jsx && git commit -m "chore(redesign): tune V3Scrim opacity for editorial-spread readability

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

If no tune was needed, skip this commit and note in the phase report that the existing scrim was sufficient.

---

## Phase 2 done — what's next

After Task 3, the Experience section is a full editorial spread — same data, no cards, Direction B — and the primitives are ready to compose every other section.

**Phase 3 (its own plan, written after this is verified live):** port the other 11 sections one at a time using the same primitives — About, Impact/FunFacts, Projects, Skills (with the constellation treatment), Education, Achievements, Testimonials, Hobbies, Pillars/What-Sets-Me-Apart, Notes/Writing, Contact. Each section = its own commit, verified live before moving on.

## Self-review notes

- **Spec coverage (this phase):** editorial-spread primitives → Task 1; pilot on the densest section (Experience) → Task 2; scene-backdrop readability check → Task 3.
- **Data preservation:** the plan explicitly forbids editing `src/content/index.js` and defines the entire refactor as "presentation only" — the authored `experiences[]` data is read verbatim.
- **Placeholder scan:** none — every step names exact files, exact commands, and the full replacement code.
- **Type consistency:** primitive names + prop names used in Task 2 match Task 1's export list exactly (Spread, Masthead, Em, Subhead, MetricRow, TrackList, StackLine, EyebrowRule).
- **Verification adapted** to this repo (lint + foreground chrome-devtools) since there is no unit-test runner; the Browser pane freezes rAF and produces a black 3D canvas.
- **Blast radius:** two new files, one section rewrite, one optional 2-line CSS tweak. Other 11 sections + the 3D tour are untouched.
