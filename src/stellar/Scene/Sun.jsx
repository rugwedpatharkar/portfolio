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
  const innerCoronaRef = useRef();
  const outerCoronaRef = useRef();
  const tRef = useRef(0);

  const urls = useMemo(() => (texture ? [texture] : []), [texture]);
  const loaded = useLoader(THREE.TextureLoader, urls);
  const sunTex = loaded[0];
  if (sunTex) {
    sunTex.colorSpace = THREE.SRGBColorSpace;
    sunTex.anisotropy = 4;
  }

  useFrame((_, delta) => {
    tRef.current += delta;
    const t = tRef.current;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
    /* Subtle breathing — corona opacity + scale oscillate at different
       frequencies so the sun feels alive without a obvious sine-wave. */
    if (innerCoronaRef.current) {
      const pulse = 1 + Math.sin(t * 0.9) * 0.04 + Math.sin(t * 2.3 + 1.7) * 0.02;
      innerCoronaRef.current.scale.setScalar(pulse);
      innerCoronaRef.current.material.opacity = 0.45 + Math.sin(t * 1.3) * 0.08;
    }
    if (outerCoronaRef.current) {
      const pulse = 1 + Math.sin(t * 0.55 + 0.8) * 0.05;
      outerCoronaRef.current.scale.setScalar(pulse);
      outerCoronaRef.current.material.opacity = 0.22 + Math.sin(t * 0.7 + 2.1) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* The sun body is heavily over-bright so bloom catches it and
          turns the surface into a true glowing star, not a flat ball. */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          map={sunTex || null}
          color={sunTex ? "#ffb060" : "#ffb86b"}
          toneMapped={false}
        />
      </mesh>
      {/* Inner corona — close, bright halo that bloom grabs first.
          Subtly breathes via useFrame above. */}
      <mesh ref={innerCoronaRef}>
        <sphereGeometry args={[radius * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#fff0c0"
          transparent
          opacity={0.45}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {/* Outer corona — softer, wider falloff that bloom smears out */}
      <mesh ref={outerCoronaRef}>
        <sphereGeometry args={[radius * 1.45, 32, 32]} />
        <meshBasicMaterial
          color="#ffa040"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      {/* Warm sun-side fill for the inner planets. Trimmed (was 2.4) and
          given faster decay so it no longer stacks with the directional
          key to over-expose the outer gas giants — those sit far enough
          out that this contributes little, which is physically right. */}
      <pointLight color="#ffe5b0" intensity={1.1} distance={60} decay={1.5} />
    </group>
  );
};

export default Sun;
