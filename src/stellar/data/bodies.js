import * as THREE from "three";
import { OBJECTS } from "../config/objects";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { MOON_BY_ID } from "../config/moons";

/*
 * Live body positions. The scene's SolarEclipse reads liveBodyPosition so the
 * Moon's umbra tracks the REAL moving Moon (planets revolve; moons ride their
 * live parent; anomalies are static). The former "game body registry" (radar /
 * scanner / scoring / objectives) went with the v2 game — only the position
 * lookup survives.
 */
const DEST_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));
const POS_BY_ID = Object.fromEntries(OBJECTS.map((o) => [o.id, o.position]));

const _v = new THREE.Vector3();
export const liveBodyPosition = (id, t = 0, out = _v) => {
  const dest = DEST_BY_ID[id];
  if (dest && dest.kind === "planet") return orbitalPosition(dest, t, out);
  /* Moons ride their live parent (orbital pos + the authored offset). */
  const moon = MOON_BY_ID[id];
  if (moon) {
    const parent = DEST_BY_ID[moon.parent];
    if (parent && parent.kind === "planet") {
      orbitalPosition(parent, t, out);
      return out.set(out.x + moon.offset[0], out.y + moon.offset[1], out.z + moon.offset[2]);
    }
  }
  const p = POS_BY_ID[id] || [0, 0, 0];
  return out.set(p[0], p[1], p[2]);
};
