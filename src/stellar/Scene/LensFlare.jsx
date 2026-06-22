/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Cinematic lens flare anchored at the sun.
 *
 * Two pieces:
 *   1. Anamorphic horizontal streak — long thin sprite across the
 *      sun's screen position. Reads as a true camera-lens artifact.
 *   2. Bokeh ghosts — three small coloured ring sprites placed along
 *      the line from the sun to the screen centre, mimicking light
 *      refraction through internal lens elements.
 *
 * Brightness fades as the sun moves off-screen (we use the camera's
 * forward vector vs sun direction to compute a falloff).
 */

const STREAK_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 32;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 16, 512, 16);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.3, "rgba(255,235,200,0.18)");
  g.addColorStop(0.5, "rgba(255,255,255,1)");
  g.addColorStop(0.7, "rgba(255,235,200,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
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
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,230,180,0.75)");
  g.addColorStop(0.4, "rgba(255,200,140,0.25)");
  g.addColorStop(1, "rgba(255,180,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const RING_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.translate(64, 64);
  for (let r = 28; r < 56; r++) {
    const a = 1 - Math.abs(r - 44) / 12;
    if (a <= 0) continue;
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.45})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const LensFlare = ({ position = [0, 0, 0] }) => {
  const streakRef = useRef();
  const glareRef = useRef();
  const ghostRefs = useRef([]);

  const sunPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const ndc = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const camFwd = useMemo(() => new THREE.Vector3(), []);
  const toSun = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    /* Reliable behind-check: dot(camera_forward, sun - camera_position).
       Positive = sun is in front of the camera. */
    camera.getWorldDirection(camFwd);
    toSun.subVectors(sunPos, camera.position).normalize();
    const forwardDot = camFwd.dot(toSun);
    const behind = forwardDot < 0.05; // very narrow FOV cone

    /* Project sun to NDC for screen-space ghost placement */
    ndc.copy(sunPos).project(camera);

    /* Falloff: only visible when sun is in front AND on screen */
    const r = Math.sqrt(ndc.x * ndc.x + ndc.y * ndc.y);
    const onScreen = !behind && r < 1.0;
    const visibility = onScreen ? Math.max(0, 1 - r) * forwardDot : 0;

    /* Place glare AT the sun in world space */
    if (glareRef.current) {
      glareRef.current.position.copy(sunPos);
      const m = glareRef.current.material;
      m.opacity = visibility * 0.55;
      glareRef.current.visible = visibility > 0.01;
    }

    /* Streak: world-space at sun position, oriented to face camera (sprite) */
    if (streakRef.current) {
      streakRef.current.position.copy(sunPos);
      streakRef.current.material.opacity = visibility * 0.45;
      streakRef.current.visible = visibility > 0.01;
    }

    /* Ghosts: placed along the line from sun screen-space → screen centre,
       cast back into world space at a constant depth from the camera. */
    ghostRefs.current.forEach((g, i) => {
      if (!g) return;
      const t = (i + 1) * 0.35;
      const gx = ndc.x * (1 - 2 * t);
      const gy = ndc.y * (1 - 2 * t);
      tmp.set(gx, gy, 0.85).unproject(camera);
      g.position.copy(tmp);
      g.material.opacity = visibility * (0.35 - i * 0.06);
      g.visible = visibility > 0.1;
    });
  });

  return (
    <group>
      {/* Big bright glare at the sun position */}
      <sprite ref={glareRef} scale={[4.0, 4.0, 1]}>
        <spriteMaterial
          map={GLARE_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* Wide anamorphic streak across the sun */}
      <sprite ref={streakRef} scale={[16, 0.22, 1]}>
        <spriteMaterial
          map={STREAK_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* Ghost rings along the lens axis — coloured, additive */}
      {["#ffd2a8", "#a8c8ff", "#d4a8ff"].map((color, i) => (
        <sprite
          key={i}
          ref={(el) => { ghostRefs.current[i] = el; }}
          scale={[0.8 + i * 0.25, 0.8 + i * 0.25, 1]}
        >
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
