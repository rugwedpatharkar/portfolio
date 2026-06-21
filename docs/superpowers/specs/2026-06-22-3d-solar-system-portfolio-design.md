# 3D Solar System Portfolio — Design Spec

**Date:** 2026-06-22
**Status:** Draft — awaiting final approval
**Project codename:** Stellar

## Vision

A fully 3D, navigable solar system that replaces the existing flat-scroll portfolio. Visitors arrive in space. The sun at the center is the engineer's identity. Twelve destinations (sun + planets + belts + edge beacon) hold the portfolio's content. Visitors can either watch a cinematic guided tour (default scroll behavior) or freely fly through the system by drag-rotate + click-to-jump.

Tone: cinematic, engineering-grade, playful (alien ships + comets are deliberate easter eggs). Not a tech-demo for its own sake — every visual choice ladders back to a content destination.

## Content map — every section preserved

| Body | Type | Section | Visual identity |
|---|---|---|---|
| Sol | Star | Hero | Photo at center, glowing corona, slow rotation |
| Mercury | Inner planet | About | Small, fast-rotating, gray-blue |
| Venus | Inner planet | FunFacts | Warm yellow, 8 stat-moons in close orbit |
| Earth | Inner planet | Experience | Day/night terminator, city lights on the dark side |
| Mars | Inner planet | Projects | Red, 3 satellites (MCP / RAG / Platform) |
| Asteroid belt | Belt | Achievements | 30+ instanced golden rocks, each clickable |
| Jupiter | Outer planet | Skills | Largest planet, 9 category-moons in spread orbit |
| Saturn | Outer planet | Notes | Banded teal planet with rings = topics |
| Uranus | Outer planet | Education | Tilted axis (90°), 4 percentage-moons |
| Neptune | Outer planet | Hobbies | Deep blue, 6 personal-interest moons |
| Kuiper belt | Belt | Testimonials | Small bright bodies at outer system |
| Edge beacon | Beacon | Contact | Pulsing red signal at system's edge |

Plus:
- **2 alien ships** drifting on Lissajous paths; click reveals personality content
- **Comets** spawning occasionally, each carrying a status update (latest commit, etc.)
- **2 nebula clouds** in opposite corners for spatial depth
- **5,000-point star field** as backdrop

## Two navigation modes (both always available)

### Mode A — Cinematic scroll (default)
Visitor lands at Sol. Scrolling triggers a GSAP-choreographed camera flight that visits each destination in order. Content overlay slides in when the camera "arrives" at a body. Scroll back = camera reverses.

### Mode B — Free roam
Drag-rotate orbits the camera around the system center. Click any body → camera flies directly there. URL hash syncs (`/#skills` flies to Skills from a shared link). A small minimap in the top-right shows current location.

### URL routing
- `/` lands at Sol
- `/#about`, `/#funfacts`, `/#experience`, etc. fly directly to that destination
- Browser back/forward navigates between visited destinations

## Architecture

```
<App>
  <BootSequence />        ← typed boot log + progress, dismisses when scene ready
  <Canvas frameloop="demand">
    <Suspense>
      <Scene>
        <Stars count={5000} />
        <Nebulae />
        <Sun />
        <Planets />        ← Mercury through Neptune, each its own component
        <AsteroidBelt />   ← instanced
        <KuiperBelt />     ← instanced
        <AlienShips />
        <Comets />
        <Camera ref />     ← controlled by Navigator
      </Scene>
    </Suspense>
  </Canvas>
  <Navigator />            ← scroll + drag + click + URL coordination
  <ContentOverlay />       ← active section's content as portal'd HTML over the canvas
  <Minimap />              ← top-right corner; always visible
  <BackToSystem />         ← visible when overlay is open
</App>
```

## Tech stack

- **`@react-three/fiber`** — React renderer for Three.js
- **`@react-three/drei`** — helpers (OrbitControls, Stars, useScroll, Html)
- **`three`** — peer dep (single chunk, lazy-loaded after boot)
- **`gsap`** + **`gsap/ScrollTrigger`** — camera flight choreography
- **`lenis`** — smooth scroll that drives GSAP ScrollTrigger
- **`motion`** — already installed; for content overlay animations
- **No texture downloads** — all planets are procedural shaders (custom GLSL fragments via `<shaderMaterial>` or `drei/MeshDistortMaterial`)

## Performance budget

The discipline that prevents the previous lag:

| Rule | Why |
|---|---|
| `frameloop="demand"` | Canvas idle = 0 CPU. Renders only on scroll/drag/animation. |
| Instanced asteroids (1 draw call for 1000+) | GPU-friendly, looks like a real belt. |
| `drei/Points` for star field | Single buffer for 5000 stars; cheap. |
| Procedural planet shaders | No texture downloads, no IO blocking. |
| `dpr={[1, 1.5]}` | Caps device pixel ratio so retina screens don't render at 4x. |
| Suspense + boot sequence | Three.js loads while user watches the boot log — perceived load = 0. |
| Lazy section-content imports | Each planet's content only loads when camera arrives. |
| Reduced motion: scene static + scroll snaps | `prefers-reduced-motion: reduce` swaps cinematic flights for instant section jumps. |

### Hard FPS targets
- Desktop: 60 fps during free roam and camera flights
- Mid-range mobile (iPhone 12 / Pixel 6 class): 30 fps sustained
- Low-end mobile (older Android, Lighthouse-mobile profile): 24 fps minimum

If we miss the mobile target during Phase 7 perf hardening, we tune by lowering asteroid count and disabling nebulae on mobile.

## Mobile (user explicitly opted into full 3D)

Full 3D on mobile per user direction. Adjustments:
- DPR capped at 1.5 (vs desktop 2)
- Asteroid count 300 (vs 1000)
- Nebula clouds disabled
- Camera flights use simpler easing (less work per frame)
- Tap-to-fly replaces click-to-fly
- Touch drag-rotate via OrbitControls touch handlers
- No comet ambient (only on demand / explicit triggers)
- 2-finger pinch zoom for free-roam altitude

## Boot sequence (user picked this)

A black canvas. A typed `monospace` boot log appears one line at a time, ~80ms per character:

```
> initializing navigation system...
> charting orbital paths...
> calibrating instruments...
> loading skill catalog: 9 categories · 67 items
> loading projects: 9 entries
> loading writing: 3 notes
> welcome aboard, visitor.
```

A subtle progress bar at the bottom fills as the Three.js chunk loads. When loaded, the log fades, the system reveals with a 1.5s "rolling out from the sun" camera move. Total boot: ~2-3 seconds, feels intentional.

## Replace, not opt-out (user picked this)

The existing flat-scroll site is replaced entirely. No "skip the tour" button. The 3D experience IS the portfolio. Recruiters scroll, get the guided tour, land on Contact at the end.

The flat content is preserved as data — every section's content stays in `src/content/index.js`. The new system pulls from there into the content overlays.

## Content overlay pattern

When the camera arrives at a planet, the planet remains visible (parked left-of-center) while a content panel slides up from the bottom with that section's content. The overlay uses the existing section components (About, Experience, Skills, etc.) but rendered in a portal'd `<dialog>` with backdrop blur on the canvas.

The dialog can be:
- Dismissed by scroll (continues the tour)
- Dismissed by Escape (returns to system view)
- Dismissed by click-outside (returns to system view)
- Switched to next via arrow keys / swipe

The existing card grids, terminal, GitHub stats widget — all stay inside their overlays. We don't rebuild the content, we re-host it.

## Implementation phases

| Phase | Hours | Deliverable |
|---|---|---|
| 1. Foundation | 4 | R3F scaffold, Lenis, GSAP, boot sequence, sun + 1 planet rendering |
| 2. All planets | 4 | 9 distinct planets with procedural shaders, moons, rings, tilt |
| 3. Belts + extras | 3 | Asteroid belt (Achievements), Kuiper belt (Testimonials), star field, nebulae |
| 4. Navigation | 4 | Scroll tour, free-roam OrbitControls, click-to-fly, URL hash |
| 5. Content overlays | 3 | Per-planet content panels using existing section components |
| 6. Ships + comets | 2 | Alien ships, comets, easter egg reveals |
| 7. Mobile | 3 | DPR cap, lower asteroid count, touch gestures, tap-to-fly |
| 8. Perf hardening | 3 | Device profiling, reduced-motion fallback, Lighthouse pass |
| **Total** | **26h** | Production-ready |

Shipped across 4 commits (Phases 1-2, 3-4, 5-6, 7-8) so you can review progress.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Three.js bundle size hurts LCP | Boot sequence absorbs perceived load. Static OG + meta tags still resolve fast for crawlers and link previews. |
| Mobile perf misses 30fps target | Phase 7 has a budget gate; we lower particle count, disable nebulae, drop DPR before shipping |
| Visitor disoriented by 3D | Minimap shows location always. Cinematic scroll never requires controls to progress. Boot sequence teaches the metaphor. |
| Accessibility | Reduced-motion fallback = no camera flights, no continuous animation. Each destination has a focusable button equivalent in DOM for keyboard nav. Screen readers get the existing semantic HTML via the overlay system. |
| SEO/crawler invisibility | Server-rendered fallback in `index.html` lists each section's heading + first paragraph as static text. Crawlers see the content, browsers see the 3D. |
| Loading screen feels like a wait | Boot log is intentional content — sets the tone. ~2 seconds is fine if the visitor is reading. |

## Out of scope (deliberately)

- Sound effects (could add later if you want)
- Multiplayer / shared cursors
- Per-visitor analytics ship-tracking ("Where in the system did they spend the most time?") — interesting but Phase 9
- AR view via WebXR

## Open questions / decisions still to make

- **Sun visual:** Should the sun BE your photo (texture on the star), or a stylized star with your photo orbiting it as the first body? My recommendation: the photo IS the sun — strongest identity statement.
- **Color tone for planets:** Stay close to your existing brand palette (purple, teal, amber, magenta), or take colors from real astronomy (Mars red, Neptune blue)? My recommendation: hybrid — real astronomical colors for instantly-recognizable planet identity, brand accents for moons and rings.
- **Sound:** Default off, opt-in via a corner button? My recommendation: yes, off by default.

These can be decided during Phase 1 by seeing what looks right in the browser.

---

## Approval

Sign off below to proceed to writing-plans + Phase 1 implementation.

- [ ] **Vision approved.** I commit to the 3D solar system replacement.
- [ ] **Phases approved.** I'm comfortable with the 26h estimate across 4 commits.
- [ ] **Risk register acknowledged.** I understand mobile and SEO considerations.
