/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { helixPosition, trailParams } from "../config/galaxy";

/*
 * One planet's helical trail. The path is fully ANALYTIC, so each frame we
 * refill a fixed-length buffer by sampling helixPosition(τ) for τ from
 * (t − spanT) up to t — no rolling history, deterministic at any time-scale,
 * and pause/scrub-safe. Reduced-motion builds the static helix once. The line
 * fades from a dim tail to a bright head and blends additively so the existing
 * Bloom haloes it (no postprocessing trail effect — that would break the
 * single-mainImage constraint).
 */

const HelixTrails = ({ dest, reducedMotion = false }) => {
  const clock = useSceneClock();
  const geomRef = useRef();
  const { spanT, samples } = useMemo(() => trailParams(dest), [dest]);
  const positions = useMemo(() => new Float32Array(samples * 3), [samples]);
  const colors = useMemo(() => {
    const c = new Float32Array(samples * 3);
    const base = new THREE.Color(dest.color || "#cfd6ff");
    for (let i = 0; i < samples; i++) {
      const a = i / (samples - 1); // 0 = oldest (tail), 1 = now (head)
      const f = 0.06 + 0.94 * a * a; // dim tail → bright head
      c[i * 3] = base.r * f;
      c[i * 3 + 1] = base.g * f;
      c[i * 3 + 2] = base.b * f;
    }
    return c;
  }, [dest.color, samples]);
  const _v = useMemo(() => new THREE.Vector3(), []);

  const fill = (tNow) => {
    for (let i = 0; i < samples; i++) {
      const a = i / (samples - 1);
      helixPosition(dest, tNow - (1 - a) * spanT, _v);
      positions[i * 3] = _v.x;
      positions[i * 3 + 1] = _v.y;
      positions[i * 3 + 2] = _v.z;
    }
    if (geomRef.current) geomRef.current.attributes.position.needsUpdate = true;
  };

  /* Static helix under reduced-motion (built once, never touched in useFrame). */
  useMemo(() => { if (reducedMotion) fill(0); /* eslint-disable-next-line */ }, [reducedMotion]);
  useFrame(() => { if (!reducedMotion) fill(clock.t); });

  return (
    <line frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </line>
  );
};

export default HelixTrails;
