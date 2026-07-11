/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ktx2Url } from "./shared/textureUrl";

/*
 * Real Milky Way skybox — NASA Tycho catalog all-sky panorama (4K, ~2 MB),
 * loaded via Suspense and shown immediately. Dimmed to a deep-space backdrop
 * (deep-navy floor baked into the image; the material colour dims it further).
 *
 * The 8K tier was dropped: at this dimness (~0.27) it read visually identical
 * to the 4K but cost a 5.2 MB download + decode hitch + ~134 MB of GPU memory.
 */
const FOURK = "/textures/space/milkyway-space.webp";

const configure = (tex, gl) => {
  if (!tex) return tex;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
};

const Skybox = () => {
  const { gl } = useThree();
  /* §9.3 KTX2 flag — ktx2Url() returns FOURK unchanged unless ?ktx2=1 is on,
     in which case the extension gets swapped to .ktx2. Wiring KTX2Loader
     itself is the remaining follow-up (see scripts/convert-textures.mjs). */
  const tex = useLoader(THREE.TextureLoader, ktx2Url(FOURK));

  /* Configure synchronously during render so colorSpace is correct on the very
     first frame (no wrong-colorspace flash). */
  useMemo(() => configure(tex, gl), [tex, gl]);

  return (
    /* Rotated so the bright galactic-core bulge swings away from the
       inner-planet sightlines (which look back toward the sun on −x). */
    <mesh rotation={[0.3, 2.4, 0]}>
      <sphereGeometry args={[7000, 64, 32]} />
      {/* Dimmed hard so the dense Tycho star field recedes into a backdrop.
          toneMapped={false} + a directly-dimmed colour makes the backdrop
          deterministic across GPUs (ACES tone-mapping washed it near-white on
          some drivers); the colour grade still applies as a post pass. */}
      <meshBasicMaterial
        map={tex}
        side={THREE.BackSide}
        color="#44474f"
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Skybox;
