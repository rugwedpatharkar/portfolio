/* eslint-disable react/no-unknown-property, react/prop-types */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit } from "../config/orbits";

/*
 * Faint orbital rings on the ecliptic plane — reveals the system's real
 * structure in the orrery / system view. Only shown while the wide pull-back
 * (overview) is active; invisible during the close tour.
 */
const RINGS = DESTINATIONS.filter((d) => d.kind === "planet").map((d) => ({
  id: d.id,
  R: getOrbit(d).R,
  color: d.color || "#cfd6ff",
}));

const OrbitRings = ({ wideRef }) => {
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) groupRef.current.visible = !!wideRef?.current;
  });
  return (
    <group ref={groupRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
      {RINGS.map((r) => (
        <mesh key={r.id}>
          <ringGeometry args={[r.R - 0.02, r.R + 0.02, 160]} />
          <meshBasicMaterial color={r.color} transparent opacity={0.16} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

export default OrbitRings;
