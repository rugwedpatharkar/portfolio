/* eslint-disable react/no-unknown-property */
import { nearBody } from "../../config/destinations";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * Interstellar's Cooper Station — small rotating cylinder near
 * Saturn's rings, the human habitat from the film's ending. Two
 * end-caps + cylinder body. Slow spin = artificial gravity.
 */

const POSITION = nearBody("notes", [-3.0, -0.6, -2.4]); // by Saturn, in the tour view

const CooperStation = () => {
  const cylRef = useRef();
  useFrame((_, dt) => {
    if (cylRef.current) cylRef.current.rotation.z += dt * 0.6;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:cooperstation"));
  };

  return (
    <group
      ref={cylRef}
      position={POSITION}
      rotation={[0, 0, Math.PI / 4]}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.6, 18]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.18, 0.16, 0.06, 18]} />
        <meshStandardMaterial color="#9a9a9a" />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.06, 18]} />
        <meshStandardMaterial color="#9a9a9a" />
      </mesh>
    </group>
  );
};

export default CooperStation;
