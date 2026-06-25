/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * Sun-direction key light + shadow caster.
 *
 * The light DIRECTION is fixed (SUN_DIR, matching the atmosphere + grade)
 * so surfaces are lit consistently. But for crisp shadows across a scene
 * that spans 45 world units, the shadow camera FOLLOWS the active planet:
 * each frame we re-aim the light at the framed planet's live orbital
 * position and sit it a fixed distance back along SUN_DIR. The ortho
 * frustum is tight (±8) so a 1024 map gives sharp shadows — and because
 * only the active planet (+ its moons/rings) falls inside that frustum,
 * the shadow pass stays cheap regardless of how many planets exist.
 *
 * Gives the iconic Saturn ring-shadow band, moons dotting shadows on
 * their planet, and crisp terminator shading. Desktop-only (castShadow
 * gated by the caller).
 */

const D = 28; // distance back along the light direction
const FILL_D = 24; // fill sits on the anti-sun (camera) side
const _active = new THREE.Vector3();
const _sunward = new THREE.Vector3();

const KeyLight = ({ scrollT, castShadow = true }) => {
  const lightRef = useRef();
  const fillRef = useRef();
  const clock = useSceneClock();

  useFrame(() => {
    const light = lightRef.current;
    if (!light) return;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);
    const idx = Math.round(rawT * (DESTINATIONS.length - 1));
    orbitalPosition(DESTINATIONS[idx], clock.t, _active);
    /* PHYSICAL lighting: the light comes FROM the Sun (origin) → the planet's
       sun-facing side is lit, the far side falls to night → real phases. Sit
       the shadow caster on the sun side, aimed back at the planet. */
    _sunward.copy(_active).normalize();
    light.position.copy(_active).addScaledVector(_sunward, -D);
    light.target.position.copy(_active);
    light.target.updateMatrixWorld();
    /* Fill from the ANTI-sun (camera) side: the default hero shot is backlit, so
       a gentle fill keeps the camera-facing night side's surface readable while
       the Sun-side limb stays the bright, sculpted edge. Dims with the scene at
       eclipse totality (EclipseLights touches all lights). */
    const fill = fillRef.current;
    if (fill) {
      fill.position.copy(_active).addScaledVector(_sunward, FILL_D);
      fill.target.position.copy(_active);
      fill.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        intensity={1.2}
        color="#fff2d8"
        castShadow={castShadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={D * 2 + 14}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      <directionalLight ref={fillRef} intensity={0.5} color="#cdd9f2" />
    </>
  );
};

export default KeyLight;
