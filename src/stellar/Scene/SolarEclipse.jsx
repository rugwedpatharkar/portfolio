/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { DESTINATIONS } from "../config/destinations";
import { liveBodyPosition } from "../data/bodies";

/*
 * REAL solar eclipses — totality is actual geometry, never a fake disc.
 *
 * A body eclipses the Sun when, FROM THE CAMERA, it (a) sits in front of the
 * Sun and (b) its apparent disc covers the Sun's. We score the real occluders —
 * Earth's actual Moon (its live world position, supplied by Planet via
 * satelliteRef) and every planet — by alignment × size-coverage × in-front, and
 * drive a corona + chromosphere + diamond-ring at the Sun by the best score.
 * The totality is published to eclipseRef so the DOM can darken the sky.
 *
 *   • Game: fly so Earth's Moon (or a planet) covers the Sun → total eclipse.
 *   • Read: planets / the Moon transit the Sun as they orbit.
 *
 * No staged disc, no second moon. Cheap; frozen on reduced-motion.
 */

const SUN = new THREE.Vector3(0, 0, 0);
const SUN_R = DESTINATIONS[0].radius; // 1.6
const EARTH = DESTINATIONS.find((d) => d.type === "earth");
const MOON_R = EARTH.radius * (EARTH.moonScale || 0.27); // the real Moon's radius
const PLANETS = DESTINATIONS.filter((d) => d.kind === "planet").map((d) => ({ id: d.id, r: d.radius }));

const corona = makeCorona();
const chromo = makeChromo();
const glint = makeGlint();

const SolarEclipse = ({ satelliteRef, eclipseRef, reducedMotion = false }) => {
  const coronaRef = useRef();
  const chromoRef = useRef();
  const glintRef = useRef();
  const sceneClock = useSceneClock();
  const v = useMemo(() => ({ occ: new THREE.Vector3(), dir: new THREE.Vector3(), sunDir: new THREE.Vector3(), bestPos: new THREE.Vector3() }), []);

  useFrame(({ camera }) => {
    const t = reducedMotion ? 0 : sceneClock.t;
    const cam = camera.position;
    const sunDist = cam.distanceTo(SUN);
    const sunAppR = SUN_R / sunDist;
    v.sunDir.copy(SUN).sub(cam).normalize();

    let best = 0;
    let bestR = SUN_R;
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
      if (tot > best) { best = tot; bestR = r; v.bestPos.copy(pos); }
    };
    if (satelliteRef?.current) consider(satelliteRef.current, MOON_R); // Earth's real Moon
    for (const p of PLANETS) consider(liveBodyPosition(p.id, t, v.occ), p.r);

    const force = typeof window !== "undefined" ? window.__forceEclipse : undefined;
    const totality = force != null ? force : best;
    if (eclipseRef) eclipseRef.current = totality;

    /* Centre the corona on the OCCLUDER (the dark planet) and size it to the
       planet, so its transparent core covers the silhouette and the bright ring
       sits OUTSIDE it. (Centring on the Sun drew the ring inside the planet —
       the "Sun seen through the planet" / "faded planet" bug.) */
    const occluded = best > 0.001;
    const cx = occluded ? v.bestPos : SUN;
    const r = occluded ? bestR : SUN_R;
    if (coronaRef.current) {
      coronaRef.current.position.copy(cx);
      coronaRef.current.scale.setScalar(r * 5.3);
      coronaRef.current.material.opacity = totality * 0.95;
      coronaRef.current.material.rotation += reducedMotion ? 0 : 0.0007;
      coronaRef.current.visible = totality > 0.01;
    }
    if (chromoRef.current) {
      chromoRef.current.position.copy(cx);
      chromoRef.current.scale.setScalar(r * 5.1);
      chromoRef.current.material.opacity = Math.max(0, totality - 0.4) * 1.4;
      chromoRef.current.visible = totality > 0.4;
    }
    if (glintRef.current) {
      const g = Math.max(0, 1 - Math.abs(totality - 0.85) / 0.12); // diamond-ring sliver
      glintRef.current.position.copy(cx);
      glintRef.current.scale.setScalar(r * 2.2);
      glintRef.current.material.opacity = g;
      glintRef.current.visible = g > 0.02;
    }
  });

  return (
    <group>
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
