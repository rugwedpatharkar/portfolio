/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ktx2Url } from "./shared/textureUrl";
import { SKY_SCALE } from "../config/destinations";

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

const Skybox = ({ homepage = false }) => {
  const { gl } = useThree();
  /* §9.3 KTX2 flag — ktx2Url() returns FOURK unchanged unless ?ktx2=1 is on,
     in which case the extension gets swapped to .ktx2. Wiring KTX2Loader
     itself is the remaining follow-up (see scripts/convert-textures.mjs). */
  const tex = useLoader(THREE.TextureLoader, ktx2Url(FOURK));

  /* Configure synchronously during render so colorSpace is correct on the very
     first frame (no wrong-colorspace flash). */
  useMemo(() => configure(tex, gl), [tex, gl]);

  return (
    /* Rotation: on the tour the bulge swings away from inner-planet sightlines
       (they look back at the Sun on -X, so the panorama's bright bulge is
       tucked into +X where the camera never faces). On the Milky Way
       homepage, we WANT the bulge front-and-centre — rotation aligns the
       baked Sagittarius core with the milkyway destination's camera lookAt
       direction so the visitor's first frame is dominated by galactic core. */
    <mesh rotation={homepage ? [0.15, 3.6, 0] : [0.3, 2.4, 0]}>
      <sphereGeometry args={[7000 * SKY_SCALE, 64, 32]} />
      {/* Homepage = the galaxy is the subject, seen against a JWST-style deep
          field, so the Tycho panorama must recede to near-black (any brighter
          and its milky haze fights the galaxy). The tour keeps a slightly
          lifted dim so the star field reads as a backdrop. toneMapped={false}
          keeps the colour deterministic across GPUs. */}
      <meshBasicMaterial
        map={tex}
        side={THREE.BackSide}
        color={homepage ? "#0a0b12" : "#44474f"}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Skybox;
