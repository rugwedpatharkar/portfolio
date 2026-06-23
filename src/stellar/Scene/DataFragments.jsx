/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Data fragments — flyable résumé collectibles that give free-flight a point.
 *
 * ~9 small glowing crystalline shards scattered off the planet line, within a
 * pilot's reach. Fly the camera through one (pilot mode only) and it pops/fades
 * out, dispatching a "stellar:fragment" event the app surfaces as a nugget toast.
 *
 *   window.dispatchEvent(new CustomEvent("stellar:fragment",
 *     { detail: { id: <number>, text: <string> } }))
 *
 * Constraints honoured:
 *   - IN-SCENE meshes only (icosahedron core + additive sprite halo). NEVER a
 *     post-processing pass — a 2nd post effect whites out the frame.
 *   - No per-frame allocation: one scratch Vector3, pool built once in useMemo.
 *   - No Date.now()/Math.random() — positions + nuggets are static constants.
 *   - reducedMotion: pass animate={false} → fully static (no bob/spin), but the
 *     shards stay visible so the pilot can still see + collect targets.
 *   - active (pilot mode) gates collection only; shards render faintly always so
 *     they read as targets to chase before you enter the cockpit.
 */

/* Soft radial glow for the additive halo — same canvas-gradient idiom as the
   beacons/probes. Built once at module load (no per-frame / per-instance cost). */
const GLOW_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/* Static layout: radius 6–30 from origin, varied y, deliberately off the +x
   planet line so they sit in open space the pilot has to detour for. Each shard
   carries a hardcoded résumé nugget surfaced on collection. */
const FRAGMENTS = [
  { id: 0, position: [7.5, 2.4, -5.5], color: "#7fd4ff", text: "Shipped 31 microservices on FastAPI + gRPC" },
  { id: 1, position: [-9, -3.2, 6], color: "#9b8cff", text: "Multi-agent systems with LangGraph" },
  { id: 2, position: [12, 4.5, 8.5], color: "#6affc4", text: "Hybrid RAG over 4 LLM providers" },
  { id: 3, position: [-14, 1.6, -10], color: "#ffd36a", text: "MCP tool orchestration" },
  { id: 4, position: [16.5, -5, -13], color: "#7fd4ff", text: "GKE at production scale" },
  { id: 5, position: [-18, 6, 11], color: "#ff8cc4", text: "One router, four models" },
  { id: 6, position: [22, 3, 14], color: "#6affc4", text: "Backend platforms that scale" },
  { id: 7, position: [-24, -4.5, -16], color: "#9b8cff", text: "Agentic AI, end to end" },
  { id: 8, position: [28, 7.5, -9], color: "#ffd36a", text: "Late nights, clean abstractions" },
];

const CORE_RADIUS = 0.12;
const COLLECT_DIST = 0.9;
const COLLECT_DIST_SQ = COLLECT_DIST * COLLECT_DIST;

const DataFragments = ({ active = false, animate = true }) => {
  const { camera } = useThree();
  /* Per-fragment group refs so we can bob/spin + hide individually. */
  const groupRefs = useRef([]);
  /* Session-scoped collected set — survives prop flips, resets on reload. */
  const collected = useRef(new Set());
  /* One scratch vector reused every frame (no per-frame allocation). */
  const camPos = useRef(new THREE.Vector3());

  /* Build the visual pool once. Phase offsets per shard keep the bob/spin from
     marching in lockstep — derived from the static index, not randomness. */
  const pool = useMemo(
    () =>
      FRAGMENTS.map((f, i) => ({
        ...f,
        phase: i * 1.7,
        spin: 0.5 + (i % 3) * 0.15,
      })),
    []
  );

  useFrame((state, dt) => {
    const step = Math.min(dt, 1 / 20);
    const t = state.clock.elapsedTime;

    if (animate) {
      for (let i = 0; i < pool.length; i++) {
        const g = groupRefs.current[i];
        if (!g || !g.visible) continue;
        const p = pool[i];
        g.position.y = pool[i].position[1] + Math.sin(t * 0.8 + p.phase) * 0.18;
        g.rotation.y += step * p.spin;
        g.rotation.x += step * p.spin * 0.4;
      }
    }

    /* Collection only happens in pilot mode. */
    if (!active) return;
    camera.getWorldPosition(camPos.current);
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (collected.current.has(p.id)) continue;
      const g = groupRefs.current[i];
      if (!g) continue;
      const dx = camPos.current.x - p.position[0];
      const dy = camPos.current.y - g.position.y;
      const dz = camPos.current.z - p.position[2];
      if (dx * dx + dy * dy + dz * dz < COLLECT_DIST_SQ) {
        collected.current.add(p.id);
        g.visible = false;
        window.dispatchEvent(
          new CustomEvent("stellar:fragment", { detail: { id: p.id, text: p.text } })
        );
      }
    }
  });

  return (
    <group>
      {pool.map((f, i) => (
        <group
          key={f.id}
          ref={(el) => (groupRefs.current[i] = el)}
          position={f.position}
          visible={!collected.current.has(f.id)}
        >
          {/* Crystalline shard — emissive so bloom lifts it to a glint. Faint
              by default (active=false), brighter once you're piloting. */}
          <mesh>
            <icosahedronGeometry args={[CORE_RADIUS, 0]} />
            <meshStandardMaterial
              color={f.color}
              emissive={f.color}
              emissiveIntensity={active ? 2.2 : 1.1}
              metalness={0.3}
              roughness={0.25}
              flatShading
            />
          </mesh>
          {/* Soft additive halo so the shard reads as a beacon to chase. */}
          <sprite scale={[CORE_RADIUS * 5, CORE_RADIUS * 5, 1]}>
            <spriteMaterial
              map={GLOW_TEXTURE}
              color={f.color}
              transparent
              opacity={active ? 0.55 : 0.3}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}
    </group>
  );
};

export default DataFragments;
