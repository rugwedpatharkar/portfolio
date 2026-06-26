import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
 * Stellar glare — diegetic "the star floods the cockpit" light.
 *
 * The 3D LensFlare only fires when the Sun is in FRONT of the camera, but the
 * planet-focus framing parks the camera sunward of each body looking OUTWARD
 * (Sun behind it). So on an inward approach the star's light should still spill
 * across the canopy from behind. This is a single GPU-cheap DOM layer
 * (transform + opacity only, `screen` blend) driven by the live camera:
 *
 *   - proximity:  bright in the inner system, gone by Jupiter
 *   - direction:  a tighter, brighter bloom positioned ON the Sun when it's in
 *                 view (complements the 3D flare); a soft diffuse wash when the
 *                 Sun is behind/off-screen
 *   - warp:       blooms on a hop (warpVelRef) so diving toward the star flares
 *
 * Sits below the HUD chrome (zIndex 12) so text stays crisp; `screen` blend
 * brightens the scene canvas behind it without ever fully whiting out.
 */

const _sun = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _toSun = new THREE.Vector3();

const StellarGlare = ({ cameraRef, warpVelRef, reducedMotion = false }) => {
  const ref = useRef(null);
  const cur = useRef({ op: 0, x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const cam = cameraRef?.current;
      if (!cam) return;

      const W = window.innerWidth;
      const H = window.innerHeight;
      const camd = cam.position.length();
      /* Inner system glows; faded out by ~Jupiter (camd ~260). */
      const prox = Math.max(0, Math.min(1, (190 - camd) / 160));

      cam.getWorldDirection(_fwd);
      _toSun.copy(cam.position).negate(); // origin - camPos
      if (_toSun.lengthSq() > 1e-6) _toSun.normalize();
      const fdot = _fwd.dot(_toSun); // >0: Sun in front of camera
      _sun.set(0, 0, 0).project(cam);
      const inView = fdot > 0 && Math.abs(_sun.x) < 1.25 && Math.abs(_sun.y) < 1.25;

      /* Target screen position + spread. On the Sun when visible (tight, bright);
         a broad wash low on the canopy when the Sun is behind you. */
      let tx, ty, tscale;
      if (inView) {
        tx = (_sun.x * 0.5 + 0.5) * W;
        ty = (1 - (_sun.y * 0.5 + 0.5)) * H;
        tscale = 0.62;
      } else {
        tx = W * 0.5;
        ty = H * 1.04; // light bleeding up from behind/below the canopy
        tscale = 1.25;
      }

      const warp = reducedMotion ? 0 : Math.min(1, Math.abs(warpVelRef?.current || 0));
      const view = prox * Math.max(0, fdot) * 1.35; // extra when staring at the star
      const target = Math.max(0, Math.min(1, prox * 0.4 + view + warp * prox * 0.8));

      const c = cur.current;
      const a = 0.1; // smoothing
      c.op += (target - c.op) * a;
      c.x += (tx - c.x) * a;
      c.y += (ty - c.y) * a;
      c.scale += (tscale - c.scale) * a;

      el.style.opacity = (c.op * 0.6).toFixed(3);
      el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) translate(-50%, -50%) scale(${c.scale.toFixed(3)})`;
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [cameraRef, warpVelRef, reducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "120vmax",
        height: "120vmax",
        borderRadius: "50%",
        /* warm K-type starlight: hot core → amber falloff → nothing */
        background:
          "radial-gradient(circle, rgba(255,243,222,0.9) 0%, rgba(255,221,164,0.42) 11%, rgba(255,189,130,0.14) 30%, rgba(255,170,110,0.04) 46%, rgba(255,160,100,0) 60%)",
        zIndex: 12,
        pointerEvents: "none",
        opacity: 0,
        mixBlendMode: "screen",
        willChange: "transform, opacity",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

export default StellarGlare;
