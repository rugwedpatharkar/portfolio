/* eslint-disable react/no-unknown-property */
/*
 * Zodiacal light — the faint diffuse warm glow along the ecliptic, caused
 * by sunlight scattered off interplanetary dust grains. In the real sky
 * it's the ghostly cone you can see rising from the horizon around sunrise
 * or sunset in dark locations.
 *
 * Rendered as a slim additive band running along the ecliptic plane (the
 * scene's XZ plane) with an intensity that fades away from the anti-solar
 * direction. Purely visual — cheap, one draw call, no per-frame cost.
 */
import { useMemo } from "react";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    /* uv.y = across the band (0 = one edge, 1 = other). uv.x = along the
       band. The band tapers on both edges (gaussian) and along its length
       (softer taper) so it reads as an atmospheric cone, not a slab. */
    float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
    across = smoothstep(0.0, 1.0, across);
    float along = 1.0 - abs(vUv.x - 0.5) * 1.4;
    along = smoothstep(0.0, 1.0, along);
    float a = across * along * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a * 1.6, a);
  }
`;

const ZodiacalLight = () => {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color("#fff2c8") }, // warm daylight-scattered dust
    uOpacity: { value: 0.11 },
  }), []);

  return (
    /* Long thin plane lying along the ecliptic (scene XZ). Rotated so it
       trails from +X toward -X (anti-solar side of the sky). */
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} frustumCulled={false}>
      <planeGeometry args={[7200, 620]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
};

export default ZodiacalLight;
