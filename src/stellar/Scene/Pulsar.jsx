/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { remapPosition, frontOfSun } from "../config/destinations";

/*
 * A pulsar — a rapidly spinning neutron star in the deep field. A tiny,
 * intensely bright core plus two opposite relativistic beams (additive
 * cones) that sweep like a lighthouse: the beam axis is tilted off the spin
 * axis, so as the star spins the beams rake around. The core pulses each
 * time a beam sweeps past. Object-space only — no postprocessing.
 */

const BEAM_VERT = /* glsl */ `
  varying float vT;
  void main() { vT = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vT;
  void main() {
    float a = pow(1.0 - vT, 2.3) * uOpacity;  // bright at the star → fades out
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const Pulsar = ({ position = remapPosition(frontOfSun([-26, 16, -34])), radius = 4 }) => {
  const spinRef = useRef();
  const coreRef = useRef();
  const coreMat = useRef();
  const sceneClock = useSceneClock();

  const beamUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#9fd2ff") }, uOpacity: { value: 0.5 } }),
    []
  );

  const beamLen = 150;

  useFrame(() => {
    const t = sceneClock.t;
    if (spinRef.current) spinRef.current.rotation.y = t * 3.2; // fast spin → lighthouse
    /* Core pulses twice per rotation (two beams sweep the line of sight). */
    const pulse = 0.6 + 0.4 * Math.abs(Math.sin(t * 3.2));
    if (coreRef.current) coreRef.current.scale.setScalar(pulse);
    if (coreMat.current) coreMat.current.opacity = pulse;
  });

  return (
    <group position={position}>
      {/* Intense core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial ref={coreMat} color="#eaf6ff" transparent toneMapped={false} />
      </mesh>
      {/* Soft halo */}
      <mesh>
        <sphereGeometry args={[radius * 2.4, 16, 16]} />
        <meshBasicMaterial color="#5aa0ff" transparent opacity={0.22} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Generous invisible hit area — click to "decode" the pulsar's signal. */}
      <mesh
        onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("stellar:pulsar")); }}
        onPointerOver={() => { if (typeof document !== "undefined") document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { if (typeof document !== "undefined") document.body.style.cursor = ""; }}
      >
        <sphereGeometry args={[radius * 12, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Spinning, tilted beam axis → lighthouse sweep */}
      <group ref={spinRef}>
        <group rotation={[0, 0, Math.PI * 0.22]}>
          {[0, Math.PI].map((flip, i) => (
            <mesh key={i} position={[0, (i === 0 ? beamLen / 2 : -beamLen / 2), 0]} rotation={[flip, 0, 0]}>
              <coneGeometry args={[1.1, beamLen, 18, 1, true]} />
              <shaderMaterial
                vertexShader={BEAM_VERT}
                fragmentShader={BEAM_FRAG}
                uniforms={beamUniforms}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

export default Pulsar;
