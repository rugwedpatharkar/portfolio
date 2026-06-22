/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useViewport from "../useViewport";

/*
 * Real Milky Way skybox — NASA Tycho catalog all-sky panorama.
 *
 * 8K source (8192×4096, ~8 MB) on desktop; 4K on mobile.
 * Anisotropic filtering at max so stars stay sharp even at grazing
 * angles. We tone-map THIS texture so it integrates with ACES on
 * the renderer; raw sRGB upload would clip the bright Milky Way
 * band against bloom.
 */

const Skybox = () => {
  const { isMobile } = useViewport();
  const url = isMobile ? "/textures/space/milkyway.jpg" : "/textures/space/milkyway-8k.jpg";
  const tex = useLoader(THREE.TextureLoader, url);
  const { gl } = useThree();

  /* Apply quality settings once the texture lands */
  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
  }, [tex, gl]);

  /* Reuse the same Texture instance; useMemo gives a stable handle. */
  const map = useMemo(() => tex, [tex]);

  return (
    /* Rotated so the bright galactic-core bulge swings away from the
       inner-planet sightlines (which look back toward the sun on −x).
       The dense band now sits behind/below the tour route. */
    <mesh rotation={[0.3, 2.4, 0]}>
      {/* Tighter segment counts only for skybox — high-segment sphere
          eats memory without quality benefit on a constant-distance
          texture. */}
      <sphereGeometry args={[400, 64, 32]} />
      {/* Dimmed hard so the dense Tycho star field — especially the
          bright galactic-core bulge — recedes into a backdrop instead
          of fighting the planets for attention. */}
      <meshBasicMaterial
        map={map}
        side={THREE.BackSide}
        color="#474f6b"
        toneMapped
        depthWrite={false}
      />
    </mesh>
  );
};

export default Skybox;
