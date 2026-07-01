/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * PHASE 4 (Wave 2) — MIMAS, Saturn's "Death Star" moon. One colossal impact crater
 * (Herschel, ~⅓ its width) gives it an unmistakable silhouette — and in 2024 it
 * was found to hide a YOUNG subsurface ocean under all that ice. Mounted inside
 * Saturn's OrbitGroup at Mimas's offset; the giant crater turns into and out of
 * view (the "Death Star wink"). Frozen on reduced-motion. Scan + facts live in
 * config/moons.js.
 */

export default function MimasMoon({ offset = [2.9, 0.4, -1.3], radius = 0.13, animate = true }) {
  const grp = useRef();
  const pos = useMemo(() => new THREE.Vector3(...offset), [offset]);

  useFrame((_, dt) => {
    if (animate && grp.current) grp.current.rotation.y += dt * 0.05;
  });

  const R = radius;
  return (
    <group position={pos}>
      <group ref={grp}>
        {/* the icy body */}
        <mesh>
          <sphereGeometry args={[R, 24, 24]} />
          <meshStandardMaterial color="#c9cdd2" roughness={0.85} metalness={0} />
        </mesh>
        {/* Herschel — the giant crater: a darker dished disc on +X with a central peak */}
        <group position={[R * 0.97, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <circleGeometry args={[R * 0.34, 28]} />
            <meshStandardMaterial color="#969ca4" roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, R * 0.05]}>
            <coneGeometry args={[R * 0.08, R * 0.13, 12]} />
            <meshStandardMaterial color="#b6bcc4" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
