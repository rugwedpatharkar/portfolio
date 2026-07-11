/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";
import { DESTINATION_BY_ID } from "../config/destinations";
import { lumpyRock } from "./shared/geometry";

/*
 * Jupiter's Trojan asteroids — two REAL swarms locked 60° ahead of (L4) and
 * behind (L5) Jupiter on its orbit, shepherded by the giant's gravity at the
 * stable Lagrange points. Together they rival the main belt in number. We render
 * two tadpole-shaped clouds at Jupiter's true orbital radius — static instanced
 * clusters (write-once matrices), background scenery like the belts, not stops.
 */

const L = Math.PI / 3; // 60° — the L4 / L5 lead/lag along the orbit

const Swarm = ({ angle, radius, y, count, geometry }) => {
  const fill = (mesh) => {
    if (!mesh) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      /* Tadpole spread: wide along the orbit (±~14°), tighter radially + in y. */
      const a = angle + (Math.random() - 0.5) * 0.5;
      const r = radius + (Math.random() - 0.5) * radius * 0.1;
      const yy = y + (Math.random() - 0.5) * radius * 0.06;
      d.position.set(Math.cos(a) * r, yy, Math.sin(a) * r);
      d.rotation.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28);
      const t = Math.random();
      const s = 1.4 * (0.4 + t * t * t * 3.2); // heavy-tailed: mostly gravel, a few big
      d.scale.set(s * (0.7 + Math.random() * 0.6), s * (0.7 + Math.random() * 0.6), s * (0.7 + Math.random() * 0.6));
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  return (
    <instancedMesh ref={fill} args={[undefined, undefined, count]} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#6b5f52" roughness={0.92} metalness={0.08} flatShading />
    </instancedMesh>
  );
};

const TrojanAsteroids = ({ count = 160 }) => {
  const jup = DESTINATION_BY_ID.skills.position; // Jupiter, already at true scale
  const radius = Math.hypot(jup[0], jup[2]);
  const angle = Math.atan2(jup[2], jup[0]);
  const geometry = useMemo(() => lumpyRock({ seed: 21.7, amp: 0.62 }), []);
  return (
    <>
      <Swarm angle={angle + L} radius={radius} y={jup[1]} count={count} geometry={geometry} />
      <Swarm angle={angle - L} radius={radius} y={jup[1]} count={count} geometry={geometry} />
    </>
  );
};

export default TrojanAsteroids;
