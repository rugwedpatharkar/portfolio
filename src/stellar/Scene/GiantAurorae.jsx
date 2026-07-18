/* eslint-disable react/no-unknown-property */
/*
 * AURORAE ON THE GIANT PLANETS — Jupiter (brightest in the solar system per
 * Juno), Saturn (H₂ emission in UV), Uranus (JWST-imaged 2023), Neptune
 * (JWST-imaged 2025 at MID-latitudes because the field is offset 47° from
 * spin axis).
 *
 * Rendered as feathered auroral ovals ringing the planet's magnetic poles.
 * Reuses the same shader approach as Earth's aurora (Planet.jsx auroraMat).
 * Colour varies by planet: Jupiter's Juno-blue, Saturn's UV-pink, Uranus's
 * green-cyan (H₃⁺ near-IR), Neptune's mid-latitude blue-green.
 *
 * Simple ring-geometry meshes with additive additive blending — the existing
 * Bloom pass haloes them. Ride the planet's axial tilt via parent group.
 *
 * Sources: docs/research/01-sun-and-planets.md §3.5-§3.8; NASA JWST + Juno
 * press releases.
 */
import { useMemo } from "react";
import * as THREE from "three";

const PRESETS = {
  jupiter: { color: "#8fc4ff", ringMin: 0.65, ringMax: 0.88, opacity: 0.55 },
  saturn:  { color: "#f0b5d4", ringMin: 0.60, ringMax: 0.90, opacity: 0.45 },
  uranus:  { color: "#7fe4c8", ringMin: 0.55, ringMax: 0.92, opacity: 0.45 },
  /* Neptune: mid-latitude ovals — the aurora on Neptune sits ~47° from
     the spin axis because the magnetic axis is offset from spin axis. */
  neptune: { color: "#8ee8d0", ringMin: 0.35, ringMax: 0.62, opacity: 0.40 },
};

const GiantAurorae = ({ radius, kind = "jupiter", both = true }) => {
  const preset = PRESETS[kind] || PRESETS.jupiter;
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: preset.color,
      transparent: true,
      opacity: preset.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
    [preset.color, preset.opacity],
  );

  const inner = radius * preset.ringMin;
  const outer = radius * preset.ringMax;
  /* Position each ring above the surface so it doesn't clip: at the
     pole latitude, the ring sits tangent to the sphere. */
  const yUp = radius * (kind === "neptune" ? 0.7 : 0.92);

  return (
    <group>
      {/* North pole */}
      <mesh position={[0, yUp, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, outer, 96]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {both && (
        <mesh position={[0, -yUp, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[inner, outer, 96]} />
          <primitive object={mat} attach="material" />
        </mesh>
      )}
    </group>
  );
};

export default GiantAurorae;
