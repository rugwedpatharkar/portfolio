/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { placeInFrontOfSun } from "../../config/destinations";
import { nearCamera } from "../shared/hooks";
import { useSceneClock } from "../SceneClock";

/*
 * PHASE 4 (Wave 1) — BETELGEUSE, a red supergiant ~700× the Sun's width: drop it
 * where the Sun is and it would swallow Jupiter's orbit. Near the end of its life,
 * due to go supernova (astronomically soon). In 2025 astronomers confirmed a close
 * companion star, nicknamed "Siwarħa" — modelled here as a small bright point on a
 * tight orbit. A deep, slowly-pulsing red sphere (semiregular variable) + corona.
 * Registered in config/objects.js (scan) + explorer.js (discoverable). Frozen on RM.
 */

export const BETELGEUSE_RAW = [40, 16, -28];

export default function Hypergiant({ animate = true }) {
  const star = useRef();
  const halo = useRef();
  const comp = useRef();
  const sceneClock = useSceneClock();
  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(BETELGEUSE_RAW)), []);

  useFrame(({ camera }) => {
    if (!nearCamera(camera, pos, 500)) return;
    if (!animate) return;
    /* §4.4: read shared world-time from SceneClock instead of a per-instance
       accumulator so the pulse + companion orbit obey global time-scale changes
       (pause / ×0.5 / ×2) and reduced-motion the same way orbits do. */
    const T = sceneClock.t;
    const pulse = 1 + Math.sin(T * 0.28) * 0.06 + Math.sin(T * 0.11 + 1.3) * 0.03; // semiregular
    if (star.current) star.current.scale.setScalar(pulse);
    if (halo.current) halo.current.material.opacity = 0.16 + Math.sin(T * 0.28) * 0.05;
    if (comp.current) {
      const a = T * 0.25; // tight companion orbit
      comp.current.position.set(Math.cos(a) * 11, Math.sin(a * 0.6) * 2.5, Math.sin(a) * 11);
    }
  });

  const R = 7;
  return (
    <group position={pos}>
      {/* the supergiant — self-lit, blooms into a deep red star */}
      <mesh ref={star}>
        <sphereGeometry args={[R, 36, 36]} />
        <meshBasicMaterial color="#ff5326" toneMapped={false} />
      </mesh>
      {/* tenuous outer envelope */}
      <mesh ref={halo}>
        <sphereGeometry args={[R * 1.9, 24, 24]} />
        <meshBasicMaterial color="#ff7a40" transparent opacity={0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Siwarħa — the 2025-confirmed companion */}
      <mesh ref={comp} position={[11, 0, 0]}>
        <sphereGeometry args={[0.7, 14, 14]} />
        <meshBasicMaterial color="#ffe0bc" toneMapped={false} />
      </mesh>
    </group>
  );
}
