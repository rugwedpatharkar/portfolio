/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { placeInFrontOfSun } from "../config/destinations";
import { makeSoftDot } from "./shared/textures";

/*
 * PHASE 4 (Wave 1) — a KILONOVA: two neutron stars merging. In a few seconds it
 * forges the heavy elements the universe makes no other way — every gram of gold,
 * platinum and uranium you've touched was born in a blast like this (GW170817,
 * 2017: seen in gravitational waves AND light). Rendered as a periodic flare — a
 * blue-white core that erupts then decays to a gold r-process glow, with an
 * expanding shockwave ring. Registered in config/objects.js (scan) + explorer.js
 * (discoverable) at the SAME raw position. Frozen on reduced-motion.
 */

export const KILONOVA_RAW = [-45, -12, -20];

const burstTex = () =>
  makeSoftDot({
    size: 128,
    stops: [
      [0, "rgba(255,255,255,1)"],
      [0.25, "rgba(255,245,220,0.85)"],
      [0.6, "rgba(255,210,150,0.25)"],
      [1, "rgba(255,200,140,0)"],
    ],
  });

export default function Kilonova({ animate = true }) {
  const core = useRef();
  const ring = useRef();
  const clock = useSceneClock();
  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(KILONOVA_RAW)), []);
  const tex = useMemo(burstTex, []);

  useFrame((_, dt) => {
    if (!animate) return;
    const ph = (clock.t % 14) / 14; // ~14 s cycle
    const flare = ph < 0.04 ? ph / 0.04 : Math.max(0, 1 - (ph - 0.04) / 0.26); // fast rise, ~3.6 s decay
    if (core.current) {
      core.current.material.opacity = 0.15 + flare * 0.85;
      const s = 6 + flare * 16;
      core.current.scale.set(s, s, 1);
      // blue-white at peak → gold as it decays (r-process)
      core.current.material.color.setRGB(1, 0.78 + 0.22 * flare, 0.5 + 0.5 * flare);
    }
    if (ring.current) {
      const r = ph / 0.32;
      ring.current.visible = ph < 0.32;
      ring.current.scale.setScalar(1 + r * 55);
      ring.current.material.opacity = Math.max(0, 1 - r) * 0.55;
    }
  });

  return (
    <group position={pos}>
      <sprite ref={core} scale={[6, 6, 1]}>
        <spriteMaterial map={tex} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} toneMapped={false} />
      </sprite>
      <mesh ref={ring} rotation={[Math.PI / 2.3, 0.4, 0]} visible={false}>
        <torusGeometry args={[1, 0.05, 8, 72]} />
        <meshBasicMaterial color="#bfe0ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
