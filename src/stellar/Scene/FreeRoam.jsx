/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * WASD + arrow free-roam. When enabled, keystrokes accumulate into
 * an offset that CameraRig adds on top of its scroll-driven position.
 * Movement is camera-relative: W flies forward along the look vector.
 *
 * Q / E = down / up. Shift = boost. Esc on the parent toggles off.
 */

const SPEED = 6.0;
const BOOST = 2.5;

const FreeRoam = ({ enabled, offsetRef }) => {
  const keys = useRef({});
  const { camera } = useThree();
  const fwd = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));
  const delta = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!enabled) {
      keys.current = {};
      return;
    }
    const down = (e) => { keys.current[e.code] = true; };
    const upE = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", upE);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", upE);
    };
  }, [enabled]);

  useFrame((_, dt) => {
    if (!enabled) return;
    const k = keys.current;
    const boost = k["ShiftLeft"] || k["ShiftRight"] ? BOOST : 1;
    const step = SPEED * boost * dt;

    camera.getWorldDirection(fwd.current);
    right.current.crossVectors(fwd.current, up.current).normalize();

    delta.current.set(0, 0, 0);
    if (k["KeyW"] || k["ArrowUp"]) delta.current.addScaledVector(fwd.current, step);
    if (k["KeyS"] || k["ArrowDown"]) delta.current.addScaledVector(fwd.current, -step);
    if (k["KeyD"] || k["ArrowRight"]) delta.current.addScaledVector(right.current, step);
    if (k["KeyA"] || k["ArrowLeft"]) delta.current.addScaledVector(right.current, -step);
    if (k["KeyE"] || k["Space"]) delta.current.addScaledVector(up.current, step);
    if (k["KeyQ"]) delta.current.addScaledVector(up.current, -step);

    offsetRef.current.add(delta.current);
  });

  return null;
};

export default FreeRoam;
