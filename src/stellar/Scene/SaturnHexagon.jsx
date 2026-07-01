/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * PHASE 4 (Wave 1) — Saturn's north-polar HEXAGON. The real, persistent ~30,000 km
 * six-sided jet stream first seen by Voyager (1981), tracked by Cassini + JWST —
 * the only shape of its kind in the solar system. Rendered as a slowly-turning
 * hexagonal jet band + a polar-vortex eye, sat on the pole and tilted with
 * Saturn's axis so it lines up with the rings. Additive, cheap, frozen on
 * reduced-motion. "What you learn" hook lives in Saturn's dossier (planetFacts).
 */

const hexPts = (r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    return new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
  });

export default function SaturnHexagon({ radius = 1, axialTilt = 0, animate = true }) {
  const ref = useRef();
  const clock = useSceneClock();
  const { band, eye } = useMemo(() => {
    const shape = new THREE.Shape(hexPts(1));
    shape.holes.push(new THREE.Path(hexPts(0.78).reverse()));
    return {
      band: new THREE.ShapeGeometry(shape),
      eye: new THREE.ShapeGeometry(new THREE.Shape(hexPts(0.74))),
    };
  }, []);

  useFrame(() => {
    if (ref.current && animate) ref.current.rotation.z = clock.t * 0.05; // slow polar jet
  });

  const R = radius * 0.32; // ~30,000 km across vs Saturn's ~58,000 km radius
  return (
    <group rotation={[0, 0, axialTilt]}>
      {/* on the (oblate-flattened) north pole; coplanar with the rings (π/2.05, the
          same lean Planet.jsx uses) so the hexagon parallels the ring plane. */}
      <group position={[0, radius * 0.9, 0]} rotation={[Math.PI / 2.05, 0, 0]} scale={[R, R, R]}>
        <group ref={ref}>
          {/* the hexagonal jet band */}
          <mesh geometry={band}>
            <meshBasicMaterial color="#8fe0d8" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          {/* the warm polar-vortex eye */}
          <mesh geometry={eye} position={[0, 0, -0.01]}>
            <meshBasicMaterial color="#c8a868" transparent opacity={0.16} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
