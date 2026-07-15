/*
 * Destination registry for the Stellar 3D portfolio.
 *
 * Each destination has:
 *   - id           — URL hash + section anchor
 *   - kind         — "star" | "planet" | "belt" | "beacon"
 *   - type         — for planet: "rocky" | "warm" | "earth" | "rust" | "gas"
 *                    | "golden" | "ice" | "abyss" (controls shader)
 *   - position     — [x, y, z] in scene units; sun at origin
 *   - radius       — visual size
 *   - color/colorB — primary + secondary palette for the shader
 *   - section      — which content section this destination opens
 *   - cameraTarget — { position, lookAt } for cinematic arrival
 *   - moons, rings, axialTilt — optional
 *
 * Order matters — the cinematic scroll visits destinations in this order.
 */

import { COSMIC_STOPS } from "../v3/cosmicStops";
import { PLANET_FACTS } from "../data/planetFacts";
import { PLANET_EDITORIAL } from "../v3/data/planetEditorial";

const DEG = Math.PI / 180;

export const DESTINATIONS = [
  {
    /* v3 STOP 00 — the MILKY WAY homepage. The visitor's first frame is a
       cinematic view of the galaxy from inside — arching band across the sky,
       Sagittarius core glow, Great Rift dust lanes, thousands of real stars.
       No résumé section, no planet body — pure "welcome to the journey"
       spectacle. Sun + inner planets are hidden at this stop (see Scene/
       index.jsx gating on activeIdx === 0); the visible geometry is Skybox,
       Stars, MilkyWay, Nebulae, Constellations, DistantGalaxies, StarLabels.
       Scrolling triggers a hyperspace jump to the Solar-System overview. */
    id: "hero",
    kind: "overview",
    label: "The Milky Way",
    position: [0, 0, 0],
    radius: 0,
    accent: "#ffd58a",
    section: "hero", // no résumé — pure intro
    docTitle: "",
    /* Camera pose framing the full-screen HomepageGalaxy (core at ~[240,40,
       -560]). Camera pulled to +Z and lifted so the tilted disc fills the
       frame and bleeds past the edges; lookAt aimed at the core so the galaxy
       reads right-of-centre with the dim outer arm sweeping across the left
       (where the hero text sits). Wide fov=72 for the full-bleed spread. */
    cameraTarget: { position: [-300, 860, 2140], lookAt: [40, 0, -560], fov: 82 },
  },
  {
    /* v3 STOP 01 — Solar-System overview / arrival pose. Reached via the
       hyperspace jump from the Milky Way homepage. Carries the ABOUT ME
       section (was Sun's About). No body of its own — Sun + planets already
       draw from their own stops. */
    id: "about",
    kind: "overview",
    label: "Solar System",
    position: [0, 0, 0],
    radius: 0,
    section: "about",
    docTitle: "About",
    /* v3 system overview — pulled WAY back so the whole solar system fits
       in-frame with Neptune's 2857u orbit visible. Camera at ~5300u from
       origin (inside the 7000u sky shell) at a high 3/4 vantage so orbits
       read as concentric ellipses around a distant Sun. Was too zoomed
       in at 2200u altitude — Sun's bloom swallowed the frame; from here
       Sun is a bright dot and the orbits dominate. */
    cameraTarget: { position: [2000, 4000, 2800], lookAt: [0, 0, 0], fov: 60 },
  },
  {
    id: "impact",
    kind: "star",
    label: "Sol",
    position: [0, 0, 0],
    /* TRUE-SCALE Sun: its real radius, ≈109× Earth. The whole system is scaled
       up (large AU_UNIT) so this colossal Sun clears the inner orbits. */
    radius: 19.87, // 695,700 km — 109.2× Earth (0.182 × 109.2)
    color: "#fff2e0", // the Sun is WHITE (5772K); warm-white here, warmth lives in the corona/bloom
    /* HUD accent (Sol gold) — distinct from the near-white body colour.
       Non-planet stops carry `accent`; planets fall back to `color`. */
    accent: "#e9c675",
    texture: "/textures/planets/sunmap.webp",
    section: "funfacts",
    docTitle: "Impact",
    /* About — fly IN from the overview to frame the Sun prominently, still kept
       right-of-centre so the left info column stays clear. */
    cameraTarget: { position: [6, 8, 82], lookAt: [-10, 1, 0], fov: 46 },
  },

  // Inner system
  {
    id: "experience",
    docTitle: "Experience",
    kind: "planet",
    type: "rocky",
    label: "Mercury",
    position: [5.5, 0.1, 0.3],
    radius: 0.07, // 2,439 km — smallest planet, ~0.38× Earth
    color: "#7a7d85",
    colorB: "#2f3138",
    texture: "/textures/planets/mercurymap.webp",
    bumpTexture: "/textures/planets/moonbump1k.webp",
    section: "experience",
    /* Camera closes in to frame the now-tiny world (offset scaled to radius). */
    cameraTarget: { position: [5.65, 0.13, 0.52], lookAt: [5.5, 0.1, 0.3], fov: 44 },
  },
  {
    id: "projects",
    docTitle: "Projects",
    kind: "planet",
    type: "warm",
    label: "Venus",
    position: [8.2, -0.2, 1.0],
    radius: 0.173, // 6,052 km — Earth's near-twin
    color: "#f8c555",
    colorB: "#a0651a",
    texture: "/textures/planets/venusmap.webp",
    bumpTexture: "/textures/planets/venusbump.webp",
    /* Venus's map is near-white and blooms to a featureless disc.
       Knock it back so the cloud banding survives the bloom pass. */
    tint: "#c9b48a",
    axialTilt: 177.4 * DEG, // Venus spins retrograde — effectively upside-down
    section: "projects",
    /* Venus — high 3/4 looking down through the haze (offset scaled to radius) */
    cameraTarget: { position: [8.57, 0.27, 1.46], lookAt: [8.2, -0.15, 1.0], fov: 46 },
  },
  {
    id: "achievements",
    docTitle: "Achievements",
    kind: "planet",
    type: "earth",
    label: "Earth",
    position: [11.4, 0.0, -1.4],
    radius: 0.182, // 6,371 km — the reference world
    color: "#3b6ea8",
    colorB: "#1d3a5e",
    texture: "/textures/planets/earth_atmos.webp",
    nightTexture: "/textures/planets/earth_lights.webp",
    cloudTexture: "/textures/planets/earthcloudmap.webp",
    normalTexture: "/textures/planets/earth_normal.webp",
    /* Inverted ocean mask used as a roughnessMap: oceans dark → low
       roughness → mirror-like → catch a sharp sun-glint; land bright →
       matte. (The raw spec map had oceans bright = the wrong way round.) */
    specularTexture: "/textures/planets/earth_roughness.webp",
    /* The Moon — one prominent satellite at ~0.27 Earth radius (the real
       ratio, so it reads as THE Moon, not a pebble). Planet.jsx's moon loop
       orbits + textures it; it rides Earth's OrbitGroup, so it follows Earth
       around the sun while circling the planet. */
    moons: 1,
    moonColor: "#cfcdc9",
    moonTexture: "/textures/planets/moonmap1k.webp",
    moonScale: 0.27,
    axialTilt: 23.4 * DEG, // Earth's real obliquity — tips the globe + Moon orbit
    section: "achievements",
    /* Earth — the standout hero shot. These exact values frame the
       day/night terminator without the sun flooding the lens; do not
       move the position or the sun glares the frame orange. */
    cameraTarget: { position: [11.76, 0.22, -1.08], lookAt: [11.4, 0, -1.4], fov: 42 },
  },
  {
    id: "skills",
    docTitle: "Skills",
    kind: "planet",
    type: "rust",
    label: "Mars",
    position: [15.3, 0.3, 0.6],
    radius: 0.097, // 3,390 km — about half Earth
    color: "#b06a48", // real Mars: muted butterscotch-ochre (iron-oxide regolith), not fire-red
    colorB: "#6e3a26",
    texture: "/textures/planets/marsmap1k.webp",
    bumpTexture: "/textures/planets/marsbump1k.webp",
    axialTilt: 25.2 * DEG, // near-Earth obliquity — the polar caps sit off-vertical
    moons: 2, // Phobos + Deimos — tiny captured rocks
    moonColor: "#8a8276",
    moonScale: 0.06,
    /* Phobos + Deimos — tiny, irregular captured-asteroid greys. */
    moonSet: [
      { color: "#7d7165", scale: 0.05 },  // Phobos — closer, larger
      { color: "#8a7e70", scale: 0.038 }, // Deimos — smaller, smoother
    ],
    section: "skills",
    /* Mars — slight low angle (offset scaled to radius) */
    cameraTarget: { position: [15.47, 0.22, 0.81], lookAt: [15.3, 0.2, 0.6], fov: 44 },
  },

  // Ceres — the dwarf planet IN the asteroid belt (Achievements). Keeps id +
  // section so all lookups / content / hash stay intact; only the body changes.
  {
    id: "writing",
    docTitle: "Writing",
    kind: "planet",
    type: "rocky",
    label: "Ceres",
    position: [19.5, 0.4, 0.6],
    /* Small visibility floor (true scale 0.0135 / 940 km is a sub-pixel speck).
       The backlit camera frames every body by DISTANCE-from-radius, so this no
       longer needs to be inflated for visibility — 0.06 reads as a small dwarf
       and clears the 0.1 near-clip. Still well under Pluto's 0.034... note it is
       not (0.06 > 0.034): kept marginally larger only so the cleaned Dawn map is
       legible; apparent size is a framing choice, not a Ceres-vs-Pluto claim. */
    radius: 0.06,
    color: "#8a8378", // UI accent only — the surface uses the real NASA map
    colorB: "#5b574e",
    texture: "/textures/planets/ceres.webp", // NASA/JPL Dawn grayscale photomosaic
    section: "notes",
    /* Tight framing for the dwarf (offset preserved through the AU remap). */
    cameraTarget: { position: [19.54, 0.43, 0.65], lookAt: [19.5, 0.4, 0.6], fov: 44 },
  },

  // Outer system
  {
    id: "education",
    docTitle: "Education",
    kind: "planet",
    type: "gas",
    label: "Jupiter",
    position: [24.6, -0.4, -1.8],
    radius: 2.0, // 69,911 km — the giant; ~11× Earth
    color: "#c9a06a", // real Jupiter: tan/cream/orange-brown bands (NASA)
    colorB: "#9a6a3c",
    texture: "/textures/planets/jupitermap_hd.webp",
    bumpTexture: "/textures/planets/jupiter_bump.webp",
    section: "education",
    /* Jupiter — wide + slight roll to sell the scale (offset scaled to radius) */
    cameraTarget: { position: [27.89, 1.39, 1.02], lookAt: [24.6, 0.1, -1.8], fov: 52, roll: -0.05 },
    axialTilt: 3.1 * DEG, // Jupiter spins nearly upright
    oblateness: 0.065, // real polar flattening — Jupiter is visibly squashed by its fast spin
    faintRings: true, // Jupiter's faint dusty ring (real)
    moons: 4, // the four Galilean moons
    moonColor: "#cfc6e0",
    moonScale: 0.045,
    /* The Galilean moons, each distinct (real relative sizes, Ganymede largest). */
    moonSet: [
      { color: "#e6c84e", scale: 0.05, glow: 0.3 }, // Io — volcanic sulfur-orange
      { color: "#e0e6e2", scale: 0.045 },           // Europa — bright icy white
      { color: "#9c8c74", scale: 0.062 },           // Ganymede — largest moon, tan-grey
      { color: "#6f6253", scale: 0.056 },           // Callisto — dark, heavily cratered
    ],
  },
  {
    id: "hobbies",
    docTitle: "Hobbies",
    kind: "planet",
    type: "golden",
    label: "Saturn",
    position: [30.2, 0.6, 1.5],
    radius: 1.666, // 58,232 km — second-largest (excl. rings)
    color: "#e3c485",
    colorB: "#a07a3a",
    texture: "/textures/planets/saturnmap_hd.webp",
    bumpTexture: "/textures/planets/saturn_bump.webp",
    section: "hobbies",
    /* Saturn — dutch tilt to throw the rings across the frame (offset scaled) */
    cameraTarget: { position: [33.68, 2.61, 4.69], lookAt: [30.2, 0, 1.5], fov: 50, roll: 0.11 },
    axialTilt: 26.7 * DEG, // Saturn's obliquity — tilts the ring plane across the frame
    oblateness: 0.098, // the most oblate planet — ~10% flattened, clearly squashed
    rings: true,
    ringTexture: "/textures/planets/saturnringcolor.webp",
    ringColor: "#f8c555",
    moons: 6,
    moonScale: 0.05,
    /* Titan — bigger than Mercury, thick orange hydrocarbon haze; Enceladus —
       tiny, brilliant water-ice; + Rhea/Iapetus/Dione/Tethys (next-biggest). */
    moonSet: [
      { color: "#d99a4a", scale: 0.052 }, // Titan — orange haze
      { color: "#eef3f1", scale: 0.022 }, // Enceladus — bright icy
      { color: "#cdd2d0", scale: 0.016 }, // Rhea — cratered ice
      { color: "#8a7f70", scale: 0.015 }, // Iapetus — two-tone
      { color: "#d4dad8", scale: 0.012 }, // Dione — wispy ice cliffs
      { color: "#dfe6e3", scale: 0.011 }, // Tethys — Ithaca Chasma
    ],
  },
  {
    id: "testimonials",
    docTitle: "Testimonials",
    kind: "planet",
    type: "ice",
    label: "Uranus",
    position: [34.8, -0.2, -1.0],
    radius: 0.726, // 25,362 km — ice giant
    color: "#aad4cf", // real Uranus: muted greenish-cyan (2024 true-color study)
    colorB: "#7ba8a0",
    texture: "/textures/planets/uranusmap_hd.webp",
    bumpTexture: "/textures/planets/uranus_bump.webp",
    /* The bundled map is the Voyager-era over-saturated cyan; grade it toward
       Uranus's real near-featureless PALE greenish-cyan (gentler than Neptune,
       since Uranus is paler/blander). */
    grade: { sat: 0.6, lift: 0.1, mix: 0.32, tint: "#b8d6d0" },
    section: "testimonials",
    /* Uranus — closer + tighter fov so the planet fills the negative space
       (Education read as empty), with the strong dutch tilt for its 98° axis. */
    cameraTarget: { position: [36.03, 0.87, 0.02], lookAt: [34.8, 0, -1.0], fov: 40, roll: 0.17 },
    axialTilt: 97.8 * DEG, // Uranus rolls on its side — the real ~98° obliquity
    oblateness: 0.023, // real flattening
    faintRings: true, // Uranus's narrow rings ride near-vertical with its tilt

    moons: 5,
    moonColor: "#d0ccea",
    moonScale: 0.06,
    /* Uranus's major moons — pale grey-cyan icy worlds. */
    moonSet: [
      { color: "#bcc8c8", scale: 0.052 }, // Titania — largest
      { color: "#b2bebe", scale: 0.046 }, // Oberon
      { color: "#c8d4d4", scale: 0.036 }, // Miranda — small, fractured
      { color: "#aab6b6", scale: 0.05 },  // Ariel
      { color: "#9aa4a4", scale: 0.044 }, // Umbriel — darkest of the five
    ],
  },
  {
    id: "whatsetsmeapart",
    docTitle: "",
    kind: "planet",
    type: "abyss",
    label: "Neptune",
    position: [39.0, 0.4, 0.8],
    radius: 0.704, // 24,622 km — Uranus's near-twin
    color: "#7fb0c4", // real Neptune: PALE greenish-blue, only slightly bluer than Uranus (2024 Oxford true-color study)
    colorB: "#5688a0",
    texture: "/textures/planets/neptunemap_hd.webp",
    bumpTexture: "/textures/planets/neptune_bump.webp",
    /* The bundled map is the over-saturated Voyager indigo; grade it to the 2024
       true colour — a PALE greenish-blue, near-Uranus but a touch bluer. */
    grade: { sat: 0.55, lift: 0.08, mix: 0.42, tint: "#9ec6d6" },
    section: "whatsetsmeapart",
    /* Neptune — pulled back, lonely framing in the deep dark (offset scaled) */
    cameraTarget: { position: [40.54, 0.94, 2.34], lookAt: [39.0, 0, 0.8], fov: 44 },
    axialTilt: 28.3 * DEG, // Neptune's obliquity, close to Earth's
    oblateness: 0.017, // real flattening
    faintRings: true, // Neptune's faint rings + arcs (real)
    moons: 2, // Triton (large) + Nereid (small, highly eccentric)
    moonColor: "#b8d4ee",
    moonScale: 0.07,
    /* Triton — pinkish-tan nitrogen-ice, retrograde; Nereid — small + very eccentric. */
    moonSet: [
      { color: "#d8cabd", scale: 0.052 }, // Triton
      { color: "#c8c0b4", scale: 0.008 }, // Nereid — small
    ],
  },

  // Pluto — the dwarf planet IN the Kuiper belt (Testimonials). Keeps id +
  // section so all lookups / content / hash stay intact; only the body changes.
  {
    id: "contact",
    docTitle: "Contact",
    kind: "planet",
    type: "rocky",
    label: "Pluto",
    position: [44, 0.9, 1.4],
    radius: 0.034, // 1,188 km — the famous Kuiper-belt dwarf planet
    color: "#c9b6a0", // UI accent only — the surface uses the real NASA map
    colorB: "#9a7b5e",
    texture: "/textures/planets/pluto.webp", // NASA/JHU-APL/SwRI New Horizons color mosaic
    moons: 1, // Charon — ~half Pluto's diameter; the pair are a true double dwarf system
    moonColor: "#b9b1a6",
    moonScale: 0.5,
    /* Charon — grey, nearly half Pluto's size (the system's true double dwarf). */
    moonSet: [{ color: "#9a948a", scale: 0.5 }],
    /* Pluto hosts WHAT SETS ME APART (personal-differentiators pitch); the
       Contact section lives on the closing black-hole "The Edge" stop. */
    section: "contact",
    /* Tight framing for the small dwarf (offset preserved through the AU remap). */
    cameraTarget: { position: [44.08, 0.97, 1.52], lookAt: [44, 0.9, 1.4], fov: 46 },
  },

  // (Edge beacon removed in v3 — Contact now lives on Pluto, the last body.)
];

/* v3 COSMIC EPILOGUE — appended as scroll stops BEYOND Pluto: the tour journeys out
   past the edge into deep space (black hole → wormhole → nebula → pulsar → Milky Way).
   Authored in scene units (no AU remap — AU[id] is undefined for these). The camera
   drops between the object and the Sun, looking back at it. */
COSMIC_STOPS.forEach((c) => {
  const [x, y, z] = c.position;
  const len = Math.hypot(x, y, z) || 1;
  const d = Math.max(10, c.radius * 3.6); // standoff toward the Sun
  /* A cosmic stop may author its own cameraTarget for framings the default
     "drop between Sun and object" math can't produce (e.g. the Oort Cloud's
     wrap-around shell view where camera sits at intermediate distance from
     Sun and looks AT the Sun, not at the destination point). Fall back to
     the computed pose when no override is provided. */
  const cameraTarget = c.cameraTarget || {
    position: [x - (x / len) * d, y + d * 0.16, z - (z / len) * d],
    lookAt: [x, y, z],
    fov: 44,
  };
  DESTINATIONS.push({
    id: c.id,
    kind: c.kind, // "cosmic" — Scene renders the matching object; CameraRig frames by radius
    render: c.render,
    label: c.label,
    section: c.section,
    docTitle: c.docTitle ?? "",
    position: c.position,
    radius: c.radius,
    color: c.accent,
    accent: c.accent,
    cameraTarget,
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * TRUE 1:1 ORBITAL DISTANCES
 *
 * Remap every body to its real distance from the Sun (AU × AU_UNIT). The Sun is
 * size-capped (a 1:1 Sun would engulf the inner orbits), so AU_UNIT is set large
 * enough that Mercury clears it. Planet SIZES are unchanged, so each planet's
 * framing-camera offset is preserved (it just sits at the true distance); belts
 * scale their ring + offset. A radial remap (remapRadius) carries every
 * off-the-line object (anomalies, easter-eggs, dwarf planets) out by the same
 * curve; the background, flight bounds and far-clip are scaled to match.
 * ──────────────────────────────────────────────────────────────────────── */
/* LITERAL 1:1 orbital distance is now the DEFAULT — orbits use the same unit as
   the true planet radii (1 AU = 4274u), so Neptune lands ~128,000u out like the
   real solar system. `?compress=1` restores the old navigable ×45-compressed
   scale (kept as an escape hatch / A-B compare). Read once at module load
   (query params are available then; SSR-safe guard). */
const COMPRESS =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("compress") === "1";
export const AU_UNIT = COMPRESS ? 95 : 4274; // scene units per AU — true 1:1 by default
/* Everything with a FIXED backdrop distance (sky shells, Oort, heliosphere,
   far-clip) multiplies by this so it stays just outside the planets in either
   mode: 1 compressed, 45 at true scale. */
export const SKY_SCALE = AU_UNIT / 95;
const AU = {
  experience: 0.387, projects: 0.723, achievements: 1.0, skills: 1.524,
  writing: 2.77, education: 5.203, hobbies: 9.537, testimonials: 19.191, // writing = Ceres @ 2.77 AU
  whatsetsmeapart: 30.05, contact: 39.48, // contact = Pluto @ 39.48 AU (Neptune 30.05 per NASA)
};

/* The asteroid + Kuiper belts are no longer tour stops — they render as
   background scenery (Scene/index.jsx) at these true AU ranges (× AU_UNIT). */
export const BACKGROUND_BELTS = {
  // Real spans (main belt ~2.1–3.3 AU, Kuiper ~30–50 AU) rendered as FAT tori —
  // a real vertical thickness from inclination dispersion (not a thin ribbon),
  // so they read as the dense dusty donuts the reference imagery shows.
  asteroid: { inner: 2.1 * AU_UNIT, outer: 3.3 * AU_UNIT, thickness: 36, color: "#6f645a" }, // C-type-weighted dark grey-brown (belt is ~75% dark carbonaceous)
  kuiper: { inner: 30 * AU_UNIT, outer: 50 * AU_UNIT, thickness: 320, color: "#8a7360" }, // red-to-neutral (tholins) — Kuiper objects are NEVER blue
};

/* Sample curve (original radius → true radius) from the planets, used to remap
   arbitrary off-line objects so "near Saturn" / "past Neptune" stay true. */
const _curve = DESTINATIONS
  .filter((d) => d.kind === "planet" && AU[d.id])
  .map((d) => ({ r: Math.hypot(d.position[0], d.position[2]), R: AU[d.id] * AU_UNIT }))
  .sort((a, b) => a.r - b.r);

export const remapRadius = (r) => {
  if (r <= 0) return 0;
  if (r <= _curve[0].r) return r * (_curve[0].R / _curve[0].r);
  for (let i = 0; i < _curve.length - 1; i++) {
    const a = _curve[i], b = _curve[i + 1];
    if (r <= b.r) return a.R + ((r - a.r) / (b.r - a.r)) * (b.R - a.R);
  }
  const a = _curve[_curve.length - 2], b = _curve[_curve.length - 1];
  return b.R + (r - b.r) * ((b.R - a.R) / (b.r - a.r));
};

/* Scale a whole [x,y,z] out to true scale, preserving its direction from the
   Sun. Used to scatter off-line objects (anomalies, easter-eggs) so they keep
   their themed neighbourhood (e.g. HAL stays by Jupiter) at the real distance. */
export const remapPosition = ([x, y, z]) => {
  const r = Math.hypot(x, y, z) || 1;
  const f = remapRadius(r) / r;
  return [x * f, y * f, z * f];
};

/* Force a position into the −X hemisphere within the camera's view cone — i.e.
   IN FRONT of the camera / BEHIND the Sun. The whole tour is laid out along +X
   and every backlit stop looks sunward (−X), so a free-floating cosmic object is
   only visible if it sits in the −X sky near that axis. This (a) flips X negative
   (sunward), and (b) clamps the off-axis angle into [minDeg, maxDeg] so the
   object lands near, but not buried in, the Sun's glare — preserving its distance
   from the Sun and its azimuth (the y:z direction) so each object keeps a distinct
   spot ringing the Sun. Apply BEFORE remapPosition for off-line cosmic objects. */
export const frontOfSun = ([x, y, z], minDeg = 13, maxDeg = 28) => {
  const r = Math.hypot(x, y, z) || 1;
  const ax = -(Math.abs(x) || 1); // sunward (−X), in front of the camera
  let ny = y, nz = z;
  let lat = Math.hypot(ny, nz) || 1e-4;
  const tanMin = Math.tan((minDeg * Math.PI) / 180);
  const tanMax = Math.tan((maxDeg * Math.PI) / 180);
  const ratio = lat / Math.abs(ax);
  const k = ratio > tanMax ? (Math.abs(ax) * tanMax) / lat : ratio < tanMin ? (Math.abs(ax) * tanMin) / lat : 1;
  ny *= k;
  nz *= k;
  const f = r / Math.hypot(ax, ny, nz);
  return [ax * f, ny * f, nz * f];
};

/* Shortcut for the most common off-line placement chain: authored RAW tuple →
   forced into the in-front-of-Sun view cone → radially remapped to the true
   AU-scale distance. Used by ~15 anomaly / deep-field / probe components; the
   inline `remapPosition(frontOfSun(raw))` composition had been copy-pasted
   verbatim at each site. Pass through the same `minDeg` / `maxDeg` overrides
   frontOfSun accepts so a caller can widen the cone (e.g. bulk positioning). */
export const placeInFrontOfSun = (raw, minDeg, maxDeg) =>
  remapPosition(frontOfSun(raw, minDeg, maxDeg));

/* §4.12 — remap DESTINATIONS[].position + cameraTarget to their true AU-scaled
   coordinates. Extracted from a bare module-load forEach so the ordering hazard
   is now a named + idempotent function with a clear entry point. Guard prevents
   a double-remap if this is called more than once (module-load + StellarApp
   boot, or in tests).
   Still called at module load below because objects.js snapshots MARS_POS +
   parent-relative moon positions at ITS module load (config/objects.js:390) —
   a full deferral to StellarApp boot is naturally addressed by §6.3's section
   registry work, which moves those snapshots off the module top-level. */
let _destinationsInitialized = false;
export function initDestinations() {
  if (_destinationsInitialized) return;
  _destinationsInitialized = true;
  DESTINATIONS.forEach((d) => {
    /* §6.3 (full): join per-id `factCard` + `editorial` onto each row so every
       consumer that has a destination reference gets everything about that stop
       in one lookup. Source-of-truth stays split between planetFacts.js and
       planetEditorial.js (editing content is easier per-file than scrolling
       inside a giant destinations.js), but downstream code no longer needs to
       import those keyed maps — dest.factCard / dest.editorial work directly. */
    d.factCard = PLANET_FACTS[d.id];
    d.editorial = PLANET_EDITORIAL[d.id];

    const au = AU[d.id];
    if (!au) return; // the Sun stays at the origin
    const [x, y, z] = d.position;
    const r = Math.hypot(x, z) || 1;
    const f = (au * AU_UNIT) / r;
    const nx = x * f, nz = z * f;
    const cam = d.cameraTarget;
    /* Planet size is unchanged, so the framing offset is preserved — the body
       just sits at its true distance. */
    d.position = [nx, y, nz];
    d.cameraTarget = {
      ...cam,
      position: [nx + (cam.position[0] - x), y + (cam.position[1] - y), nz + (cam.position[2] - z)],
      lookAt: [nx + (cam.lookAt[0] - x), y + (cam.lookAt[1] - y), nz + (cam.lookAt[2] - z)],
    };
  });
}
initDestinations();

/* Identity map. NOTE the three-way naming — they are NOT interchangeable:
 *   • id      — the URL-hash + lookup anchor (a legacy section name, e.g. Earth's
 *               id is "achievements"). Kept stable across the v3 "shift-forward-one".
 *   • section — the résumé section this stop DISPLAYS (e.g. Earth shows "skills").
 *               V3Panel/HoloBridge are section-driven; this is the content key.
 *   • label   — the real body name ("Earth"); color — the real body color.
 * The per-body v3 accent reads `color` here (V3Style), NOT the id, because the id
 * is a section name and would never match a body-keyed palette. Don't collapse
 * these into one field without re-checking every consumer (hash nav, sectionItems,
 * planetFacts, holoSummary). */
export const DESTINATION_BY_ID = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d])
);

/* Place an object a few TRUE scene-units from a body (its already-remapped
   position) — used to drop the easter-egg craft right beside their themed
   planet so they're in frame during the tour, without the radial-remap
   magnification a pre-remap offset would suffer. Returns absolute scene coords. */
export const nearBody = (id, [dx = 0, dy = 0, dz = 0] = []) => {
  const p = DESTINATION_BY_ID[id]?.position || [0, 0, 0];
  return [p[0] + dx, p[1] + dy, p[2] + dz];
};

/* Place an easter-egg / probe just BESIDE its host planet and IN the backlit
   camera's view, so it's actually visible during the tour. The camera sits
   ~radius×4.18 beyond the planet (anti-sun) framing the whole disk in a 47° fov,
   so a FIXED offset is wildly off-screen for tiny worlds (Ceres r=0.06) and lost
   beside giants — the offset MUST scale with the planet's radius. `dir` = a
   [screenUp, screenLeft] direction (Y≈up/down, Z≈left/right of the planet) to
   spread multiple objects around it; `lateral` sets the off-axis distance
   (×radius → ~atan(lateral/4.18)≈18° at 1.4); `toward` nudges it toward the
   camera (along the anti-sun radial) so the planet never occludes it. */
export const besidePlanet = (id, dir = [1, 0], { lateral = 1.4, toward = 0.5 } = {}) => {
  const d = DESTINATION_BY_ID[id];
  if (!d) return [0, 0, 0];
  const r = d.radius;
  const [x, y, z] = d.position;
  const rl = Math.hypot(x, y, z) || 1;
  const [uy, uz] = dir;
  const n = Math.hypot(uy, uz) || 1;
  return [
    x + (x / rl) * toward * r,
    y + (y / rl) * toward * r + (uy / n) * lateral * r,
    z + (z / rl) * toward * r + (uz / n) * lateral * r,
  ];
};

/* Recommended on-screen size for a besidePlanet object: a fraction of the host
   planet's radius, so an egg reads as a clear companion (not a screen-filling
   blob beside tiny Ceres, nor an invisible speck beside Jupiter). */
export const besideScale = (id, frac = 0.5) => (DESTINATION_BY_ID[id]?.radius || 1) * frac;

export const SCROLL_LENGTH_PER_DESTINATION = 100; // viewport heights
/* The opening galaxy→solar-system DIVE (segment 0: hero → overview) gets this
   many normal-segments' worth of scroll, so the plunge through the galactic
   plate, the interstellar star-field, and into the solar system is a felt
   journey rather than a one-flick glide. Only segment 0 is stretched; every
   planet segment stays at 1× (SCROLL_LENGTH_PER_DESTINATION). */
export const DIVE_STRETCH = 2.6;
/* Extra scroll runway AFTER the last destination — the cinematic pull-back
   finale scrubs across this (≈2 destinations of travel), collapsing the solar
   system to the Sun among its real neighbours + the galaxy arching around. */
/* Was 200 — the pull-back "finale" was a legacy leftover from when the tour
   ended with LocalNeighborhood + arching MilkyWay band. With The Edge as
   the last stop, the finale runway ate the scroll budget between Pluto and
   The Edge and prevented The Edge from ever landing at a stable pose. Set
   to 0 so The Edge sits cleanly at scrollFraction 1.0. */
export const FINALE_SCROLL_VH = 0;
const TOUR_SCROLL_VH = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;
export const TOTAL_SCROLL_VH = TOUR_SCROLL_VH + FINALE_SCROLL_VH;
/* Fraction of total scroll where the tour ends and the finale reveal begins. */
export const TOUR_END_FRACTION = TOUR_SCROLL_VH / TOTAL_SCROLL_VH;

/* A stop index → its position as a fraction of the full scroll runway (0→1),
   accounting for the stretched opening dive (segment 0 owns DIVE_STRETCH×). The
   SINGLE source of truth for index↔scroll: Navigator's magnetic snap AND
   StellarApp's handleJump (rail / keys / deep-link) both use it, so a jump lands
   exactly where the snap rests. Inverse of Navigator's toTourT. */
export const stopScrollFraction = (idx) => {
  const N = DESTINATIONS.length;
  const seg0T = 1 / (N - 1);
  const diveEndRaw = DIVE_STRETCH / (N - 2 + DIVE_STRETCH);
  const tt = idx / (N - 1);
  const raw = tt <= seg0T
    ? (tt / seg0T) * diveEndRaw
    : diveEndRaw + ((tt - seg0T) / (1 - seg0T)) * (1 - diveEndRaw);
  return raw * TOUR_END_FRACTION;
};
