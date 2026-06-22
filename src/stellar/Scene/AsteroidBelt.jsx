/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Instanced asteroid belt — three families of rocks merged into one
 * draw call per family, each with a distinct material to mimic the
 * real spectral classes (C-type carbonaceous dark grey, S-type silicate
 * brown, M-type metallic warm tan).
 *
 * Each asteroid orbits the system center on a slightly inclined plane
 * with a random angle, speed, and rotation. Per-instance scale gives
 * varied sizes so a few "Ceres-like" bodies stand out among gravel.
 */

const FAMILY_COLORS = ["#6e6258", "#a0795a", "#cbb288"]; // C / S / M-type
const FAMILY_METAL = [0.05, 0.15, 0.35];
const FAMILY_ROUGH = [0.95, 0.85, 0.55];

const Family = ({ instances, family, baseSize, dummy }) => {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    instances.forEach((a, i) => {
      a.angle += a.orbitSpeed * delta;
      a.rx += a.rotationSpeed * delta;
      dummy.position.set(
        Math.cos(a.angle) * a.radius,
        a.y,
        Math.sin(a.angle) * a.radius
      );
      dummy.rotation.set(a.rx, a.angle, a.rz);
      dummy.scale.set(a.scale * a.xStretch, a.scale, a.scale * a.zStretch);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, instances.length]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={FAMILY_COLORS[family]}
        roughness={FAMILY_ROUGH[family]}
        metalness={FAMILY_METAL[family]}
        flatShading
      />
    </instancedMesh>
  );
};

const AsteroidBelt = ({
  count = 600,
  innerRadius = 18.5,
  outerRadius = 20.5,
  size = 0.08,
}) => {
  const dummy = useMemo(() => new THREE.Object3D(), []);

  /* Split count three ways across spectral classes, with slightly
     non-uniform scale + irregular xz stretch per rock */
  const families = useMemo(() => {
    const buckets = [[], [], []];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 0.5;
      const baseScale = size * (0.35 + Math.random() * 1.8);
      const rotationSpeed = (Math.random() - 0.5) * 0.7;
      const orbitSpeed = 0.004 + Math.random() * 0.012;
      const family = i % 3;
      buckets[family].push({
        angle,
        radius,
        y,
        scale: baseScale,
        xStretch: 0.7 + Math.random() * 0.6,
        zStretch: 0.7 + Math.random() * 0.6,
        rotationSpeed,
        orbitSpeed,
        rx: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
      });
    }
    return buckets;
  }, [count, innerRadius, outerRadius, size]);

  return (
    <>
      {families.map((instances, family) =>
        instances.length > 0 ? (
          <Family key={family} instances={instances} family={family} baseSize={size} dummy={dummy} />
        ) : null
      )}
    </>
  );
};

export default AsteroidBelt;
