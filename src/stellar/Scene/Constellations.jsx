/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A handful of named constellations drawn as thin glowing line segments
 * far out on the skybox sphere. They fade in when the camera has been
 * still for ~600 ms and out the moment the scroll resumes.
 *
 * Points are stylised representations, not astronomically precise —
 * the goal is recognition (Orion's belt is three dots in a line; the
 * Plough is a saucepan shape), not accuracy.
 */

const SKY_R = 380;

const sph = (azimuthDeg, polarDeg) => {
  /* Spherical-to-Cartesian: az 0=+X, polar 90=horizon */
  const az = (azimuthDeg * Math.PI) / 180;
  const po = (polarDeg * Math.PI) / 180;
  return new THREE.Vector3(
    SKY_R * Math.sin(po) * Math.cos(az),
    SKY_R * Math.cos(po),
    SKY_R * Math.sin(po) * Math.sin(az)
  );
};

/* Constellations: ordered point chains. Drawn as a polyline. */
const SHAPES = [
  {
    name: "Orion",
    points: [
      sph(85, 70), sph(80, 76), sph(76, 82), // Belt
      sph(70, 60), // Right shoulder
      sph(95, 60), // Left shoulder
      sph(75, 92), // Right foot
      sph(86, 96), // Mid
      sph(98, 92), // Left foot
    ],
    /* Draw order is two polylines to look like Orion */
    polylines: [
      [0, 1, 2], // belt
      [3, 0], [4, 2], // shoulders to belt
      [5, 3], [6, 0], [7, 4], // body to legs
    ],
  },
  {
    name: "Big Dipper",
    points: [
      sph(200, 50), sph(210, 55), sph(220, 50), sph(230, 60),
      sph(240, 70), sph(250, 75), sph(260, 65),
    ],
    polylines: [[0, 1, 2, 3, 4, 5, 6]],
  },
  {
    name: "Cassiopeia",
    points: [
      sph(310, 40), sph(320, 50), sph(330, 38), sph(340, 50), sph(350, 40),
    ],
    polylines: [[0, 1, 2, 3, 4]],
  },
];

const Constellations = ({ scrollTRef }) => {
  const groupRef = useRef();
  const lastT = useRef(0);
  const stillSince = useRef(0);
  const targetOpacity = useRef(0);
  const currentOpacity = useRef(0);

  const lineGroups = useMemo(() => SHAPES.map((s) => {
    const groups = [];
    s.polylines.forEach((indices) => {
      const verts = new Float32Array(indices.length * 3);
      indices.forEach((idx, j) => {
        const p = s.points[idx];
        verts[j * 3 + 0] = p.x;
        verts[j * 3 + 1] = p.y;
        verts[j * 3 + 2] = p.z;
      });
      groups.push(verts);
    });
    return groups;
  }), []);

  useFrame(({ clock }) => {
    const t = scrollTRef.current ?? 0;
    const dt = Math.abs(t - lastT.current);
    lastT.current = t;
    const now = clock.elapsedTime;
    if (dt > 0.0005) {
      stillSince.current = now;
      targetOpacity.current = 0;
    } else if (now - stillSince.current > 0.6) {
      targetOpacity.current = 0.55;
    }
    currentOpacity.current += (targetOpacity.current - currentOpacity.current) * 0.06;
    if (groupRef.current) {
      groupRef.current.traverse((o) => {
        if (o.material) o.material.opacity = currentOpacity.current;
      });
      groupRef.current.visible = currentOpacity.current > 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {lineGroups.map((groups, si) => (
        <group key={si}>
          {groups.map((verts, gi) => (
            <line key={gi}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={verts.length / 3} array={verts} itemSize={3} />
              </bufferGeometry>
              <lineBasicMaterial color="#7faaff" transparent opacity={0} linewidth={1} depthWrite={false} />
            </line>
          ))}
        </group>
      ))}
    </group>
  );
};

export default Constellations;
