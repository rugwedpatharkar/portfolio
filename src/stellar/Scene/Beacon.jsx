/* eslint-disable react/no-unknown-property, react/prop-types */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * The Edge Beacon — the Contact stop's body.
 *
 * Replaces the old dull-red rocky sphere (which read as a stray render) with
 * a deliberate signal beacon: an over-bright emissive core (so bloom lifts it
 * to a glowing point), a soft additive halo, and a slow expanding ping ring —
 * a thing that's clearly *transmitting*, fitting "reach out · signal back".
 * Pulse freezes under reduced-motion.
 */

const GLOW_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const Beacon = ({ position, radius = 0.4, color = "#ff6b6b", animate = true, onClick, onPointerOver, onPointerOut }) => {
  const coreRef = useRef();
  const glowRef = useRef();
  const pingRef = useRef();

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : 0;
    const pulse = 1 + Math.sin(t * 2.4) * 0.16;
    if (coreRef.current) coreRef.current.scale.setScalar(pulse);
    if (glowRef.current) glowRef.current.material.opacity = 0.4 + Math.sin(t * 2.4) * 0.16;
    if (pingRef.current) {
      /* Expanding ping every ~2.8s, fading as it grows. */
      const cyc = animate ? (t % 2.8) / 2.8 : 0.4;
      const s = 1 + cyc * 5;
      pingRef.current.scale.set(s, s, s);
      pingRef.current.material.opacity = (1 - cyc) * 0.45;
    }
  });

  return (
    <group position={position} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* White-hot emissive core → bloom turns it into a brilliant signal
          point (not a flat coloured ball). */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius * 0.24, 32, 32]} />
        <meshBasicMaterial color="#fff2ea" toneMapped={false} />
      </mesh>
      {/* Soft coloured halo — kept compact (the contact camera sits close). */}
      <sprite ref={glowRef} scale={[radius * 1.35, radius * 1.35, 1]}>
        <spriteMaterial map={GLOW_TEXTURE} color={color} transparent opacity={0.4} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {/* Expanding transmission ping */}
      <mesh ref={pingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.42, radius * 0.5, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export default Beacon;
