/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { voyagerPositions } from "../data/ephemeris";

/*
 * Voyager 1 + 2 probes at scaled real positions outside the system.
 *
 * Our system's outer planet (Neptune) sits at x=39 in scene units,
 * representing 30 AU. So 1 AU ≈ 1.3 scene units. Real Voyager 1
 * (≈165 AU today) is ~214 units from origin — too far to see at
 * scale, so we scale down 5× for visibility (≈43 units).
 */

const AU_TO_SCENE = 1.3;
const PROBE_SCALE_DOWN = 0.25;

const Probe = ({ name, auFromSun, direction, color }) => {
  const scenePos = useMemo(() => {
    const d = auFromSun * AU_TO_SCENE * PROBE_SCALE_DOWN;
    const [dx, dy, dz] = direction;
    const len = Math.hypot(dx, dy, dz) || 1;
    return [dx / len * d, dy / len * d * 0.4, dz / len * d];
  }, [auFromSun, direction]);

  const meshRef = useRef();
  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.4;
      meshRef.current.rotation.z += dt * 0.15;
    }
  });

  return (
    <group position={scenePos}>
      <mesh ref={meshRef}>
        {/* Tiny dish + body */}
        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#dcdcdc" metalness={0.6} roughness={0.4} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <pointLight color={color} intensity={0.4} distance={1.6} decay={2} />
      <Html
        center
        distanceFactor={14}
        style={{
          pointerEvents: "none",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: "#a8d8ff",
          textShadow: "0 1px 6px rgba(0,0,0,0.7)",
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          transform: "translateY(-12px)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "white", fontWeight: 600 }}>{name}</div>
          <div>{auFromSun.toFixed(1)} AU FROM SOL</div>
        </div>
      </Html>
    </group>
  );
};

const Voyager = () => {
  const positions = useMemo(() => voyagerPositions(), []);
  return (
    <>
      <Probe name="VOYAGER 1" auFromSun={positions.voyager1.auFromSun} direction={positions.voyager1.direction} color="#ffd47a" />
      <Probe name="VOYAGER 2" auFromSun={positions.voyager2.auFromSun} direction={positions.voyager2.direction} color="#a8d8ff" />
    </>
  );
};

export default Voyager;
