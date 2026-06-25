/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Dense dust band for a belt — tens of thousands of tiny additive points filling
 * the torus volume. This is what sells the real "dense dusty donut" look (see
 * the reference belt imagery): discrete instanced rocks alone read as sparse
 * specks, but a high-count point field reads as a continuous glowing band whose
 * brightness comes from density. One draw call, written once — cheap.
 *
 * Points use a SOFT ROUND sprite and CONSTANT screen size (sizeAttenuation off),
 * so a camera flying through the belt (e.g. the Ceres stop sits inside it) sees
 * fine grain — not the giant square splats that size-attenuated quads become up
 * close. Distribution mirrors a real belt: denser mid-plane + mid-radius
 * (Gaussian-ish from summed uniforms) so the band has a bright core that fades
 * at the edges, not a hard-edged ring.
 */

/* Soft circular sprite (radial gradient) — shared module-level so every belt
   reuses one texture. */
let _dot;
const dotSprite = () => {
  if (_dot) return _dot;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.55)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _dot = new THREE.CanvasTexture(c);
  return _dot;
};

const BeltDust = ({
  count = 24000,
  innerRadius,
  outerRadius,
  thickness,
  color = "#c9b48a",
  size = 2.4, // screen pixels (sizeAttenuation off)
  opacity = 0.5,
  drift = 0.012,
  gaps = null, // fractional Kirkwood-gap centres (dust mirrors the rocks)
  cliff = false, // Kuiper-cliff density falloff
  animate = true,
}) => {
  const ref = useRef();
  const sprite = useMemo(dotSprite, []);

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const mid = (innerRadius + outerRadius) / 2;
    const span = (outerRadius - innerRadius) / 2;
    const span01 = outerRadius - innerRadius;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      let rr = mid;
      for (let t = 0; t < 6; t++) {
        rr = mid + (Math.random() + Math.random() - 1) * span; // triangular → denser mid-band
        const frac = (rr - innerRadius) / span01;
        if (gaps && gaps.some((g) => Math.abs(frac - g) < 0.03) && Math.random() > 0.12) continue;
        if (cliff) {
          const keep = frac < 0.82 ? 1 : Math.max(0.04, 1 - (frac - 0.82) / 0.12);
          if (Math.random() > keep) continue;
        }
        break;
      }
      const y = (Math.random() + Math.random() + Math.random() - 1.5) * (thickness / 3);
      pos[i * 3] = Math.cos(a) * rr;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * rr;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, innerRadius, outerRadius, thickness, gaps, cliff]);

  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y += delta * drift;
  });

  return (
    <group ref={ref}>
      <points geometry={geo} frustumCulled={false}>
        <pointsMaterial
          map={sprite}
          size={size}
          sizeAttenuation={false}
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
};

export default BeltDust;
