# Rugwed Patharkar — Portfolio

A cinematic 3D portfolio built as a scientifically-accurate solar system.
Every visitor lands in the same experience: a scroll-driven tour from the
Sun outward through the planets, with the résumé progressively revealing
as the camera reaches each stop. Past Pluto, a pull-back finale swaps the
AU-scale solar system for the Sun among its real neighbours with the
galactic band arching overhead.

**Live:** [rugwedpatharkar.vercel.app](https://rugwedpatharkar.vercel.app)

## Stack

- React 18 + Vite 5
- Three.js 0.163 via `@react-three/fiber` (v8), `@react-three/drei`, `@react-three/postprocessing`
- Lenis for smooth scroll
- `motion/react` (Motion One) for overlay animation
- `@emailjs/browser` for the contact form
- Vercel Analytics + Speed Insights

Deployed on Vercel.

## Structure

```
src/
├── App.jsx                     one-shot WebGL probe → lazy StellarApp, else a
│                               lightweight static résumé fallback
├── content/index.js            résumé single-source-of-truth
└── stellar/                    the 3D experience
    ├── StellarApp.jsx          root orchestrator (activeIdx, focusRef, keys)
    ├── Navigator.jsx           Lenis → scrollTRef / finaleTRef
    ├── Scene/                  one <Canvas>, one <Suspense>, one <EffectComposer>
    │   ├── CameraRig.jsx       finale scrub → focus (backlit hero) → scroll
    │   ├── SceneClock.jsx      shared virtual time (paused under reduced-motion)
    │   ├── Planet.jsx          textured sphere + moons + rings
    │   ├── Sun.jsx / MilkyWay.jsx / LocalNeighborhood.jsx / …
    │   └── anomalies (BlackHole, Pulsar, Wormhole, EinsteinRing, …)
    ├── config/                 destinations, orbits, planetData, scaleRegimes, galaxy
    ├── data/                   planetFacts, brightStars, bodies, ephemeris
    ├── v3/                     overlay UI (V3Panel, V3Hud, V3Reticle, V3Editorial, …)
    │   └── sections/           per-stop résumé sections (About, Experience, …)
    └── holobridge/             HoloBridge — the info surface over the 3D scene
```

## Local dev

```sh
npm install
npm run dev            # localhost:5174
npm run lint
npm run textures       # regenerate .webp textures from any new source JPG/PNG
npm run test:visual    # Playwright visual smoke pass (see tests/)
```

## Hard rendering constraints

- One `<Canvas>`, one `<Suspense>`, one `<EffectComposer multisampling={0}>`.
- Only **one** custom postprocessing `mainImage` (`CinematicGrade`) + `Bloom`.
  A second `mainImage` merges into the pass and renders the frame white.
- Scientific-accuracy is the prime goal — radii, rotation, eccentricity,
  inclination, and 1:1 orbital distances are real (NASA/JPL). See
  `docs/galaxy/` for the cited astronomy foundation.
- Reduced-motion + mobile → snap tour (no fly-through).

## Contact

- Email — `rugwedspatharkar@gmail.com`
- LinkedIn — [rugwed-patharkar](https://www.linkedin.com/in/rugwed-patharkar)
- GitHub — [@rugwedpatharkar](https://github.com/rugwedpatharkar)
