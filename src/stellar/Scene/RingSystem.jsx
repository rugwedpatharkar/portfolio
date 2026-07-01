/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * Realistic Saturn ring system — not a flat decal.
 *
 * A radial shader builds the ring out of hundreds of fine concentric
 * ringlets (several octaves of banding + granular noise → reads as
 * countless orbiting particles), with the real structure: a faint inner
 * C-ring, the bright B-ring, the dark CASSINI DIVISION gap, the A-ring,
 * and the thin Encke gap near the outer edge. The supplied ring texture
 * tints it so the brand palette carries through.
 *
 * Particle granularity also drifts very slowly (uTime) so the ring isn't
 * a frozen pattern — it subtly shimmers like real ice debris catching the
 * sun. Cheap: one annulus, no extra geometry.
 */

const VERT = /* glsl */ `
  varying float vR;
  uniform float uInner;
  uniform float uOuter;
  void main() {
    float rad = length(position.xy); // RingGeometry lies in local XY plane
    vR = clamp((rad - uInner) / (uOuter - uInner), 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Depth-pass shader for the SHADOW the rings throw on the planet. A transparent
   ShaderMaterial with depthWrite:false writes nothing to the shadow map, so the
   rings would cast NO shadow — defeating the iconic Saturn ring-shadow band. We
   give the mesh a customDepthMaterial that alpha-tests the SAME radial density,
   so only the solid B/A-rings cast shadow and the Cassini Division shows as a
   bright stripe across the band. */
const DEPTH_FRAG = /* glsl */ `
  #include <packing>
  varying float vR;
  /* x*x, not pow(x,2.0): the base (r-gap)/width goes negative for inner radii,
     and pow(negative, …) is spec-undefined → NaN on Metal/ANGLE (which Bloom
     would smear full-frame). Squaring by multiply is always finite. */
  float sq(float x){ return x * x; }
  void main() {
    float r = vR;
    float dens = smoothstep(0.0, 0.10, r) * (1.0 - smoothstep(0.94, 1.0, r));
    dens *= 1.0 - 0.93 * exp(-sq((r - 0.63) / 0.014));  // Cassini Division
    dens *= 1.0 - 0.65 * exp(-sq((r - 0.89) / 0.006));  // Encke gap
    if (dens < 0.38) discard;
    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
  }
`;

const FRAG = /* glsl */ `
  varying float vR;
  uniform sampler2D uMap;
  uniform vec3 uTint;
  uniform float uTime;

  float sq(float x){ return x * x; } // see DEPTH_FRAG: avoids pow(negative, …) NaN
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float vnoise(float x) {
    float i = floor(x), f = fract(x);
    return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
  }

  void main() {
    float r = vR;

    /* Base colour: sample the ring texture radially. */
    vec3 base = texture2D(uMap, vec2(r, 0.5)).rgb * uTint;

    /* Fine ringlets — several frequencies so no single band dominates. */
    float bands =
        0.30 * sin(r * 230.0)
      + 0.18 * sin(r * 560.0 + 1.3)
      + 0.12 * sin(r * 1100.0 + 4.1);
    /* Granular ice-particle shimmer, very slowly drifting. */
    float grain = vnoise(r * 1400.0 + uTime * 0.05) * 0.22;
    float tex = clamp(0.5 + bands + grain, 0.0, 1.0);

    /* Radial density envelope (C → B → Cassini → A → Encke). */
    float dens = smoothstep(0.0, 0.10, r) * (1.0 - smoothstep(0.94, 1.0, r));
    dens *= 0.55 + 0.45 * smoothstep(0.10, 0.30, r);          // B-ring brighter
    dens *= 1.0 - 0.93 * exp(-sq((r - 0.63) / 0.014));  // Cassini Division
    dens *= 1.0 - 0.65 * exp(-sq((r - 0.89) / 0.006));  // Encke gap

    float alpha = dens * (0.40 + 0.60 * tex);
    if (alpha < 0.012) discard;

    vec3 col = base * (0.55 + 0.7 * tex);
    gl_FragColor = vec4(col, alpha);
  }
`;

const RingSystem = ({ radius, texture, tint = "#f5e2b8" }) => {
  const inner = radius * 1.28;
  const outer = radius * 2.3;
  const matRef = useRef();
  const sceneClock = useSceneClock();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uMap: { value: texture },
          uInner: { value: inner },
          uOuter: { value: outer },
          uTint: { value: new THREE.Color(tint) },
          uTime: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [texture, inner, outer, tint]
  );

  /* The shadow-caster material — same geometry + radial density, alpha-tested. */
  const depthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: DEPTH_FRAG,
        uniforms: { uInner: { value: inner }, uOuter: { value: outer } },
        side: THREE.DoubleSide,
      }),
    [inner, outer]
  );

  useFrame(() => {
    material.uniforms.uTime.value = sceneClock.t;
  });

  return (
    <mesh ref={matRef} castShadow receiveShadow>
      <ringGeometry args={[inner, outer, 196, 4]} />
      <primitive object={material} attach="material" />
      <primitive object={depthMaterial} attach="customDepthMaterial" />
    </mesh>
  );
};

export default RingSystem;
