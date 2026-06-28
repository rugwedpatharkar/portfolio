/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — the VOYAGER GOLDEN RECORD. The gold-anodised phonograph disc
 * bolted to both Voyagers, carrying greetings, music and the sounds of Earth into
 * interstellar space. Slowly turns and glints out past the planets; click it to
 * "play" — the spin quickens and a transmission prints to the console. Real object,
 * interactive. Stock materials only.
 */

export const GOLDEN_RAW = [40, 4, -20];
const SOUNDS = "Voyager Golden Record · greetings in 55 languages · whale song · Bach, Chuck Berry, raga · a human heartbeat";

export default function GoldenRecord() {
  const ref = useRef();
  const spin = useRef(0.5);
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(GOLDEN_RAW)), []);

  useFrame((state, dt) => {
    spin.current += (0.5 - spin.current) * 0.02; // ease back to idle after a click burst
    if (ref.current) {
      ref.current.rotation.z += dt * spin.current;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
    }
  });

  const play = (e) => {
    e.stopPropagation();
    spin.current = 6;
    window.dispatchEvent(new CustomEvent("stellar:goldenrecord"));
    console.log(`%c♪  ${SOUNDS}`, "color:#ffd56a;font-size:13px;font-family:monospace;");
  };

  return (
    <group
      position={pos}
      rotation={[Math.PI / 2.6, 0, 0]}
      scale={0.9}
      onClick={play}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <group ref={ref}>
        {/* the disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.03, 48]} />
          <meshStandardMaterial color="#e9b54a" metalness={1.0} roughness={0.22} emissive="#3a2a08" emissiveIntensity={0.3} toneMapped={false} />
        </mesh>
        {/* grooves */}
        {[0.45, 0.62, 0.78].map((r) => (
          <mesh key={r} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.006, 4, 64]} />
            <meshStandardMaterial color="#b8862e" metalness={1} roughness={0.35} toneMapped={false} />
          </mesh>
        ))}
        {/* centre hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 24]} />
          <meshStandardMaterial color="#8a6420" metalness={1} roughness={0.4} toneMapped={false} />
        </mesh>
        {/* rim glint (additive) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.04, 8, 48]} />
          <meshBasicMaterial color="#ffe9a8" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
