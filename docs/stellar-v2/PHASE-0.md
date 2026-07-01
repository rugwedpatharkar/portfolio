# PHASE 0 — Stabilize, Verify & Ship
*Make the current excellent build deployable + public, so everything after is built on solid ground.*
**Do this first — nothing is live yet** (6 commits sit unpushed; the production build is red).

## Why first
We have a working, gorgeous build with the new nav, cockpit, journey feel, glare/dust, and 3
black-planet fixes — but it's all local and the production build doesn't pass. Lock it in before
piling on the big features.

## Sub-phases (each independently checkable)

### 0.1 — Cleanup the debug + harness footprint
- Remove the temp `window.__dbg` block in `src/stellar/Scene/CameraRig.jsx` (the `warp/jactive/jkey/
  camd/fkey` readback) — it was diagnostic scaffolding.
- Remove or `.gitignore` the untracked Playwright/swiftshader harness scripts at repo root
  (`_c.mjs, _m.mjs, _verify.mjs, _round.mjs, _fwd.mjs, _hover.mjs, _earthprobe.mjs, _sweep.mjs,
  _scrolltest.mjs, _planetscroll.mjs, _scrollsweep.mjs, _verifyfix.mjs, _scenecheck.mjs, _glare.mjs,
  _glaredbg.mjs, _glareshot.mjs, _drift.mjs, _dcheck.mjs, _round.mjs, _hover.mjs`). Recommended:
  add a `/_*.mjs` line to `.gitignore` and keep them locally (they're useful), OR move to a
  `scripts/headless/` dir if we want them tracked. **Decision needed:** gitignore vs track.
- Verify the fix comments left in `SolarEclipse.jsx` / `Planet.jsx` / `StellarApp.jsx` read cleanly.

### 0.2 — User verification on real GPU
- Hand the user `http://localhost:5175/` (hard-refresh, Cmd+Shift+R). Confirm:
  - **Mercury (and all inner planets) visible without hovering** — the frustum-cull fix.
  - **No black/dim planet** on any nav path (scroll/keys/clicks) — the focus + eclipse fixes.
  - **D effects** read well: glare blooms on inward dives, dust streams on hops, both invisible when
    settled. Tune `StellarGlare` (`* 0.6`) / `StellarDrift` (`* 0.5`) if too strong/faint.
- **Critical:** confirm which port/worktree the user actually views (5173 is an OLDER worktree
  WITHOUT these fixes; 5175 is this worktree).

### 0.3 — Fix the production build (deploy blocker)
- `npm run build` + `npm run lint` are **red at baseline** (per CLAUDE.md). This is real,
  currently-blocked work — the site cannot deploy until it's green.
- Triage: run `npm run build`, capture errors, fix (likely: unused imports, missing deps, type/JSX
  issues, asset paths, env). Then `npm run lint` (or relax the gate to a `lint:ci` that passes).
- Confirm `npm run preview` serves the prod bundle and the experience matches dev (intro skip,
  reduced-motion, no white frame).

### 0.4 — Commit, push (on approval), deploy
- Commit cleanup as `chore(stellar): remove debug probe + harness scaffolding` and the build fix as
  `fix(build): make production build/lint pass for deploy`.
- **Push only on explicit user approval** (`github.com-personal` SSH). First public v2 deploy
  (Vercel/Netlify/GitHub Pages — confirm target with user).

## Files
- `src/stellar/Scene/CameraRig.jsx` (remove `window.__dbg`).
- `.gitignore` (add `/_*.mjs`) or new `scripts/headless/`.
- Whatever the build errors point to (TBD by running it).
- Possibly `package.json` (a `lint:ci`/`build` script), deploy config (`vercel.json` etc.).

## Verification
- `npm run build` exits 0; `npm run preview` loads; dev `:5175` unchanged.
- User confirms inner planets + D on their GPU.
- Reduced-motion + mobile emulation: straight-to-tour, no forced audio, no white frame.

## Risks / gotchas
- The first-load Vite optimize takes ~4 min on a cold server here — be patient or use the warm 5175.
- Don't `rm -rf node_modules/.vite` (forces another ~4-min optimize).
- The legacy build being red may hide multiple issues — budget time; it's the gate to *shipping*.
