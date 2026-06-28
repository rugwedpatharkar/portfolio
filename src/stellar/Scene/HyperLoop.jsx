/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Hyperloop — Stellar Command's light-tunnel for a lane jump. A static field of
 * thin glowing rods rides just ahead of the camera and rushes toward it while
 * warpVelRef is hot, so the streaks perspective-stretch from a dark centre out
 * past the screen edges, then collapse back as the jump ends.
 *
 * Rods are an INSTANCED thin-box mesh (one draw call) so the streaks have real
 * LENGTH and THICKNESS — plain WebGL LineSegments are locked to 1px regardless of
 * linewidth. In-scene additive (NOT a postprocessing pass — that rule is sacred);
 * toneMapped:false so the existing Bloom fuses the rods into a glowing tube. The
 * dark "smudged black" surround for the pipe is the uWarp term folded into the
 * single CinematicGrade pass (driven by the same warpVelRef).
 */

const COUNT = 1600;
const RADIUS = 2.2;  // lateral spread → streaks reach the corners
const DEPTH = 56;    // how far ahead the streaks live
const NEAR = 1.0;    // closest streaks (they stretch past the edges)
const LEN = 3.4;     // streak length along the view (longer than the old 2.6)
const THICK = 0.045; // streak thickness in world units (a touch fat for a glowing rod)

export default function HyperLoop({ warpVelRef, color = "#8fcfff" }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const meshRef = useRef();
  const matRef = useRef();
  const cur = useRef(0); // eased intensity
  const zOff = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const streaks = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      /* bias the radius outward (sqrt of a floored random) so the very centre stays
         empty — the dark hole of the tube. */
      const rr = RADIUS * Math.sqrt(0.05 + 0.95 * Math.random());
      arr[i * 3] = Math.cos(a) * rr;
      arr[i * 3 + 1] = Math.sin(a) * rr;
      arr[i * 3 + 2] = -(NEAR + Math.random() * DEPTH); // ahead of the camera (-z)
    }
    return arr;
  }, []);

  useLayoutEffect(() => {
    const m = meshRef.current;
    if (!m) return;
    for (let i = 0; i < COUNT; i++) {
      /* centre the rod on its segment so it spans [z, z+LEN] like the old streak. */
      dummy.position.set(streaks[i * 3], streaks[i * 3 + 1], streaks[i * 3 + 2] + LEN / 2);
      dummy.scale.set(THICK, THICK, LEN);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [streaks, dummy]);

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
    if (meshRef.current) meshRef.current.position.z = zOff.current;
    if (matRef.current) matRef.current.opacity = Math.min(1, cur.current);
  });

  return (
    <group ref={groupRef} visible={false} renderOrder={9999} frustumCulled={false}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          ref={matRef}
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
