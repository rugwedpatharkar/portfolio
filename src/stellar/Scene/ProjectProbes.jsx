/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PROJECT_POSITIONS } from "../config/objects";
import { DESTINATION_BY_ID } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * Real projects as little inspectable "probes" riding Mars's orbit (the Projects
 * stop). Each is a glowing octahedron craft; scannable through the registry
 * (config/objects.js PROJECT_OBJECTS → the scan-HUD reads their stats as facts).
 * The group tracks Mars's LIVE position each frame so the probes orbit with it;
 * the static map hotspots stay at the t=0 spot (consistent with planet hotspots).
 */
const ProjectProbes = ({ animate = true }) => {
  const groupRef = useRef();
  const clock = useSceneClock();
  const mars = DESTINATION_BY_ID.projects;
  const offsets = useMemo(
    () => PROJECT_POSITIONS.map((p) => [p.position[0] - mars.position[0], p.position[1] - mars.position[1], p.position[2] - mars.position[2]]),
    [mars]
  );
  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    orbitalPosition(mars, animate ? clock.t : 0, _v);
    groupRef.current.position.copy(_v);
    if (animate) groupRef.current.children.forEach((c, i) => { c.rotation.y += dt * (0.4 + i * 0.06); });
  });

  return (
    <group ref={groupRef}>
      {PROJECT_POSITIONS.map((p, i) => (
        <group key={p.id} position={offsets[i]}>
          <mesh>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color={p.color} emissive={new THREE.Color(p.color)} emissiveIntensity={0.6} roughness={0.5} metalness={0.3} flatShading />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.26, 12, 12]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default ProjectProbes;
