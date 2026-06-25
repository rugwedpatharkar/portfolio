/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Hyperloop — Stellar Command's light-tunnel for a lane jump. Authored fresh for
 * the new look (hologram blue-white #8fcfff, dark centre hole). A static cylinder
 * of thin streaks rides just ahead of the camera and rushes toward it while
 * warpVelRef is hot, so the lines perspective-stretch from a dark centre out past
 * the screen edges, then collapse back to points as the jump ends.
 *
 * In-scene additive LineSegments (NOT a postprocessing pass — that rule is
 * sacred); toneMapped:false so the existing Bloom turns the lines into a glowing
 * tube. Cheap: the streak field is built once; only a group transform animates.
 */

const COUNT = 1600;
const RADIUS = 2.2; // lateral spread → streaks reach the corners
const DEPTH = 56; // how far ahead the streaks live
const NEAR = 1.0; // closest streaks (they stretch past the edges)
const LEN = 2.6; // streak length along the view

export default function HyperLoop({ warpVelRef, color = "#8fcfff" }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const linesRef = useRef();
  const matRef = useRef();
  const cur = useRef(0); // eased intensity
  const zOff = useRef(0);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 6); // 2 endpoints per streak
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      /* bias the radius outward (sqrt of a floored random) so the very centre
         stays empty — the dark hole of the tube. */
      const rr = RADIUS * Math.sqrt(0.05 + 0.95 * Math.random());
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      const z = -(NEAR + Math.random() * DEPTH); // ahead of the camera (-z)
      const o = i * 6;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
      pos[o + 3] = x; pos[o + 4] = y; pos[o + 5] = z + LEN;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    const target = warpVelRef?.current || 0;
    /* punch in fast, ease out gentle → the classic jump-in / collapse-out. */
    cur.current += (target - cur.current) * (target > cur.current ? 0.16 : 0.08);
    const grp = groupRef.current;
    if (!grp) return;
    const on = cur.current > 0.01;
    grp.visible = on;
    if (!on) return;
    /* ride just ahead of the camera, oriented to the view. */
    grp.position.copy(camera.position);
    grp.quaternion.copy(camera.quaternion);
    /* rush the streaks toward the camera; loop within the field depth. */
    zOff.current = (zOff.current + dt * 46 * Math.min(cur.current, 1.5)) % DEPTH;
    if (linesRef.current) linesRef.current.position.z = zOff.current;
    if (matRef.current) matRef.current.opacity = Math.min(1, cur.current);
  });

  return (
    <group ref={groupRef} visible={false} renderOrder={9999} frustumCulled={false}>
      <lineSegments ref={linesRef} geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={matRef}
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}
