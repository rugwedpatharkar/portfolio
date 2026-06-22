/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useViewport from "../useViewport";

/*
 * Real Milky Way skybox — NASA Tycho catalog all-sky panorama.
 *
 * Progressive load: the 4K (~4 MB) loads first and is shown immediately
 * via Suspense. On desktop the 8K (~8 MB) then streams in the background
 * and swaps onto the material when ready — so first paint never waits on
 * the full 8 MB download.
 *
 * Anisotropic filtering at max keeps stars sharp at grazing angles. The
 * texture is tone-mapped so it integrates with the renderer's ACES curve.
 */

const FOURK = "/textures/space/milkyway.jpg";
const EIGHTK = "/textures/space/milkyway-8k.jpg";

const applyQuality = (tex, gl) => {
  if (!tex) return;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 16;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
};

const Skybox = () => {
  const { isMobile } = useViewport();
  const { gl, invalidate } = useThree();
  const matRef = useRef();

  /* Always load the 4K first — this is what Suspense waits on. */
  const tex4k = useLoader(THREE.TextureLoader, FOURK);

  useEffect(() => {
    applyQuality(tex4k, gl);
  }, [tex4k, gl]);

  /* Desktop only: stream the 8K in the background and hot-swap it onto
     the live material when it finishes decoding. */
  useEffect(() => {
    if (isMobile) return;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(EIGHTK, (tex8k) => {
      if (cancelled) {
        tex8k.dispose();
        return;
      }
      applyQuality(tex8k, gl);
      if (matRef.current) {
        const old = matRef.current.map;
        matRef.current.map = tex8k;
        matRef.current.needsUpdate = true;
        /* Free the 4K now that the 8K is live */
        if (old && old !== tex8k) old.dispose();
        invalidate();
      }
    });
    return () => { cancelled = true; };
  }, [isMobile, gl, invalidate]);

  const map = useMemo(() => tex4k, [tex4k]);

  return (
    /* Rotated so the bright galactic-core bulge swings away from the
       inner-planet sightlines (which look back toward the sun on −x). */
    <mesh rotation={[0.3, 2.4, 0]}>
      <sphereGeometry args={[400, 64, 32]} />
      {/* Dimmed hard so the dense Tycho star field recedes into a
          backdrop instead of fighting the planets. */}
      <meshBasicMaterial
        ref={matRef}
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
