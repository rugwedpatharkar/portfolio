/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { placeInFrontOfSun } from "../../config/destinations";
import { nearCamera } from "../shared/hooks";

/*
 * PHASE 4 (Wave 2) — COSMIC-WEB STRUCTURES as faint galaxy fields:
 *  • void      — the Boötes Void: a ~330-Mly near-empty bubble; galaxies cling
 *                only to its distant rim. "If the Milky Way sat here we'd not have
 *                known of other galaxies until the 1960s."
 *  • attractor — the Great Attractor at the heart of Laniakea, pulling our whole
 *                supercluster of 100,000 galaxies toward it at ~600 km/s.
 *  • wall      — the Hercules–Corona Borealis Great Wall: the largest known
 *                structure, ~10 billion light-years of galaxies.
 * Each is a cloud of faint galaxy points in the right distribution + a soft glow,
 * turning slowly. Registered in objects.js (scan) + explorer.js. Frozen on RM.
 */

const buildField = (kind, n, R) => {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    let x, y, z;
    if (kind === "void") {
      const r = R * (0.82 + Math.random() * 0.18); // thick rim, empty interior
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * 0.7; z = r * Math.sin(ph) * Math.sin(th);
    } else if (kind === "attractor") {
      const r = R * Math.sqrt(Math.random()); // denser toward the centre
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * 0.6; z = r * Math.sin(ph) * Math.sin(th);
    } else {
      x = (Math.random() - 0.5) * R * 2.4; // an elongated sheet
      y = (Math.random() - 0.5) * R * 0.5;
      z = (Math.random() - 0.5) * R * 0.9;
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    c.setHSL(0.6 - Math.random() * 0.12, 0.4, 0.55 + Math.random() * 0.25);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
};

export default function CosmicMarker({ raw = [0, 0, 0], kind = "wall", count = 700, radius = 10, glow = "#9fb6ff", animate = true }) {
  const grp = useRef();
  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(raw)), [raw]);
  const geo = useMemo(() => buildField(kind, count, radius), [kind, count, radius]);

  useFrame(({ camera }, dt) => {
    if (!nearCamera(camera, pos, 500)) return;
    if (animate && grp.current) grp.current.rotation.y += dt * 0.008;
  });

  return (
    <group ref={grp} position={pos}>
      <points geometry={geo}>
        <pointsMaterial size={0.14} sizeAttenuation vertexColors transparent opacity={0.78} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {kind === "attractor" && (
        <mesh>
          <sphereGeometry args={[radius * 0.16, 18, 18]} />
          <meshBasicMaterial color={glow} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
