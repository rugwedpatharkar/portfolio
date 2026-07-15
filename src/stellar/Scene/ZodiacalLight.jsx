/* eslint-disable react/no-unknown-property */
/*
 * Zodiacal light — the faint diffuse warm glow along the ecliptic, caused
 * by sunlight scattered off interplanetary dust grains. In the real sky
 * it's the ghostly cone you can see rising from the horizon around sunrise
 * or sunset in dark locations.
 *
 * Rendered as a slim additive band running along the ecliptic plane (the
 * scene's XZ plane) with an intensity that fades away from the anti-solar
 * direction, PLUS the gegenschein — the faint round counterglow directly
 * OPPOSITE the Sun, where dust backscatters sunlight straight back at you.
 * The band is static; the gegenschein billboards along the live anti-solar
 * ray (one cheap vector op per frame) so it always sits opposite the Sun.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

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

const GEGEN_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,244,208,0.6)"],
    [0.5, "rgba(255,240,200,0.16)"],
    [1, "rgba(255,235,190,0)"],
  ],
  mipmaps: true,
});

const ZodiacalLight = () => {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color("#fff2c8") }, // warm daylight-scattered dust
    uOpacity: { value: 0.11 },
  }), []);
  const gegenRef = useRef();

  /* Gegenschein — the anti-solar counterglow. The Sun is at the origin, so the
     anti-solar direction from the camera is the ray from the Sun THROUGH the
     camera, continued outward; project it onto the ecliptic (y≈0) and park the
     soft disc out there. Backscatter concentrates the zodiacal glow into a faint
     round patch exactly 180° from the Sun. */
  useFrame((state) => {
    const g = gegenRef.current;
    if (!g) return;
    const c = state.camera.position;
    const d = Math.hypot(c.x, c.z) || 1;
    g.position.set((c.x / d) * 2600, 0.5, (c.z / d) * 2600);
  });

  return (
    <group>
      {/* Long thin plane lying along the ecliptic (scene XZ). Rotated so it
          trails from +X toward -X (anti-solar side of the sky). */}
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
      <sprite ref={gegenRef} scale={[900, 560, 1]}>
        <spriteMaterial map={GEGEN_SPRITE} color="#fff2c8" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};

export default ZodiacalLight;
