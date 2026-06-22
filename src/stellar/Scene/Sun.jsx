/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/*
 * The sun — visitor's starting point. Glowing sphere with photosphere
 * texture (granulation pattern), corona halo, and a pointlight that
 * spills onto nearby planets.
 *
 * Texture is optional; if `texture` is omitted the sun falls back to a
 * flat orange. We multiply the texture by warm orange in shader-color
 * to keep the brand palette consistent.
 */

const Sun = ({
  position = [0, 0, 0],
  radius = 2.2,
  texture,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const meshRef = useRef();

  const urls = useMemo(() => (texture ? [texture] : []), [texture]);
  const loaded = useLoader(THREE.TextureLoader, urls);
  const sunTex = loaded[0];
  if (sunTex) {
    sunTex.colorSpace = THREE.SRGBColorSpace;
    sunTex.anisotropy = 4;
  }

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          map={sunTex || null}
          color={sunTex ? "#ffa040" : "#ffb86b"}
          toneMapped={false}
        />
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
