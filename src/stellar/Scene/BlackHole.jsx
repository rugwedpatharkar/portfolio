/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * A black hole — the deep-field anomaly.
 *
 * Gargantua-style: a pure-black event horizon, a tilted accretion disk of
 * superheated plasma swirling inward (turbulent FBM, white-hot inner →
 * red outer) with DOPPLER beaming (the side rotating toward you is much
 * brighter — relativistic boosting), a bright photon ring billboarded to
 * the camera (the lensed light circling the hole), and a soft gravity
 * glow. Slowly rotating. A "wait… what is THAT?" object that rewards
 * exploration to the edge of the system.
 */

const DISK_VERT = /* glsl */ `
  varying float vR;
  varying vec2 vLocal;
  uniform float uInner;
  uniform float uOuter;
  void main() {
    vLocal = position.xy;
    float rad = length(position.xy);
    vR = clamp((rad - uInner) / (uOuter - uInner), 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISK_FRAG = /* glsl */ `
  varying float vR;
  varying vec2 vLocal;
  uniform float uTime;

  vec3 hash3(vec3 p){ p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453); }
  float noise(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    float n=mix(mix(mix(dot(hash3(i+vec3(0,0,0))-0.5,f-vec3(0,0,0)),dot(hash3(i+vec3(1,0,0))-0.5,f-vec3(1,0,0)),f.x),
                   mix(dot(hash3(i+vec3(0,1,0))-0.5,f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0))-0.5,f-vec3(1,1,0)),f.x),f.y),
               mix(mix(dot(hash3(i+vec3(0,0,1))-0.5,f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1))-0.5,f-vec3(1,0,1)),f.x),
                   mix(dot(hash3(i+vec3(0,1,1))-0.5,f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1))-0.5,f-vec3(1,1,1)),f.x),f.y),f.z);
    return n; }
  float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v+0.5; }

  void main() {
    float r = vR;
    float ang = atan(vLocal.y, vLocal.x);

    /* Spiral turbulence dragged around the hole (faster on the inside). */
    float spin = uTime * (0.9 + 1.6 * (1.0 - r));
    vec3 sp = vec3(cos(ang + spin) * 2.2, sin(ang + spin) * 2.2, r * 5.0);
    float turb = fbm(sp + vec3(uTime * 0.2));

    /* Radial brightness: hot just outside the ISCO, fading outward. */
    float radial = smoothstep(0.0, 0.06, r) * (1.0 - smoothstep(0.55, 1.0, r));
    float bright = radial * (0.45 + 0.85 * turb);

    /* Doppler beaming — the approaching limb (cos(ang) > 0) is far brighter. */
    float doppler = 0.35 + 1.15 * pow(max(cos(ang), 0.0), 1.6);

    vec3 col = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.55, 0.18), smoothstep(0.0, 0.45, r));
    col = mix(col, vec3(0.75, 0.16, 0.05), smoothstep(0.45, 1.0, r));

    float a = clamp(bright * doppler, 0.0, 1.0);
    if (a < 0.01) discard;
    gl_FragColor = vec4(col * a * 1.8, a);
  }
`;

/* Lensed-light smear: faint tangential arcs of background starlight bent
   around the hole. Stylized gravitational lensing — an in-scene additive ring,
   no post-processing pass (protects the single-mainImage constraint). */
const LENS_FRAG = /* glsl */ `
  varying float vR;
  varying vec2 vLocal;
  uniform float uTime;
  void main() {
    float ang = atan(vLocal.y, vLocal.x);
    float s = pow(max(0.0, sin(ang * 8.0 + uTime * 0.18)), 8.0)
            + pow(max(0.0, sin(ang * 13.0 - uTime * 0.12 + 2.1)), 10.0) * 0.7
            + pow(max(0.0, sin(ang * 5.0 + 1.3)), 6.0) * 0.5;
    /* Brightest hugging the photon ring, fading outward. */
    float radial = (1.0 - smoothstep(0.0, 1.0, vR)) * smoothstep(0.0, 0.1, vR);
    float a = radial * s * 0.5;
    if (a < 0.01) discard;
    vec3 col = mix(vec3(0.86, 0.93, 1.0), vec3(0.55, 0.66, 1.0), vR);
    gl_FragColor = vec4(col * a, a);
  }
`;

const BlackHole = ({ position = [0, 0, 0], radius = 2.2, animate = true, onClick, onPointerOver, onPointerOut }) => {
  const diskMat = useRef();
  const haloMat = useRef();
  const lensMat = useRef();
  const diskGroup = useRef();
  const ringRef = useRef();
  const haloRef = useRef();
  const lensRef = useRef();
  const sceneClock = useSceneClock();

  const diskUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uInner: { value: radius * 1.25 }, uOuter: { value: radius * 4.2 } }),
    [radius]
  );
  /* Lensed-halo uniforms — the bright wrap that arcs over/under the horizon
     (the gravitationally lensed image of the far side of the disk). */
  const haloUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uInner: { value: radius * 1.14 }, uOuter: { value: radius * 2.7 } }),
    [radius]
  );
  const lensUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uInner: { value: radius * 1.12 }, uOuter: { value: radius * 3.4 } }),
    [radius]
  );

  useFrame(({ camera }) => {
    const t = animate ? sceneClock.t : 0;
    if (diskMat.current) diskMat.current.uniforms.uTime.value = t;
    if (haloMat.current) haloMat.current.uniforms.uTime.value = t * 0.6;
    if (lensMat.current) lensMat.current.uniforms.uTime.value = t;
    if (diskGroup.current && animate) diskGroup.current.rotation.z = t * 0.05;
    /* Photon ring + lensed halo + lens smear all billboard to the camera — the
       halo + smear are the Interstellar "wrap": background + disk light bent up
       and over the hole so the glow rings the black sphere from every angle. */
    if (ringRef.current) ringRef.current.lookAt(camera.position);
    if (haloRef.current) haloRef.current.lookAt(camera.position);
    if (lensRef.current) lensRef.current.lookAt(camera.position);
  });

  return (
    <group position={position} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Event horizon — pure black, swallows everything behind it. */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>

      {/* Lensed halo — the gravitational "wrap": the far side of the disk
          bent up and over the horizon so the glow rings the black sphere
          from any angle. Camera-facing, runs the disk shader. */}
      <mesh ref={haloRef}>
        <ringGeometry args={[radius * 1.14, radius * 2.7, 128, 4]} />
        <shaderMaterial
          ref={haloMat}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Lensed background-light smear — faint tangential arcs of starlight
          bent around the rim (stylized gravitational lensing). */}
      <mesh ref={lensRef}>
        <ringGeometry args={[radius * 1.12, radius * 3.4, 160, 4]} />
        <shaderMaterial
          ref={lensMat}
          vertexShader={DISK_VERT}
          fragmentShader={LENS_FRAG}
          uniforms={lensUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Photon ring — the bright thin Einstein ring hugging the horizon. */}
      <mesh ref={ringRef}>
        <ringGeometry args={[radius * 1.02, radius * 1.15, 160]} />
        <meshBasicMaterial color="#fff0d4" transparent opacity={1} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Accretion disk — tilted, swirling, Doppler-beamed. */}
      <group ref={diskGroup} rotation={[Math.PI * 0.42, 0, 0]}>
        <mesh>
          <ringGeometry args={[radius * 1.25, radius * 4.2, 128, 6]} />
          <shaderMaterial
            ref={diskMat}
            vertexShader={DISK_VERT}
            fragmentShader={DISK_FRAG}
            uniforms={diskUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Soft gravity glow halo. */}
      <mesh>
        <sphereGeometry args={[radius * 1.5, 24, 24]} />
        <meshBasicMaterial color="#3a1a44" transparent opacity={0.25} side={THREE.BackSide} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export default BlackHole;
