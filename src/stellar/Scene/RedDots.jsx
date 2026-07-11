/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { placeInFrontOfSun } from "../config/destinations";

/*
 * PHASE 4 (Wave 2) — "LITTLE RED DOTS". JWST's surprise population: tiny, intensely
 * red, compact objects from the universe's first billion years — dust-shrouded
 * baby galaxies or overfed early black holes. They're rewriting how fast cosmic
 * structure grew. Rendered as a tight scatter of small deep-red glows that slowly
 * breathe. Registered in objects.js (scan) + explorer.js. Frozen on RM.
 */

export const REDDOTS_RAW = [-50, -34, 30];

export default function RedDots({ animate = true }) {
  const grp = useRef();
  const t = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(REDDOTS_RAW)), []);
  const dots = useMemo(() => Array.from({ length: 16 }, () => ({
    p: [(Math.random() - 0.5) * 9, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 9],
    s: 0.18 + Math.random() * 0.4,
    ph: Math.random() * Math.PI * 2,
  })), []);

  useFrame((_, dt) => {
    if (!animate || !grp.current) return;
    t.current += Math.min(dt, 1 / 20);
    grp.current.children.forEach((c, i) => {
      if (c.material) c.material.opacity = 0.5 + Math.sin(t.current * 0.5 + dots[i].ph) * 0.18;
    });
  });

  return (
    <group ref={grp} position={pos}>
      {dots.map((d, i) => (
        <mesh key={i} position={d.p}>
          <sphereGeometry args={[d.s, 12, 12]} />
          <meshBasicMaterial color="#d83a2a" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
