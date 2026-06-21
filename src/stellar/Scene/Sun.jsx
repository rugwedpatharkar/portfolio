import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * The sun — the visitor's starting point. A glowing sphere with a corona
 * billboard sprite around it, slow rotation. Tints to brand orange.
 *
 * This is YOU. The camera lands here, the system's center of gravity.
 *
 * Performance: simple emissive material, no PBR, no expensive lighting.
 * The corona is a flat sprite, not volumetric.
 */

const Sun = ({ position = [0, 0, 0], radius = 2.2 }) => {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial color="#ffb86b" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#ffd47a"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff9a3c"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ffd47a" intensity={1.5} distance={60} decay={1.2} />
    </group>
  );
};

export default Sun;
