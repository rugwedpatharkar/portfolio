/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { placeInFrontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 2) — OMEGA CENTAURI. The largest, brightest globular cluster
 * orbiting the Milky Way: ~10 million ancient stars packed into a ball, with
 * Hubble evidence (2024-25) for an intermediate-mass black hole hiding at its
 * core. Rendered as a dense Gaussian sphere of bright points, brightest at the
 * centre, turning slowly. Registered in config/objects.js (scan) + explorer.js
 * (discoverable). Frozen on reduced-motion.
 */

export const OMEGACEN_RAW = [-58, 30, -44];

const buildCluster = (n, R) => {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    // central concentration: r ~ R * u^2 (u uniform) pulls points toward the core
    const u = Math.random();
    const r = R * u * u * (0.25 + 0.75 * Math.random());
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    // old-star palette: warm white → pale gold, a few blue stragglers
    const t = Math.random();
    c.setHSL(0.09 + t * 0.04, 0.35, 0.72 + Math.random() * 0.18);
    if (t > 0.93) c.setHSL(0.58, 0.4, 0.8); // rare blue straggler
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
};

export default function GlobularCluster({ animate = true }) {
  const grp = useRef();
  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(OMEGACEN_RAW)), []);
  const geo = useMemo(() => buildCluster(2600, 7), []);

  useFrame((_, dt) => {
    if (animate && grp.current) grp.current.rotation.y += dt * 0.02;
  });

  return (
    <group ref={grp} position={pos}>
      {/* the swarm of ancient stars */}
      <points geometry={geo}>
        <pointsMaterial size={0.16} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {/* soft unresolved core glow */}
      <mesh>
        <sphereGeometry args={[2.6, 20, 20]} />
        <meshBasicMaterial color="#fff0d8" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
