# PHASE 2 — Item Dossiers & Characterful Worlds
*The résumé itself becomes the holographic experience; every ←→ object is a **moment**.*
**Finishes M2 · Plan Part III (item side)**

## The gap
The 2-axis nav works, but the ←→ "items" are generic octahedrons (`LaneObjects.jsx`), ←→ still
shows the *section* panel (not a per-item dossier), there's no characterful model or 3-beat arrival,
and the section panels (`ContentPanel.jsx`) load plain (no scan-reveal). The plumbing is in; the
*soul of the item-view* is missing.

## What exists to reuse
- `LaneObjects.jsx` — the co-orbital convoy per section (octahedron + glow, active=amber+reticle),
  `laneObjectPosition()` in `config/orbits.js` (`LANE_ARC=2.8`).
- `ScanReadout.jsx` — already has the scan-sweep + staggered reveal + reduced-motion fallback (the
  language to extend to sections + items).
- `data/sectionItems.js` — `SECTION_ITEMS` map (section → items from the Content layer).
- `CameraRig` focus branch — `applyFocus(planetIdx, k>=0)` already dolly-focuses lane objects
  (`FOCUS_DIST=1.8`); `navItem(dir)` drives ←→.

## Sub-phases
- **2A — Characterful per-item models.** Replace the octahedron with forms that **echo content**:
  - Experience → orbital **stations / probes** (research platform, comms relay).
  - Projects → characterful **craft** (mining rig, derelict, survey drone). Mars probes partly built
    (`ProjectProbes`) — reuse.
  - Skills → **Jupiter's moons**; Education → **Uranus's moons** (real bodies as the items).
  - This is the home for tasteful **pop-culture cameos** as scannable objects (see §C below).
  - Implement as a small model registry keyed by item type; instanced where possible; LOD for distance.
  *Check:* each section's lane shows distinct, recognizable models, not identical octahedra.
- **2B — Item-view dossier.** ←→ flies *in* and opens a **per-item** dossier (title, dates, bullets,
  metrics) from `sectionItems.js`, replacing the section panel while focused on an item. Extend
  `ContentPanel`/`ScanReadout`; ↑↓ still carries to the next planet. *Check:* ←→ to "Upswing" under
  Experience shows that role's dossier, not the Experience section blurb.
- **2C — 3-beat arrival per object.** approach → **reticle-lock + beep** → **scan-beam reveal** that
  streams data into the dossier. ←→ **banks along the orbital arc**; **rack-focus** planet→object on
  board. Reuse `stellar:sound:beep`/`whoosh`. *Check:* the 3 beats read distinctly; feels like a scan.
- **2D — Section dossiers as scan-reveal.** Bring the holographic sweep/flicker-in to the section
  panels (`ContentPanel`) so About/Experience/Projects/Skills/Education arrive like a scan, not a
  static card. One dossier template + per-section variation. *Check:* sections flicker-in; RM →
  instant cross-fade.

## Files
- Modify: `Scene/LaneObjects.jsx` (model registry), `config/orbits.js` (arc-bank), `ContentPanel.jsx`
  + `ScanReadout.jsx` (item dossier + section scan-reveal), `data/sectionItems.js` (item model hints).
- New: small `Scene/laneModels/` (or a `LaneModel.jsx` switch) for the characterful forms; possibly
  `ItemDossier.jsx` if cleanly separable from `ContentPanel`.

## Pop-culture cameos for the lane objects (§C slice — diegetic, taste)
Use sparingly as a few of the scannable items / nearby cameos: a derelict freighter (Star Wars), a
TARS-style probe (Interstellar), the Rocinante or Normandy passing (Expanse / Mass Effect), a
Voyager probe with the **interactive Golden Record** beat (real), Discovery One (2001). Each gets an
in-universe dossier; never alters physics. Heavier megastructure cameos live in Phase 4 Wave 3.
**Sources:** fandom wikis (Expanse, Mass Effect, 2001), NASA Voyager Golden Record, SlashFilm ships.

## Verification
- Each section's ←→ items: distinct models + real per-item dossiers + 3-beat reveal; banking on ←→;
  sections flicker-in; reduced-motion → cross-fades; no perf regression (instancing/LOD); no white frame.
