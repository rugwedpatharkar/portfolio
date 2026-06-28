/* eslint-disable react/no-unknown-property */
import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/*
 * Occasional wishing meteors — a small pool of streak meshes that, one
 * at a time, ignite somewhere high in the sky, race across the view, and
 * fade. Unlike the radial Meteors shower (a steady burst from one
 * radiant), these are lonely, infrequent shooting stars: at most one or
 * two visible, several seconds apart.
 *
 * Each streak is a thin elongated box with additive vertex colour for the
 * brightness fade. The pool (≤6) is allocated once; recycling reuses the
 * same meshes — nothing is created per frame.
 *
 * Click a live streak to "make a wish": a small space/coding quote fades
 * in near the click point via drei <Html> and auto-dismisses ~3s later.
 * Fully self-contained — no external events or wiring needed.
 *
 * In-scene meshes only; NO post-processing pass. Under reduced-motion the
 * component renders nothing.
 */

const POOL = 6;
const SPREAD = new THREE.Vector3(34, 18, 28); // box the streaks fly within
const CENTER = new THREE.Vector3(0, 12, -14); // up + behind, deep-sky band

const WISHES = [
  "The cosmos is within us. — Sagan",
  "Code is poetry in motion.",
  "Somewhere, something incredible is waiting to be known. — Sagan",
  "Per aspera ad astra — through hardships to the stars.",
  "We are made of star-stuff. — Sagan",
  "Ship it like a meteor: fast and bright.",
  "Look up at the stars, not down at your feet. — Hawking",
  "Make a wish. git commit your dreams.",
];

const _q = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _up = new THREE.Vector3(0, 1, 0);

function spawnStreak() {
  /* Enter from a random point along the upper sky, fly mostly down +
     sideways across the view, with a long random idle before re-igniting
     so the sky stays mostly empty. */
  const dir = new THREE.Vector3(
    -0.5 - Math.random() * 0.6,
    -0.5 - Math.random() * 0.4,
    (Math.random() - 0.5) * 0.6,
  ).normalize();
  const start = new THREE.Vector3(
    CENTER.x + (0.3 + Math.random() * 0.7) * SPREAD.x,
    CENTER.y + (Math.random() - 0.2) * SPREAD.y,
    CENTER.z + (Math.random() - 0.5) * SPREAD.z,
  );
  return {
    dir,
    start,
    pos: start.clone(),
    speed: 26 + Math.random() * 20,
    len: 4 + Math.random() * 6,
    life: 0,
    maxLife: 1.0 + Math.random() * 0.8,
    delay: 1.5 + Math.random() * 8, // long gaps → lonely shooting stars
    color: new THREE.Color().setHSL(0.55 + Math.random() * 0.08, 0.5, 0.9),
    active: false,
  };
}

const Streak = ({ data, onWish }) => {
  const ref = useRef();
  const matRef = useRef();

  useFrame(({ camera }, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = Math.min(delta, 1 / 20);
    const s = data;

    if (!s.active) {
      s.delay -= d;
      if (s.delay > 0) {
        mesh.visible = false;
        return;
      }
      s.active = true;
      s.life = 0;
      /* Anchor the spawn near the current camera so the shooting star streaks
         across the view at ANY planet stop, not only near the Sun/origin. */
      s.pos.copy(s.start).add(camera.position);
    }

    s.life += d;
    if (s.life >= s.maxLife) {
      Object.assign(s, spawnStreak()); // fresh path + fresh idle gap
      mesh.visible = false;
      return;
    }

    s.pos.addScaledVector(s.dir, s.speed * d);
    const f = s.life / s.maxLife;
    const bright = Math.min(1, f * 5) * (1 - f) * 1.8; // quick rise, long fade

    _q.setFromUnitVectors(_up, s.dir);
    _scale.set(0.12, s.len, 0.12);
    _m.compose(s.pos, _q, _scale);
    mesh.visible = true;
    mesh.matrix.copy(_m);
    mesh.matrixWorldNeedsUpdate = true;
    if (matRef.current) matRef.current.color.copy(s.color).multiplyScalar(bright);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (data.active) onWish(data.pos);
  };

  return (
    <mesh
      ref={ref}
      matrixAutoUpdate={false}
      frustumCulled={false}
      onClick={handleClick}
      onPointerOver={() => { if (typeof document !== "undefined") document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { if (typeof document !== "undefined") document.body.style.cursor = ""; }}
    >
      {/* Slim visible streak + an invisible fat hit-box so the tiny streak
          is actually clickable without inflating the glow. */}
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
      <mesh scale={[6, 1.1, 6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </mesh>
  );
};

const ShootingStars = ({ animate = true }) => {
  const streaks = useMemo(() => Array.from({ length: POOL }, spawnStreak), []);
  const [wish, setWish] = useState(null); // { pos: Vector3, text }
  const timerRef = useRef();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!animate) return null;

  const onWish = (pos) => {
    clearTimeout(timerRef.current);
    const text = WISHES[Math.floor(Math.random() * WISHES.length)];
    setWish({ pos: pos.clone(), text });
    timerRef.current = setTimeout(() => setWish(null), 3000);
  };

  return (
    <group>
      {streaks.map((data, i) => (
        <Streak key={i} data={data} onWish={onWish} />
      ))}
      {wish && (
        <group position={wish.pos}>
          <Html center distanceFactor={26} style={{ pointerEvents: "none" }} zIndexRange={[40, 0]}>
            <div
              style={{
                width: 210,
                transform: "translateY(-130%)",
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(8,11,24,0.82)",
                border: "1px solid rgba(168,216,255,0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                fontFamily: "'Martian Mono', monospace",
                color: "white",
                fontSize: 11.5,
                lineHeight: 1.45,
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 22px rgba(168,216,255,0.18)",
                animation: "stellarWishFade 3s ease forwards",
              }}
            >
              <div style={{ fontSize: 10, color: "#a8d8ff", letterSpacing: "0.12em", marginBottom: 4 }}>
                ✦ A WISH
              </div>
              {wish.text}
              <style>{`@keyframes stellarWishFade{0%{opacity:0;transform:translateY(-115%) scale(0.96)}12%{opacity:1;transform:translateY(-130%) scale(1)}80%{opacity:1}100%{opacity:0}}`}</style>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

export default ShootingStars;
