# PHASE 3 — Soul: Reactive Co-pilot, Photo Mode, Sound & Discovery
*Give it a personality and shareable moments.*
**Finishes M3 · Plan Part IV-meta**

## The gap
The co-pilot is a **static line** (CockpitHUD), not a character that reacts. There's no photo mode,
no data sonification, and the discovery meter (`explorer.js`/`RankMeter`/`DiscoveriesView`) could be
richer. This phase adds the "soul" + the shareable hooks.

## What exists to reuse
- Co-pilot line in `CockpitHUD.jsx`; event bus (`stellar:destination/whoosh/sound:*`).
- `data/explorer.js` (13 discoverables, rank tiers), `RankMeter.jsx`, `DiscoveriesView.jsx`,
  `OverviewMap.jsx` scan-to-reveal, pulsar/Wow! Morse decode.
- `sound/SoundManager.js` singleton + `SoundToggle.jsx`; `CinematicGrade` uniforms (for Photo Mode).
- `cameraRef`/`warpVelRef` exposed to DOM; `focusedObj`/`getBodyContent` for context.

## Sub-phases
- **3A — Reactive co-pilot (scripted core).** A small rules-engine that reacts to events: arriving at
  a body, scanning an anomaly, filling the discovery meter, idling. Lines keyed by object + a "said
  recently" cooldown so it's **sparse, never blocks** (TARS/Jarvis restraint). Drive the existing
  co-pilot line + a brief comms-tone. *Check:* contextual lines on scan/nav; never spammy; RM-safe.
- **3B — Optional LLM co-pilot + voice command (toggle).** Behind a settings toggle: voice in (Web
  Speech API) → LLM (Claude API via a tiny serverless proxy; key never in client) with injected
  context (location, lore, discoveries) → TTS out (Web Audio). Falls back to the scripted engine when
  off/offline. *Decision needed:* ship scripted-only first, LLM as a follow-up. *Check:* "what's that
  ring?" → spoken answer; graceful offline fallback.
- **3C — Photo / cinematic mode.** Pause → free camera (pan/tilt/roll, focal length, aperture-bloom,
  grain/vignette toggles via CinematicGrade uniforms) → export a **shareable postcard** (canvas
  screenshot + name/date stamp + a **deep-link QR** that reopens the exact view). *Check:* export
  produces a clean image; the deep-link restores camera + focus.
- **3D — Data sonification + spatial audio.** Web Audio `PannerNode` 3D: pulsar beam "whoosh",
  black-hole accretion rhythm, light-curve melody; layer real **NASA "sounds of space"** ambient bed.
  Extend `SoundManager`. Default muted; reduced-motion → silent. *Check:* approaching pulsar/black
  hole pans + pitches; un-mute gated on first gesture.
- **3E — Discovery meta polish.** Achievements/badges on `explorer.js`; "system charted X/Y" surfaced;
  scan-codex of everything found; subtle unlock toasts. *Check:* badges unlock; codex persists
  (localStorage); no layout jank.

## Files
- New: `CoPilot.jsx` (rules-engine + optional LLM client), `PhotoMode.jsx`, possibly `sonification.js`.
- Modify: `CockpitHUD.jsx` (co-pilot line driver), `sound/SoundManager.js` (sonification + ambient),
  `data/explorer.js` + `RankMeter.jsx`/`DiscoveriesView.jsx` (achievements), `CinematicGrade` (Photo
  Mode uniform hooks), deep-link encode/decode in `StellarApp.jsx` (extend the existing `#/…` hash).
- Optional infra: a serverless proxy (`/api/copilot`) for the LLM key (Vercel function).

## Interactivity (§D slice)
Photo mode + postcards · reactive AI co-pilot (scripted + optional LLM) · voice command · spatial
audio + sonification · achievements/badges + scan-codex.
**Sources:** Photo Mode Awards 2026, MDN Web Audio spatialization, CopilotKit/Turing (voice LLM),
Mistral Voxtral (Jul 2025), Trophy (gamification), NASA "sounds of space".

## Verification
- Co-pilot reacts contextually (scripted) + via LLM when enabled, with cooldown; photo export +
  deep-link round-trips the exact view; pulsar/black-hole audio pans/pitches; achievements unlock;
  everything gates off under reduced-motion; LLM key never reaches the client.
