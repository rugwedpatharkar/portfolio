/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * 'Oumuamua (1I/'Oumuamua) — the first confirmed interstellar object, 2017. A
 * dark, reddish, extraordinarily elongated shard (≈6–10:1) that fell in from
 * another star on an UNBOUND hyperbolic trajectory, tumbled end-over-end, and is
 * already on its way back out, never to return. At system scale a hyperbola is
 * effectively a straight line, so it drifts on a fixed heading clean through the
 * planetary region and respawns once it's gone. Tumbles as it travels.
 */
const START = new THREE.Vector3(-3600, 920, 2600);
const VEL = new THREE.Vector3(168, -42, -176); // fixed heading across the system

const InterstellarVisitor = ({ animate = true }) => {
  const ref = useRef();
  const pos = useRef(START.clone());

  useFrame((_, delta) => {
    if (!ref.current || !animate) return;
    const d = Math.min(delta, 1 / 20);
    const p = pos.current;
    p.addScaledVector(VEL, d);
    if (p.length() > 6200) p.copy(START); // gone interstellar → respawn the approach
    ref.current.position.copy(p);
    ref.current.rotation.x += d * 0.9; // chaotic tumble
    ref.current.rotation.z += d * 0.55;
  });

  return (
    <group ref={ref} position={START.toArray()}>
      {/* Elongated cigar: a sub-divided icosahedron stretched ~6:1, dark reddish
          rock, lit by the Sun like everything else. */}
      <mesh scale={[6, 6.4, 34]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#7d4a39" roughness={1} metalness={0.04} flatShading />
      </mesh>
    </group>
  );
};

export default InterstellarVisitor;
