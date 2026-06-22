/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Real Milky Way skybox.
 *
 * A giant inverted sphere wraps the scene with an equirectangular
 * Milky-Way panorama (Tycho catalog, ESO licensed). Camera sits inside
 * looking out at the back side of the sphere — Three.js needs
 * `side: THREE.BackSide`.
 *
 * Radius is chosen to sit outside every destination's camera-far plane
 * but inside the renderer's far-clip (600). Texture is gently dimmed
 * via material color so planets pop against it.
 */

const Skybox = () => {
  const tex = useLoader(THREE.TextureLoader, "/textures/space/milkyway.jpg");
  const map = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }, [tex]);

  return (
    <mesh>
      <sphereGeometry args={[400, 96, 64]} />
      <meshBasicMaterial
        map={map}
        side={THREE.BackSide}
        color="#ffffff"
        toneMapped
        depthWrite={false}
      />
    </mesh>
  );
};

export default Skybox;
