/* eslint-disable react/no-unknown-property */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * HAL 9000 red-eye plate floating near Jupiter (Discovery One's mission
 * was to Jupiter — fitting). Click → console line + toast.
 */

const POSITION = [22.8, 1.3, -3.0];

const HalEye = () => {
  const irisRef = useRef();
  const [pulse, setPulse] = useState(0);

  useFrame(({ clock }) => {
    const p = Math.sin(clock.elapsedTime * 0.8) * 0.5 + 0.5;
    if (irisRef.current) irisRef.current.material.emissiveIntensity = 1.2 + p * 1.5;
    setPulse(p);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    console.log("%c\"I'm sorry, Dave. I'm afraid I can't do that.\"", "color: #ff4040; font-size: 13px; font-family: monospace;");
  };

  return (
    <group position={POSITION} onClick={handleClick}>
      {/* Black plate */}
      <mesh>
        <boxGeometry args={[0.45, 0.45, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Red iris */}
      <mesh ref={irisRef} position={[0, 0, 0.03]}>
        <circleGeometry args={[0.1, 24]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff2020" emissiveIntensity={2} />
      </mesh>
      <pointLight color="#ff3030" intensity={0.6 + pulse * 0.6} distance={1.6} decay={2} position={[0, 0, 0.1]} />
    </group>
  );
};

export default HalEye;
