/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/*
 * "I'm here" — a location pin on Earth at Pune, plus a floating callout.
 *
 * HomePin rides INSIDE Earth's rotating mesh, so it sits on India and sweeps to
 * the night side where it glows. HomeCallout is anchored above Earth (NOT the
 * spinning mesh), billboarded, and fades in when the camera is near the
 * Experience stop — so the greeting is always seen regardless of which way the
 * globe happens to be facing.
 */

const DEG = Math.PI / 180;
const PUNE = { lat: 18.52, lon: 73.86 };
/* Longitude calibration to align the dot with India on earth_atmos.jpg. */
const LON_OFFSET = -90;
const GOLD = "#ffcf6b";

const latLonToVec3 = (lat, lon, r) => {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180 + LON_OFFSET) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
};

export const HomePin = ({ radius = 0.75, animate = true }) => {
  const ringRef = useRef();
  const tipRef = useRef();

  const { position, quaternion } = useMemo(() => {
    const pos = latLonToVec3(PUNE.lat, PUNE.lon, radius);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize()
    );
    return { position: pos.toArray(), quaternion: q.toArray() };
  }, [radius]);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime; // real-time pulse — UX, not world time
    if (ringRef.current) {
      const p = (t % 2) / 2;
      ringRef.current.scale.setScalar(0.5 + p * 1.6);
      ringRef.current.material.opacity = 0.55 * (1 - p);
    }
    if (tipRef.current) {
      tipRef.current.material.emissiveIntensity = 1.7 + Math.sin(t * 3) * 0.5;
    }
  });

  const s = radius;
  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={tipRef} position={[0, s * 0.13, 0]}>
        <sphereGeometry args={[s * 0.05, 16, 16]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, s * 0.065, 0]}>
        <cylinderGeometry args={[s * 0.009, s * 0.009, s * 0.13, 8]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, s * 0.004, 0]}>
        <ringGeometry args={[s * 0.05, s * 0.075, 32]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* "you are here" light beam rising from the pin */}
      <mesh position={[0, s * 0.55, 0]}>
        <cylinderGeometry args={[s * 0.012, s * 0.026, s * 0.85, 12, 1, true]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.2} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

export const HomeCallout = ({ earthRadius = 0.75 }) => {
  const groupRef = useRef();
  const [near, setNear] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const nearRef = useRef(false);
  const [, force] = useState(0);
  const _w = useRef(new THREE.Vector3());

  /* Tick the IST clock while visible. */
  useEffect(() => {
    if (!near) return undefined;
    const id = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [near]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(_w.current);
    const n = _w.current.distanceTo(state.camera.position) < 5.5;
    if (n !== nearRef.current) { nearRef.current = n; setNear(n); }
  });

  const ist = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <group ref={groupRef} position={[earthRadius * 0.5, earthRadius * 0.62, earthRadius * 0.5]}>
      <Html center style={{ pointerEvents: near ? "auto" : "none" }}>
        <div
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          onClick={() => setExpanded((e) => !e)}
          style={{
            opacity: near ? 1 : 0, transition: "opacity 400ms ease, width 220ms ease",
            width: expanded ? 212 : 176, transform: "translateY(-50%)",
            padding: "10px 13px", borderRadius: 12, cursor: "pointer",
            background: "rgba(8,11,24,0.9)", border: "1px solid rgba(255,207,107,0.45)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            fontFamily: "'Martian Mono', monospace", color: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 22px rgba(255,207,107,0.18)",
          }}
        >
          <div style={{ fontSize: 12.5, marginBottom: 3 }}>👋 Rugwed is here</div>
          <div style={{ fontSize: 10, color: GOLD, letterSpacing: "0.04em" }}>Pune, Maharashtra, India</div>
          {expanded ? (
            <div style={{ marginTop: 6, fontSize: 9.5, color: "rgba(223,217,255,0.82)", lineHeight: 1.7 }}>
              <div>Backend &amp; Agentic AI Engineer</div>
              <div>18.52°N · 73.86°E · {ist} IST</div>
              <div style={{ color: "#2fe0b0" }}>● Available for opportunities</div>
            </div>
          ) : (
            <div style={{ fontSize: 9, color: "rgba(223,217,255,0.62)", marginTop: 4 }}>{ist} IST · probably still shipping code</div>
          )}
        </div>
      </Html>
    </group>
  );
};
