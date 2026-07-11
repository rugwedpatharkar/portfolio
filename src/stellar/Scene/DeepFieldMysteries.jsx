/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../config/destinations";
import { makeSoftDot } from "./shared/textures";

/*
 * Real unsolved space mysteries, as faint deep-field discoverables (scannable +
 * clickable for the story — registered in config/objects.js with the SAME
 * pre-remap positions used here, so marker ↔ object match):
 *   • Planet Nine — the hypothesised distant world that would explain the Kuiper
 *     Cliff (a dark, barely-lit super-Earth far past the belt).
 *   • Tabby's Star (KIC 8462852) — a star whose brightness drops irregularly by
 *     up to 22%; here it flickers + takes the occasional dramatic dip.
 *   • The Wow! Signal — the 1977 72-second narrowband burst toward Sagittarius
 *     that never repeated; a marker that pulses an expanding radio ring.
 *   • Fast Radio Burst — millisecond flashes of immense energy from random
 *     directions; an occasional bright flash from the deep field.
 * Positions are pre-remap (radius ~50 → deep field) carried out by remapPosition.
 */

export const MYSTERY_RAW = {
  planetnine: [42, -3, -26],
  tabby: [-40, 9, -34],
  wow: [33, 18, -38],
  frb: [-30, -16, 42],
};

const dot = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,255,255,0.5)"],
    [1, "rgba(255,255,255,0)"],
  ],
});

const DeepFieldMysteries = ({ animate = true }) => {
  const pos = useMemo(() => {
    const o = {};
    for (const k in MYSTERY_RAW) o[k] = new THREE.Vector3(...remapPosition(frontOfSun(MYSTERY_RAW[k])));
    return o;
  }, []);

  const p9 = useRef();
  const tabby = useRef();
  const wowRing = useRef();
  const frb = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!animate) return;
    t.current += Math.min(delta, 1 / 20);
    const T = t.current;
    if (p9.current) p9.current.rotation.y += delta * 0.05;
    // Tabby's Star: shimmer + an occasional deep (up to ~22%) dip
    if (tabby.current) {
      const shimmer = 0.85 + 0.1 * Math.sin(T * 2.3);
      const dip = (T % 9) < 1.1 ? 0.78 : 1; // periodic dramatic dimming
      tabby.current.material.opacity = shimmer * dip;
    }
    // Wow! signal: expanding radio ring that resets (~6 s)
    if (wowRing.current) {
      const ph = (T % 6) / 6;
      const s = 4 + ph * 60;
      wowRing.current.scale.set(s, s, s);
      wowRing.current.material.opacity = 0.5 * (1 - ph);
    }
    // FRB: brief bright flash every ~7 s
    if (frb.current) {
      const ph = T % 7;
      frb.current.material.opacity = ph < 0.18 ? 1 : ph < 0.45 ? 0.4 * (1 - (ph - 0.18) / 0.27) : 0;
    }
  });

  return (
    <>
      {/* Planet Nine — a dark, faint super-Earth far past the Kuiper belt */}
      <group ref={p9} position={pos.planetnine.toArray()}>
        <mesh>
          <sphereGeometry args={[13, 32, 32]} />
          <meshStandardMaterial color="#2b3340" roughness={1} metalness={0.1} emissive="#0a1018" emissiveIntensity={0.4} />
        </mesh>
        <mesh>
          <sphereGeometry args={[14.5, 24, 24]} />
          <meshBasicMaterial color="#3a5070" transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* Tabby's Star — a bright deep-field star that dims irregularly */}
      <sprite ref={tabby} position={pos.tabby.toArray()} scale={[78, 78, 78]}>
        <spriteMaterial map={dot} color="#fff2d8" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>

      {/* Wow! signal — marker + expanding radio-ring pulse toward Sagittarius */}
      <group position={pos.wow.toArray()}>
        <sprite scale={[32, 32, 32]}><spriteMaterial map={dot} color="#7fe0ff" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
        <mesh ref={wowRing} rotation={[Math.PI / 2.3, 0.4, 0]}>
          <ringGeometry args={[0.9, 1.0, 48]} />
          <meshBasicMaterial color="#7fe0ff" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>

      {/* Fast Radio Burst — a brief, intense flash from the deep field */}
      <sprite ref={frb} position={pos.frb.toArray()} scale={[120, 120, 120]}>
        <spriteMaterial map={dot} color="#d6c0ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </>
  );
};

export default DeepFieldMysteries;
