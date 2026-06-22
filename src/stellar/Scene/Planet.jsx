/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import PlanetMaterial from "./PlanetMaterial";

/*
 * Planet primitive. Renders a textured sphere when a `texture` URL is
 * provided, otherwise falls back to the procedural PlanetMaterial shader.
 *
 * Earth gets the full PBR treatment: day map + emissive night-lights map
 * + a separate cloud-layer sphere that rotates a hair faster. Saturn's
 * rings consume `ringTexture` if supplied.
 */

const Planet = ({
  position = [0, 0, 0],
  radius = 1,
  type = "rocky",
  color,
  colorB,
  texture,
  nightTexture,
  cloudTexture,
  ringTexture,
  rotationSpeed = 0.1,
  rings = false,
  ringColor,
  axialTilt = 0,
  moons = 0,
  moonColor,
  moonScale = 0.12,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const groupRef = useRef();
  const planetRef = useRef();
  const cloudRef = useRef();
  const moonsRef = useRef([]);

  /* Load textures via Suspense — Scene wraps in <Suspense> already */
  const allTextureUrls = useMemo(
    () => [texture, nightTexture, cloudTexture, ringTexture].filter(Boolean),
    [texture, nightTexture, cloudTexture, ringTexture]
  );
  const loadedTextures = useLoader(THREE.TextureLoader, allTextureUrls.length ? allTextureUrls : []);
  const textureMap = useMemo(() => {
    const out = {};
    const order = [texture, nightTexture, cloudTexture, ringTexture].filter(Boolean);
    order.forEach((url, i) => {
      const tex = loadedTextures[i];
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
      }
      out[url] = tex;
    });
    return out;
  }, [loadedTextures, texture, nightTexture, cloudTexture, ringTexture]);

  useFrame((_, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * rotationSpeed;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * rotationSpeed * 1.35;
    moonsRef.current.forEach((m, i) => {
      if (m) {
        const t = m.userData.t + delta * (0.25 + (i % 3) * 0.05);
        m.userData.t = t;
        const orbitR = m.userData.orbit;
        m.position.set(
          Math.cos(t) * orbitR,
          Math.sin(t * 0.7) * orbitR * 0.22,
          Math.sin(t) * orbitR
        );
      }
    });
  });

  const moonNodes = [];
  const mColor = moonColor || color || "#cccccc";
  for (let i = 0; i < moons; i++) {
    const orbit = radius * 1.85 + i * 0.16 * radius;
    const initial = (i / Math.max(1, moons)) * Math.PI * 2;
    moonNodes.push(
      <mesh
        key={i}
        ref={(el) => {
          if (el) {
            el.userData = { orbit, t: initial };
            moonsRef.current[i] = el;
          }
        }}
        position={[Math.cos(initial) * orbit, 0, Math.sin(initial) * orbit]}
      >
        <sphereGeometry args={[radius * moonScale, 16, 16]} />
        <meshStandardMaterial
          color={mColor}
          emissive={new THREE.Color(mColor).multiplyScalar(0.35)}
          emissiveIntensity={0.5}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>
    );
  }

  const rColor = ringColor || color || "#f8c555";

  /* Earth gets the night-lights + clouds treatment */
  const isEarth = type === "earth" && textureMap[texture] && textureMap[nightTexture];

  /* Material selection: textured PBR when texture is provided, else shader */
  const hasTexture = Boolean(textureMap[texture]);

  return (
    <group position={position} ref={groupRef} rotation={[0, 0, axialTilt]}>
      <mesh
        ref={planetRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        {hasTexture ? (
          <meshStandardMaterial
            map={textureMap[texture]}
            emissiveMap={isEarth ? textureMap[nightTexture] : null}
            emissive={isEarth ? new THREE.Color("#ffe089") : new THREE.Color("#000000")}
            emissiveIntensity={isEarth ? 1.2 : 0}
            roughness={isEarth ? 0.85 : 0.95}
            metalness={isEarth ? 0.05 : 0.05}
          />
        ) : (
          <PlanetMaterial type={type} color={color} colorB={colorB} />
        )}
      </mesh>

      {/* Cloud layer for Earth — slightly larger sphere with cloud texture */}
      {isEarth && textureMap[cloudTexture] && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[radius * 1.012, 48, 48]} />
          <meshStandardMaterial
            map={textureMap[cloudTexture]}
            transparent
            opacity={0.45}
            depthWrite={false}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      {rings && (
        <group rotation={[Math.PI / 2.05, 0, 0]}>
          {/* Textured ring (Saturn) — use the ring image as both color and alpha */}
          {textureMap[ringTexture] ? (
            <mesh>
              <ringGeometry args={[radius * 1.35, radius * 2.25, 96]} />
              <meshBasicMaterial
                map={textureMap[ringTexture]}
                alphaMap={textureMap[ringTexture]}
                transparent
                opacity={0.95}
                side={THREE.DoubleSide}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          ) : (
            <>
              <mesh>
                <ringGeometry args={[radius * 1.32, radius * 1.55, 64]} />
                <meshBasicMaterial color={rColor} transparent opacity={0.18} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
              <mesh>
                <ringGeometry args={[radius * 1.58, radius * 1.92, 96]} />
                <meshBasicMaterial color={rColor} transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
              <mesh>
                <ringGeometry args={[radius * 1.96, radius * 2.15, 96]} />
                <meshBasicMaterial color={rColor} transparent opacity={0.28} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            </>
          )}
        </group>
      )}

      {moonNodes}
    </group>
  );
};

export default Planet;
