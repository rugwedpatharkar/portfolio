/* eslint-disable react/no-unknown-property */
/*
 * IO PLASMA TORUS — the neon-purple donut of ionized sulfur (S+, S²+, O+, O²+)
 * that Io's volcanoes spew into Jupiter's magnetosphere. Discovered by
 * Voyager 1 (1979), imaged in emission (S+, [S II] 673 nm; O+ ultraviolet) by
 * HST and by Cassini's ion spectrometer. Sits centred on Io's orbit at
 * ~5.9 R_J (~421,700 km) — a real ring of colour around Jupiter.
 *
 * Rendered as a thin flat torus ring aligned with Jupiter's rotational
 * equator (inherits axialTilt from the parent). Additive glow so it sits
 * naturally on top of Jupiter's atmosphere without occluding it.
 *
 * Sources: docs/research/00-MASTER.md §2.2; Krupp et al. 2004 for the
 * discovery + imaging history.
 */
import { useMemo } from "react";
import * as THREE from "three";

const IoPlasmaTorus = ({ jupiterRadius }) => {
  /* Io orbits Jupiter at ~5.9 R_J. In tour units Jupiter has radius=2.0
     (destinations.js), so torus at ~11.8 units around it. The torus is
     THIN in cross-section but broad in azimuth. */
  const inner = jupiterRadius * 5.4;
  const outer = jupiterRadius * 6.4;

  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: "#a8a0ff",
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
    [],
  );

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mat}>
        <ringGeometry args={[inner, outer, 96]} />
      </mesh>
      {/* Warmer inner edge — hotter plasma toward the flux surface. */}
      <mesh>
        <ringGeometry args={[inner * 1.02, inner * 1.14, 96]} />
        <meshBasicMaterial color="#ff9adc" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default IoPlasmaTorus;
