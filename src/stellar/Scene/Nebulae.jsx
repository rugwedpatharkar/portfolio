/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * Real Hubble nebulae as billboarded sprite planes.
 *
 * Each nebula is built from TWO co-planar, camera-facing layers for
 * volumetric depth:
 *
 *   - CORE layer  — the original luminance-thresholded sprite: only bright
 *     nebula material contributes, additive over the skybox.
 *   - HALO layer  — a larger, much softer, lower-opacity wash behind the core,
 *     pulled toward a per-nebula SECONDARY hue (uTint at depth=1). It catches
 *     the dimmer outer gas the core threshold clips, so the cloud reads as a
 *     layered volume with colour that shifts from rim to core rather than one
 *     flat tint.
 *
 * The shader mixes the sampled colour toward a per-layer tint by `uTintAmt`,
 * giving each nebula a richer two-tone palette (cool/warm depth) while staying
 * desaturated and soft so it never overpowers the planets or over-drives bloom.
 *
 * Image credits: ESA/Hubble + NASA, CC-BY-4.0
 */

const NEBULA_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPos;
}
`;

const NEBULA_FRAGMENT = `
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uOpacity;
uniform float uLumThresholdLow;
uniform float uLumThresholdHigh;
uniform float uEdgeInner;   // radius where the sprite starts fading out
uniform vec3  uTint;        // secondary hue to push this layer toward
uniform float uTintAmt;     // 0 = true colour, 1 = full tint
uniform float uSat;         // saturation retained after desaturation
void main() {
  vec4 c = texture2D(uMap, vUv);
  float lum = max(c.r, max(c.g, c.b));
  float a = smoothstep(uLumThresholdLow, uLumThresholdHigh, lum) * uOpacity;
  /* Radial edge fade — dissolve the sprite into space toward its rim so the
     square plane boundary (and any nebula material that runs to the image
     edge) never shows as a hard border. The halo uses a wider fade. */
  float r = length(vUv - 0.5);
  a *= smoothstep(0.5, uEdgeInner, r);
  if (a < 0.005) discard;
  /* DESATURATE toward luminance (the raw NASA JPEGs sit ~0.6 saturation —
     too punchy for a soft backdrop), THEN tint toward a per-layer secondary
     hue for chromatic depth. Core layers keep more true colour; the halo
     leans into its tint, so each cloud reads as a graded volume, not a flat
     wash. */
  vec3 col = c.rgb;
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(g), col, uSat);
  col = mix(col, g * uTint, uTintAmt);  // tint scaled by local brightness
  gl_FragColor = vec4(col, a);
}
`;

/* Opacity kept low across the board so the nebulae sit behind the action,
   not in front of it. Bloom amplifies the bright cores anyway, so we don't
   need raw opacity for impact. Each entry carries TWO tints — a cooler/warmer
   secondary hue for the soft halo and a truer near-tint for the bright core —
   so the cloud gains depth without becoming garish. */
const NEBULAE = [
  { url: "/textures/nebulae/eagle.jpg", position: [-38, 8, -28], scale: 30, opacity: 0.46, haloTint: [0.45, 0.62, 1.0], coreTint: [1.0, 0.86, 0.74] },
  { url: "/textures/nebulae/carina.jpg", position: [50, -6, 22], scale: 34, opacity: 0.4, haloTint: [1.0, 0.58, 0.72], coreTint: [1.0, 0.82, 0.6] },
  { url: "/textures/nebulae/crab.jpg", position: [22, 12, -36], scale: 22, opacity: 0.44, haloTint: [0.62, 0.78, 1.0], coreTint: [1.0, 0.74, 0.66] },
  { url: "/textures/nebulae/helix.jpg", position: [-60, -10, 30], scale: 24, opacity: 0.34, haloTint: [0.5, 0.92, 0.86], coreTint: [1.0, 0.9, 0.72] },
  { url: "/textures/nebulae/orion.jpg", position: [70, 14, -10], scale: 28, opacity: 0.36, haloTint: [0.7, 0.62, 1.0], coreTint: [1.0, 0.8, 0.7] },
];

const NebulaPlane = ({ url, position, scale, opacity, haloTint, coreTint }) => {
  const tex = useLoader(THREE.TextureLoader, url);
  const sceneClock = useSceneClock();
  const billboardRef = useRef();
  const haloMatRef = useRef();

  /* Core layer: the original sharp, true-ish look. */
  const coreUniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return {
      uMap: { value: tex },
      uOpacity: { value: opacity },
      uLumThresholdLow: { value: 0.11 },
      uLumThresholdHigh: { value: 0.46 },
      uEdgeInner: { value: 0.3 },
      uTint: { value: new THREE.Color(...coreTint) },
      uTintAmt: { value: 0.18 },
      uSat: { value: 0.62 },
    };
  }, [tex, opacity, coreTint]);

  /* Halo layer: dimmer outer gas, wider + softer, pushed toward the secondary
     hue. Lower threshold catches faint material the core clips; lower opacity
     and a wide edge fade keep it a gentle wash (bloom-safe). */
  const haloUniforms = useMemo(() => {
    return {
      uMap: { value: tex },
      uOpacity: { value: opacity * 0.55 },
      uLumThresholdLow: { value: 0.05 },
      uLumThresholdHigh: { value: 0.34 },
      uEdgeInner: { value: 0.16 },
      uTint: { value: new THREE.Color(...haloTint) },
      uTintAmt: { value: 0.6 },
      uSat: { value: 0.42 },
    };
  }, [tex, opacity, haloTint]);

  useFrame(({ camera }) => {
    /* Billboard the whole group so BOTH layers face the camera together. */
    if (billboardRef.current) billboardRef.current.lookAt(camera.position);
    /* Very gentle chromatic "breathing" of the halo tint — adds slow life to
       the colour depth. Driven by the shared virtual clock, so it FREEZES
       under reduced-motion (sceneClock.t stays 0) and respects time control. */
    if (haloMatRef.current) {
      const t = sceneClock ? sceneClock.t : 0;
      haloMatRef.current.uniforms.uTintAmt.value = 0.6 + 0.08 * Math.sin(t * 0.25 + position[0]);
    }
  });

  return (
    <group ref={billboardRef} position={position}>
      {/* HALO — slightly larger, drawn first (behind the core). */}
      <mesh scale={1.45} renderOrder={-1}>
        <planeGeometry args={[scale, scale]} />
        <shaderMaterial
          ref={haloMatRef}
          vertexShader={NEBULA_VERTEX}
          fragmentShader={NEBULA_FRAGMENT}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* CORE — original crisp layer on top. Shares the halo's billboard
          orientation via the parent group, so it tracks the camera too. */}
      <mesh>
        <planeGeometry args={[scale, scale]} />
        <shaderMaterial
          vertexShader={NEBULA_VERTEX}
          fragmentShader={NEBULA_FRAGMENT}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const Nebulae = () => (
  <>
    {NEBULAE.map((n) => (
      <NebulaPlane key={n.url} {...n} />
    ))}
  </>
);

export default Nebulae;
