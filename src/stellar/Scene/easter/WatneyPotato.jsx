/* eslint-disable react/no-unknown-property */
import { besidePlanet } from "../../config/destinations";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/*
 * Mark Watney's potato — a tiny brown sphere near Mars's north pole.
 * Visible only when Mars is reasonably close to the camera.
 */

const POSITION = besidePlanet("projects", [1, 0.3], { lateral: 1.5 }); // just beside Mars, in the backlit tour view
/* Hoisted once — was rebuilt as new THREE.Vector3(...POSITION) every frame */
const POSITION_VEC = new THREE.Vector3(...POSITION);

const WatneyPotato = () => {
  const groupRef = useRef();
  useFrame(({ camera }) => {
    if (groupRef.current) groupRef.current.visible = camera.position.distanceTo(POSITION_VEC) < 5.5;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:watney"));
  };

  return (
    <group ref={groupRef} position={POSITION}>
      <mesh
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = ""; }}
      >
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshStandardMaterial color="#a07a4a" roughness={0.95} />
      </mesh>
      <Html
        center
        distanceFactor={4}
        style={{
          pointerEvents: "none",
          fontFamily: "'Martian Mono', monospace",
          fontSize: 9,
          color: "#a07a4a",
          textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          letterSpacing: "0.1em",
          transform: "translateY(-12px)",
        }}
      >POTATO</Html>
    </group>
  );
};

export default WatneyPotato;
