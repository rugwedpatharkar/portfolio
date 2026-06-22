/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useState } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useViewport from "../useViewport";

/*
 * Real Milky Way skybox — NASA Tycho catalog all-sky panorama.
 *
 * Progressive load, done DECLARATIVELY: the 4K (~4 MB) loads first via
 * Suspense and is shown immediately. On desktop the 8K (~8 MB) then
 * streams in the background; once decoded it goes into React state and
 * the material's `map` switches to it on the next render.
 *
 * IMPORTANT: we do NOT imperatively mutate material.map or dispose the
 * 4K. An earlier version did both — but the JSX prop still bound the 4K,
 * so any re-render (resize / HMR) reset map back to the disposed 4K and
 * the whole sky rendered WHITE. Keeping it declarative (map = hiRes ||
 * tex4k, both kept alive) avoids that entirely.
 */

/* Leveled skybox: dimmed to a backdrop with a deep-NAVY floor baked in so
   the void reads as deep space, not dead pure-black ("background too dark"
   fix). Level baked into the image → meshBasicMaterial colour stays white,
   GPU-pipeline-independent. */
const FOURK = "/textures/space/milkyway-space.jpg";
const EIGHTK = "/textures/space/milkyway-8k-space.jpg";

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
  const { isMobile } = useViewport();
  const { gl, invalidate } = useThree();
  const tex4k = useLoader(THREE.TextureLoader, FOURK);
  const [hiRes, setHiRes] = useState(null);

  /* Configure the 4K synchronously during render so its colorSpace is
     correct on the very first frame (no wrong-colorspace flash). */
  useMemo(() => configure(tex4k, gl), [tex4k, gl]);

  /* Desktop: stream the 8K, then flip it in via state (declarative). */
  useEffect(() => {
    if (isMobile) return undefined;
    let cancelled = false;
    new THREE.TextureLoader().load(EIGHTK, (t) => {
      if (cancelled) {
        t.dispose();
        return;
      }
      configure(t, gl);
      setHiRes(t);
      invalidate();
    });
    return () => { cancelled = true; };
  }, [isMobile, gl, invalidate]);

  /* Both textures stay alive; React owns which one is bound. */
  const map = hiRes || tex4k;

  return (
    /* Rotated so the bright galactic-core bulge swings away from the
       inner-planet sightlines (which look back toward the sun on −x). */
    <mesh rotation={[0.3, 2.4, 0]}>
      <sphereGeometry args={[400, 64, 32]} />
      {/* Dimmed hard so the dense Tycho star field recedes into a
          backdrop instead of fighting the planets.

          toneMapped={false}: render the texture as-authored. With ACES
          tone-mapping ON, the result was GPU-dependent — on some drivers
          the sky washed out to near-WHITE. Disabling tone-mapping here +
          a directly-dimmed colour makes the backdrop deterministic
          everywhere. The color grade still applies as a post pass. */}
      <meshBasicMaterial
        map={map}
        side={THREE.BackSide}
        color="#ffffff"
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Skybox;
