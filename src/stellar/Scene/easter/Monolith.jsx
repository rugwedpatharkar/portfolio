/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — THE MONOLITH (2001: A Space Odyssey). A perfectly black slab
 * in the exact ratio 1 : 4 : 9 (the squares of the first three integers), turning
 * silently in the dark. Rendered as a near-black metallic box that catches a thin
 * specular glint on its edges + a faint outline so its silhouette reads against the
 * stars. Diegetic cameo — scannable, never alters physics. Frozen on RM.
 */

export const MONOLITH_RAW = [-56, 8, -36];

export default function Monolith({ animate = true }) {
  const ref = useRef();
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(MONOLITH_RAW))), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 2.4, 5.4)), []);

  useFrame((_, dt) => {
    if (animate && ref.current) ref.current.rotation.y += dt * 0.05;
  });

  return (
    <group position={pos}>
      <group ref={ref} rotation={[0.1, 0.6, 0.04]}>
        {/* the slab — 1:4:9, near-black but metallic so edges catch a glint */}
        <mesh>
          <boxGeometry args={[0.6, 2.4, 5.4]} />
          <meshStandardMaterial color="#05060a" metalness={0.92} roughness={0.22} envMapIntensity={0.6} />
        </mesh>
        {/* faint outline so the silhouette reads against the starfield */}
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#3a4a6a" transparent opacity={0.6} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
}
