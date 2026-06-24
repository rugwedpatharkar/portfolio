/* eslint-disable react/no-unknown-property */
import { remapPosition } from "../../config/destinations";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * An Imperial Star Destroyer, hanging as a silhouette in the deep field —
 * the iconic dagger wedge: a long flattened triangular hull, a raised
 * command tower near the stern, and three engine glows at the back. Dark
 * grey so it reads as a distant capital ship looming behind the system, not
 * a toy in the foreground. Drifts almost imperceptibly.
 *
 * Click → fires 'stellar:stardestroyer'.
 */

const POSITION = remapPosition([28, 12.5, -34]);

const StarDestroyer = () => {
  const ref = useRef();

  /* Flat triangular hull (top-view dagger), extruded thin. */
  const hull = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(3.4, 0);     // nose
    s.lineTo(-2.6, 1.5);  // port stern
    s.lineTo(-2.6, -1.5); // starboard stern
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 1 });
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012; // barely perceptible drift
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:stardestroyer"));
    console.log("%c⬛  Imperial Star Destroyer — that's a big ship.", "color: #9aa0a6; font-size: 14px; font-family: monospace;");
  };

  return (
    <group
      ref={ref}
      position={POSITION}
      rotation={[0.18, -0.5, 0]}
      scale={1.1}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* Hull — geometry lies in XY; rotate so it spreads in the XZ plane,
          thin axis vertical. */}
      <mesh geometry={hull} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#7e848c" roughness={0.7} metalness={0.35} flatShading />
      </mesh>
      {/* Command tower — block + bridge, near the stern, on top */}
      <mesh position={[-1.7, 0.42, 0]}>
        <boxGeometry args={[0.7, 0.34, 0.7]} />
        <meshStandardMaterial color="#888e95" roughness={0.65} metalness={0.4} flatShading />
      </mesh>
      <mesh position={[-1.7, 0.66, 0]}>
        <boxGeometry args={[0.42, 0.16, 0.5]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.6} metalness={0.45} flatShading />
      </mesh>
      {/* Two shield-generator domes flanking the bridge */}
      {[-0.28, 0.28].map((z) => (
        <mesh key={z} position={[-2.1, 0.6, z]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* Three engine glows at the stern */}
      {[-0.55, 0, 0.55].map((z) => (
        <mesh key={z} position={[-2.62, 0.0, z]}>
          <sphereGeometry args={[0.12, 12, 10]} />
          <meshBasicMaterial color="#9fd0ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

export default StarDestroyer;
