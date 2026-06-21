/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Two large faint nebulae as billboarded particle clouds.
 * Each is a tight cluster of ~200 soft glow points colored to match the
 * brand palette (one purple, one teal).
 *
 * Renders behind everything, additive blend so they don't darken the
 * planets. Slowly drift to give the system the sense it's alive.
 */

const Nebula = ({ position, color, count = 250, spread = 8, opacity = 0.18 }) => {
  const groupRef = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      a[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      a[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      a[i * 3 + 2] = r * Math.cos(phi) * 0.7;
    }
    return a;
  }, [count, spread]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.005;
  });

  return (
    <group ref={groupRef} position={position}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={3.5}
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

const Nebulae = () => (
  <>
    <Nebula position={[-30, 5, -20]} color="#915eff" count={300} spread={14} opacity={0.16} />
    <Nebula position={[55, -4, 18]} color="#00cea8" count={250} spread={12} opacity={0.13} />
    <Nebula position={[20, 8, -28]} color="#bf61ff" count={180} spread={8} opacity={0.11} />
  </>
);

export default Nebulae;
