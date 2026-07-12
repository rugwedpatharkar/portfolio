/* eslint-disable react/no-unknown-property */
/*
 * Parallax deep-field dust — a screen of very slow-drifting foreground
 * motes that ride with the camera. Gives the whole hero framing a sense
 * of DEPTH: when the camera micro-drifts, the nearest dust motes shift
 * faster than the distant stars, so the sky reads as a real volumetric
 * space instead of a flat backdrop.
 *
 * Positioned relative to camera each frame (a thin shell in front of the
 * viewer). No absolute-position scatter — otherwise the motes would be
 * miles away from wherever the tour scrolls to, invisible from every stop.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

/* Kept SUBTLE — this is meant to be near-invisible ambient depth cue, not
   visible snowfall. Previous tuning at 240 motes × 1.4u size × 0.42 opacity
   read as blob-storm across the hero. New tuning: fewer particles, much
   smaller sprites, and low opacity so the effect only registers on close
   inspection as gentle motion between the viewer and the star backdrop. */
const COUNT = 60;
const SHELL_R = 90;      // scene units in front of the camera
const SHELL_JITTER = 40; // depth variation so parallax reads

const DOT = makeSoftDot({
  size: 32,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,255,255,0.4)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

const HeroDust = () => {
  const pointsRef = useRef();
  const materialRef = useRef();
  const geomRef = useRef();
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const seeds = useMemo(() => Array.from({ length: COUNT }, () => ({
    /* Random direction inside a forward cone (bias toward -Z / view direction),
       plus a per-mote parallax weight so nearer motes drift faster. */
    dir: new THREE.Vector3(
      (Math.random() - 0.5) * 1.7,
      (Math.random() - 0.5) * 1.7,
      -Math.random() * 1.6 - 0.2,
    ).normalize(),
    depth: SHELL_R + (Math.random() - 0.5) * SHELL_JITTER,
    phase: Math.random() * Math.PI * 2,
    wobble: 0.6 + Math.random() * 0.8,
  })), []);

  useEffect(() => {
    /* Cold-fill positions so the first frame isn't a bunch of motes at (0,0,0). */
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      positions[i * 3    ] = s.dir.x * s.depth;
      positions[i * 3 + 1] = s.dir.y * s.depth;
      positions[i * 3 + 2] = s.dir.z * s.depth;
    }
    if (geomRef.current) geomRef.current.attributes.position.needsUpdate = true;
  }, [seeds, positions]);

  useFrame(({ camera, clock }) => {
    /* Track motes to the camera in world space each frame + apply a slow
       per-mote drift so they gently swim. */
    const t = clock.getElapsedTime();
    const cam = camera.position;
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      const wob = Math.sin(t * 0.11 + s.phase) * 0.3 * s.wobble;
      positions[i * 3    ] = cam.x + s.dir.x * s.depth + wob * s.dir.y;
      positions[i * 3 + 1] = cam.y + s.dir.y * s.depth + wob * s.dir.z;
      positions[i * 3 + 2] = cam.z + s.dir.z * s.depth + wob * s.dir.x;
    }
    if (geomRef.current) geomRef.current.attributes.position.needsUpdate = true;
  });

  useEffect(() => () => {
    /* §9.6 disposal — the material + geometry are useMemo-allocated and
       this component mounts/unmounts with the tour, so release GPU memory
       on unmount. */
    if (geomRef.current) geomRef.current.dispose();
    if (materialRef.current) materialRef.current.dispose();
  }, []);

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        map={DOT}
        size={0.35}
        sizeAttenuation
        transparent
        opacity={0.12}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default HeroDust;
