# PHASE 7 — Immersion & Reach
*The modern-web WOW layer: spatial, social, time-aware, accessible.*
**Stretch — sequence after the core; pick a subset with the user**

## Features (each its own small build; cherry-pick)

### Real ephemeris + time-travel scrubbing
- "Where are the planets **right now**" — drive positions from real ephemeris (`astronomy-engine`
  JS lib, or NASA JPL Horizons data) layered onto the existing orbit math (keep the accurate engine).
- A timeline scrubber: 1977 (Voyager launch) → today → 3026; watch orbits/auroras/geysers cycle.
- **Sources:** Swiss Ephemeris, astronomy-engine, NASA JPL Horizons, NASA "Eyes on the Solar System".

### WebXR / VR / AR
- Browser-native immersive mode: Apple Vision Pro (visionOS Safari, gaze-pinch), Meta Quest
  (passthrough AR + hand-tracking). Walk around the system; pinch-scale; gaze-select to scan.
- **Sources:** Upload VR (Vision Pro WebXR), VR.org (2026 adoption), WebXR Device API (MDN).

### Multiplayer cursors / presence
- Lightweight shared presence (PartyKit/Ably): see other visitors' cursors + "scanning X" status;
  no full multiplayer. **Sources:** PartyKit, Ably cursors.

### Reach polish (pick what fits)
- Gyroscope/gesture controls (mobile tilt to pan) · shareable **deep-links** (extend the `#/…` hash)
  · **QR business-card mode** (current view → QR + contact) · **"add to calendar"** for real 2026
  astro events (Feb/Aug eclipses) · **Konami** secret mode · PWA offline (service worker) · haptics
  (Vibration API on Android).

### Accessibility hardening (also an always-on baseline)
- Full keyboard nav (already strong) · `prefers-reduced-motion` (already honored) · ARIA labels +
  live regions for dynamic updates (scan results, discoveries) · screen-reader narration of the tour
  · high-contrast mode · WCAG AA contrast. **Sources:** MDN ARIA, accessibility.com 2026 trends.

## Files (TBD per feature)
- New: `ephemeris.js` + a time-scrubber UI; `XRMode.jsx` (WebXR session); `Presence.jsx` (cursors);
  `QRCard.jsx`; `calendar.js` (iCal). Modify: `StellarApp.jsx` (deep-link encode/decode, mode hooks),
  accessibility passes across the DOM overlays.

## Verification
- Ephemeris matches a known reference (e.g., NASA Eyes) within tolerance; XR enters/exits cleanly on
  a headset; presence cursors update; deep-links round-trip; all features reduced-motion + a11y safe;
  no perf or white-frame regressions.

## Note
This phase is explicitly **modular** — ship the highest-value items (real ephemeris, photo-deep-links
already in Phase 3, accessibility) and treat WebXR/multiplayer as optional flagships per user appetite.
