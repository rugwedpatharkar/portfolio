/* eslint-disable react/no-unknown-property */
/*
 * LOW EARTH ORBIT satellites — the modern human "layer" around Earth:
 *   - Starlink shell at ~550 km altitude, ~5,000 satellites (2026), moving
 *     with visible glint. Rendered as ~40 sparse orbiting points forming
 *     a bright shell around Earth.
 *   - ISS at ~408 km altitude — one prominent, larger, warm-gold marker
 *     with a slower orbit.
 *
 * Both ride a small offset from Earth's position (passed in from Scene).
 * Sky-fixed dot glow; additive blending. Rides Earth's OrbitGroup so it
 * follows Earth around the Sun.
 *
 * Real physics: Starlink at 550 km / 90 min period; ISS at 408 km /
 * 92.7 min period. Earth radius = 6371 km, so 550 km altitude ≈
 * 1.086 × Earth radius (in tour units: earth radius 0.182 → LEO shell
 * at 0.198).
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { makeSoftDot } from "./shared/textures";

const DOT = makeSoftDot({
  size: 32,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(230,240,255,0.85)"],
    [1, "rgba(180,200,255,0)"],
  ],
});

const LowEarthOrbit = ({ earthRadius = 0.182 }) => {
  const groupRef = useRef();
  const issRef = useRef();
  const sceneClock = useSceneClock();

  const shell = earthRadius * 1.09;   // Starlink altitude
  const iss = earthRadius * 1.065;    // ISS altitude (slightly lower)

  const dots = useMemo(() => {
    const arr = [];
    /* 42 Starlink markers arranged as tilted orbital planes for a
       "constellation" feel. */
    for (let plane = 0; plane < 6; plane++) {
      const inc = (plane / 6) * Math.PI - Math.PI / 4;
      for (let sat = 0; sat < 7; sat++) {
        const phase = (sat / 7) * Math.PI * 2 + plane * 0.35;
        arr.push({ inc, phase, speed: 1.2 + Math.random() * 0.3 });
      }
    }
    return arr;
  }, []);

  useFrame(() => {
    const t = sceneClock.t;
    if (groupRef.current) {
      const children = groupRef.current.children;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const angle = d.phase + t * d.speed;
        const c = Math.cos(angle), s = Math.sin(angle);
        const ic = Math.cos(d.inc), is = Math.sin(d.inc);
        const x = c * shell;
        const y = s * is * shell;
        const z = s * ic * shell;
        const child = children[i];
        if (child) child.position.set(x, y, z);
      }
    }
    if (issRef.current) {
      const angle = t * 0.85;
      const inc = 0.9; // 51.6° ISS inclination
      const c = Math.cos(angle), sn = Math.sin(angle);
      const ic = Math.cos(inc), is = Math.sin(inc);
      issRef.current.position.set(c * iss, sn * is * iss, sn * ic * iss);
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        {dots.map((_, i) => (
          <sprite key={i} scale={[earthRadius * 0.05, earthRadius * 0.05, 1]}>
            <spriteMaterial map={DOT} color="#f0f8ff" transparent opacity={0.62} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        ))}
      </group>
      <sprite ref={issRef} scale={[earthRadius * 0.10, earthRadius * 0.10, 1]}>
        <spriteMaterial map={DOT} color="#ffe0a8" transparent opacity={0.90} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
};

export default LowEarthOrbit;
