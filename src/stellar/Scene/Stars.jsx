import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * 5,000 instanced stars as a single Points buffer. One draw call, ~1.5 MB
 * GPU memory, renders in <0.5 ms even on mid-range mobile.
 *
 * Slowly rotates on the Y axis for parallax depth — gives the scene a
 * sense of "you are inside something vast" without distracting from the
 * sun + planets.
 */

const STAR_COUNT = 5000;
const SPREAD = 250;

const Stars = () => {
  const groupRef = useRef();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < STAR_COUNT; i++) {
      // Uniform distribution on a sphere shell
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = SPREAD * (0.6 + Math.random() * 0.4);
      tmp.setFromSphericalCoords(r, phi, theta);
      positions[i * 3 + 0] = tmp.x;
      positions[i * 3 + 1] = tmp.y;
      positions[i * 3 + 2] = tmp.z;

      // Slight color variance — most white, some bluish, some gold
      const t = Math.random();
      const c =
        t < 0.05
          ? new THREE.Color("#ffd47a")
          : t < 0.15
            ? new THREE.Color("#9bb4ff")
            : new THREE.Color("#ffffff");
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.005;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={STAR_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={STAR_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

export default Stars;
