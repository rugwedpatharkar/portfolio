/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * The TARDIS — small blue box near Saturn that fades in/out every
 * 90 s with a brief flicker (the "vworp" tell). Two small light
 * panels glow at the top.
 *
 * Visibility cycle: 4 s visible → 86 s gone, repeats. Triggers on
 * page load.
 */

/* Bigger + closer to Saturn so the vworp is visible from the scroll
   tour camera, not just from free-roam. */
const POSITION = [31.2, 2.0, 3.2];
const CYCLE = 90;
const VISIBLE_FOR = 5;
const SCALE = 1.8;

const Tardis = () => {
  const groupRef = useRef();
  const tRef = useRef(60); // first appearance 30s after load

  useFrame((_, dt) => {
    tRef.current += dt;
    if (tRef.current > CYCLE) tRef.current = 0;
    const phase = tRef.current % CYCLE;
    const visible = phase < VISIBLE_FOR;
    /* Flicker on enter + exit (vworp) */
    const flicker = visible
      ? (phase < 0.5 ? Math.sin(phase * 40) * 0.5 + 0.5 : phase > 3.5 ? Math.sin((4 - phase) * 40) * 0.5 + 0.5 : 1)
      : 0;
    if (groupRef.current) {
      groupRef.current.visible = visible;
      groupRef.current.scale.setScalar(SCALE * (0.5 + flicker * 0.5));
      groupRef.current.rotation.y += dt * 0.2;
    }
  });

  /* R3F already suppresses pointer events on meshes whose object.visible
     is false, so this only fires while the TARDIS is phased in. We also
     mirror the visibility check off the ref as an explicit guard. */
  const handleClick = (e) => {
    e.stopPropagation();
    if (!groupRef.current?.visible) return;
    window.dispatchEvent(new CustomEvent("stellar:tardis"));
  };

  return (
    <group
      ref={groupRef}
      position={POSITION}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* Box body */}
      <mesh>
        <boxGeometry args={[0.32, 0.55, 0.32]} />
        <meshStandardMaterial color="#1a4090" emissive="#3a60c0" emissiveIntensity={0.5} />
      </mesh>
      {/* Roof light panels */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.34]} />
        <meshBasicMaterial color="#fff0c0" />
      </mesh>
      <pointLight color="#fff0c0" intensity={0.5} distance={2} decay={2} position={[0, 0.32, 0]} />
    </group>
  );
};

export default Tardis;
