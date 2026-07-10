/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Cinematic lens flare anchored at the sun.
 *
 * Physically, a real flare from a yellow-white star is dominated by WARM
 * white/amber light — only the horizontal anamorphic streak is the cool-blue
 * artifact that signature look comes from. So: a warm glare core + warm
 * starburst rays + a cool-blue anamorphic streak, plus faint chromatic-fringe
 * ghost rings (one warm, one neutral, one cool) strung along the lens axis.
 *
 * Brightness fades as the sun moves off-screen (camera forward vs sun
 * direction → falloff).
 */

const STREAK_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 32;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 16, 512, 16);
  g.addColorStop(0, "rgba(120,170,255,0)");
  g.addColorStop(0.32, "rgba(150,195,255,0.2)");
  g.addColorStop(0.5, "rgba(235,245,255,1)");
  g.addColorStop(0.68, "rgba(150,195,255,0.2)");
  g.addColorStop(1, "rgba(120,170,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 32);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const GLARE_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,250,242,1)");
  g.addColorStop(0.16, "rgba(255,232,196,0.7)");
  g.addColorStop(0.42, "rgba(255,206,150,0.24)");
  g.addColorStop(1, "rgba(255,196,140,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/* Radial starburst — the "rays". A few long prominent spikes plus many faint
   ones, blue-white, additive. */
const RAYS_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.translate(128, 128);
  const spokes = (count, maxLen, width, alpha, jitter) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + jitter;
      const len = maxLen * (0.62 + 0.38 * (((i * 53) % 11) / 11));
      const ex = Math.cos(a) * len;
      const ey = Math.sin(a) * len;
      const g = ctx.createLinearGradient(0, 0, ex, ey);
      g.addColorStop(0, `rgba(255,244,224,${alpha})`);
      g.addColorStop(0.4, `rgba(255,210,150,${alpha * 0.4})`);
      g.addColorStop(1, "rgba(255,200,140,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  };
  spokes(6, 126, 2.6, 0.9, 0.25); // long prominent spikes
  spokes(28, 96, 1.0, 0.38, 0.1); // dense faint rays
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
  cg.addColorStop(0, "rgba(255,246,228,0.9)");
  cg.addColorStop(0.5, "rgba(255,212,150,0.22)");
  cg.addColorStop(1, "rgba(255,212,150,0)");
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/* Concentric thin rings for the "chain-link" bokeh ghosts. White rings; the
   blue tint comes from each sprite's color. */
const RING_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.translate(64, 64);
  for (let r = 28; r < 56; r++) {
    const a = 1 - Math.abs(r - 44) / 12;
    if (a <= 0) continue;
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.5})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/* Chromatic-fringe ghosts: one warm, one neutral, one cool (real lens dispersion),
   not a uniform blue. */
const GHOST_COLORS = ["#ffd9b0", "#d6d6d6", "#a8c8ff"];

const LensFlare = ({ position = [0, 0, 0] }) => {
  const streakRef = useRef();
  const glareRef = useRef();
  const raysRef = useRef();
  const ghostRefs = useRef([]);

  const sunPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const ndc = useMemo(() => new THREE.Vector3(), []);
  const camFwd = useMemo(() => new THREE.Vector3(), []);
  const toSun = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    /* Reliable behind-check: dot(camera_forward, sun - camera_position).
       Positive = sun is in front of the camera. */
    camera.getWorldDirection(camFwd);
    toSun.subVectors(sunPos, camera.position).normalize();
    const forwardDot = camFwd.dot(toSun);
    const behind = forwardDot < 0.05; // very narrow FOV cone

    /* Project sun to NDC for screen-space placement */
    ndc.copy(sunPos).project(camera);

    /* Falloff: only visible when sun is in front AND on screen */
    const r = Math.sqrt(ndc.x * ndc.x + ndc.y * ndc.y);
    const onScreen = !behind && r < 1.0;
    const visibility = onScreen ? Math.max(0, 1 - r) * forwardDot : 0;
    /* Fade the whole flare out in the pulled-back overview (low FOV magnifies
       it and the sun is tiny there): full at the tour's ~44-60° FOV, gone by
       the overview's 34°. */
    const fovFade = Math.max(0, Math.min(1, (camera.fov - 36) / 12));
    const vis = visibility * fovFade;
    const on = vis > 0.01;

    if (glareRef.current) {
      glareRef.current.position.copy(sunPos);
      glareRef.current.material.opacity = vis * 1.0;
      glareRef.current.visible = on;
    }
    if (raysRef.current) {
      raysRef.current.position.copy(sunPos);
      raysRef.current.material.opacity = vis * 0.94;
      /* No auto-spin: real diffraction spikes are fixed to the lens, not slowly
         rotating on their own (that read as a 'magic glow'). */
      raysRef.current.visible = on;
    }
    if (streakRef.current) {
      streakRef.current.position.copy(sunPos);
      streakRef.current.material.opacity = vis * 0.64;
      streakRef.current.visible = on;
    }
    /* Chain-link bokeh ghosts strung along the sun→screen-centre axis, cast
       back into world space at a constant camera depth. */
    ghostRefs.current.forEach((g, i) => {
      if (!g) return;
      const tg = (i + 1) * 0.35;
      tmp.set(ndc.x * (1 - 2 * tg), ndc.y * (1 - 2 * tg), 0.85).unproject(camera);
      g.position.copy(tmp);
      /* Subtle — a lens artifact, not a feature. (The wide overview's narrow
         FOV magnifies them, so keep them faint.) */
      g.material.opacity = vis * (0.24 - i * 0.05);
      g.visible = vis > 0.04;
    });
  });

  return (
    <group>
      {/* Blue glare core at the sun */}
      <sprite ref={glareRef} scale={[5.6, 5.6, 1]}>
        <spriteMaterial
          map={GLARE_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* Radial starburst rays */}
      <sprite ref={raysRef} scale={[10.5, 10.5, 1]}>
        <spriteMaterial
          map={RAYS_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* Wide anamorphic blue streak */}
      <sprite ref={streakRef} scale={[24, 0.3, 1]}>
        <spriteMaterial
          map={STREAK_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* Chain-link bokeh ghost rings strung along the lens axis — blue, additive */}
      {GHOST_COLORS.map((color, i) => (
        <sprite key={i} ref={(el) => { ghostRefs.current[i] = el; }} scale={[0.66 + i * 0.2, 0.66 + i * 0.2, 1]}>
          <spriteMaterial
            map={RING_TEXTURE}
            color={color}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
};

export default LensFlare;
