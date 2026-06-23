/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { DESTINATIONS } from "../config/destinations";
import { liveBodyPosition } from "../data/bodies";

/*
 * REAL solar eclipses — totality is computed from actual geometry, not a fake
 * fixed sweep (the reason the old version was retired: it eclipsed constantly
 * from a wrong angle).
 *
 * An occluder eclipses the Sun when, FROM THE CAMERA, it (a) sits in front of
 * the Sun and (b) its apparent disc covers the Sun's. We score every candidate
 * — a Moon that genuinely orbits Earth, and every planet — by
 *   alignment (angular) × size-coverage × in-front
 * and drive a corona / chromosphere / diamond-ring at the Sun by the best one.
 *
 * This means it works in BOTH modes for real:
 *   • Game: fly so a planet (or Earth's Moon) covers the Sun → total eclipse.
 *   • Read: planets transit the Sun as they orbit; plus a guaranteed, occasional
 *     close Moon transit staged at the Sol view so visitors actually see one.
 *
 * Cheap: a handful of vector ops + three billboards. Frozen on reduced-motion.
 */

const SUN = new THREE.Vector3(0, 0, 0);
const SUN_R = DESTINATIONS[0].radius; // 1.6
const HERO_CAM = new THREE.Vector3(0, 2.5, 11);
const NEAR_SOL = 6.5; // camera within this of the hero pose → stage the Read eclipse

const EARTH = DESTINATIONS.find((d) => d.type === "earth");
const PLANETS = DESTINATIONS.filter((d) => d.kind === "planet").map((d) => ({ id: d.id, r: d.radius }));

/* Earth's Moon — a real satellite. */
const MOON_R = 0.2;
const MOON_ORBIT = EARTH.radius * 2.7;
const MOON_OMEGA = 0.45;
const MOON_TILT = 0.42;

/* The staged Read transit at the Sol view (camera ≈ hero). Tuned so the disc
   lands dead-centre on the Sun at totality and matches its apparent size. */
const CROSS_Y = 0.9, CROSS_Z = 4.2, SWEEP_X = 9, SCRIPT_R = 0.98;
const SCRIPT_PERIOD = 26;   // seconds between staged eclipses
const SCRIPT_WINDOW = 0.17; // phase half-width the disc is in play (else hidden)

const corona = makeCorona();
const chromo = makeChromo();
const glint = makeGlint();

const SolarEclipse = ({ reducedMotion = false }) => {
  const scriptMoon = useRef();
  const earthMoon = useRef();
  const coronaRef = useRef();
  const chromoRef = useRef();
  const glintRef = useRef();
  const sceneClock = useSceneClock();

  const v = useMemo(() => ({
    occ: new THREE.Vector3(), dir: new THREE.Vector3(), sunDir: new THREE.Vector3(),
    earth: new THREE.Vector3(), scr: new THREE.Vector3(),
  }), []);

  useFrame(({ camera }) => {
    const t = reducedMotion ? 0 : sceneClock.t;
    const cam = camera.position;
    const sunDist = cam.distanceTo(SUN);
    const sunAppR = SUN_R / sunDist;
    v.sunDir.copy(SUN).sub(cam).normalize();

    /* Earth's Moon rides Earth's live orbital position. */
    liveBodyPosition(EARTH.id, t, v.earth);
    const ma = t * MOON_OMEGA;
    v.occ.set(Math.cos(ma) * MOON_ORBIT, Math.sin(ma) * MOON_ORBIT * MOON_TILT, Math.sin(ma) * MOON_ORBIT);
    v.earth.add(v.occ); // Moon world position
    if (earthMoon.current) earthMoon.current.position.copy(v.earth);

    /* Staged Read transit — only near the Sol view, only during its window. */
    const nearSol = cam.distanceTo(HERO_CAM) < NEAR_SOL;
    const ph = (t % SCRIPT_PERIOD) / SCRIPT_PERIOD;          // 0..1, totality at 0.5
    const scriptActive = nearSol && Math.abs(ph - 0.5) < SCRIPT_WINDOW;
    const mx = (ph * 2 - 1) * SWEEP_X;
    v.scr.set(mx, CROSS_Y, CROSS_Z);
    if (scriptMoon.current) {
      scriptMoon.current.position.copy(v.scr);
      scriptMoon.current.visible = scriptActive;
    }

    /* Best totality over all real candidates (+ the staged disc when active). */
    let best = 0;
    const consider = (pos, r) => {
      v.dir.copy(pos).sub(cam);
      const dist = v.dir.length();
      if (dist >= sunDist) return;                 // behind the Sun → can't occlude
      v.dir.divideScalar(dist);
      const occAppR = r / dist;
      const ang = Math.acos(THREE.MathUtils.clamp(v.dir.dot(v.sunDir), -1, 1));
      const alignment = THREE.MathUtils.clamp(1 - ang / (sunAppR + occAppR), 0, 1);
      const cover = THREE.MathUtils.clamp(occAppR / sunAppR, 0, 1);
      const tot = alignment * alignment * cover; // sharper falloff → crisp totality
      if (tot > best) best = tot;
    };
    consider(v.earth, MOON_R);
    for (const p of PLANETS) consider(liveBodyPosition(p.id, t, v.occ), p.r);
    if (scriptActive) consider(v.scr, SCRIPT_R);

    const force = typeof window !== "undefined" ? window.__forceEclipse : undefined;
    const totality = force != null ? force : best;

    if (coronaRef.current) {
      coronaRef.current.position.copy(SUN);
      coronaRef.current.material.opacity = totality * 0.95;
      coronaRef.current.material.rotation += reducedMotion ? 0 : 0.0007;
      coronaRef.current.visible = totality > 0.01;
    }
    if (chromoRef.current) {
      chromoRef.current.position.copy(SUN);
      chromoRef.current.material.opacity = Math.max(0, totality - 0.4) * 1.4;
      chromoRef.current.visible = totality > 0.4;
    }
    if (glintRef.current) {
      /* Diamond-ring: a bright glint at the last sliver before/after totality. */
      const g = Math.max(0, 1 - Math.abs(totality - 0.85) / 0.12);
      glintRef.current.position.copy(SUN);
      glintRef.current.material.opacity = g;
      glintRef.current.visible = g > 0.02;
    }
  });

  return (
    <group>
      {/* Earth's real Moon (also a fly-behind eclipse occluder in the game). */}
      <mesh ref={earthMoon}>
        <sphereGeometry args={[MOON_R, 32, 32]} />
        <meshStandardMaterial color="#b9bcc6" roughness={1} metalness={0} />
      </mesh>
      {/* Staged transit disc — pure black, invisible against space, only a dark
          bite out of the Sun while it crosses. */}
      <mesh ref={scriptMoon} visible={false}>
        <sphereGeometry args={[SCRIPT_R, 48, 48]} />
        <meshBasicMaterial color="#04050a" />
      </mesh>
      <sprite ref={chromoRef} scale={[5.6, 5.6, 1]}>
        <spriteMaterial map={chromo} transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={coronaRef} scale={[6.2, 6.2, 1]}>
        <spriteMaterial map={corona} transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glintRef} scale={[1.6, 1.6, 1]}>
        <spriteMaterial map={glint} transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
};

/* ── Corona / chromosphere / diamond-ring textures (additive sprites). ── */
function makeCorona() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 46, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.38, "rgba(255,255,255,0)");
  g.addColorStop(0.46, "rgba(236,245,255,0.95)");
  g.addColorStop(0.56, "rgba(175,208,255,0.4)");
  g.addColorStop(1, "rgba(135,182,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  ctx.translate(128, 128);
  ctx.globalCompositeOperation = "lighter";
  const N = 44;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + ((i * 53) % 9) * 0.035;
    const r0 = 58;
    const len = r0 + 14 + (((i * 37) % 13) / 13) * 56;
    const lg = ctx.createLinearGradient(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * len, Math.sin(a) * len);
    lg.addColorStop(0, "rgba(224,238,255,0.5)");
    lg.addColorStop(1, "rgba(150,195,255,0)");
    ctx.strokeStyle = lg;
    ctx.lineWidth = 0.6 + (((i * 17) % 5) / 5) * 1.9;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}
function makeChromo() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 50, 128, 128, 66);
  g.addColorStop(0, "rgba(255,80,66,0)");
  g.addColorStop(0.5, "rgba(255,120,96,0.9)");
  g.addColorStop(1, "rgba(255,70,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}
function makeGlint() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(210,232,255,0.7)");
  g.addColorStop(1, "rgba(150,195,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export default SolarEclipse;
