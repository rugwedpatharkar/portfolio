/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";
import { SKY_SCALE } from "../config/destinations";

/*
 * The heliosphere — the bubble the solar wind inflates against the interstellar
 * medium, the true outer boundary of the Sun's domain. It is LAYERED, and we now
 * render both real boundaries as nested teardrop shells:
 *   - termination shock (~94 AU) — inner, where the supersonic solar wind slows
 *     abruptly; Voyager 1 crossed it in 2004, Voyager 2 in 2007. Warm-tinted.
 *   - heliopause (~120 AU) — outer, where the wind gives way to the interstellar
 *     medium; V1 crossed it in 2012, V2 in 2018. Cool-tinted.
 * The turbulent HELIOSHEATH is the gap between the two shells.
 *
 * Each is a vast, near-invisible FRESNEL shell: transparent looking through it,
 * with only the grazing rim faintly aglow, so it reads as a boundary you sit
 * inside of rather than a solid fog (a uniform additive sphere would wash the
 * whole frame). BackSide so we see it from within. No per-frame work.
 */
const VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    /* max(0.0, …) is load-bearing: dot() of two unit vectors is mathematically
       in [-1,1], but float rounding can return 1.0+epsilon, so 1.0 - abs(dot)
       goes slightly NEGATIVE. pow(negative, uPower) is NaN on Metal/ANGLE (other
       drivers clamp to 0). A single NaN texel here — additive + toneMapped:false
       — gets smeared across the WHOLE frame by Bloom's mipmapBlur downsample,
       turning the entire canvas black. Clamping the base keeps pow finite. */
    float f = pow(max(0.0, 1.0 - abs(dot(normalize(vN), normalize(vV)))), uPower); // only the grazing rim glows
    float a = f * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/* §9.4 blunt-teardrop shell — the real heliosphere is compressed on the nose
   (facing the incoming Local Interstellar Cloud wind from ~+Z, Scorpius/
   Ophiuchus direction) and drawn out into a long downstream heliotail behind.
   Non-uniform scale approximates the "comet-shape" Voyager + IBEX imaging
   support: ~0.7 nose radius, ~2.2 antisolar length. */
const Shell = ({ radius, color, opacity, power }) => {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uPower: { value: power } }),
    [color, opacity, power],
  );
  return (
    <mesh frustumCulled={false} scale={[0.72, 0.85, 2.2]}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
};

/* Two nested boundaries. The termination shock sits at ~94/120 = 0.78 of the
   heliopause radius — the shocked, slowed wind — and gets a warmer tint + a
   thinner rim (higher fresnel power) so it reads as an inner frontier, the
   turbulent heliosheath filling the gap out to the cool heliopause. */
const Heliosphere = ({ radius = 5400 * SKY_SCALE }) => (
  <>
    <Shell radius={radius * 0.78} color="#b39079" opacity={0.34} power={3.4} />
    <Shell radius={radius} color="#7d8aa8" opacity={0.5} power={2.6} />
  </>
);

export default Heliosphere;
