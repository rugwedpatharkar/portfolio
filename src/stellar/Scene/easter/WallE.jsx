/* eslint-disable react/no-unknown-property */
import { nearBody } from "../../config/destinations";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * Wall-E sitting on a derelict satellite past Neptune. Tiny boxy
 * mesh with binocular eyes. Looks toward Earth direction (origin
 * relative). Hidden far enough out you have to free-roam to find it.
 */

const POSITION = nearBody("experience", [-1.3, -0.5, -1.4]); // near Earth (his home) — in the tour view

const WallE = () => {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      /* Tiny head bob, watching the system */
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.15;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:walle"));
  };

  return (
    <group
      ref={groupRef}
      position={POSITION}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.35, 0.4, 0.35]} />
        <meshStandardMaterial color="#c08040" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.09, 0.28, 0.18]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#202020" />
      </mesh>
      <mesh position={[0.09, 0.28, 0.18]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#202020" />
      </mesh>
      <mesh position={[-0.09, 0.28, 0.22]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial emissive="#a8d8ff" emissiveIntensity={2} color="#a8d8ff" />
      </mesh>
      <mesh position={[0.09, 0.28, 0.22]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial emissive="#a8d8ff" emissiveIntensity={2} color="#a8d8ff" />
      </mesh>
    </group>
  );
};

export default WallE;
