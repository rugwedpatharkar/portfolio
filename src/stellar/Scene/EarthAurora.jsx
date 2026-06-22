/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Earth aurora ring shells at the poles. Two thin tilted rings
 * (north + south) render with an animated noise glow in aurora green,
 * additive-blended. Only visible when the camera is reasonably close
 * to Earth (we don't render aurora when zoomed all the way out).
 */

const VERTEX = `
varying vec2 vUv;
varying vec3 vWorldNormal;
void main() {
  vUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = `
varying vec2 vUv;
varying vec3 vWorldNormal;
uniform float uTime;
uniform vec3 uColor;

void main() {
  /* Radial falloff from ring centre */
  float d = abs(vUv.y - 0.5) * 2.0;
  float band = smoothstep(1.0, 0.0, d) * smoothstep(0.0, 0.2, 1.0 - d);
  /* Animated wave along U — feels like the aurora dancing */
  float wave = sin(vUv.x * 28.0 + uTime * 1.8) * 0.5 + 0.5;
  float wave2 = sin(vUv.x * 11.0 - uTime * 0.6) * 0.5 + 0.5;
  float alpha = band * (0.4 + wave * 0.5) * (0.6 + wave2 * 0.5);
  gl_FragColor = vec4(uColor, alpha * 0.7);
}
`;

const EarthAurora = ({ position = [0, 0, 0], radius = 0.75 }) => {
  const groupRef = useRef();
  const matNRef = useRef();
  const matSRef = useRef();

  const uniformsN = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color("#7df2c0") } }),
    []
  );
  const uniformsS = useMemo(
    () => ({ uTime: { value: 1.4 }, uColor: { value: new THREE.Color("#a8e2ff") } }),
    []
  );

  useFrame(({ clock, camera }) => {
    const dist = camera.position.distanceTo(groupRef.current?.position || new THREE.Vector3());
    const visible = dist < 12;
    if (groupRef.current) groupRef.current.visible = visible;
    if (!visible) return;
    if (matNRef.current) matNRef.current.uniforms.uTime.value = clock.elapsedTime;
    if (matSRef.current) matSRef.current.uniforms.uTime.value = clock.elapsedTime + 1.4;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* North pole ring — tilted slightly off the axis for visual interest */}
      <mesh rotation={[0, 0, 0.05]} position={[0, radius * 0.85, 0]}>
        <torusGeometry args={[radius * 0.42, radius * 0.04, 24, 96]} />
        <shaderMaterial
          ref={matNRef}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniformsN}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* South pole ring */}
      <mesh rotation={[0, 0, -0.04]} position={[0, -radius * 0.85, 0]}>
        <torusGeometry args={[radius * 0.42, radius * 0.04, 24, 96]} />
        <shaderMaterial
          ref={matSRef}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniformsS}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default EarthAurora;
