/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Instanced asteroid belt — three spectral families (C-type dark carbon,
 * S-type silicate brown, M-type metallic tan), one draw call each.
 *
 * Realism: every family uses its own LUMPY geometry — an icosahedron whose
 * vertices are pushed in and out by a position hash, so each rock reads as a
 * cratered, irregular body instead of a faceted ball (the old look). Random
 * per-instance orientation + non-uniform stretch + a wide size spread (a few
 * big "planetesimals" among gravel) sell the variety.
 *
 * Performance: instance matrices are written ONCE. Orbital motion is a slow
 * rotation of the whole family group (one transform per frame), not a rebuild
 * of every instance matrix every frame — the previous per-frame rebuild of
 * ~1000 matrices dominated the CPU budget and made the tour stutter.
 */

const FAMILY_COLORS = ["#5d5650", "#9a7350", "#c4a878"]; // C / S / M-type
const FAMILY_METAL = [0.04, 0.14, 0.4];
const FAMILY_ROUGH = [0.96, 0.86, 0.55];
const FAMILY_DRIFT = [0.010, 0.014, 0.018]; // slight differential orbit shear

/* Icosahedron with vertices displaced by a deterministic position hash →
   a watertight lumpy rock. Shared vertices hash identically, so faces stay
   joined; flatShading then reads the displacement as craggy facets. */
function lumpyRock(detail, seed, amp) {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const s = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719 + seed) * 43758.5453;
    const n = s - Math.floor(s); // 0..1
    v.multiplyScalar(1 + (n - 0.5) * amp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

const Family = ({ instances, family, geometry, animate = true }) => {
  const groupRef = useRef();

  /* Write all instance matrices exactly once, when the mesh mounts. */
  const fill = (mesh) => {
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    instances.forEach((a, i) => {
      dummy.position.set(Math.cos(a.angle) * a.radius, a.y, Math.sin(a.angle) * a.radius);
      dummy.rotation.set(a.rx, a.ry, a.rz);
      dummy.scale.set(a.scale * a.xStretch, a.scale * a.yStretch, a.scale * a.zStretch);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame((_, delta) => {
    if (animate && groupRef.current) groupRef.current.rotation.y += delta * FAMILY_DRIFT[family];
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={fill} args={[undefined, undefined, instances.length]} frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={FAMILY_COLORS[family]}
          roughness={FAMILY_ROUGH[family]}
          metalness={FAMILY_METAL[family]}
          flatShading
        />
      </instancedMesh>
    </group>
  );
};

const AsteroidBelt = ({
  count = 600,
  innerRadius = 18.5,
  outerRadius = 20.5,
  size = 0.08,
  animate = true,
}) => {
  /* One lumpy base shape per family (different seed → different silhouette);
     instances reuse it, so this is three geometries total, not one per rock. */
  const geometries = useMemo(
    () => [lumpyRock(1, 11.3, 0.62), lumpyRock(1, 47.9, 0.7), lumpyRock(1, 88.1, 0.55)],
    []
  );

  const families = useMemo(() => {
    const buckets = [[], [], []];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const y = (Math.random() - 0.5) * 0.5;
      /* Heavy-tailed size: cube of a uniform → mostly gravel, a rare few big. */
      const r = Math.random();
      const baseScale = size * (0.3 + r * r * r * 3.4);
      buckets[i % 3].push({
        angle,
        radius,
        y,
        scale: baseScale,
        xStretch: 0.65 + Math.random() * 0.7,
        yStretch: 0.65 + Math.random() * 0.7,
        zStretch: 0.65 + Math.random() * 0.7,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
      });
    }
    return buckets;
  }, [count, innerRadius, outerRadius, size]);

  return (
    <>
      {families.map((instances, family) =>
        instances.length > 0 ? (
          <Family key={family} instances={instances} family={family} geometry={geometries[family]} animate={animate} />
        ) : null
      )}
    </>
  );
};

export default AsteroidBelt;
