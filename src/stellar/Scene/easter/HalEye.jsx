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

/* Slightly out from the belt so it doesn't get occluded by passing
   asteroids — still in the Jupiter neighbourhood (Discovery One). */
const POSITION = [23.6, 2.2, -3.4];

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
    window.dispatchEvent(new CustomEvent("stellar:hal"));
    console.log("%c\"I'm sorry, Dave. I'm afraid I can't do that.\"", "color: #ff4040; font-size: 13px; font-family: monospace;");
  };

  return (
    <group
      position={POSITION}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <mesh>
        <boxGeometry args={[0.7, 0.7, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={irisRef} position={[0, 0, 0.04]}>
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff2020" emissiveIntensity={2.5} />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#ff3030"
        intensity={0.6}
        distance={2.4}
        decay={2}
        position={[0, 0, 0.12]}
      />
    </group>
  );
};

export default HalEye;
