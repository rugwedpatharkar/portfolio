/* eslint-disable react/no-unknown-property */
import * as THREE from "three";

/*
 * PHASE 2A — characterful lane models. The résumé items along a planet's orbital
 * lane were identical octahedra; now each `kind` (set in data/sectionItems.js)
 * gets a distinct, recognisable silhouette built from primitives so every ←→
 * object reads as a *moment*:
 *
 *   station  (experience)   research platform — module + solar wings + dish
 *   probe    (projects)     survey craft — body + sensor dish + boom
 *   moon     (skills/edu)   a real little world — cratered grey sphere
 *   beacon   (achievement)  a glowing marker pylon
 *   relay    (testimonial)  comms dish on a mast
 *   drone    (hobby)        quad survey drone
 *   log      (notes)        data tablet panel
 *   fact     (funfacts)     a data mote in a signal ring
 *   dossier  (about)        crew capsule
 *
 * Materials key off `active` (amber-lit + bright when focused, cool blue when not)
 * so the convoy still reads at a glance. Only the active section mounts (a handful),
 * and the parent group spins/scales each — these stay cheap.
 */

const bodyMat = (active) => ({
  color: active ? "#dce8f5" : "#8499b5",
  metalness: 0.62,
  roughness: 0.34,
  emissive: active ? "#ffb84d" : "#4da6ff",
  emissiveIntensity: active ? 0.42 : 0.12,
});
const panelMat = (active) => ({
  color: active ? "#27406a" : "#1a2840",
  metalness: 0.4,
  roughness: 0.55,
  emissive: active ? "#2f6ea5" : "#16304e",
  emissiveIntensity: 0.22,
});
const rockMat = (active) => ({
  color: active ? "#b8b0a4" : "#7d7468",
  metalness: 0.05,
  roughness: 0.95,
  emissive: active ? "#5a4632" : "#221c14",
  emissiveIntensity: active ? 0.25 : 0.08,
});

function Station({ active }) {
  const b = bodyMat(active), p = panelMat(active);
  return (
    <group>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
        <meshStandardMaterial {...b} />
      </mesh>
      {[0.16, -0.16].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.14, 0.006, 0.11]} />
          <meshStandardMaterial {...p} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.05, 14, 1, true]} />
        <meshStandardMaterial {...b} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Probe({ active }) {
  const b = bodyMat(active);
  return (
    <group rotation={[0, 0, 0.5]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.16, 10]} />
        <meshStandardMaterial {...b} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.08, 0.06, 16, 1, true]} />
        <meshStandardMaterial {...b} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 6]} />
        <meshStandardMaterial {...bodyMat(active)} />
      </mesh>
    </group>
  );
}

function Moon({ active }) {
  return (
    <mesh castShadow>
      <icosahedronGeometry args={[0.16, 1]} />
      <meshStandardMaterial {...rockMat(active)} flatShading />
    </mesh>
  );
}

function Beacon({ active }) {
  const b = bodyMat(active);
  return (
    <group>
      <mesh castShadow>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial {...b} emissiveIntensity={active ? 0.7 : 0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 8, 28]} />
        <meshStandardMaterial {...panelMat(active)} />
      </mesh>
    </group>
  );
}

function Relay({ active }) {
  const b = bodyMat(active), p = panelMat(active);
  return (
    <group rotation={[0.4, 0, 0]}>
      <mesh castShadow position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
        <meshStandardMaterial {...b} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <coneGeometry args={[0.13, 0.07, 18, 1, true]} />
        <meshStandardMaterial {...p} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Drone({ active }) {
  const b = bodyMat(active);
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.05, 0.1]} />
        <meshStandardMaterial {...b} />
      </mesh>
      {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * 0.11, 0.01, sz * 0.11]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.008, 6, 16]} />
          <meshStandardMaterial {...bodyMat(active)} />
        </mesh>
      ))}
    </group>
  );
}

function LogTablet({ active }) {
  const b = bodyMat(active);
  return (
    <group rotation={[0.5, 0.3, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.18, 0.012, 0.13]} />
        <meshStandardMaterial {...b} />
      </mesh>
      <mesh position={[0, 0.008, 0]}>
        <boxGeometry args={[0.15, 0.002, 0.1]} />
        <meshStandardMaterial color={active ? "#ffb84d" : "#2f6ea5"} emissive={active ? "#ffb84d" : "#2f6ea5"} emissiveIntensity={active ? 0.6 : 0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Mote({ active }) {
  const b = bodyMat(active);
  return (
    <group>
      <mesh castShadow>
        <icosahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial {...b} emissiveIntensity={active ? 0.8 : 0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0.4, 0]}>
        <torusGeometry args={[0.16, 0.01, 8, 32]} />
        <meshStandardMaterial color={active ? "#ffb84d" : "#4da6ff"} emissive={active ? "#ffb84d" : "#4da6ff"} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Capsule({ active }) {
  return (
    <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.07, 0.12, 6, 14]} />
      <meshStandardMaterial {...bodyMat(active)} />
    </mesh>
  );
}

const REGISTRY = {
  station: Station,
  probe: Probe,
  moon: Moon,
  beacon: Beacon,
  relay: Relay,
  drone: Drone,
  log: LogTablet,
  fact: Mote,
  dossier: Capsule,
};

export default function LaneModel({ kind, active }) {
  const Model = REGISTRY[kind] || Beacon;
  return <Model active={active} />;
}
