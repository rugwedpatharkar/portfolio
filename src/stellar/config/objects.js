import { DESTINATIONS, remapPosition } from "./destinations";
import { PLANET_FACTS } from "../data/planetFacts";
import { DWARF_PLANETS } from "./dwarfPlanets";

/*
 * Registry of every notable object in the scene — the 12 résumé destinations
 * PLUS the anomalies / ships / easter-eggs that live off the planet line.
 * Powers the interactive system-overview map: hover for an info card, click to
 * visit. Planets route to their résumé stop (kind "stop"); anomalies fly the
 * free-focus camera to an authored framing (kind "focus").
 */

/* Authored framing for a static object: drop the camera between the object and
   the sun, lifted a touch, looking back at it. Absolute world coords (the
   focus camera uses them directly, no orbital offset). */
const frame = (pos, dist = 4, up = 1.1, fov = 42) => {
  const [x, y, z] = pos;
  const len = Math.hypot(x, y, z) || 1;
  return {
    position: [x - (x / len) * dist, y - (y / len) * dist + up, z - (z / len) * dist],
    lookAt: [x, y, z],
    fov,
  };
};

const CATEGORY_BY_KIND = { star: "Star", planet: "Planet", belt: "Belt", beacon: "Beacon" };

/* The 12 résumé destinations — clicking one returns to its scroll stop. */
const DESTINATION_OBJECTS = DESTINATIONS.map((d, index) => ({
  id: d.id,
  label: d.label,
  category: CATEGORY_BY_KIND[d.kind] || "Planet",
  color: d.color,
  position: d.position,
  info: PLANET_FACTS[d.id]?.wow || PLANET_FACTS[d.id]?.body || "",
  visit: { kind: "stop", index },
}));

/* Anomalies / ships / easter-eggs — clicking one flies the free camera there. */
const ANOMALY_RAW = [
  {
    id: "blackhole", label: "Gargantua", category: "Black hole", color: "#ffb066", position: [49, -6, -15],
    info: "A stellar-mass black hole at the edge of the system. Light bends around the event horizon — the accretion disk wraps up and over in a glowing Einstein ring.",
    visit: { kind: "focus", cameraTarget: frame([49, -6, -15], 8, 2.4, 46) },
  },
  {
    id: "wormhole", label: "Wormhole", category: "Portal", color: "#9a7dff", position: [48.55, 0.58, 1.62],
    info: "A traversable wormhole — the 'beam aboard' portal. Click the portal itself to book a call.",
    visit: { kind: "focus", cameraTarget: frame([48.55, 0.58, 1.62], 2.3, 0.5, 40) },
  },
  {
    id: "pulsar", label: "Pulsar", category: "Neutron star", color: "#9fd0ff", position: [-26, 16, -34],
    info: "A rapidly spinning neutron star sweeping twin lighthouse beams across the void — a teaspoon of it would weigh billions of tonnes. Its sweep blinks Morse: ·-- ·- ···- · — click it to decode.",
    visit: { kind: "focus", cameraTarget: frame([-26, 16, -34], 7, 1.6, 44) },
  },
  {
    id: "deathstar", label: "Death Star", category: "Easter egg", color: "#c9ccd6", position: [21, 2.6, -2.8],
    info: "That's no moon. The Empire's planet-killer, lurking just above the asteroid belt.",
    visit: { kind: "focus", cameraTarget: frame([21, 2.6, -2.8], 3.3, 0.9, 40) },
  },
  {
    id: "enterprise", label: "USS Enterprise", category: "Easter egg", color: "#9fc8ff", position: [14.8, 0.9, -2.8],
    info: "NCC-1701 — boldly going, high over the inner planets, twin warp nacelles aglow.",
    visit: { kind: "focus", cameraTarget: frame([14.8, 0.9, -2.8], 2.6, 0.7, 38) },
  },
  {
    id: "endurance", label: "Endurance", category: "Easter egg", color: "#cfd6e0", position: [37.0, 1.1, -2.5],
    info: "Interstellar's ring-shaped craft, rotating for artificial gravity on its long voyage outward.",
    visit: { kind: "focus", cameraTarget: frame([37.0, 1.1, -2.5], 3, 0.9, 40) },
  },
  {
    id: "stardestroyer", label: "Star Destroyer", category: "Easter egg", color: "#aeb6c4", position: [28, 12.5, -34],
    info: "An Imperial dagger looming in the deep field behind the system.",
    visit: { kind: "focus", cameraTarget: frame([28, 12.5, -34], 9, 1.6, 44) },
  },
  {
    id: "cooperstation", label: "Cooper Station", category: "Easter egg", color: "#d0d6dd", position: [29.6, -1.2, 3.5],
    info: "The cylindrical O'Neill colony from Interstellar, slowly spinning near Saturn.",
    visit: { kind: "focus", cameraTarget: frame([29.6, -1.2, 3.5], 3, 0.9, 40) },
  },
  {
    id: "voyager", label: "Voyager Probes", category: "Probe", color: "#ffd9a0", position: [40, 3.5, -19],
    info: "Humanity's farthest emissaries — Voyager 1 & 2, each carrying the Golden Record into interstellar space.",
    visit: { kind: "focus", cameraTarget: frame([40, 3.5, -19], 4, 1, 42) },
  },
  {
    id: "jwst", label: "JWST", category: "Probe", color: "#e8b84a", position: [11.7, 0.5, -1.5],
    info: "James Webb Space Telescope — our largest space observatory, parked at Sun-Earth Lagrange point L2, 1.5 million km beyond Earth, its golden mirror permanently shaded from the Sun.",
    visit: { kind: "focus", cameraTarget: frame([11.7, 0.5, -1.5], 2, 0.6, 38) },
  },
  {
    id: "parker", label: "Parker Solar Probe", category: "Probe", color: "#ffcaa0", position: [2.9, 0.6, 1.6],
    info: "Parker Solar Probe — the fastest human-made object ever and the first to 'touch' the Sun, flying through the corona behind a glowing heat shield at ~700,000 km/h.",
    visit: { kind: "focus", cameraTarget: frame([2.9, 0.6, 1.6], 2.4, 0.6, 40) },
  },
  {
    id: "juno", label: "Juno", category: "Probe", color: "#caa86a", position: [25.5, 0.3, 1.5],
    info: "Juno — NASA's solar-powered orbiter studying Jupiter's deep interior and ferocious poles since 2016.",
    visit: { kind: "focus", cameraTarget: frame([25.5, 0.3, 1.5], 2.6, 0.7, 40) },
  },
  {
    id: "lucy", label: "Lucy", category: "Probe", color: "#cfd3d8", position: [13.8, 1.0, 20.5],
    info: "Lucy — on a 12-year tour of Jupiter's Trojan asteroids, the trapped fossils of planet formation at the L4/L5 points.",
    visit: { kind: "focus", cameraTarget: frame([13.8, 1.0, 20.5], 3, 0.8, 42) },
  },
  {
    id: "newhorizons", label: "New Horizons", category: "Probe", color: "#d8d2c4", position: [46, 1.0, 2.2],
    info: "New Horizons — flew past Pluto in 2015 (our first close look at the dwarf), then on to the Kuiper body Arrokoth; now ~60 AU out and still calling home.",
    visit: { kind: "focus", cameraTarget: frame([46, 1.0, 2.2], 3, 0.8, 42) },
  },
  {
    id: "halley", label: "Halley's Comet", category: "Comet", color: "#9fdcff", position: [8, 2, -2],
    info: "1P/Halley — the most famous comet, swinging back every ~76 years on a steep, stretched orbit. Two tails: a straight blue ion tail blown dead anti-sunward by the solar wind, and a curved dust tail lagging its path. Last seen 1986; returns 2061.",
    visit: { kind: "focus", cameraTarget: frame([8, 2, -2], 5, 1.2, 44) },
  },
  {
    id: "oumuamua", label: "'Oumuamua", category: "Interstellar object", color: "#b07a5a", position: [-12, 4, 9],
    info: "1I/'Oumuamua — the first confirmed interstellar visitor (2017). A dark, reddish, wildly elongated shard tumbling end-over-end on an unbound hyperbolic path: it fell in from another star and is already leaving, never to return.",
    visit: { kind: "focus", cameraTarget: frame([-12, 4, 9], 4, 1, 42) },
  },
  {
    id: "tardis", label: "TARDIS", category: "Easter egg", color: "#5b8dff", position: [31.2, 2.0, 3.2],
    info: "Bigger on the inside. It materialises near Saturn now and then — blink and you'll miss it.",
    visit: { kind: "focus", cameraTarget: frame([31.2, 2.0, 3.2], 2.4, 0.6, 38) },
  },
  {
    id: "hal", label: "HAL 9000", category: "Easter egg", color: "#ff5a4d", position: [23.6, 2.2, -3.4],
    info: "“I'm sorry, Dave. I'm afraid I can't do that.” The unblinking red eye drifting near Jupiter.",
    visit: { kind: "focus", cameraTarget: frame([23.6, 2.2, -3.4], 2.4, 0.6, 38) },
  },
  {
    id: "walle", label: "WALL·E", category: "Easter egg", color: "#e2a85a", position: [42, -2.5, 8],
    info: "A lonely little robot far past Neptune, still dutifully doing his job.",
    visit: { kind: "focus", cameraTarget: frame([42, -2.5, 8], 2.6, 0.7, 38) },
  },
];

/* Scatter every off-line object out to true scale (keeps its themed
   neighbourhood), preserving the small framing-camera offset. */
const ANOMALY_OBJECTS = ANOMALY_RAW.map((o) => {
  const np = remapPosition(o.position);
  const c = o.visit.cameraTarget;
  return {
    ...o,
    position: np,
    visit: {
      ...o.visit,
      cameraTarget: {
        position: [np[0] + (c.position[0] - o.position[0]), np[1] + (c.position[1] - o.position[1]), np[2] + (c.position[2] - o.position[2])],
        lookAt: np,
        fov: c.fov,
      },
    },
  };
});

/* Dwarf planets + named belt bodies — scannable, on the radar, with real
   facts; rendered by Scene/DwarfPlanets from the same data. */
const DWARF_OBJECTS = DWARF_PLANETS.map((d) => ({
  id: d.id,
  label: d.label,
  category: d.category || "Dwarf planet",
  color: d.color,
  position: d.position,
  info: d.info,
  visit: { kind: "focus", cameraTarget: frame(d.position, 1.4, 0.4, 36) },
}));

export const OBJECTS = [...DESTINATION_OBJECTS, ...ANOMALY_OBJECTS, ...DWARF_OBJECTS];
