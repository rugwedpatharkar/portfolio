/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * A periodic solar eclipse over the sun.
 *
 * A dark moon disc drifts across the camera→sun sightline. It's pure black,
 * so against empty space it's invisible — you only see it as a dark bite out
 * of the bright sun as it transits, exactly like a real eclipse. At totality
 * a cool corona ring + diamond-ring glint flare around the silhouette.
 *
 * Cheap: one unlit sphere + two billboards, driven by screen-space alignment
 * so it stays correct under camera parallax. Frozen under reduced-motion.
 */

const CORONA_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  /* Bright inner ring (the sun's edge) fading to a soft outer glow. */
  const g = ctx.createRadialGradient(128, 128, 46, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.38, "rgba(255,255,255,0)");
  g.addColorStop(0.46, "rgba(236,245,255,0.95)");
  g.addColorStop(0.56, "rgba(175,208,255,0.4)");
  g.addColorStop(1, "rgba(135,182,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  /* Irregular radial streamers — the real corona's wispy spikes. */
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
})();

/* Thin reddish chromosphere ring that flashes at the sun's limb at totality. */
const CHROMO_TEXTURE = (() => {
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
})();

const GLINT_TEXTURE = (() => {
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
})();

const SUN = new THREE.Vector3(0, 0, 0);
/* The transit crossing point sits on the hero camera→sun sightline, so the
   moon lands dead-centre on the sun at totality. */
const CROSS_Y = 0.96;
const CROSS_Z = 4.2;
const SWEEP_X = 8.5;

const SolarEclipse = ({ period = 22, reducedMotion = false }) => {
  const moonRef = useRef();
  const coronaRef = useRef();
  const chromoRef = useRef();
  const glintRef = useRef();
  const _m = useMemo(() => new THREE.Vector3(), []);
  const _s = useMemo(() => new THREE.Vector3(), []);
  const sceneClock = useSceneClock();

  useFrame(({ camera }) => {
    /* Phase 0..1; ph=0.5 is totality. A window override lets us pin a phase
       for visual verification; otherwise it's clock-driven (frozen if the
       user prefers reduced motion). */
    const override = typeof window !== "undefined" ? window.__eclipsePhase : undefined;
    const ph =
      override != null
        ? override
        : reducedMotion
          ? 0.18 // a static, far-from-totality partial when motion is reduced
          : (sceneClock.t % period) / period;

    const mx = (ph * 2 - 1) * SWEEP_X; // linear sweep -SWEEP_X..SWEEP_X
    if (moonRef.current) moonRef.current.position.set(mx, CROSS_Y, CROSS_Z);

    /* Totality from screen-space distance between moon + sun (parallax-safe). */
    _m.set(mx, CROSS_Y, CROSS_Z).project(camera);
    _s.copy(SUN).project(camera);
    const d = Math.hypot(_m.x - _s.x, _m.y - _s.y);
    const totality = Math.max(0, 1 - d / 0.11);

    if (coronaRef.current) {
      coronaRef.current.position.copy(SUN);
      coronaRef.current.material.opacity = totality * 0.95;
      coronaRef.current.material.rotation += reducedMotion ? 0 : 0.0008;
      coronaRef.current.visible = totality > 0.01;
    }
    if (chromoRef.current) {
      chromoRef.current.position.copy(SUN);
      chromoRef.current.material.opacity = totality * 0.85;
      chromoRef.current.visible = totality > 0.2;
    }
    if (glintRef.current) {
      /* Diamond-ring glint: a bright point that peaks just off perfect
         alignment (the last/first sliver of sun). */
      const glint = Math.max(0, 1 - Math.abs(totality - 0.82) / 0.12);
      glintRef.current.position.copy(SUN);
      glintRef.current.material.opacity = glint;
      glintRef.current.visible = glint > 0.02;
    }
  });

  return (
    <group>
      <mesh ref={moonRef}>
        {/* Sized so the moon fully covers the sun's disc at totality (total
            eclipse — black disc + corona), not an annular ring. */}
        <sphereGeometry args={[0.98, 48, 48]} />
        <meshBasicMaterial color="#04050a" />
      </mesh>
      <sprite ref={chromoRef} scale={[5.7, 5.7, 1]}>
        <spriteMaterial
          map={CHROMO_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={coronaRef} scale={[6.0, 6.0, 1]}>
        <spriteMaterial
          map={CORONA_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={glintRef} scale={[1.5, 1.5, 1]}>
        <spriteMaterial
          map={GLINT_TEXTURE}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};

export default SolarEclipse;
