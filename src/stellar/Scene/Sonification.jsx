import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../config/destinations";
import { useSceneClock } from "./SceneClock";
import { SoundManager } from "../sound/SoundManager";

/*
 * PHASE 3D — proximity sonification driver. Each frame (throttled) it measures how
 * close + which way the camera is to Gargantua (a low rumble that swells on
 * approach) and the pulsar (a rhythmic tone), and feeds those into
 * SoundManager.updateSonification — panned L/R by direction, louder as you near.
 *
 * Silent by default: SoundManager gates on the un-mute gesture (master gain 0 when
 * muted). Not mounted under reduced-motion. Throttled + no per-frame allocation.
 * (The NASA "sounds of space" ambient bed is deferred — it needs an audio asset.)
 */

const HOLE = remapPosition(frontOfSun([49, -6, -15])); // Gargantua, matches Scene mount
const PULSE = remapPosition(frontOfSun([-26, 16, -34])); // pulsar, matches Pulsar default
const HOLE_RANGE = 1400;
const PULSE_RANGE = 700;

export default function Sonification() {
  const clock = useSceneClock();
  const v = useMemo(() => ({ d: new THREE.Vector3(), r: new THREE.Vector3() }), []);
  const n = useRef(0);

  useFrame(({ camera }) => {
    n.current++;
    if (n.current % 4 !== 0) return; // ~15 Hz — plenty for proximity
    if (SoundManager.isMuted?.()) return; // silent until the user un-mutes
    v.r.setFromMatrixColumn(camera.matrixWorld, 0).normalize(); // camera right
    const sense = (pos, range) => {
      v.d.copy(pos).sub(camera.position);
      const dist = v.d.length();
      const prox = THREE.MathUtils.clamp(1 - dist / range, 0, 1);
      v.d.normalize();
      return { prox, pan: THREE.MathUtils.clamp(v.d.dot(v.r), -1, 1) };
    };
    const h = sense(HOLE, HOLE_RANGE);
    const p = sense(PULSE, PULSE_RANGE);
    const beat = Math.pow(Math.max(0, Math.sin(clock.t * 5)), 6); // sharp pulsar blips
    SoundManager.updateSonification({
      hole: h.prox * h.prox, // sharper falloff for the rumble
      holePan: h.pan,
      pulse: p.prox,
      pulsePan: p.pan,
      pulseBeat: beat,
    });
  });

  return null;
}
