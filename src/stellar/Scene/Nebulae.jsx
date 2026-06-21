/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Faint nebulae as billboarded soft-glow particle clouds.
 *
 * The pointsMaterial gets a tiny radial-gradient sprite (built once via
 * canvas) so each point reads as a glowing blob, not a square. Additive
 * blending means colors stack toward the bright center of each cloud.
 *
 * The clouds drift slowly to keep the system feeling alive at idle.
 */

const SPRITE_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(0.75, "rgba(255,255,255,0.08)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
})();

const Nebula = ({ position, color, count = 250, spread = 8, opacity = 0.18, size = 4.2 }) => {
  const groupRef = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      a[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      a[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      a[i * 3 + 2] = r * Math.cos(phi) * 0.7;
    }
    return a;
  }, [count, spread]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.005;
  });

  return (
    <group ref={groupRef} position={position}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={size}
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={SPRITE_TEXTURE}
          alphaTest={0.001}
        />
      </points>
    </group>
  );
};

const Nebulae = () => (
  <>
    <Nebula position={[-32, 6, -22]} color="#915eff" count={320} spread={14} opacity={0.20} size={5.5} />
    <Nebula position={[55, -4, 18]} color="#00cea8" count={260} spread={12} opacity={0.16} size={4.8} />
    <Nebula position={[22, 9, -30]} color="#bf61ff" count={200} spread={9} opacity={0.14} size={4.0} />
  </>
);

export default Nebulae;
