/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "../SceneClock";
import { placeInFrontOfSun } from "../../config/destinations";

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
    float a = pow(1.0 - vT, 1.8) * uOpacity;  // collimated pencil → fades out
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const Pulsar = ({ position = placeInFrontOfSun([-26, 16, -34]), radius = 4 }) => {
  const spinRef = useRef();
  const coreRef = useRef();
  const coreMat = useRef();
  const sceneClock = useSceneClock();

  const beamUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#bcd6ff") }, uOpacity: { value: 0.85 } }),
    []
  );

  const beamLen = 280;

  useFrame(() => {
    const t = sceneClock.t;
    if (spinRef.current) spinRef.current.rotation.y = t * 3.2; // fast spin → lighthouse
    /* Real pulsars flash as a SHARP spike when a beam crosses the line of sight,
       flat otherwise — not a gentle sinusoidal throb. pow(|sin|, 8) gives that
       crisp blink, twice per rotation (two opposed beams). */
    const blink = Math.pow(Math.abs(Math.sin(t * 3.2)), 8.0);
    if (coreRef.current) coreRef.current.scale.setScalar(0.9 + 0.35 * blink);
    if (coreMat.current) coreMat.current.opacity = 0.5 + 0.5 * blink;
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
        <meshBasicMaterial color="#bcd6ff" transparent opacity={0.22} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
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
              <coneGeometry args={[0.55, beamLen, 18, 1, true]} />
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
