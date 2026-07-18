/* eslint-disable react/no-unknown-property */
/*
 * COSMIC MICROWAVE BACKGROUND GLOW — the relic radiation from the universe's
 * "last scattering surface" 380,000 years after the Big Bang, now cooled to
 * 2.725 K after 13.8 Gyr of cosmic expansion. In our visible-light rendering
 * this shows up as an extremely faint uniform warm-red glow filling the
 * entire sky beyond every star, nebula, and galaxy.
 *
 * Rendered as a very large (10,000 SKY_SCALE) inside-out sphere with a soft
 * warm-red material, additively blended at very low opacity so it lifts the
 * "black" of the sky by a hair — the honest visual representation that
 * "the sky is not empty even where nothing else is."
 *
 * Sources: docs/research/00-MASTER.md; Planck 2018 CMB temperature map;
 * COBE/WMAP historical observations.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { SKY_SCALE } from "../config/destinations";

const CMBGlow = () => {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: "#3a1a1a",
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-100} frustumCulled={false}>
      {/* Slightly inside the far-clip, so it sits behind every other layer. */}
      <sphereGeometry args={[10000 * SKY_SCALE, 24, 24]} />
    </mesh>
  );
};

export default CMBGlow;
