/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * PHASE 4 (Wave 1) — the Io plasma torus. A donut of ionized sulfur + oxygen, fed
 * by Io's relentless volcanoes and trapped in Jupiter's magnetosphere — the
 * strongest plasma structure in the solar system. Rendered as a faint, gently
 * breathing additive torus in Jupiter's equatorial plane (tilted with its axis).
 * Frozen on reduced-motion.
 */
export default function IoTorus({ radius = 2, axialTilt = 0, animate = true }) {
  const matRef = useRef();
  const clock = useSceneClock();
  useFrame(() => {
    if (matRef.current && animate) matRef.current.opacity = 0.13 + Math.sin(clock.t * 0.6) * 0.04;
  });
  return (
    <group rotation={[0, 0, axialTilt]}>
      {/* equatorial plane = perpendicular to the (tilted) spin axis. Uses the SAME
          π/2.05 lean as the planet rings (Planet.jsx) so the torus is coplanar with
          Jupiter's ring instead of sitting 2.2° off it. */}
      <mesh rotation={[Math.PI / 2.05, 0, 0]}>
        <torusGeometry args={[radius * 2.5, radius * 0.18, 18, 90]} />
        <meshBasicMaterial ref={matRef} color="#d8e07a" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
