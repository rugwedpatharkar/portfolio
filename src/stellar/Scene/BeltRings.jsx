/* eslint-disable react/no-unknown-property */
/*
 * Overview-only soft additive rings that show the asteroid + Kuiper belts as
 * BELTS from the wide framing (~2200u out) where 7500 sub-pixel rocks read
 * as barely-there haze. Two flat annular rings on the ecliptic — a warm
 * golden asteroid band between Mars and Jupiter, and a cooler blue-white
 * Kuiper band beyond Neptune. Additive blending + very low opacity so at
 * close range (any tour stop) the ring is invisible against the real
 * particle-based belt render.
 */
import * as THREE from "three";
import { BACKGROUND_BELTS } from "../config/destinations";

const BeltRings = () => (
  <group rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
    <mesh renderOrder={1}>
      <ringGeometry args={[BACKGROUND_BELTS.asteroid.inner, BACKGROUND_BELTS.asteroid.outer, 128, 1]} />
      <meshBasicMaterial
        color={BACKGROUND_BELTS.asteroid.color}
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
    <mesh renderOrder={1}>
      <ringGeometry args={[BACKGROUND_BELTS.kuiper.inner, BACKGROUND_BELTS.kuiper.outer, 192, 1]} />
      <meshBasicMaterial
        color={BACKGROUND_BELTS.kuiper.color}
        transparent
        opacity={0.11}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  </group>
);

export default BeltRings;
