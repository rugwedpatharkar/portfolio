/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Camera-like auto-exposure.
 *
 * A real lens/eye stops DOWN when you swing toward the blazing sun and
 * opens UP in dark space. We approximate the "metered scene brightness"
 * cheaply (no GPU read-back) from how centred + close the sun is to the
 * view: the more you stare into the sun, the lower the exposure.
 *
 * Driven on gl.toneMappingExposure (renderer side) rather than a
 * post-processing pass — a ToneMapping/AutoExposure EffectPass would be a
 * second "mainImage" effect and re-trigger the white-frame merge bug
 * (see CinematicGrade.jsx). Eased so it breathes, never snaps.
 */

const EXP_DARK = 1.15; // open aperture — deep space
const EXP_SUN = 0.68; // stopped down — staring at the sun
const EASE_60 = 0.05;

const _fwd = new THREE.Vector3();
const _toSun = new THREE.Vector3();

const AutoExposure = () => {
  const { gl, camera } = useThree();
  const started = useRef(false);

  useFrame((_, dt) => {
    camera.getWorldDirection(_fwd);
    _toSun.copy(camera.position).negate().normalize(); // sun at origin
    const aim = Math.max(0, _fwd.dot(_toSun)); // 1 = looking straight at sun
    const proximity = THREE.MathUtils.clamp(1 - camera.position.length() / 60, 0, 1);
    const sun = Math.pow(aim, 1.4) * proximity; // 0..1 "sun is dominating the frame"

    const target = THREE.MathUtils.lerp(EXP_DARK, EXP_SUN, sun);
    if (!started.current) {
      gl.toneMappingExposure = target;
      started.current = true;
      return;
    }
    const d = Math.min(dt || 1 / 60, 1 / 20);
    const a = 1 - Math.pow(1 - EASE_60, d * 60);
    gl.toneMappingExposure += (target - gl.toneMappingExposure) * a;
  });

  return null;
};

export default AutoExposure;
