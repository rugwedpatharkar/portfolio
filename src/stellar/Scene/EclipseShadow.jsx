/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";

/*
 * PHASE 4 (Wave 1) — THE 2026 ECLIPSES (Feb 17 annular · Aug 12 total). The Moon's
 * shadow falls on Earth twice in 2026, racing a narrow path of totality across the
 * surface. Rendered as the iconic view-from-space: a small dark umbra (+ soft
 * penumbra) drifting across Earth's sunlit DAY side. Mounted in Earth's OrbitGroup
 * (which only translates), so we recompute the sunward day side from Earth's live
 * orbital position each frame. Frozen on reduced-motion. The "what you learn" +
 * scan entry live in config/moons.js (the "2026 Eclipses" pin).
 */

const EARTH = DESTINATIONS.find((d) => d.type === "earth");
const _e = new THREE.Vector3();
const _sun = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _p = new THREE.Vector3();
const Z = new THREE.Vector3(0, 0, 1);

export default function EclipseShadow({ earthRadius = 0.07, animate = true }) {
  const grp = useRef();
  const clock = useSceneClock();

  useFrame((_, dt) => {
    if (!grp.current) return;
    /* Earth's sunward (day-side) direction from its live orbital position. */
    orbitalPosition(EARTH, clock.t, _e);
    _sun.copy(_e).multiplyScalar(-1).normalize();
    /* Drift the umbra slowly across the day side (the path of totality). */
    const drift = Math.sin(clock.t * 0.15) * 0.5;
    _tan.set(-_sun.z, 0.4, _sun.x).normalize();
    _p.copy(_sun).applyAxisAngle(_tan, drift).normalize();
    grp.current.position.copy(_p).multiplyScalar(earthRadius * 1.012);
    grp.current.quaternion.setFromUnitVectors(Z, _p); // lie flat on the surface, facing out
  });

  const R = earthRadius;
  return (
    <group ref={grp}>
      {/* penumbra — the softer partial shadow (drawn first, under the umbra) */}
      <mesh position={[0, 0, -0.0006]}>
        <circleGeometry args={[R * 0.34, 28]} />
        <meshBasicMaterial color="#0a0c14" transparent opacity={0.38} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* umbra — the dark total-shadow spot */}
      <mesh>
        <circleGeometry args={[R * 0.15, 24]} />
        <meshBasicMaterial color="#05060a" transparent opacity={0.82} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
