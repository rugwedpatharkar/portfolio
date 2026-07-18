/* eslint-disable react/no-unknown-property */
/*
 * The Local Bubble — a ~1,000 ly-diameter hot cavity in the interstellar
 * medium that the Sun (and the Local Interstellar Cloud we're plowing
 * through) currently sit inside. Carved out ~10-15 million years ago by a
 * chain of ~10 nearby supernovae (Sco-Cen OB association traces); interior
 * plasma is ~10⁶ K but so tenuous (<0.001 atoms/cm³, ~10³ less dense than
 * the surrounding ISM) that the Sun's heliosphere sails through it easily.
 *
 * Rendered as a very sparse spherical SHELL — the boundary between the
 * bubble interior and the denser ISM beyond. Blue-white to hint at hot
 * plasma. Radius ~8000 SKY_SCALE places it well outside the Local
 * Interstellar Cloud (at ~5700 SKY_SCALE) and the heliosphere (~2400),
 * so the layers read as nested: heliosphere → LIC → Local Bubble → ISM.
 * Additive, low-opacity, write-once; no per-frame work. Shown at the
 * outer stops + finale, alongside LocalInterstellarCloud.
 *
 * Sources: docs/research/08-exotic-astrophysics.md §3.5 (interstellar
 * medium); docs/research/00-MASTER.md §5.3 additions list.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { SKY_SCALE } from "../config/destinations";

const LocalBubble = ({ count = 900, radius = 8000, thickness = 1400 }) => {
  const geo = useMemo(() => {
    const R = radius * SKY_SCALE;
    const T = thickness * SKY_SCALE;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      /* Uniform point on a sphere (z = cosθ uniform), jittered radially for
         shell thickness. Same pattern as OortCloud. */
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const r = R + (Math.random() - 0.5) * T;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = Math.cos(t) * s * r;
      pos[i * 3 + 1] = u * r;
      pos[i * 3 + 2] = Math.sin(t) * s * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius, thickness]);

  const labelPos = useMemo(
    () => [0, radius * 0.42 * SKY_SCALE, radius * 0.9 * SKY_SCALE],
    [radius],
  );

  return (
    <group>
      <points geometry={geo} frustumCulled={false}>
        {/* Blue-white to hint at hot (10⁶ K) plasma. Very faint — a real
            observer would see NOTHING here; this is a scientific "you are
            in the bubble" marker, not a glowing cloud. */}
        <pointsMaterial
          size={45}
          sizeAttenuation
          color="#a6c0e4"
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <Html
        center
        position={labelPos}
        style={{
          pointerEvents: "none",
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "rgba(180, 200, 232, 0.55)",
          textTransform: "uppercase",
          textShadow: "0 0 8px rgba(0,0,0,0.85)",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        <div>Local Bubble</div>
        <div style={{ opacity: 0.55, fontSize: 8, marginTop: 2 }}>~1,000 ly cavity · carved by ~10 supernovae</div>
      </Html>
    </group>
  );
};

export default LocalBubble;
