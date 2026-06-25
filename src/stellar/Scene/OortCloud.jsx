/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";

/*
 * The Oort cloud — the vast spherical shell of icy bodies that wraps the ENTIRE
 * solar system and is the source of long-period comets (Halley's cousins). The
 * real cloud sits ~2,000–100,000 AU out, utterly off any visible scale, so this
 * is a representative far halo: a sparse, very faint sphere of points enclosing
 * the whole planetary region — "the system is cocooned in a cloud." Additive,
 * low-opacity, write-once; no per-frame work.
 */
const OortCloud = ({ count = 1400, radius = 5200, thickness = 3200 }) => {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      /* Uniform point on a sphere (z = cosθ uniform), jittered radially for
         shell thickness. */
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * thickness;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = Math.cos(t) * s * r;
      pos[i * 3 + 1] = u * r;
      pos[i * 3 + 2] = Math.sin(t) * s * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius, thickness]);

  return (
    <points geometry={geo} frustumCulled={false}>
      {/* The real Oort cloud is invisible to the eye — this is the faintest
          possible hint of a cocooning halo, not a glowing bubble. Low opacity +
          small motes so it never frosts over the starfield/nebulae behind it. */}
      <pointsMaterial
        size={6}
        sizeAttenuation
        color="#c2ccd8"
        transparent
        opacity={0.055}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default OortCloud;
