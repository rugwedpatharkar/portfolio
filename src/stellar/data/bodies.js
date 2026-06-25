import * as THREE from "three";
import { OBJECTS } from "../config/objects";
import { DESTINATIONS } from "../config/destinations";
import { PLANET_FACTS } from "./planetFacts";
import { orbitalPosition } from "../config/orbits";
import { MOON_BY_ID, MOON_FACTS } from "../config/moons";
import { DISCOVERABLE } from "./explorer";

/*
 * THE BODY REGISTRY — the single source of truth the whole game reads.
 *
 * Every registered object (planets, belts, beacon, anomalies, ships, and any
 * FUTURE anomaly) is normalized into one uniform game "body". Radar, Scanner,
 * scoring, objectives, rank, and the cockpit TARGET panel all derive from this.
 *
 * Adding a new space anomaly + its "my info" content is ONE data entry in
 * config/objects.js (position + `info`/`content`; planets link a résumé
 * `section`). It then appears on the radar, becomes scannable, scores, shows its
 * content in the cockpit, and counts toward objectives — with ZERO game-code
 * changes. Nothing downstream hardcodes a planet/anomaly list.
 */

const SECTION_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d.section]));
const DEST_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));
const DISCOVERABLE_IDS = new Set(DISCOVERABLE.map((d) => d.id));

const isWorld = (o) => o.visit.kind === "stop";
const defaultScanRadius = (o) => (isWorld(o) ? 3.4 : 2.6);
const defaultScore = (o) => {
  if (isWorld(o)) return 100;                 // a charted world
  if (o.category === "Easter egg") return 500; // a homage ship
  return 250;                                  // a plain anomaly
};

/* Normalized game bodies — derived from the object registry. */
export const BODIES = OBJECTS.map((o) => ({
  id: o.id,
  label: o.label,
  category: o.category,
  color: o.color || "#cfd6ff",
  position: o.position,                         // authored / static (anomalies)
  orbiting: DEST_BY_ID[o.id]?.kind === "planet", // worlds revolve; live pos below
  kind: isWorld(o) ? "world" : "anomaly",
  section: SECTION_BY_ID[o.id] || null,         // résumé section (worlds)
  scanRadius: o.scanRadius ?? defaultScanRadius(o),
  score: o.score ?? defaultScore(o),
  /* Counts toward "chart the system": every world + every discoverable anomaly. */
  objective: isWorld(o) || DISCOVERABLE_IDS.has(o.id),
}));

export const BODY_BY_ID = Object.fromEntries(BODIES.map((b) => [b.id, b]));
export const OBJECTIVE_BODIES = BODIES.filter((b) => b.objective);
export const OBJECTIVE_TOTAL = OBJECTIVE_BODIES.length;

/* Live world position (planets revolve) so the radar + scanner track the real
   thing, not the authored t=0 spot. Anomalies/ships are static. */
const _v = new THREE.Vector3();
export const liveBodyPosition = (id, t = 0, out = _v) => {
  const dest = DEST_BY_ID[id];
  if (dest && dest.kind === "planet") return orbitalPosition(dest, t, out);
  /* Moons ride their live parent (orbital pos + the authored offset) so the
     radar/scanner track the real moving thing. */
  const moon = MOON_BY_ID[id];
  if (moon) {
    const parent = DEST_BY_ID[moon.parent];
    if (parent && parent.kind === "planet") {
      orbitalPosition(parent, t, out);
      return out.set(out.x + moon.offset[0], out.y + moon.offset[1], out.z + moon.offset[2]);
    }
  }
  const b = BODY_BY_ID[id];
  const p = b ? b.position : [0, 0, 0];
  return out.set(p[0], p[1], p[2]);
};

/* Everything the cockpit TARGET panel needs to render a body's "my info".
   Planets resolve to a résumé `section`; anomalies carry `info` / optional rich
   `content`. The panel decides how to render — this just normalizes the data. */
export const getBodyContent = (id) => {
  const b = BODY_BY_ID[id];
  if (!b) return null;
  const o = OBJECTS.find((x) => x.id === id);
  return {
    id,
    label: b.label,
    category: b.category,
    color: b.color,
    facts: PLANET_FACTS[id] || MOON_FACTS[id] || null, // planet or moon facts
    section: b.section,                 // résumé section key (worlds)
    info: o?.info || "",                // short blurb (anomalies + planets)
    content: o?.content || null,        // optional rich content (future anomalies)
    score: b.score,
  };
};
