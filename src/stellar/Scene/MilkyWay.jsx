/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * The galactic band — a faint, grand sweep of stars + dust sitting far
 * behind everything (radius ~260, well beyond Stars at 150 and the
 * skybox sphere). A single THREE.Points field scattered along a thin
 * band on a huge sphere shell, tilted on a diagonal so it reads as the
 * Milky Way arching across the deep sky.
 *
 * Deliberately cheap and subtle: ~2600 additive points, low opacity, so
 * it reads as depth/grandeur without competing with the planets. Colour
 * runs cool blue-white at the dense core → faint purple/amber at the
 * sparse edges, the warm-dust-lane look of the real galactic plane.
 *
 * No post-processing (the scene allows exactly one effect). Motion is
 * an optional, almost-imperceptible drift; under reduced-motion it is
 * fully static.
 */

const POINT_COUNT = 2600;
const RADIUS = 6800; // behind the true-scale system + Stars, inside the skybox (7000)
const BAND_TILT = 0.62; // diagonal lean of the band, radians

/* Soft round sprite — broad, gentle falloff (unlike the crisp pinprick
   Stars sprite) so each dust mote blends into a hazy band rather than a
   field of distinct dots. */
const DUST_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
})();

const MilkyWay = ({ animate = true }) => {
  const groupRef = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);
    const sizes = new Float32Array(POINT_COUNT);
    const tmp = new THREE.Vector3();
    const core = new THREE.Color("#cfe0ff"); // cool blue-white centre
    const edgeCool = new THREE.Color("#7a6bd6"); // faint purple fringe
    const edgeWarm = new THREE.Color("#caa372"); // warm dust lane
    const tint = new THREE.Color();

    for (let i = 0; i < POINT_COUNT; i++) {
      const theta = Math.random() * 2 * Math.PI; // around the band
      /* Gaussian-ish offset off the band plane (sum of uniforms) so the
         band is dense at its spine and feathers out top/bottom. */
      const spread = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const phi = Math.PI / 2 + spread * 0.34; // band thickness

      const r = RADIUS * (0.97 + Math.random() * 0.06);
      tmp.setFromSphericalCoords(r, phi, theta);
      positions[i * 3 + 0] = tmp.x;
      positions[i * 3 + 1] = tmp.y;
      positions[i * 3 + 2] = tmp.z;

      /* Colour by distance from the band spine: bright cool core fading
         to a mix of purple + amber at the edges. */
      const edge = Math.min(1, Math.abs(spread));
      tint.copy(core).lerp(Math.random() < 0.5 ? edgeCool : edgeWarm, edge * 0.85);
      const dim = 1 - edge * 0.4;
      colors[i * 3 + 0] = tint.r * dim;
      colors[i * 3 + 1] = tint.g * dim;
      colors[i * 3 + 2] = tint.b * dim;

      sizes[i] = 1.6 + Math.random() * 3.4;
    }
    return { positions, colors, sizes };
  }, []);

  useFrame((_, delta) => {
    if (animate && groupRef.current) groupRef.current.rotation.y += delta * 0.0006;
  });

  return (
    <group ref={groupRef} rotation={[BAND_TILT, 0.4, 0.25]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={POINT_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={POINT_COUNT} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={POINT_COUNT} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={68}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.13}
          depthWrite={false}
          map={DUST_TEXTURE}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
};

export default MilkyWay;
