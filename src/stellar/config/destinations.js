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
    position: [0, 0, 0],
    radius: 1.6,
    color: "#ff9a3c",
    section: "hero",
    cameraTarget: { position: [0, 2.5, 11], lookAt: [0, 0, 0] },
  },

  // Inner system
  {
    id: "about",
    kind: "planet",
    type: "rocky",
    position: [5.5, 0.1, 0.3],
    radius: 0.5,
    color: "#7a7d85",
    colorB: "#2f3138",
    section: "about",
    cameraTarget: { position: [6.6, 0.7, 1.8], lookAt: [5.5, 0, 0.3] },
  },
  {
    id: "funfacts",
    kind: "planet",
    type: "warm",
    position: [8.2, -0.2, 1.0],
    radius: 0.6,
    color: "#f8c555",
    colorB: "#a0651a",
    section: "funfacts",
    cameraTarget: { position: [9.5, 0.6, 2.6], lookAt: [8.2, 0, 1.0] },
  },
  {
    id: "experience",
    kind: "planet",
    type: "earth",
    position: [11.4, 0.0, -1.4],
    radius: 0.75,
    color: "#3b6ea8",
    colorB: "#1d3a5e",
    section: "experience",
    cameraTarget: { position: [12.9, 0.9, -0.1], lookAt: [11.4, 0, -1.4] },
  },
  {
    id: "projects",
    kind: "planet",
    type: "rust",
    position: [15.3, 0.3, 0.6],
    radius: 0.9,
    color: "#c2553e",
    colorB: "#5d2317",
    section: "projects",
    cameraTarget: { position: [16.9, 1.1, 2.4], lookAt: [15.3, 0, 0.6] },
  },

  // Asteroid belt — Achievements
  {
    id: "achievements",
    kind: "belt",
    position: [19.5, 0, 0],
    innerRadius: 18.5,
    outerRadius: 20.5,
    color: "#f8c555",
    section: "achievements",
    cameraTarget: { position: [19.5, 2.5, 4.5], lookAt: [19.5, 0, 0] },
  },

  // Outer system
  {
    id: "skills",
    kind: "planet",
    type: "gas",
    position: [24.6, -0.4, -1.8],
    radius: 1.7,
    color: "#915eff",
    colorB: "#3d2370",
    section: "skills",
    cameraTarget: { position: [27.4, 1.6, 0.4], lookAt: [24.6, 0, -1.8] },
    moons: 9,
    moonColor: "#bf61ff",
    moonScale: 0.09,
  },
  {
    id: "notes",
    kind: "planet",
    type: "golden",
    position: [30.2, 0.6, 1.5],
    radius: 1.15,
    color: "#00cea8",
    colorB: "#0e604e",
    section: "notes",
    cameraTarget: { position: [32.6, 1.8, 3.7], lookAt: [30.2, 0, 1.5] },
    rings: true,
    ringColor: "#f8c555",
  },
  {
    id: "education",
    kind: "planet",
    type: "ice",
    position: [34.8, -0.2, -1.0],
    radius: 1.0,
    color: "#bf61ff",
    colorB: "#7e3eab",
    section: "education",
    cameraTarget: { position: [37.0, 1.5, 0.9], lookAt: [34.8, 0, -1.0] },
    axialTilt: 60 * DEG,
    moons: 4,
    moonColor: "#915eff",
    moonScale: 0.1,
  },
  {
    id: "hobbies",
    kind: "planet",
    type: "abyss",
    position: [39.0, 0.4, 0.8],
    radius: 1.05,
    color: "#1a73d8",
    colorB: "#0a3a72",
    section: "hobbies",
    cameraTarget: { position: [41.3, 1.4, 2.9], lookAt: [39.0, 0, 0.8] },
    moons: 6,
    moonColor: "#61dafb",
    moonScale: 0.09,
  },

  // Kuiper belt — Testimonials
  {
    id: "testimonials",
    kind: "belt",
    position: [44, 0, 0],
    innerRadius: 43,
    outerRadius: 45,
    color: "#b4b4ff",
    section: "testimonials",
    cameraTarget: { position: [44, 2.6, 3.7], lookAt: [44, 0, 0] },
  },

  // Edge beacon — Contact
  {
    id: "contact",
    kind: "beacon",
    position: [49, 0, 0.5],
    radius: 0.4,
    color: "#ff6b6b",
    section: "contact",
    cameraTarget: { position: [50.5, 1.1, 2.2], lookAt: [49, 0, 0.5] },
  },
];

export const DESTINATION_BY_ID = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d])
);

export const SCROLL_LENGTH_PER_DESTINATION = 100; // viewport heights
export const TOTAL_SCROLL_VH = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;
