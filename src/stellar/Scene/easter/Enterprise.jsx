/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * The USS Enterprise — saucer (primary hull) on a short neck to the
 * engineering hull, with twin warp nacelles on struts and glowing bussard
 * caps. Small, cruising high over the inner system. The nacelle glow
 * breathes; the whole ship drifts with a gentle bob.
 *
 * Click → fires 'stellar:enterprise'.
 */

const POSITION = [14.8, 0.9, -2.8];

const Enterprise = () => {
  const ref = useRef();
  const capL = useRef();
  const capR = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) ref.current.position.y = POSITION[1] + Math.sin(t * 0.6) * 0.06;
    const glow = 0.7 + Math.sin(t * 3) * 0.3;
    if (capL.current) capL.current.material.opacity = glow;
    if (capR.current) capR.current.material.opacity = glow;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:enterprise"));
    console.log("%c🖖  USS Enterprise — to boldly go.", "color: #bcd6ff; font-size: 14px; font-family: monospace;");
  };

  return (
    <group ref={ref} position={POSITION} rotation={[0.1, -0.6, 0.05]} scale={0.9} onClick={handleClick}>
      {/* Saucer — primary hull */}
      <mesh position={[0.28, 0.04, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.055, 28]} />
        <meshStandardMaterial color="#dde2e7" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Neck */}
      <mesh position={[0.05, -0.08, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.14, 0.13, 0.07]} />
        <meshStandardMaterial color="#c2c8ce" metalness={0.45} roughness={0.5} />
      </mesh>
      {/* Engineering hull */}
      <mesh position={[-0.16, -0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.055, 0.4, 18]} />
        <meshStandardMaterial color="#d2d7dc" metalness={0.45} roughness={0.5} />
      </mesh>
      {/* Twin nacelles on struts */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-0.16, 0.0, 0.26 * s]}>
          {/* strut */}
          <mesh position={[0.02, -0.06, -0.1 * s]} rotation={[0.5 * s, 0, 0.4]}>
            <boxGeometry args={[0.16, 0.028, 0.028]} />
            <meshStandardMaterial color="#b8bec5" metalness={0.4} roughness={0.55} />
          </mesh>
          {/* nacelle body */}
          <mesh position={[-0.06, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.36, 14]} />
            <meshStandardMaterial color="#cdd3d9" metalness={0.45} roughness={0.5} />
          </mesh>
          {/* glowing bussard cap (front) */}
          <mesh ref={s === -1 ? capL : capR} position={[0.12, 0.05, 0]}>
            <sphereGeometry args={[0.052, 12, 10]} />
            <meshBasicMaterial color="#5fb0ff" transparent opacity={0.8} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Enterprise;
