/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";

/*
 * The heliosphere / heliopause — the bubble the solar wind inflates against the
 * interstellar medium, the true outer boundary of the Sun's domain. Voyager 1
 * crossed it in 2012 (the Edge Beacon marks roughly that frontier here).
 *
 * Rendered as a vast, near-invisible FRESNEL shell: transparent looking through
 * it, with only the grazing rim faintly aglow, so it reads as a boundary you sit
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
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
    f = pow(f, 2.6);                 // only the grazing rim of the bubble glows
    float a = f * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const Heliosphere = ({ radius = 5400, color = "#5f7fc4", opacity = 0.85 }) => {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } }),
    [color, opacity],
  );
  return (
    <mesh frustumCulled={false}>
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

export default Heliosphere;
