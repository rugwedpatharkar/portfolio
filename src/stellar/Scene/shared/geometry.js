/*
 * §6.4 / Phase 4 — shared 3D geometry primitives.
 *
 * lumpyRock: an icosahedron whose vertices are displaced by a deterministic
 * position hash → a watertight lumpy rock. Shared vertices hash identically
 * so faces stay joined; flatShading then reads the displacement as craggy
 * facets. The main asteroid belt and Jupiter's Trojans share this exact
 * shape — this is the SoT.
 */
import * as THREE from "three";

export function lumpyRock({ detail = 1, seed = 0, amp = 0.5 } = {}) {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const s = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719 + seed) * 43758.5453;
    const n = s - Math.floor(s); // 0..1
    v.multiplyScalar(1 + (n - 0.5) * amp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
