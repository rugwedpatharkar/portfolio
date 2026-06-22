/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";

/*
 * Translucent Earth-sized ghost sphere placed beside the active planet
 * (gas giants only — too crowded on inner planets). Lets the visitor
 * feel scale by direct comparison.
 *
 * Earth's radius is 0.75 in our scene units. We render at that exact
 * radius next to anything ≥ 1.0 radius.
 */

const SHOW_NEXT_TO = new Set(["skills", "notes", "education", "hobbies"]); // Jupiter+

const ScaleGhost = ({ activeIdx }) => {
  const meshRef = useRef();
  const dest = DESTINATIONS[activeIdx];
  const visible = dest && SHOW_NEXT_TO.has(dest.id);

  const target = useMemo(() => {
    if (!visible) return null;
    return [dest.position[0] - dest.radius - 1.0, dest.position[1], dest.position[2]];
  }, [visible, dest]);

  useFrame(() => {
    if (!meshRef.current || !visible) return;
    meshRef.current.visible = true;
    meshRef.current.position.set(target[0], target[1], target[2]);
  });

  if (!visible) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.75, 32, 32]} />
      <meshStandardMaterial
        color="#5fa5ff"
        transparent
        opacity={0.32}
        emissive="#1d3a5e"
        emissiveIntensity={0.6}
        wireframe={false}
      />
    </mesh>
  );
};

export default ScaleGhost;
