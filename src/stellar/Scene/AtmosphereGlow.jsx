/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";

/*
 * Fresnel atmosphere glow.
 *
 * A slightly larger sphere rendered with BackSide so only the rim of
 * the original planet sphere shows through. The Fresnel falloff makes
 * the rim brightest where the surface normal is most perpendicular to
 * the view direction — the classic "blue limb" effect on Earth.
 *
 * Color defaults to atmospheric blue; pass a custom color for Venus
 * (yellow), Mars (faint pink), etc.
 */

const ATMOSPHERE_VERTEX = `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = -normalize(mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}
`;

const ATMOSPHERE_FRAGMENT = `
varying vec3 vNormal;
varying vec3 vViewDir;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPower;
void main() {
  float fres = pow(1.0 - dot(vViewDir, vNormal), uPower);
  gl_FragColor = vec4(uColor, fres * uIntensity);
}
`;

const AtmosphereGlow = ({ radius = 1, color = "#7aa8ff", intensity = 0.9, power = 2.6, scale = 1.06 }) => {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
      uPower: { value: power },
    }),
    [color, intensity, power]
  );

  return (
    <mesh>
      <sphereGeometry args={[radius * scale, 48, 32]} />
      <shaderMaterial
        attach="material"
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={ATMOSPHERE_FRAGMENT}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default AtmosphereGlow;
