/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Instanced asteroid belt — one draw call for all asteroids.
 * Each asteroid is a tiny irregular polyhedron (icosahedron at low detail
 * gets the lumpy rock feel cheaper than dodecahedron).
 *
 * Asteroids orbit the system center on a slightly inclined plane, each
 * with its own radius, phase, and rotation. The full belt rotates very
 * slowly as a unit.
 */

const AsteroidBelt = ({
  count = 600,
  innerRadius = 18.5,
  outerRadius = 20.5,
  color = "#f8c555",
  size = 0.08,
}) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const asteroids = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 0.45;
      const scale = size * (0.5 + Math.random() * 1.3);
      const rotationSpeed = (Math.random() - 0.5) * 0.6;
      const orbitSpeed = 0.005 + Math.random() * 0.01;
      arr.push({
        angle,
        radius,
        y,
        scale,
        rotationSpeed,
        orbitSpeed,
        rx: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
      });
    }
    return arr;
  }, [count, innerRadius, outerRadius, size]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    asteroids.forEach((a, i) => {
      a.angle += a.orbitSpeed * delta;
      a.rx += a.rotationSpeed * delta;
      dummy.position.set(
        Math.cos(a.angle) * a.radius,
        a.y,
        Math.sin(a.angle) * a.radius
      );
      dummy.rotation.set(a.rx, a.angle, a.rz);
      dummy.scale.setScalar(a.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(color).multiplyScalar(0.4)}
        emissiveIntensity={0.45}
        roughness={0.95}
        metalness={0.15}
        flatShading
      />
    </instancedMesh>
  );
};

export default AsteroidBelt;
