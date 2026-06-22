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
    cameraTarget: { position: [0, 2.5, 11], lookAt: [0, 0, 0], fov: 60 },
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
    section: "about",
    cameraTarget: { position: [6.6, 0.7, 1.8], lookAt: [5.5, 0, 0.3], fov: 44 },
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
    section: "funfacts",
    cameraTarget: { position: [9.5, 0.6, 2.6], lookAt: [8.2, 0, 1.0], fov: 46 },
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
    specularTexture: "/textures/planets/earth_specular.jpg",
    section: "experience",
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
    section: "projects",
    cameraTarget: { position: [16.9, 1.1, 2.4], lookAt: [15.3, 0, 0.6], fov: 44 },
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
    cameraTarget: { position: [19.5, 2.5, 4.5], lookAt: [19.5, 0, 0], fov: 56 },
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
    texture: "/textures/planets/jupitermap.jpg",
    section: "skills",
    cameraTarget: { position: [27.4, 1.6, 0.4], lookAt: [24.6, 0, -1.8], fov: 50 },
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
    texture: "/textures/planets/saturnmap.jpg",
    section: "notes",
    cameraTarget: { position: [32.6, 1.8, 3.7], lookAt: [30.2, 0, 1.5], fov: 52 },
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
    texture: "/textures/planets/uranusmap.jpg",
    section: "education",
    cameraTarget: { position: [37.0, 1.5, 0.9], lookAt: [34.8, 0, -1.0], fov: 46 },
    axialTilt: 60 * DEG,
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
    texture: "/textures/planets/neptunemap.jpg",
    section: "hobbies",
    cameraTarget: { position: [41.3, 1.4, 2.9], lookAt: [39.0, 0, 0.8], fov: 48 },
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
    cameraTarget: { position: [44, 2.6, 3.7], lookAt: [44, 0, 0], fov: 58 },
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
    cameraTarget: { position: [49, 1.1, 2.2], lookAt: [49, 0, 0.5], fov: 48 },
  },
];

export const DESTINATION_BY_ID = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d])
);

export const SCROLL_LENGTH_PER_DESTINATION = 100; // viewport heights
export const TOTAL_SCROLL_VH = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;
