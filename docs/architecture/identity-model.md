# The Three-Name Identity Model

> Every stop in the tour has three names that look interchangeable but aren't.
> This doc is the single source of truth for what each name is, who uses it, and
> what breaks if you mix them up.

## The three names

| Name       | Purpose                              | Example (Earth stop) |
|------------|--------------------------------------|----------------------|
| `id`       | URL-hash anchor + `DEST_BY_ID` key   | `"experience"`       |
| `section`  | Which résumé section this stop shows | `"projects"`         |
| `label`    | The body's real display name         | `"Earth"`            |

Plus these supporting fields (all §6.3 — all live on each destination row):

| Field      | Purpose | Example |
|------------|---------|---------|
| `color`    | The body's real visual accent — planets tint the HUD with this | `"#3b6ea8"` |
| `accent`   | Non-planet HUD tint — Sol keeps its curated gold separate from the body's fire-orange color; cosmic stops set both to the same value | `"#e9c675"` (Sol) |
| `docTitle` | The `document.title` prefix for this stop (`"" `→ site default) | `"Projects"` |

### Why they diverge

The tour was reshuffled in v3 so every planet displays the section of the
**next** stop — Mercury shows "About", Venus shows "Impact", Earth shows
"Projects", and so on. The `id`s were **kept stable** across that reshuffle to
avoid breaking every deep-link, sitemap entry, and comment reference. So
`id: "experience"` is a legacy section name that now refers to Earth (whose
section is `"projects"`). The `label` is the body's real name.

## Rules

1. **URL hashes and lookups use `id`.** `window.location.hash = "#v3/experience"`
   opens Earth. `DEST_BY_ID["experience"]` returns Earth's dest object. No other
   name works for lookups.
2. **Résumé content is keyed by `section`.** `V3Panel` picks its section
   component from `SECTION_COMPONENT[section]`. `data/planetFacts.js` is keyed
   by `id` (per body), `v3/data/planetEditorial.js` is keyed by `id` (per body).
   Don't cross-key.
3. **Human-facing labels use `label`.** V3Reticle's tag, V3Hud rail's tooltip,
   the "Planet Information" card title — all read `label`. Never render `id`
   to a user.
4. **The per-body accent comes off the destination row.** V3Style resolves
   `dest.accent || dest.color || COLOR.accent` — non-planets carry `accent`
   (Sol's curated gold, the black-hole's warm amber), planets fall through to
   `color` (their real body tint), and any no-dest / missing-value path lands
   on Sol gold. There is no separate `ACCENT` lookup map or `accentFor` helper
   — §6.3 collapsed both into the row itself.

## Consumers

Alphabetical, so you can grep and verify a change touches all of them.

| Consumer | Reads | Notes |
|----------|-------|-------|
| `config/destinations.js`    | all fields | source of truth |
| `data/planetFacts.js`       | `id`     | keyed by dest id → body-fact card |
| `Scene/index.jsx` (Planet mount) | `id`, `section` | id → matches `d.type === "earth"` branches; section unused here |
| `StellarApp.jsx` (tab title) | `docTitle` | reads the row's `docTitle`; empty → default site title |
| `StellarApp.jsx` (deep-link, hash) | `id` | URL hash sync + `handleJump` |
| `StellarApp.jsx` (arrival beep event detail) | `id`, index | passed to SoundManager |
| `V3Editorial`               | `id`     | picks per-body editorial card |
| `V3Hero.jsx` (begin tour target) | index | positional, not name-based |
| `V3Hud.jsx`                 | `id`, `label`, `section` | rail tooltip + counter |
| `V3Panel.jsx`               | `section` | picks lazy section component |
| `V3Reticle.jsx`             | `label`  | on-screen tag |
| `V3Style.jsx`               | `accent`, `color` | `dest.accent || dest.color || COLOR.accent` |
| `v3/data/planetEditorial.js`| `id`     | keyed by dest id → editorial quote |

## Where new stops touch each layer

If you add a new tour stop, expect to touch:

1. **Data**
   - `config/destinations.js` — new row with `{id, section, label, color, position, cameraTarget, kind, docTitle}` (planets also get `radius`, `axialTilt`, `moons`, etc.; non-planets add `accent`)
   - `data/planetFacts.js` — new entry keyed by `id`
   - `v3/data/planetEditorial.js` — new entry keyed by `id`
2. **UI**
   - `v3/V3Panel.jsx` — new lazy import in `SECTION_COMPONENT`, keyed by `section`
   - `v3/sections/<NewSection>.jsx` — the actual section component

That's a 5-file touch — down from 8 after §6.3 folded `DOC_SECTION`,
`tokens.ACCENT`, and `accentFor` onto the destination row. The remaining
`SECTION_COMPONENT` map stays in `V3Panel.jsx` because it wires React lazy
imports and belongs with the panel, not the data config.

## Keyboard conventions (§10.8)

All master-list sections use `useMasterListKeys` from `v3/primitives/`. The
default axis is **↑↓ + jk** (vertical master list), with ←→ + hl reserved for
horizontal carousels (Projects, Achievements). Every list is a **roving
tablist**: the container gets `tabIndex={0}`, only the active item has
`tabIndex={0}` among its siblings, and arrow keys move focus + change the
selection in one atomic step. Focus is drawn with a 2px accent outline via
`:focus-visible` in `V3Style` — see `stellar-dossier-frame [role="tab"]`.

Exceptions:

- **Projects** — carousel container, single tabIndex, prev/next buttons for mouse.
- **Education** — SVG `<motion.circle>` tabs; roving works but the ref-based
  `.focus()` model behaves inconsistently on SVG elements, so this stop
  currently keeps container-level `onKeyDown` only.

## The trap

The **most common bug** in this system is keying a data lookup by the wrong
field. Symptom: content shows on the wrong stop, or an accent falls back to
the sol gold on every planet. Diagnosis: check whether the failing consumer
uses `id` or `section`, and make sure the source of truth for that data is
keyed the same way. `planetFacts` and `planetEditorial` are `id`-keyed; the
`section` name is for résumé content only.
