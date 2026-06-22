/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Real Hubble nebulae as billboarded sprite planes.
 *
 * Each nebula is a sprite that always faces the camera. To handle the
 * black background that ships with NASA's JPEGs, we use a custom shader
 * that thresholds the texture luminance so only bright nebula material
 * contributes — additive-blended over the skybox.
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
void main() {
  vec4 c = texture2D(uMap, vUv);
  float lum = max(c.r, max(c.g, c.b));
  float a = smoothstep(uLumThresholdLow, uLumThresholdHigh, lum) * uOpacity;
  if (a < 0.005) discard;
  /* Mild contrast lift so colors don't wash out under additive blend */
  vec3 col = c.rgb;
  col = pow(col, vec3(0.85));
  gl_FragColor = vec4(col, a);
}
`;

/* Opacity dropped across the board so the nebulae sit behind action,
   not in front of it. Bloom amplifies the bright cores anyway, so we
   don't need raw opacity for impact. */
const NEBULAE = [
  { url: "/textures/nebulae/eagle.jpg", position: [-38, 8, -28], scale: 30, opacity: 0.72 },
  { url: "/textures/nebulae/carina.jpg", position: [50, -6, 22], scale: 34, opacity: 0.62 },
  { url: "/textures/nebulae/crab.jpg", position: [22, 12, -36], scale: 22, opacity: 0.68 },
  { url: "/textures/nebulae/helix.jpg", position: [-60, -10, 30], scale: 24, opacity: 0.52 },
  { url: "/textures/nebulae/orion.jpg", position: [70, 14, -10], scale: 28, opacity: 0.55 },
];

const NebulaPlane = ({ url, position, scale, opacity }) => {
  const tex = useLoader(THREE.TextureLoader, url);
  const meshRef = useRef();

  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return {
      uMap: { value: tex },
      uOpacity: { value: opacity },
      uLumThresholdLow: { value: 0.08 },
      uLumThresholdHigh: { value: 0.42 },
    };
  }, [tex, opacity]);

  useFrame(({ camera }) => {
    if (meshRef.current) meshRef.current.lookAt(camera.position);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[scale, scale]} />
      <shaderMaterial
        vertexShader={NEBULA_VERTEX}
        fragmentShader={NEBULA_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
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
