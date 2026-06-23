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
    radius: 1.6,
    color: "#ff9a3c",
    texture: "/textures/planets/sunmap.jpg",
    section: "hero",
    /* A LOW angle — near the ecliptic — so the inner planets cross the Sun's
       disc from here (real transits → eclipses) instead of passing above it. */
    cameraTarget: { position: [0, 0.9, 11], lookAt: [0, 0, 0], fov: 60 },
  },

  // Inner system
  {
    id: "about",
    kind: "planet",
    type: "rocky",
    label: "Mercury",
    position: [5.5, 0.1, 0.3],
    radius: 0.5,
    color: "#7a7d85",
    colorB: "#2f3138",
    texture: "/textures/planets/mercurymap.jpg",
    bumpTexture: "/textures/planets/moonbump1k.jpg",
    section: "about",
    /* Mercury — slight low angle */
    cameraTarget: { position: [6.6, 0.3, 1.9], lookAt: [5.5, 0.1, 0.3], fov: 44 },
  },
  {
    id: "funfacts",
    kind: "planet",
    type: "warm",
    label: "Venus",
    position: [8.2, -0.2, 1.0],
    radius: 0.6,
    color: "#f8c555",
    colorB: "#a0651a",
    texture: "/textures/planets/venusmap.jpg",
    bumpTexture: "/textures/planets/venusbump.jpg",
    /* Venus's map is near-white and blooms to a featureless disc.
       Knock it back so the cloud banding survives the bloom pass. */
    tint: "#c9b48a",
    axialTilt: 177.4 * DEG, // Venus spins retrograde — effectively upside-down
    section: "funfacts",
    /* Venus — high 3/4 looking down through the haze */
    cameraTarget: { position: [9.5, 1.3, 2.6], lookAt: [8.2, -0.15, 1.0], fov: 46 },
  },
  {
    id: "experience",
    kind: "planet",
    type: "earth",
    label: "Earth",
    position: [11.4, 0.0, -1.4],
    radius: 0.75,
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
    cameraTarget: { position: [12.9, 0.9, -0.1], lookAt: [11.4, 0, -1.4], fov: 42 },
  },
  {
    id: "projects",
    kind: "planet",
    type: "rust",
    label: "Mars",
    position: [15.3, 0.3, 0.6],
    radius: 0.9,
    color: "#c2553e",
    colorB: "#5d2317",
    texture: "/textures/planets/marsmap1k.jpg",
    bumpTexture: "/textures/planets/marsbump1k.jpg",
    axialTilt: 25.2 * DEG, // near-Earth obliquity — the polar caps sit off-vertical
    section: "projects",
    /* Mars — slight low angle, rust planet leaning in */
    cameraTarget: { position: [16.9, 0.4, 2.5], lookAt: [15.3, 0.2, 0.6], fov: 44 },
  },

  // Asteroid belt — Achievements
  {
    id: "achievements",
    kind: "belt",
    label: "Asteroid Belt",
    position: [19.5, 0, 0],
    innerRadius: 18.5,
    outerRadius: 20.5,
    color: "#f8c555",
    section: "achievements",
    /* Asteroid belt — pulled-back banking sweep so the field reads as a full
       composed arc, not a body cropped at the top edge. */
    cameraTarget: { position: [20.2, 5.6, 8.2], lookAt: [18.6, 0, -0.4], fov: 50 },
  },

  // Outer system
  {
    id: "skills",
    kind: "planet",
    type: "gas",
    label: "Jupiter",
    position: [24.6, -0.4, -1.8],
    radius: 1.7,
    color: "#915eff",
    colorB: "#3d2370",
    texture: "/textures/planets/jupitermap_hd.jpg",
    bumpTexture: "/textures/planets/jupiter_bump.jpg",
    section: "skills",
    /* Jupiter — wide + slight roll to sell the scale */
    cameraTarget: { position: [27.4, 1.2, 0.6], lookAt: [24.6, 0.1, -1.8], fov: 52, roll: -0.05 },
    axialTilt: 3.1 * DEG, // Jupiter spins nearly upright
    moons: 9,
    moonColor: "#cfc6e0",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.09,
  },
  {
    id: "notes",
    kind: "planet",
    type: "golden",
    label: "Saturn",
    position: [30.2, 0.6, 1.5],
    radius: 1.15,
    color: "#e3c485",
    colorB: "#a07a3a",
    texture: "/textures/planets/saturnmap_hd.jpg",
    bumpTexture: "/textures/planets/saturn_bump.jpg",
    section: "notes",
    /* Saturn — dutch tilt to throw the rings across the frame */
    cameraTarget: { position: [32.6, 1.8, 3.7], lookAt: [30.2, 0, 1.5], fov: 50, roll: 0.11 },
    axialTilt: 26.7 * DEG, // Saturn's obliquity — tilts the ring plane across the frame
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
    radius: 1.0,
    color: "#bf61ff",
    colorB: "#7e3eab",
    texture: "/textures/planets/uranusmap_hd.jpg",
    bumpTexture: "/textures/planets/uranus_bump.jpg",
    section: "education",
    /* Uranus — closer + tighter fov so the planet fills the negative space
       (Education read as empty), with the strong dutch tilt for its 98° axis. */
    cameraTarget: { position: [36.5, 1.2, 0.4], lookAt: [34.8, 0, -1.0], fov: 40, roll: 0.17 },
    axialTilt: 97.8 * DEG, // Uranus rolls on its side — the real ~98° obliquity

    moons: 4,
    moonColor: "#d0ccea",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.1,
  },
  {
    id: "hobbies",
    kind: "planet",
    type: "abyss",
    label: "Neptune",
    position: [39.0, 0.4, 0.8],
    radius: 1.05,
    color: "#1a73d8",
    colorB: "#0a3a72",
    texture: "/textures/planets/neptunemap_hd.jpg",
    bumpTexture: "/textures/planets/neptune_bump.jpg",
    section: "hobbies",
    /* Neptune — pulled back, lonely framing in the deep dark */
    cameraTarget: { position: [41.3, 1.4, 3.1], lookAt: [39.0, 0, 0.8], fov: 44 },
    axialTilt: 28.3 * DEG, // Neptune's obliquity, close to Earth's
    moons: 6,
    moonColor: "#b8d4ee",
    moonTexture: "/textures/planets/moonmap1k.jpg",
    moonScale: 0.09,
  },

  // Kuiper belt — Testimonials
  {
    id: "testimonials",
    kind: "belt",
    label: "Kuiper Belt",
    position: [44, 0, 0],
    innerRadius: 43,
    outerRadius: 45,
    color: "#b4b4ff",
    section: "testimonials",
    /* Kuiper belt — high top-down drift over the debris */
    cameraTarget: { position: [44, 3.4, 3.4], lookAt: [44, 0, 0], fov: 56 },
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

export const DESTINATION_BY_ID = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d])
);

export const SCROLL_LENGTH_PER_DESTINATION = 100; // viewport heights
export const TOTAL_SCROLL_VH = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;
