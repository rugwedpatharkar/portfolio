/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { laneObjectPosition } from "../config/orbits";
import { itemsForSection } from "../data/sectionItems";
import LaneModel from "./LaneModel";

/*
 * Lane objects — the active section's résumé items rendered as a co-orbital convoy
 * of characterful craft on the planet's orbital lane (←→ travels between them).
 * Refs + useFrame only: each object tracks the planet's live orbit, banks gently
 * along the arc, and the active one pulses + glows amber (Phase 2A models).
 *
 * Phase 2C — the 3-beat arrival: on ←→ lock the reticle SNAPS in and a sonar PING
 * expands from the object (the in-world half of the scan; the dossier streams the
 * data, StellarApp fires the beep). Only the active section mounts (a handful).
 */

const _p = new THREE.Vector3();

export default function LaneObjects({ destination, itemIdx = 0 }) {
  const clock = useSceneClock();
  const refs = useRef([]);
  const reticleRef = useRef();
  const pingRef = useRef();
  const lockT = useRef(0);
  const prevItem = useRef(-1);
  const items = useMemo(() => (destination ? itemsForSection(destination.section) : []), [destination]);

  useFrame(() => {
    if (!destination) return;
    const t = clock.t;
    /* New lock → stamp the time so the reticle-snap + ping animate from now. */
    if (itemIdx !== prevItem.current) {
      prevItem.current = itemIdx;
      lockT.current = t;
    }
    for (let k = 0; k < items.length; k++) {
      const g = refs.current[k];
      if (!g) continue;
      laneObjectPosition(destination, k, t, _p);
      g.position.copy(_p);
      const active = k === itemIdx;
      g.scale.setScalar(active ? 1 + Math.sin(t * 3) * 0.08 : 0.68);
      g.rotation.y += active ? 0.012 : 0.004;
      /* Gentle bank along the orbital arc — leans the convoy into its travel. */
      g.rotation.z = Math.sin(t * 0.4 + k * 1.3) * 0.16;
    }
    /* Active-object lock animations (refs live on the active item only). The ←→
       warp-dolly takes ~0.7s, so the lock beats play on ARRIVAL, not at key-press. */
    const arr = t - lockT.current - 0.7;
    if (reticleRef.current) {
      // targeting reticle: wide while approaching, snaps tight as it arrives
      reticleRef.current.scale.setScalar(1 + Math.min(0.7, Math.max(0, -arr)) * 0.7);
    }
    if (pingRef.current) {
      const a = arr >= 0 && arr < 0.7 ? 1 - arr / 0.7 : 0; // sonar ping on arrival
      pingRef.current.scale.setScalar(0.32 + Math.max(0, arr) * 2.6); // expand outward
      pingRef.current.material.opacity = a * 0.85;
      pingRef.current.visible = a > 0.001;
    }
  });

  if (!destination || items.length === 0) return null;

  return (
    <group>
      {items.map((it, k) => {
        const active = k === itemIdx;
        return (
          <group key={it.id} ref={(el) => (refs.current[k] = el)}>
            {/* characterful per-kind model (Phase 2A) */}
            <LaneModel kind={it.kind} active={active} />
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial
                color={active ? "#ffb84d" : "#4da6ff"}
                transparent
                opacity={active ? 0.3 : 0.12}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            {active && (
              <>
                {/* reticle — snaps in on lock (Phase 2C) */}
                <mesh ref={reticleRef} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.34, 0.012, 8, 40]} />
                  <meshBasicMaterial color="#ffb84d" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                </mesh>
                {/* sonar ping — expands + fades from the object on lock (Phase 2C) */}
                <mesh ref={pingRef} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.34, 0.02, 8, 44]} />
                  <meshBasicMaterial color="#ffd9a0" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
