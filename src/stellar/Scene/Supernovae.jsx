/* eslint-disable react/no-unknown-property */
/*
 * Supernova flashes — every few seconds a star dies somewhere in the arms:
 * a bright point flares hard, then fades while a faint shock-ring expands and
 * dissipates. A small pool of staggered events keeps the galaxy feeling ALIVE
 * without ever being busy.
 *
 * Mounts INSIDE the HomepageGalaxy transform (local galaxy coords). Frozen
 * under reduced motion (no useFrame progression → stays dark).
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { randomArmPoint } from "./SpiralGalaxy";

const POOL = 5;          // concurrent flash slots
const DURATION = 2.2;    // seconds per flash (flare + fade)
const GAP = 1.4;         // seconds between a slot's flashes

const FLASH_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(220,235,255,0.85)"],
    [0.5, "rgba(150,190,255,0.25)"],
    [1, "rgba(120,170,255,0)"],
  ],
  mipmaps: true,
});
const RING_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,0)"],
    [0.62, "rgba(200,220,255,0)"],
    [0.8, "rgba(210,230,255,0.5)"],
    [0.92, "rgba(190,215,255,0.15)"],
    [1, "rgba(190,215,255,0)"],
  ],
  mipmaps: true,
});

const Supernovae = ({ reducedMotion = false, fade, active = true }) => {
  const flashRefs = useRef([]);
  const ringRefs = useRef([]);
  /* Each slot seeded with a position + a staggered phase so they don't all
     pop together. `t0` is when this slot's current flash started. */
  const slots = useRef(
    Array.from({ length: POOL }, (_, i) => {
      const pos = new THREE.Vector3();
      randomArmPoint(pos, 0.3, 0.95); // writes into pos; returns t (unused here)
      return { pos, t0: -i * ((DURATION + GAP) / POOL) - Math.random() * 2 };
    }),
  );

  useFrame((state) => {
    if (reducedMotion || !active) return;
    const now = state.clock.elapsedTime;
    for (let i = 0; i < POOL; i++) {
      const s = slots.current[i];
      let e = now - s.t0;
      if (e > DURATION + GAP) {
        /* respawn at a new arm location */
        randomArmPoint(s.pos, 0.3, 0.95);
        s.t0 = now;
        e = 0;
        /* one audible swell per cycle (slot 0 only) so the audio bed breathes
           with the supernovae without a sound on every one of the 5 slots. */
        if (i === 0) window.dispatchEvent(new CustomEvent("stellar:sound:supernova"));
      }
      const flash = flashRefs.current[i];
      const ring = ringRefs.current[i];
      if (!flash || !ring) continue;
      if (e > DURATION) {
        flash.visible = false;
        ring.visible = false;
        continue;
      }
      const p = e / DURATION; // 0..1
      flash.visible = true;
      ring.visible = true;
      flash.position.set(s.pos.x, s.pos.y + 3, s.pos.z);
      ring.position.copy(flash.position);
      /* dim with the galaxy during the dive-out crossfade (1 = normal). */
      const dim = fade?.current ?? 1;
      /* flare: fast rise, slow decay */
      const rise = Math.min(1, p / 0.08);
      const decay = Math.pow(1 - p, 2.2);
      const fa = rise * decay;
      flash.material.opacity = fa * dim;
      const fs = 10 + rise * 26;
      flash.scale.setScalar(fs);
      /* ring expands + fades */
      ring.material.opacity = decay * 0.5 * dim;
      ring.scale.setScalar(14 + p * 90);
    }
  });

  const idx = useMemo(() => Array.from({ length: POOL }, (_, i) => i), []);
  return (
    <group>
      {idx.map((i) => (
        <group key={i}>
          <sprite ref={(el) => { flashRefs.current[i] = el; }} visible={false}>
            <spriteMaterial map={FLASH_SPRITE} color="#eaf2ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
          <sprite ref={(el) => { ringRefs.current[i] = el; }} visible={false}>
            <spriteMaterial map={RING_SPRITE} color="#cfe0ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        </group>
      ))}
    </group>
  );
};

export default Supernovae;
