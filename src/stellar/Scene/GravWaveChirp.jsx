/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { placeInFrontOfSun } from "../config/destinations";

/*
 * PHASE 4 (Wave 2) — a GRAVITATIONAL-WAVE CHIRP (LIGO O4, e.g. GW250114). Two
 * black holes spiral together and merge; the last orbits ring spacetime itself,
 * a wave LIGO hears as a rising "chirp". Rendered as two compact objects spiralling
 * inward faster and faster, then merging in a flash that launches expanding ripple
 * rings in the orbital plane — looped. Registered in config/objects.js (scan) +
 * explorer.js (discoverable). Frozen on reduced-motion (holds at the wide orbit).
 */

export const LIGO_RAW = [52, -28, 36];

export default function GravWaveChirp({ animate = true }) {
  const a = useRef();
  const b = useRef();
  const flash = useRef();
  const r1 = useRef();
  const r2 = useRef();
  const t = useRef(0);
  const spin = useRef(0);

  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(LIGO_RAW)), []);

  useFrame((_, dt) => {
    if (!animate) return;
    t.current += Math.min(dt, 1 / 20);
    const CY = 9; // seconds per inspiral-merge cycle
    const ph = (t.current % CY) / CY; // 0..1
    // separation shrinks (inspiral); angular speed rises as it tightens (accumulated)
    const sep = 4.2 * Math.pow(1 - ph, 0.6) + 0.25;
    spin.current += Math.min(dt, 1 / 20) * (1.0 + 3.6 / sep);
    const s = spin.current;
    if (a.current) a.current.position.set(Math.cos(s) * sep, 0, Math.sin(s) * sep);
    if (b.current) b.current.position.set(-Math.cos(s) * sep, 0, -Math.sin(s) * sep);
    // merge flash near the end of the cycle
    const mergeT = THREE.MathUtils.clamp((ph - 0.9) / 0.08, 0, 1);
    if (flash.current) {
      flash.current.material.opacity = mergeT * 0.9;
      const s = 0.6 + mergeT * 3.2;
      flash.current.scale.setScalar(s);
    }
    // two expanding ripple rings launched at merge, fading
    const ringPh = THREE.MathUtils.clamp((ph - 0.9) / 0.1, 0, 1);
    [r1, r2].forEach((rr, i) => {
      if (!rr.current) return;
      const rp = THREE.MathUtils.clamp(ringPh - i * 0.18, 0, 1);
      rr.current.visible = rp > 0 && rp < 1;
      rr.current.scale.setScalar(0.5 + rp * 9);
      rr.current.material.opacity = Math.max(0, 1 - rp) * 0.5;
    });
  });

  return (
    <group position={pos} rotation={[Math.PI / 2.6, 0, 0.3]}>
      <mesh ref={a}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#dCEBFF" toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#bcd4ff" toneMapped={false} />
      </mesh>
      <mesh ref={flash} scale={0.6}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {[r1, r2].map((rr, i) => (
        <mesh key={i} ref={rr} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[1, 0.04, 8, 80]} />
          <meshBasicMaterial color="#9fd0ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
