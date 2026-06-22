/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * HAL 9000 red-eye plate floating near Jupiter (Discovery One's mission
 * was to Jupiter — fitting). Click → console line.
 *
 * Pulse is written directly to material + light refs each frame — no
 * React state. State-in-useFrame triggers 60 reconciliations/s.
 */

const POSITION = [22.8, 1.3, -3.0];

const HalEye = () => {
  const irisRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    const p = Math.sin(clock.elapsedTime * 0.8) * 0.5 + 0.5;
    if (irisRef.current) irisRef.current.material.emissiveIntensity = 1.2 + p * 1.5;
    if (lightRef.current) lightRef.current.intensity = 0.6 + p * 0.6;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    console.log("%c\"I'm sorry, Dave. I'm afraid I can't do that.\"", "color: #ff4040; font-size: 13px; font-family: monospace;");
  };

  return (
    <group position={POSITION} onClick={handleClick}>
      <mesh>
        <boxGeometry args={[0.45, 0.45, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={irisRef} position={[0, 0, 0.03]}>
        <circleGeometry args={[0.1, 24]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff2020" emissiveIntensity={2} />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#ff3030"
        intensity={0.6}
        distance={1.6}
        decay={2}
        position={[0, 0, 0.1]}
      />
    </group>
  );
};

export default HalEye;
