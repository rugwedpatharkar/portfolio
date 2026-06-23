/* eslint-disable react/no-unknown-property, react/prop-types */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Free-look ship flight for game mode — proper space-sim controls:
 *   mouse / trackpad → look (yaw + pitch) via pointer lock (click the view to
 *     engage, Esc to release the cursor)
 *   W/S or ↑/↓       → thrust forward / back along the aim
 *   A/D or ←/→       → strafe left / right
 *   Space / C        → ascend / descend
 *   Shift            → boost
 * Owns the camera while enabled (CameraRig yields); bounded to a sphere around
 * the system so you can roam freely but never fall off the edge. Inits from the
 * current camera pose on enable so there's no jump after the warp-in.
 */

const SPEED = 10, BOOST = 2.8, BOUNDS = 58, LOOK_SENS = 0.0022, PITCH_MAX = 1.45, FOV = 72;
const CENTER = new THREE.Vector3(22, 0, 0);
/* Movement keys we own — preventDefault stops Space/arrows from page-scrolling
   the (Lenis-stopped) document behind the fixed canvas while flying. */
const HANDLED = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "KeyC", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"]);
const isText = (ev) => ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA");

const GameFlight = ({ enabled, speedRef, cameraRef, thrustRef }) => {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const yaw = useRef(0);
  const pitch = useRef(0);
  const pos = useRef(new THREE.Vector3());
  const locked = useRef(false);
  const inited = useRef(false);
  const prevFov = useRef(null);
  const q = useRef(new THREE.Quaternion());
  const e = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const fwd = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));
  const move = useRef(new THREE.Vector3());
  const fc = useRef(new THREE.Vector3());

  /* Init from the current camera pose on enable (no jump after warp-in). */
  useEffect(() => {
    if (!enabled) { inited.current = false; keys.current = {}; return undefined; }
    pos.current.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    yaw.current = Math.atan2(-dir.x, -dir.z);
    pitch.current = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
    prevFov.current = camera.fov;
    camera.fov = FOV;
    camera.updateProjectionMatrix();
    inited.current = true;
    return () => {
      if (prevFov.current != null) { camera.fov = prevFov.current; camera.updateProjectionMatrix(); }
    };
  }, [enabled, camera]);

  /* Keyboard thrust. */
  useEffect(() => {
    if (!enabled) return undefined;
    const down = (ev) => {
      if (isText(ev)) return;                 // yield to the palette search field
      if (HANDLED.has(ev.code)) ev.preventDefault();
      keys.current[ev.code] = true;
    };
    const upE = (ev) => { keys.current[ev.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", upE);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", upE); };
  }, [enabled]);

  /* Mouse-look via pointer lock — click the canopy to take the stick. */
  useEffect(() => {
    if (!enabled) return undefined;
    const el = gl.domElement;
    const onClick = () => { if (!locked.current) el.requestPointerLock?.(); };
    const onLockChange = () => { locked.current = document.pointerLockElement === el; };
    const onMove = (ev) => {
      if (!locked.current) return;
      yaw.current -= ev.movementX * LOOK_SENS;
      pitch.current = THREE.MathUtils.clamp(pitch.current - ev.movementY * LOOK_SENS, -PITCH_MAX, PITCH_MAX);
    };
    el.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMove);
      if (document.pointerLockElement === el) document.exitPointerLock?.();
      locked.current = false;
    };
  }, [enabled, gl]);

  useFrame((_, dt) => {
    if (!enabled || !inited.current) return;
    const d = Math.min(dt || 1 / 60, 1 / 20);

    e.current.set(pitch.current, yaw.current, 0);
    q.current.setFromEuler(e.current);
    camera.quaternion.copy(q.current);

    fwd.current.set(0, 0, -1).applyQuaternion(q.current);
    right.current.set(1, 0, 0).applyQuaternion(q.current);

    const k = keys.current;
    const tr = thrustRef?.current || {};
    const boost = k.ShiftLeft || k.ShiftRight || tr.boost ? BOOST : 1;
    const step = SPEED * boost * d;
    move.current.set(0, 0, 0);
    if (k.KeyW || k.ArrowUp || tr.fwd) move.current.addScaledVector(fwd.current, step);
    if (k.KeyS || k.ArrowDown || tr.back) move.current.addScaledVector(fwd.current, -step);
    if (k.KeyD || k.ArrowRight || tr.right) move.current.addScaledVector(right.current, step);
    if (k.KeyA || k.ArrowLeft || tr.left) move.current.addScaledVector(right.current, -step);
    if (k.Space || tr.up) move.current.addScaledVector(up.current, step);
    if (k.KeyC || tr.down) move.current.addScaledVector(up.current, -step);
    pos.current.add(move.current);

    /* Soft sphere bound around the system. */
    fc.current.copy(pos.current).sub(CENTER);
    if (fc.current.length() > BOUNDS) { fc.current.setLength(BOUNDS); pos.current.copy(CENTER).add(fc.current); }

    camera.position.copy(pos.current);
    if (cameraRef) cameraRef.current = camera;
    if (speedRef) speedRef.current = move.current.length() / Math.max(d, 1e-3);
  });

  return null;
};

export default GameFlight;
