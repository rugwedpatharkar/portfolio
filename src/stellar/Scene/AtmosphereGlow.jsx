/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";

/*
 * Sun-directional atmospheric scattering rim.
 *
 * A slightly larger BackSide shell so only the limb of the planet shows
 * through. Unlike a plain Fresnel glow (which lights the rim equally all
 * the way around — the giveaway of a fake atmosphere), this modulates the
 * rim by the SUN/key direction:
 *   - brightest on the sun-facing limb,
 *   - fading to nothing on the night limb,
 *   - and, with `terminator` on (Earth), shifting from blue on the lit
 *     limb to a warm orange band right at the day/night terminator —
 *     the Rayleigh→Mie look of the real blue marble.
 *
 * uSunDir is the global key-light world direction so the glow agrees with
 * how the planet surface itself is lit.
 */

const VERTEX = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  uniform vec3 uColor;
  uniform vec3 uTermColor;
  uniform vec3 uSunDir;
  uniform float uIntensity;
  uniform float uPower;
  uniform float uTerminator;
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    float fres = pow(1.0 - abs(dot(V, vWorldNormal)), uPower);

    /* Day factor along the sun direction. */
    float lit = dot(normalize(vWorldNormal), normalize(uSunDir));
    float day = smoothstep(-0.30, 0.30, lit);

    /* Colour: blue on the lit limb, warm at the terminator (Earth only). */
    float term = uTerminator * (1.0 - smoothstep(0.0, 0.55, lit)) * smoothstep(-0.35, 0.05, lit);
    vec3 col = mix(uColor, uTermColor, term);

    float alpha = fres * uIntensity * (0.10 + 0.95 * day);
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/* Global key-light world direction (matches the <directionalLight> key in
   Scene/index.jsx at [55,28,42]) so atmospheres are lit consistently. */
export const SUN_DIR = new THREE.Vector3(55, 28, 42).normalize();

const AtmosphereGlow = ({
  radius = 1,
  color = "#7aa8ff",
  intensity = 0.9,
  power = 2.6,
  scale = 1.06,
  terminator = 0,
  termColor = "#ff7a3c",
}) => {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uTermColor: { value: new THREE.Color(termColor) },
      uSunDir: { value: SUN_DIR },
      uIntensity: { value: intensity },
      uPower: { value: power },
      uTerminator: { value: terminator },
    }),
    [color, termColor, intensity, power, terminator]
  );

  return (
    <mesh>
      <sphereGeometry args={[radius * scale, 48, 32]} />
      <shaderMaterial
        attach="material"
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
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
