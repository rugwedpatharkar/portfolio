/* eslint-disable react/no-unknown-property */
/*
 * SOLAR CORONAL MASS EJECTIONS (CMEs) — the Sun is currently near Cycle-25
 * maximum (2024-2026) so CMEs are erupting several times per week.
 * Rendered as short-lived bright plasma arcs blooming from Sun's limb at
 * random azimuths, each fading over ~1 scene-second. Sells "the Sun is
 * ALIVE" — visible activity beyond the surface granulation.
 *
 * Reuses SunRays.jsx-style additive geometry. Positioned around the Sun's
 * surface at various latitudes/longitudes; new bursts spawn every few
 * scene-seconds. Never mounted more than 4 at a time (perf).
 *
 * Sources: docs/research/01-sun-and-planets.md §3.0 (Sun surface phenomena
 * — CMEs); SOHO/LASCO real-time CME catalogue.
 */
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { makeSoftDot } from "./shared/textures";

const CME_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,240,200,1)"],
    [0.3, "rgba(255,200,120,0.85)"],
    [0.75, "rgba(255,130,50,0.25)"],
    [1, "rgba(200,80,20,0)"],
  ],
  mipmaps: true,
});

const N_CME = 4; // pool size

const SolarCMEs = ({ sunRadius = 19.87 }) => {
  const groupRef = useRef();
  const refs = useRef([]);
  const sceneClock = useSceneClock();
  const state = useRef(
    Array.from({ length: N_CME }, (_, i) => ({
      birth: -100 + i * 1.2, // stagger initial births so they don't all pop at once
      lifetime: 2.4 + Math.random() * 1.8,
      lat: 0, lon: 0, size: 0,
      dir: new THREE.Vector3(),
    })),
  );

  useEffect(() => {
    /* Initial random directions. */
    const st = state.current;
    for (let i = 0; i < N_CME; i++) reseed(st[i], 0);
  }, []);

  const reseed = (s, now) => {
    s.birth = now + Math.random() * 6; // next birth in 0-6 scene-sec
    s.lifetime = 2.2 + Math.random() * 2.0;
    /* CMEs cluster near solar equator during solar-max — sample lat ±30°. */
    s.lat = (Math.random() - 0.5) * (60 * Math.PI / 180);
    s.lon = Math.random() * Math.PI * 2;
    s.size = sunRadius * (0.9 + Math.random() * 0.7);
    s.dir.set(
      Math.cos(s.lat) * Math.cos(s.lon),
      Math.sin(s.lat),
      Math.cos(s.lat) * Math.sin(s.lon),
    );
  };

  useFrame(() => {
    const now = sceneClock.t;
    const st = state.current;
    for (let i = 0; i < N_CME; i++) {
      const s = st[i];
      const spr = refs.current[i];
      if (!spr) continue;
      const age = now - s.birth;
      if (age < 0) { spr.material.opacity = 0; spr.scale.setScalar(0.01); continue; }
      const t = age / s.lifetime;
      if (t > 1) { reseed(s, now); continue; }
      /* Ejecta expands radially outward from Sun limb; opacity peaks at
         ~30% of life then fades. */
      const r = sunRadius * (1.05 + t * 1.4);
      spr.position.set(s.dir.x * r, s.dir.y * r, s.dir.z * r);
      const size = s.size * (0.4 + t * 1.1);
      spr.scale.set(size, size, 1);
      const fade = t < 0.30 ? t / 0.30 : Math.max(0, 1 - (t - 0.30) / 0.70);
      spr.material.opacity = 0.65 * fade;
    }
  });

  return (
    <group ref={groupRef}>
      {state.current.map((_, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el; }} scale={[0.01, 0.01, 1]}>
          <spriteMaterial
            map={CME_SPRITE}
            color="#ffb060"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default SolarCMEs;
