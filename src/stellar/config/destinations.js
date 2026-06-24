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

const DEG = Math.PI / 180;

export const DESTINATIONS = [
  {
    id: "sol",
    kind: "star",
    label: "Sol",
    position: [0, 0, 0],
    /* TRUE-SCALE Sun: its real radius, ≈109× Earth. The whole system is scaled
       up (large AU_UNIT) so this colossal Sun clears the inner orbits. */
    radius: 19.8, // 695,700 km — 109× Earth (0.182)
    color: "#ff9a3c",
    texture: "/textures/planets/sunmap.jpg",
    section: "hero",
    /* Pulled way back + low to frame the giant Sun, near the ecliptic. */
    cameraTarget: { position: [0, 8, 100], lookAt: [0, 0, 0], fov: 60 },
  },

  // Inner system
  {
    id: "about",
    kind: "planet",
    type: "rocky",
    label: "Mercury",
    position: [5.5, 0.1, 0.3],
    radius: 0.07, // 2,439 km — smallest planet, ~0.38× Earth
    color: "#7a7d85",
    colorB: "#2f3138",
    texture: "/textures/planets/mercurymap.jpg",
    bumpTexture: "/textures/planets/moonbump1k.jpg",
    section: "about",
    /* Camera closes in to frame the now-tiny world (offset scaled to radius). */
    cameraTarget: { position: [5.65, 0.13, 0.52], lookAt: [5.5, 0.1, 0.3], fov: 44 },
  },
  {
    id: "funfacts",
    kind: "planet",
    type: "warm",
    label: "Venus",
    position: [8.2, -0.2, 1.0],
    radius: 0.173, // 6,052 km — Earth's near-twin
    color: "#f8c555",
    colorB: "#a0651a",
    texture: "/textures/planets/venusmap.jpg",
    bumpTexture: "/textures/planets/venusbump.jpg",
    /* Venus's map is near-white and blooms to a featureless disc.
       Knock it back so the cloud banding survives the bloom pass. */
    tint: "#c9b48a",
    axialTilt: 177.4 * DEG, // Venus spins retrograde — effectively upside-down
    section: "funfacts",
    /* Venus — high 3/4 looking down through the haze (offset scaled to radius) */
    cameraTarget: { position: [8.57, 0.27, 1.46], lookAt: [8.2, -0.15, 1.0], fov: 46 },
  },
  {
    id: "experience",
    kind: "planet",
    type: "earth",
    label: "Earth",
    position: [11.4, 0.0, -1.4],
    radius: 0.182, // 6,371 km — the reference world
    color: "#3b6ea8",
    colorB: "#1d3a5e",
    texture: "/textures/planets/earth_atmos.jpg",
    nightTexture: "/textures/planets/earth_lights.png",
    cloudTexture: "/textures/planets/earthcloudmap.jpg",
    normalTexture: "/textures/planets/earth_normal.jpg",
    /* Inverted ocean mask used as a roughnessMap: oceans dark → low
       roughness → mirror-like → catch a sharp sun-glint; land bright →
       matte. (The raw spec map had oceans bright = the wrong way round.) */
    specularTexture: "/textures/planets/earth_roughness.jpg",
    /* The Moon — one prominent satellite at ~0.27 Earth radius (the real
       ratio, so it reads as THE Moon, not a pebble). Planet.jsx's moon loop
       orbits + textures it; it rides Earth's OrbitGroup, so it follows Earth
       around the sun while circling the planet. */
    moons: 1,
    moonColor: "#cfcdc9",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.27,
    axialTilt: 23.4 * DEG, // Earth's real obliquity — tips the globe + Moon orbit
    section: "experience",
    /* Earth — the standout hero shot. These exact values frame the
       day/night terminator without the sun flooding the lens; do not
       move the position or the sun glares the frame orange. */
    cameraTarget: { position: [11.76, 0.22, -1.08], lookAt: [11.4, 0, -1.4], fov: 42 },
  },
  {
    id: "projects",
    kind: "planet",
    type: "rust",
    label: "Mars",
    position: [15.3, 0.3, 0.6],
    radius: 0.097, // 3,390 km — about half Earth
    color: "#c2553e",
    colorB: "#5d2317",
    texture: "/textures/planets/marsmap1k.jpg",
    bumpTexture: "/textures/planets/marsbump1k.jpg",
    axialTilt: 25.2 * DEG, // near-Earth obliquity — the polar caps sit off-vertical
    moons: 2, // Phobos + Deimos — tiny captured rocks
    moonColor: "#8a8276",
    moonScale: 0.06,
    section: "projects",
    /* Mars — slight low angle (offset scaled to radius) */
    cameraTarget: { position: [15.47, 0.22, 0.81], lookAt: [15.3, 0.2, 0.6], fov: 44 },
  },

  // Ceres — the dwarf planet IN the asteroid belt (Achievements). Keeps id +
  // section so all lookups / content / hash stay intact; only the body changes.
  {
    id: "achievements",
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
    texture: "/textures/planets/ceres.jpg", // NASA/JPL Dawn grayscale photomosaic
    section: "achievements",
    /* Tight framing for the dwarf (offset preserved through the AU remap). */
    cameraTarget: { position: [19.54, 0.43, 0.65], lookAt: [19.5, 0.4, 0.6], fov: 44 },
  },

  // Outer system
  {
    id: "skills",
    kind: "planet",
    type: "gas",
    label: "Jupiter",
    position: [24.6, -0.4, -1.8],
    radius: 2.0, // 69,911 km — the giant; ~11× Earth
    color: "#c9a06a", // real Jupiter: tan/cream/orange-brown bands (NASA)
    colorB: "#9a6a3c",
    texture: "/textures/planets/jupitermap_hd.jpg",
    bumpTexture: "/textures/planets/jupiter_bump.jpg",
    section: "skills",
    /* Jupiter — wide + slight roll to sell the scale (offset scaled to radius) */
    cameraTarget: { position: [27.89, 1.39, 1.02], lookAt: [24.6, 0.1, -1.8], fov: 52, roll: -0.05 },
    axialTilt: 3.1 * DEG, // Jupiter spins nearly upright
    oblateness: 0.065, // real polar flattening — Jupiter is visibly squashed by its fast spin
    faintRings: true, // Jupiter's faint dusty ring (real)
    moons: 4, // the four Galilean moons
    moonColor: "#cfc6e0",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.045,
  },
  {
    id: "notes",
    kind: "planet",
    type: "golden",
    label: "Saturn",
    position: [30.2, 0.6, 1.5],
    radius: 1.666, // 58,232 km — second-largest (excl. rings)
    color: "#e3c485",
    colorB: "#a07a3a",
    texture: "/textures/planets/saturnmap_hd.jpg",
    bumpTexture: "/textures/planets/saturn_bump.jpg",
    section: "notes",
    /* Saturn — dutch tilt to throw the rings across the frame (offset scaled) */
    cameraTarget: { position: [33.68, 2.61, 4.69], lookAt: [30.2, 0, 1.5], fov: 50, roll: 0.11 },
    axialTilt: 26.7 * DEG, // Saturn's obliquity — tilts the ring plane across the frame
    oblateness: 0.098, // the most oblate planet — ~10% flattened, clearly squashed
    rings: true,
    ringTexture: "/textures/planets/saturnringcolor.jpg",
    ringColor: "#f8c555",
  },
  {
    id: "education",
    kind: "planet",
    type: "ice",
    label: "Uranus",
    position: [34.8, -0.2, -1.0],
    radius: 0.726, // 25,362 km — ice giant
    color: "#aad4cf", // real Uranus: muted greenish-cyan (2024 true-color study)
    colorB: "#7ba8a0",
    texture: "/textures/planets/uranusmap_hd.jpg",
    bumpTexture: "/textures/planets/uranus_bump.jpg",
    section: "education",
    /* Uranus — closer + tighter fov so the planet fills the negative space
       (Education read as empty), with the strong dutch tilt for its 98° axis. */
    cameraTarget: { position: [36.03, 0.87, 0.02], lookAt: [34.8, 0, -1.0], fov: 40, roll: 0.17 },
    axialTilt: 97.8 * DEG, // Uranus rolls on its side — the real ~98° obliquity
    oblateness: 0.023, // real flattening
    faintRings: true, // Uranus's narrow rings ride near-vertical with its tilt

    moons: 4,
    moonColor: "#d0ccea",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.06,
  },
  {
    id: "hobbies",
    kind: "planet",
    type: "abyss",
    label: "Neptune",
    position: [39.0, 0.4, 0.8],
    radius: 0.704, // 24,622 km — Uranus's near-twin
    color: "#5a8fc0", // real Neptune: muted greenish-blue, only slightly bluer than Uranus (2024)
    colorB: "#2e5a8a",
    texture: "/textures/planets/neptunemap_hd.jpg",
    bumpTexture: "/textures/planets/neptune_bump.jpg",
    section: "hobbies",
    /* Neptune — pulled back, lonely framing in the deep dark (offset scaled) */
    cameraTarget: { position: [40.54, 0.94, 2.34], lookAt: [39.0, 0, 0.8], fov: 44 },
    axialTilt: 28.3 * DEG, // Neptune's obliquity, close to Earth's
    oblateness: 0.017, // real flattening
    faintRings: true, // Neptune's faint rings + arcs (real)
    moons: 1, // Triton, the one large moon
    moonColor: "#b8d4ee",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.07,
  },

  // Pluto — the dwarf planet IN the Kuiper belt (Testimonials). Keeps id +
  // section so all lookups / content / hash stay intact; only the body changes.
  {
    id: "testimonials",
    kind: "planet",
    type: "rocky",
    label: "Pluto",
    position: [44, 0.9, 1.4],
    radius: 0.034, // 1,188 km — the famous Kuiper-belt dwarf planet
    color: "#c9b6a0", // UI accent only — the surface uses the real NASA map
    colorB: "#9a7b5e",
    texture: "/textures/planets/pluto.jpg", // NASA/JHU-APL/SwRI New Horizons color mosaic
    section: "testimonials",
    /* Tight framing for the small dwarf (offset preserved through the AU remap). */
    cameraTarget: { position: [44.08, 0.97, 1.52], lookAt: [44, 0.9, 1.4], fov: 46 },
  },

  // Edge beacon — Contact
  {
    id: "contact",
    kind: "beacon",
    label: "Edge Beacon",
    position: [49, 0, 0.5],
    radius: 0.4,
    color: "#ff6b6b",
    section: "contact",
    /* Edge beacon — pulled back, tiny signal in vast emptiness */
    cameraTarget: { position: [49, 1.1, 2.4], lookAt: [49, 0, 0.5], fov: 46 },
  },
];

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
export const AU_UNIT = 95; // scene units per AU — large so the true-size Sun clears Mercury's orbit
const AU = {
  about: 0.387, funfacts: 0.723, experience: 1.0, projects: 1.524,
  achievements: 2.77, skills: 5.203, notes: 9.537, education: 19.191, // achievements = Ceres @ 2.77 AU
  hobbies: 30.07, testimonials: 39.48, contact: 50, // testimonials = Pluto @ 39.48 AU
};

/* The asteroid + Kuiper belts are no longer tour stops — they render as
   background scenery (Scene/index.jsx) at these true AU ranges (× AU_UNIT). */
export const BACKGROUND_BELTS = {
  // Real spans (main belt ~2.1–3.3 AU, Kuiper ~30–50 AU) rendered as FAT tori —
  // a real vertical thickness from inclination dispersion (not a thin ribbon),
  // so they read as the dense dusty donuts the reference imagery shows.
  asteroid: { inner: 2.1 * AU_UNIT, outer: 3.3 * AU_UNIT, thickness: 36, color: "#c9b48a" },
  kuiper: { inner: 30 * AU_UNIT, outer: 50 * AU_UNIT, thickness: 320, color: "#9fb0d0" },
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

DESTINATIONS.forEach((d) => {
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

export const DESTINATION_BY_ID = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d])
);

export const SCROLL_LENGTH_PER_DESTINATION = 100; // viewport heights
export const TOTAL_SCROLL_VH = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;
