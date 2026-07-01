 
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
const LEASH = 14; // max distance from the tour framing — keeps the pilot from getting lost
const EMPTY_THRUST = {};

const FreeRoam = ({ enabled, offsetRef, speedRef, thrustRef }) => {
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
    /* Start each flight from the tour framing. */
    offsetRef.current.set(0, 0, 0);
    const down = (e) => { keys.current[e.code] = true; };
    const upE = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", upE);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", upE);
    };
  }, [enabled, offsetRef]);

  useFrame((_, dt) => {
    const off = offsetRef.current;
    /* Auto-return: when not flying, glide the offset back to the tour framing. */
    if (!enabled) {
      if (off.lengthSq() > 1e-4) off.multiplyScalar(Math.pow(0.04, Math.min(dt, 1 / 20)));
      else off.set(0, 0, 0);
      if (speedRef) speedRef.current = 0;
      return;
    }
    const k = keys.current;
    const tr = thrustRef?.current || EMPTY_THRUST;
    const boost = k["ShiftLeft"] || k["ShiftRight"] || tr.boost ? BOOST : 1;
    const step = SPEED * boost * Math.min(dt, 1 / 20);

    camera.getWorldDirection(fwd.current);
    right.current.crossVectors(fwd.current, up.current).normalize();

    delta.current.set(0, 0, 0);
    if (k["KeyW"] || k["ArrowUp"] || tr.fwd) delta.current.addScaledVector(fwd.current, step);
    if (k["KeyS"] || k["ArrowDown"] || tr.back) delta.current.addScaledVector(fwd.current, -step);
    if (k["KeyD"] || k["ArrowRight"] || tr.right) delta.current.addScaledVector(right.current, step);
    if (k["KeyA"] || k["ArrowLeft"] || tr.left) delta.current.addScaledVector(right.current, -step);
    if (k["KeyE"] || k["Space"] || tr.up) delta.current.addScaledVector(up.current, step);
    if (k["KeyQ"] || tr.down) delta.current.addScaledVector(up.current, -step);

    off.add(delta.current);
    /* Leash — clamp to a sphere so you can explore but never get lost. */
    if (off.length() > LEASH) off.setLength(LEASH);
    if (speedRef) speedRef.current = delta.current.length() / Math.max(dt, 1e-3);
  });

  return null;
};

export default FreeRoam;
