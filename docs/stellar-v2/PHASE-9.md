# PHASE 9 — Unified Visual Identity
*One design system and one typeface family across the entire portfolio — premium, consistent, deliberate.*

## Why
The UI grew to ~35 DOM overlays, almost all inline-styled, with three display fonts (Exo 2 + Michroma
+ JetBrains Mono), scattered colors / radii / shadows / glass treatments, and no shared primitives —
~10 categories of inconsistency. A single token system + one typeface family makes every surface feel
like one product, and makes future UI a data/token edit instead of a per-component restyle.

## Typography — Tactical HUD (locked)
- **Display / headings:** Chakra Petch — squared, technical, tasteful sci-fi (not the Orbitron cliché).
- **Mono / telemetry / labels:** Martian Mono — tall x-height, tabular figures for live readouts.
- **Body / résumé copy:** Saira — variable superfamily; condensed widths for dense HUD labels, normal
  width for prose.
- All Google Fonts / OFL. Load once (`index.html`), set at the Tailwind/token base, then sweep inline
  `fontFamily` usages. **Verify résumé-copy readability** at body sizes (Saira normal width + generous
  line-height for prose; reserve condensed widths for labels).

## Design system
- **One token source of truth:** consolidate `src/stellar/ui/tokens.js` (`SC`) + `src/index.css`
  `:root` + `tailwind.config.cjs` + `ui/motionTokens.js` → semantic colors + an opacity helper, a type
  scale, a radius scale, a shadow scale, ONE glass treatment, a z-index ladder, and motion tokens.
- **Shared primitives:** `<GlassPanel> <Button> <Label> <Stat> <Tag> <Brackets/Reticle>` — refactor
  overlays onto them (also feeds the Holo-Bridge chrome).
- **Uniform language:** sentence-case, consistent letter-spacing, one glass blur, one shadow scale.

## Build order
1. **Audit the TRUE currently-mounted overlay set** (reconcile CockpitHUD / NavConsole / PlanetHUD / …
   — the two audits disagreed; resolve what actually mounts in the live tour).
2. Define the token module + load the Tactical-HUD fonts; wire the Tailwind base.
3. Build the primitives.
4. Migrate overlays component-by-component (highest-traffic first: ContentPanel/Holo-Bridge, CockpitHUD,
   toasts, RankMeter, intro).
5. Consistency sweep (caps, spacing, z-index ladder). 6. Remove dead/legacy overlays.

## Files
`src/stellar/ui/tokens.js` (expanded), new `src/stellar/ui/primitives/*`, `src/index.css`,
`tailwind.config.cjs`, `index.html` (font links), then a sweep across `src/stellar/*.jsx`.

## Verification
Every overlay uses the token system + the Tactical-HUD font; one glass / shadow / radius language;
sentence case; readable on mobile; no contrast regressions (WCAG AA); E2E desktop/rm/mobile clean.

## Note
Do early — it unblocks consistent styling for Phases 8 and 5. The font swap is global; verify the
résumé sections (the heaviest text) read well before sweeping everything.
