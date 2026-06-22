/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Foreground sparkle stars — a thin layer of close-in pinpricks that
 * sit IN FRONT of the Milky Way skybox. The skybox is the actual deep
 * sky; this gives parallax depth (close stars vs distant stars).
 *
 * Count is reduced from 5000 → 1200 since the skybox carries the
 * heavy lifting now.
 */

const STAR_COUNT = 1200;
const SPREAD = 120;

/* Sharper sprite — tight bright core, fast falloff so each star reads
   as a crisp pinprick instead of a soft blob. Bloom in post-processing
   gives the glow; the sprite itself should be precise. */
const SPRITE_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.16, "rgba(255,255,255,0.92)");
  g.addColorStop(0.35, "rgba(255,255,255,0.32)");
  g.addColorStop(0.75, "rgba(255,255,255,0.04)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
})();

const Stars = () => {
  const groupRef = useRef();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < STAR_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = SPREAD * (0.7 + Math.random() * 0.3);
      tmp.setFromSphericalCoords(r, phi, theta);
      positions[i * 3 + 0] = tmp.x;
      positions[i * 3 + 1] = tmp.y;
      positions[i * 3 + 2] = tmp.z;

      const t = Math.random();
      const c =
        t < 0.06
          ? new THREE.Color("#ffe1a0")
          : t < 0.18
            ? new THREE.Color("#a0bcff")
            : new THREE.Color("#ffffff");
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.003;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={STAR_COUNT} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.42}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.92}
          depthWrite={false}
          map={SPRITE_TEXTURE}
          alphaTest={0.01}
          toneMapped={false}
        />
      </points>
    </group>
  );
};

export default Stars;
