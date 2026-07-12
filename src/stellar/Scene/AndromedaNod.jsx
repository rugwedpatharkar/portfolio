/* eslint-disable react/no-unknown-property */
/*
 * A deliberate, prominent Andromeda (M31) sitting in a corner of the homepage
 * deep field — our nearest large galactic neighbour and the thing the Milky
 * Way will merge with in ~4.5 Gyr. A tilted elongated disc + a warm nucleus +
 * a faint dust smudge, drifting very slowly so the corner never reads frozen.
 * Sky-fixed layer (mounts OUTSIDE the HomepageGalaxy transform).
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

const DISC = makeSoftDot({
  size: 256,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.12, "rgba(255,244,214,0.8)"],
    [0.34, "rgba(226,214,240,0.36)"],
    [0.62, "rgba(158,168,214,0.1)"],
    [1, "rgba(100,120,180,0)"],
  ],
  mipmaps: true,
});
const NUCLEUS = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.2, "rgba(255,246,216,0.95)"],
    [0.5, "rgba(255,220,164,0.3)"],
    [1, "rgba(255,200,140,0)"],
  ],
  mipmaps: true,
});

const BASE = [-560, 470, -1500]; // upper-left of the deep field, well behind the hero text
const TILT = 2.35;               // disc long-axis angle (screen-space)

const AndromedaNod = ({ reducedMotion = false }) => {
  const ref = useRef();
  useFrame((state) => {
    if (reducedMotion || !ref.current) return;
    /* slow lateral drift — a few dozen units over minutes */
    const t = state.clock.elapsedTime;
    ref.current.position.x = BASE[0] + Math.sin(t * 0.02) * 34;
    ref.current.position.y = BASE[1] + Math.cos(t * 0.016) * 20;
  });
  return (
    <group ref={ref} position={BASE}>
      {/* elongated stellar disc */}
      <sprite scale={[430, 132, 1]} material-rotation={TILT}>
        <spriteMaterial map={DISC} color="#fff0d2" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {/* faint outer halo so the smear reads as a galaxy, not a streak */}
      <sprite scale={[560, 260, 1]} material-rotation={TILT}>
        <spriteMaterial map={DISC} color="#cfd8ff" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {/* hot central bulge */}
      <sprite scale={[70, 70, 1]}>
        <spriteMaterial map={NUCLEUS} color="#ffe6b8" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};

export default AndromedaNod;
