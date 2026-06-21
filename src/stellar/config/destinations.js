/*
 * Destination registry for the Stellar 3D portfolio.
 *
 * Each destination has:
 *   - id           — URL hash + section anchor
 *   - kind         — "star" | "planet" | "belt" | "beacon"
 *   - position     — [x, y, z] in scene units; sun at origin
 *   - radius       — visual size
 *   - color        — base color (procedural shader tints from this)
 *   - section      — which content section this destination opens
 *   - cameraTarget — { position, lookAt } for cinematic arrival
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
    position: [5.5, 0.1, 0.3],
    radius: 0.45,
    color: "#61dafb",
    section: "about",
    cameraTarget: { position: [6.6, 0.7, 1.6], lookAt: [5.5, 0, 0.3] },
  },
  {
    id: "funfacts",
    kind: "planet",
    position: [8.2, -0.2, 1.0],
    radius: 0.55,
    color: "#f8c555",
    section: "funfacts",
    cameraTarget: { position: [9.5, 0.5, 2.4], lookAt: [8.2, 0, 1.0] },
  },
  {
    id: "experience",
    kind: "planet",
    position: [11.4, 0.0, -1.4],
    radius: 0.7,
    color: "#ff6b6b",
    section: "experience",
    cameraTarget: { position: [12.9, 0.8, -0.1], lookAt: [11.4, 0, -1.4] },
  },
  {
    id: "projects",
    kind: "planet",
    position: [15.3, 0.3, 0.6],
    radius: 0.85,
    color: "#bf61ff",
    section: "projects",
    cameraTarget: { position: [16.9, 1.0, 2.2], lookAt: [15.3, 0, 0.6] },
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
    cameraTarget: { position: [19.5, 2.2, 4.0], lookAt: [19.5, 0, 0] },
  },

  // Outer system
  {
    id: "skills",
    kind: "planet",
    position: [24.6, -0.4, -1.8],
    radius: 1.6,
    color: "#915eff",
    section: "skills",
    cameraTarget: { position: [27.1, 1.4, 0.3], lookAt: [24.6, 0, -1.8] },
    moons: 9,
  },
  {
    id: "notes",
    kind: "planet",
    position: [30.2, 0.6, 1.5],
    radius: 1.1,
    color: "#00cea8",
    section: "notes",
    cameraTarget: { position: [32.5, 1.7, 3.5], lookAt: [30.2, 0, 1.5] },
    rings: true,
  },
  {
    id: "education",
    kind: "planet",
    position: [34.8, -0.2, -1.0],
    radius: 0.95,
    color: "#bf61ff",
    section: "education",
    cameraTarget: { position: [36.9, 1.4, 0.8], lookAt: [34.8, 0, -1.0] },
    axialTilt: 60 * DEG,
    moons: 4,
  },
  {
    id: "hobbies",
    kind: "planet",
    position: [39.0, 0.4, 0.8],
    radius: 1.0,
    color: "#1a73d8",
    section: "hobbies",
    cameraTarget: { position: [41.2, 1.3, 2.7], lookAt: [39.0, 0, 0.8] },
    moons: 6,
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
    cameraTarget: { position: [44, 2.4, 3.5], lookAt: [44, 0, 0] },
  },

  // Edge beacon — Contact
  {
    id: "contact",
    kind: "beacon",
    position: [49, 0, 0.5],
    radius: 0.35,
    color: "#ff6b6b",
    section: "contact",
    cameraTarget: { position: [50.4, 1.0, 2.0], lookAt: [49, 0, 0.5] },
  },
];

export const DESTINATION_BY_ID = Object.fromEntries(
  DESTINATIONS.map((d) => [d.id, d])
);

export const SCROLL_LENGTH_PER_DESTINATION = 100; // viewport heights
export const TOTAL_SCROLL_VH = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;
