/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { laneObjectPosition } from "../config/orbits";
import { itemsForSection } from "../data/sectionItems";

/*
 * Lane objects — the active section's résumé items rendered as a co-orbital
 * convoy of small craft on the planet's orbital lane (←→ travels between them).
 * Refs + useFrame only: each object tracks the planet's live orbit, the active
 * one pulses + glows amber. M2a = visible markers; characterful per-kind models
 * land in M2c. Only the active section's objects mount (a handful), so it's cheap.
 */

const _p = new THREE.Vector3();

export default function LaneObjects({ destination, itemIdx = 0 }) {
  const clock = useSceneClock();
  const refs = useRef([]);
  const items = useMemo(() => (destination ? itemsForSection(destination.section) : []), [destination]);

  useFrame(() => {
    if (!destination) return;
    const t = clock.t;
    for (let k = 0; k < items.length; k++) {
      const g = refs.current[k];
      if (!g) continue;
      laneObjectPosition(destination, k, t, _p);
      g.position.copy(_p);
      const active = k === itemIdx;
      g.scale.setScalar(active ? 1 + Math.sin(t * 3) * 0.08 : 0.68);
      g.rotation.y += active ? 0.012 : 0.004;
    }
  });

  if (!destination || items.length === 0) return null;

  return (
    <group>
      {items.map((it, k) => {
        const active = k === itemIdx;
        return (
          <group key={it.id} ref={(el) => (refs.current[k] = el)}>
            <mesh castShadow>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial
                color={active ? "#cfe0f2" : "#7f93b0"}
                metalness={0.6}
                roughness={0.35}
                emissive={active ? "#ffb84d" : "#4da6ff"}
                emissiveIntensity={active ? 0.5 : 0.18}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial
                color={active ? "#ffb84d" : "#4da6ff"}
                transparent
                opacity={active ? 0.3 : 0.12}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {active && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.34, 0.012, 8, 40]} />
                <meshBasicMaterial color="#ffb84d" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
