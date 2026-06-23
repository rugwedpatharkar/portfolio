/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Cinematic lens flare anchored at the sun.
 *
 * A blue anamorphic flare: a soft glare core, a radial starburst of rays,
 * and a wide horizontal streak — all tinted cool blue so they read as a
 * lens artifact over the warm sun (the JJ-Abrams blue-flare look). The bokeh
 * "chain-link" ghost rings stay removed (they cluttered the frame); this is
 * the glare + rays + streak only.
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
  g.addColorStop(0, "rgba(245,250,255,1)");
  g.addColorStop(0.16, "rgba(170,205,255,0.7)");
  g.addColorStop(0.42, "rgba(110,165,255,0.24)");
  g.addColorStop(1, "rgba(90,150,255,0)");
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
      g.addColorStop(0, `rgba(215,232,255,${alpha})`);
      g.addColorStop(0.4, `rgba(120,180,255,${alpha * 0.4})`);
      g.addColorStop(1, "rgba(90,150,255,0)");
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
  cg.addColorStop(0, "rgba(225,238,255,0.9)");
  cg.addColorStop(0.5, "rgba(130,185,255,0.22)");
  cg.addColorStop(1, "rgba(130,185,255,0)");
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

const GHOST_COLORS = ["#a8c8ff", "#7fb0ff", "#bcd6ff"];

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
    const on = visibility > 0.01;

    if (glareRef.current) {
      glareRef.current.position.copy(sunPos);
      glareRef.current.material.opacity = visibility * 0.6;
      glareRef.current.visible = on;
    }
    if (raysRef.current) {
      raysRef.current.position.copy(sunPos);
      raysRef.current.material.opacity = visibility * 0.5;
      raysRef.current.material.rotation += 0.0016; // slow living spin
      raysRef.current.visible = on;
    }
    if (streakRef.current) {
      streakRef.current.position.copy(sunPos);
      streakRef.current.material.opacity = visibility * 0.5;
      streakRef.current.visible = on;
    }
    /* Chain-link bokeh ghosts strung along the sun→screen-centre axis, cast
       back into world space at a constant camera depth. */
    ghostRefs.current.forEach((g, i) => {
      if (!g) return;
      const tg = (i + 1) * 0.35;
      tmp.set(ndc.x * (1 - 2 * tg), ndc.y * (1 - 2 * tg), 0.85).unproject(camera);
      g.position.copy(tmp);
      g.material.opacity = visibility * (0.4 - i * 0.07);
      g.visible = visibility > 0.05;
    });
  });

  return (
    <group>
      {/* Blue glare core at the sun */}
      <sprite ref={glareRef} scale={[4.4, 4.4, 1]}>
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
      <sprite ref={raysRef} scale={[8.5, 8.5, 1]}>
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
      <sprite ref={streakRef} scale={[18, 0.24, 1]}>
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
        <sprite key={i} ref={(el) => { ghostRefs.current[i] = el; }} scale={[0.85 + i * 0.28, 0.85 + i * 0.28, 1]}>
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
