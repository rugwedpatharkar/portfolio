/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * PHASE 4 (Wave 1) — ICY-MOON GEYSERS. Enceladus (Saturn) and Europa (Jupiter)
 * both vent water from a subsurface ocean through cracks; Enceladus's south-pole
 * jets are so powerful they feed Saturn's E-ring. Rendered as a small bright icy
 * moon with a fan of pulsing plumes from one pole, mounted INSIDE the parent
 * planet's OrbitGroup at the moon's offset so it rides the planet's live orbit.
 * Generic so one component serves both moons. Frozen on reduced-motion; the scan
 * + facts already live in config/moons.js (no new registry entry needed).
 */

const Y = new THREE.Vector3(0, 1, 0);

export default function MoonGeysers({
  offset = [0, 0, 0], radius = 0.13, color = "#eef3f1", plumeColor = "#bfe6ff",
  jets = 6, dir = [0, -1, 0.3], animate = true,
}) {
  const fan = useRef();
  const t = useRef(0);
  const d = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir]);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(Y, d), [d]);
  const list = useMemo(() => Array.from({ length: jets }, (_, i) => i), [jets]);

  useFrame((_, dt) => {
    if (!animate || !fan.current) return;
    t.current += Math.min(dt, 1 / 20);
    const T = t.current;
    fan.current.children.forEach((c, i) => {
      const ph = (Math.sin(T * 0.9 + i * 1.4) + 1) * 0.5; // staggered 0..1 pulse
      c.scale.y = 0.6 + ph * 0.9;
      c.material.opacity = 0.1 + ph * 0.26;
    });
  });

  const R = radius;
  return (
    <group position={offset}>
      {/* the bright icy moon */}
      <mesh>
        <sphereGeometry args={[R, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0} emissive={color} emissiveIntensity={0.14} />
      </mesh>
      {/* plume fan, rooted at the pole and aimed along `dir` */}
      <group ref={fan} quaternion={quat} position={[d.x * R, d.y * R, d.z * R]}>
        {list.map((i) => {
          const a = (i - (jets - 1) / 2) * 0.2; // small fan spread
          return (
            <mesh key={i} position={[Math.sin(a) * R * 0.4, R * 1.4, 0]} rotation={[0, 0, a]}>
              <coneGeometry args={[R * 0.16, R * 2.8, 8, 1, true]} />
              <meshBasicMaterial color={plumeColor} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
