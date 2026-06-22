/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import PlanetMaterial from "./PlanetMaterial";
import AtmosphereGlow from "./AtmosphereGlow";

/* Atmosphere preset per planet type. With bloom on, the rim will glow
   secondarily on its own — keep intensities moderate so atmospheres
   don't drown the surface texture. */
const ATMOSPHERE_PRESETS = {
  earth: { color: "#6aa0ff", intensity: 0.55, power: 3.2, scale: 1.045 },
  warm: { color: "#ffd99a", intensity: 0.40, power: 2.8, scale: 1.035 },
  rust: { color: "#ff9070", intensity: 0.28, power: 3.0, scale: 1.035 },
  gas: { color: "#caa6ff", intensity: 0.35, power: 2.8, scale: 1.035 },
  golden: { color: "#ffe9a8", intensity: 0.40, power: 2.8, scale: 1.035 },
  ice: { color: "#a6d8ff", intensity: 0.40, power: 2.8, scale: 1.04 },
  abyss: { color: "#7ad0ff", intensity: 0.50, power: 2.8, scale: 1.045 },
};

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
  moonTexture,
  normalTexture,
  specularTexture,
  bumpTexture,
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
  draggable = true,
}) => {
  const groupRef = useRef();
  const planetRef = useRef();
  const cloudRef = useRef();
  const moonsRef = useRef([]);
  /* Drag spin: extra rotation accumulator + decay back to natural */
  const dragSpinRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartSpinRef = useRef(0);
  /* Hover state — used to scale the atmosphere ring up subtly so the
     planet feels "highlighted" without a tacky outline. */
  const hoverScaleRef = useRef(1);
  const targetHoverRef = useRef(1);

  /* Load textures via Suspense — Scene wraps in <Suspense> already.
     Normal + specular + bump maps must NOT be sRGB — they're data,
     not colour. We mark them as Linear after load. */
  const colorUrls = useMemo(
    () => [texture, nightTexture, cloudTexture, ringTexture, moonTexture].filter(Boolean),
    [texture, nightTexture, cloudTexture, ringTexture, moonTexture]
  );
  const dataUrls = useMemo(
    () => [normalTexture, specularTexture, bumpTexture].filter(Boolean),
    [normalTexture, specularTexture, bumpTexture]
  );
  const loadedColor = useLoader(THREE.TextureLoader, colorUrls.length ? colorUrls : []);
  const loadedData = useLoader(THREE.TextureLoader, dataUrls.length ? dataUrls : []);

  const textureMap = useMemo(() => {
    const out = {};
    colorUrls.forEach((url, i) => {
      const tex = loadedColor[i];
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
      }
      out[url] = tex;
    });
    dataUrls.forEach((url, i) => {
      const tex = loadedData[i];
      if (tex) {
        tex.colorSpace = THREE.NoColorSpace;
        tex.anisotropy = 8;
      }
      out[url] = tex;
    });
    return out;
  }, [loadedColor, loadedData, colorUrls, dataUrls]);

  useFrame((_, delta) => {
    /* Natural rotation + drag-imparted spin that decays back gently */
    if (!isDraggingRef.current) {
      dragSpinRef.current *= 0.96;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * rotationSpeed + dragSpinRef.current * delta;
    }
    if (cloudRef.current) cloudRef.current.rotation.y += delta * rotationSpeed * 1.35;
    /* Hover lerp — snappier (0.12 → 0.22) so the pop reads cleanly */
    hoverScaleRef.current += (targetHoverRef.current - hoverScaleRef.current) * 0.22;
    if (groupRef.current) groupRef.current.scale.setScalar(hoverScaleRef.current);
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
        <sphereGeometry args={[radius * moonScale, 24, 24]} />
        <meshStandardMaterial
          color={mColor}
          map={textureMap[moonTexture] || null}
          emissive={new THREE.Color(mColor).multiplyScalar(textureMap[moonTexture] ? 0.05 : 0.35)}
          emissiveIntensity={textureMap[moonTexture] ? 0.15 : 0.5}
          roughness={textureMap[moonTexture] ? 0.95 : 0.55}
          metalness={textureMap[moonTexture] ? 0.04 : 0.15}
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
        onPointerOver={(e) => {
          targetHoverRef.current = 1.05;
          onPointerOver?.(e);
        }}
        onPointerOut={(e) => {
          targetHoverRef.current = 1.0;
          onPointerOut?.(e);
        }}
        onPointerDown={(e) => {
          if (!draggable) return;
          e.stopPropagation();
          isDraggingRef.current = true;
          dragStartXRef.current = e.clientX;
          dragStartSpinRef.current = dragSpinRef.current;
          e.target.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!isDraggingRef.current || !draggable) return;
          const dx = e.clientX - dragStartXRef.current;
          dragSpinRef.current = dragStartSpinRef.current + dx * 0.04;
        }}
        onPointerUp={(e) => {
          isDraggingRef.current = false;
          e.target.releasePointerCapture?.(e.pointerId);
        }}>
        <sphereGeometry args={[radius, 64, 64]} />
        {hasTexture ? (
          <meshStandardMaterial
            map={textureMap[texture]}
            normalMap={textureMap[normalTexture] || null}
            normalScale={textureMap[normalTexture] ? new THREE.Vector2(0.85, 0.85) : undefined}
            /* Specular map carries Earth's ocean mask — bright on water,
               dark on land. We feed it to roughnessMap inverted so oceans
               are smooth (low roughness, mirror-like) and land is rough. */
            roughnessMap={textureMap[specularTexture] || null}
            bumpMap={textureMap[bumpTexture] || null}
            bumpScale={textureMap[bumpTexture] ? (isEarth ? 0.04 : 0.08) : 0}
            emissiveMap={isEarth ? textureMap[nightTexture] : null}
            emissive={isEarth ? new THREE.Color("#ffc480") : new THREE.Color("#000000")}
            emissiveIntensity={isEarth ? 1.6 : 0}
            roughness={isEarth ? 0.7 : 0.85}
            metalness={isEarth ? 0.12 : 0.05}
          />
        ) : (
          <PlanetMaterial type={type} color={color} colorB={colorB} />
        )}
      </mesh>

      {/* Cloud layer for Earth — slightly larger sphere with cloud texture.
          Opacity is lower so continents remain the focal point through the
          haze; the planet, not the weather, is the subject. */}
      {isEarth && textureMap[cloudTexture] && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[radius * 1.008, 48, 48]} />
          <meshStandardMaterial
            map={textureMap[cloudTexture]}
            alphaMap={textureMap[cloudTexture]}
            transparent
            opacity={0.55}
            depthWrite={false}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      {/* Atmosphere rim glow — earth-blue by default, custom per planet */}
      {hasTexture && ATMOSPHERE_PRESETS[type] && (
        <AtmosphereGlow radius={radius} {...ATMOSPHERE_PRESETS[type]} />
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
