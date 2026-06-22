/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { SUN_DIR } from "./AtmosphereGlow";

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
const _active = new THREE.Vector3();

const KeyLight = ({ scrollT, castShadow = true }) => {
  const lightRef = useRef();

  useFrame(({ clock }) => {
    const light = lightRef.current;
    if (!light) return;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);
    const idx = Math.round(rawT * (DESTINATIONS.length - 1));
    orbitalPosition(DESTINATIONS[idx], clock.elapsedTime, _active);
    light.position.copy(_active).addScaledVector(SUN_DIR, D);
    light.target.position.copy(_active);
    light.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={1.2}
      color="#fff2d8"
      castShadow={castShadow}
      shadow-mapSize-width={512}
      shadow-mapSize-height={512}
      shadow-camera-near={1}
      shadow-camera-far={D * 2 + 14}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-bias={-0.0006}
      shadow-normalBias={0.02}
    />
  );
};

export default KeyLight;
