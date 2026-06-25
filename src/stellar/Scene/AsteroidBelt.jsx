/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Instanced asteroid belt — three spectral families, one draw call each, with
 * REALISTIC composition mix (main belt): C-type dark carbonaceous (~75%, the
 * dominant kind), S-type silicate (rocky/metallic), M-type metallic iron/nickel.
 * The Kuiper belt passes an icy palette instead.
 *
 * Every family uses its own LUMPY geometry — an icosahedron whose vertices are
 * pushed in/out by a position hash, so each rock reads as a cratered, irregular
 * body. Random per-instance orientation + non-uniform stretch + a wide, fat-
 * tailed size spread (dust-grade gravel → a rare GIANT planetesimal bigger than
 * the terrestrial planets) sell the "millions of bodies, all sizes" look.
 *
 * Performance: instance matrices are written ONCE (not rebuilt per frame); the
 * orbital motion is a slow rotation of the whole family group.
 */

/* Main-belt spectral families (color · metalness · roughness). C-type is dark
   carbonaceous (real albedo ~0.04 — kept dark but not pure black so lit rocks
   still read); S-type silicate; M-type metallic and a touch shinier. */
const MAIN_FAMILIES = [
  { color: "#585048", metal: 0.04, rough: 0.96 }, // C-type
  { color: "#9a7d5a", metal: 0.16, rough: 0.82 }, // S-type
  { color: "#b8a886", metal: 0.5, rough: 0.42 },  // M-type
];
const MAIN_WEIGHTS = [0.75, 0.17, 0.08]; // C dominates (~75%), then S, then M

const FAMILY_DRIFT = [0.01, 0.014, 0.018]; // slight differential orbit shear

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

const Family = ({ instances, family, geometry, mat, animate = true }) => {
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
        <meshStandardMaterial color={mat.color} roughness={mat.rough} metalness={mat.metal} flatShading />
      </instancedMesh>
    </group>
  );
};

/* Kirkwood-gap / Kuiper-cliff aware radius sampler. `gaps` are fractional belt
   positions (0..1) that resonances clear out (mostly empty, ~10% remnant);
   `cliff` ramps density to near-zero toward the outer edge (the Kuiper Cliff).
   Rejection sampling at generation time only — no per-frame cost. */
const GAP_W = 0.03;
const sampleRadius = (innerRadius, outerRadius, gaps, cliff) => {
  for (let t = 0; t < 8; t++) {
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const frac = (radius - innerRadius) / (outerRadius - innerRadius);
    if (gaps && gaps.some((g) => Math.abs(frac - g) < GAP_W) && Math.random() > 0.1) continue;
    if (cliff) {
      const keep = frac < 0.82 ? 1 : Math.max(0.04, 1 - (frac - 0.82) / 0.12);
      if (Math.random() > keep) continue;
    }
    return radius;
  }
  return innerRadius + Math.random() * (outerRadius - innerRadius);
};

/* Weighted family pick (cumulative). */
const pickFamily = (w) => {
  const r = Math.random() * (w[0] + w[1] + w[2]);
  if (r < w[0]) return 0;
  if (r < w[0] + w[1]) return 1;
  return 2;
};

const AsteroidBelt = ({
  count = 600,
  innerRadius = 18.5,
  outerRadius = 20.5,
  size = 0.08,
  thickness = 0.5, // vertical spread (real belts are fat tori, not ribbons)
  gaps = null, // fractional Kirkwood-gap centres
  cliff = false, // Kuiper-cliff density falloff toward the outer edge
  families = MAIN_FAMILIES, // spectral mix (main C/S/M, or an icy Kuiper palette)
  weights = MAIN_WEIGHTS, // relative abundance per family
  animate = true,
}) => {
  /* One lumpy base shape per family (different seed → different silhouette);
     instances reuse it, so this is three geometries total, not one per rock. */
  const geometries = useMemo(
    () => [lumpyRock(1, 11.3, 0.62), lumpyRock(1, 47.9, 0.7), lumpyRock(1, 88.1, 0.55)],
    []
  );

  const buckets = useMemo(() => {
    const out = [[], [], []];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = sampleRadius(innerRadius, outerRadius, gaps, cliff);
      /* Gaussian-ish vertical spread (two uniforms) → denser mid-plane, sparse
         outliers, like a real belt's inclination dispersion. */
      const y = (Math.random() + Math.random() - 1) * 0.5 * thickness;
      /* Multi-tier, fat-tailed size mix: mostly gravel/extra-small, a third
         small, ~7% large, and a rare ~0.8% GIANT planetesimal — the big ones
         dwarf the terrestrial planets. */
      const r = Math.random();
      let baseScale;
      if (r > 0.992)      baseScale = size * (5.0 + Math.random() * 7.0);   // rare giants
      else if (r > 0.93)  baseScale = size * (2.2 + Math.random() * 2.6);   // large
      else if (r > 0.62)  baseScale = size * (0.7 + Math.random() * 1.3);   // small
      else                baseScale = size * (0.16 + Math.random() * 0.5);  // gravel / extra-small
      out[pickFamily(weights)].push({
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
    return out;
  }, [count, innerRadius, outerRadius, size, thickness, gaps, cliff, weights]);

  return (
    <>
      {buckets.map((instances, family) =>
        instances.length > 0 ? (
          <Family key={family} instances={instances} family={family} geometry={geometries[family]} mat={families[family]} animate={animate} />
        ) : null
      )}
    </>
  );
};

export default AsteroidBelt;
