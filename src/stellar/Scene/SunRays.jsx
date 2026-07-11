/* eslint-disable react/no-unknown-property */
/*
 * §14/§11-cinematic — god-ray shafts + lens-flare ghosts from the Sun.
 *
 * A billboarded additive quad pinned to the Sun via drei's <Billboard follow>,
 * with a fragment shader that draws:
 *   - four soft anamorphic streaks (H + V + two 45° diagonals) — the classic
 *     four-pointed "star burst" that reads as a lens flare from a bright light.
 *   - a small chain of hex-tinted ghost circles along the Sun-to-frame-centre
 *     axis (milestone §14 #4 — extended lens flare). Ghosts scale + shift out
 *     with distance so distant framings sit larger than close ones, keeping
 *     the "lens" character consistent as the tour scrubs past.
 *   - a bright inner core so the Sun's disc reads as the light source.
 *
 * Because everything is object-space and additive, it composits with the
 * existing Bloom pass and DOES NOT need a second mainImage (which would
 * white-out the frame — see CinematicGrade.jsx for the reason).
 *
 * The streaks fade toward the frame edge and pulse subtly with SceneClock
 * time. Intensity dials down to 0 under reduced-motion via the `intensity`
 * prop; the whole component unmounts in the finale (index.jsx gates it on
 * `!finale`).
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

const RAYS_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const RAYS_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3  uColor;
  varying vec2 vUv;

  /* One streak: attenuates by perpendicular distance from a line through
     the centre at 'ang' radians; 'thickness' controls the streak sharpness. */
  float streak(vec2 p, float ang, float thickness, float len) {
    vec2 d = vec2(cos(ang), sin(ang));
    /* perpendicular distance to the streak line */
    float perp = abs(p.x * -d.y + p.y * d.x);
    /* along-line distance (0 at centre, 1 at fade edge) */
    float along = length(p) / len;
    /* narrow, then fade in from the centre and out at the edge */
    return smoothstep(thickness, 0.0, perp) * smoothstep(1.0, 0.05, along);
  }

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);
    /* Inside a soft disc — the streaks fan from a bright inner core. */
    float core = smoothstep(0.14, 0.0, d);

    /* Four streaks at 0/45/90/135°; the horizontal + vertical pair carries
       more energy than the diagonals so the shape reads as a classic
       four-pointed "star burst" rather than a symmetric eight. */
    float ang = uTime * 0.02; // barely-perceptible drift
    float sHV = streak(p, ang,          0.020, 0.55) * 0.85
             + streak(p, ang + 1.5708,  0.020, 0.55) * 0.85;
    float sDG = streak(p, ang + 0.7854, 0.014, 0.42) * 0.55
             + streak(p, ang + 2.3562,  0.014, 0.42) * 0.55;

    /* Lens-flare ghost chain: 4 small tinted discs along the axis from the
       centre toward the (0, -0.5) direction — reads as the anamorphic ghosts
       classic lenses produce when a bright light sits off-centre. Each ghost
       gets its own subtle chromatic tint. */
    vec2 axis = normalize(vec2(0.04, -1.0)); // slight rightward drift for cinematography
    vec4 ghost = vec4(0.0);
    for (int i = 0; i < 4; i++) {
      float t = float(i + 1) / 5.0; // 0.2, 0.4, 0.6, 0.8
      vec2 gp = p - axis * (0.16 + t * 0.28);
      float gd = length(gp);
      float gr = 0.02 + t * 0.03;
      float m = smoothstep(gr, 0.0, gd);
      vec3 tint = vec3(
        0.8 + 0.2 * cos(float(i) * 1.4),
        0.9 + 0.1 * cos(float(i) * 1.9 + 1.2),
        1.0 - 0.15 * cos(float(i) * 1.1 + 2.4)
      );
      ghost.rgb += tint * m * 0.35;
      ghost.a += m * 0.35;
    }

    /* Gentle sine-modulated pulse so it feels alive (subtle — not disco). */
    float pulse = 0.9 + 0.1 * sin(uTime * 0.9);

    float brightness = (core + sHV + sDG) * uIntensity * pulse;
    vec3 rgb = uColor * brightness + ghost.rgb * uIntensity * pulse;
    float alpha = brightness + ghost.a * uIntensity * pulse;
    /* Clip near-zero to avoid a full-quad additive tint. */
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(rgb, alpha);
  }
`;

const SunRays = ({
  position = [0, 0, 0],
  radius = 60,           // world radius of the billboard quad (scene units)
  color = "#ffefc9",     // warm-white; matches the Sun's photosphere accent
  intensity = 0.6,       // 0 = off (reduced-motion); ~0.5-0.8 = tasteful
}) => {
  const matRef = useRef();
  const sceneClock = useSceneClock();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uColor: { value: new THREE.Color(color) },
  }), [color, intensity]);

  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.uTime.value = sceneClock.t;
  });

  return (
    <Billboard position={position} follow>
      <mesh renderOrder={2}>
        <planeGeometry args={[radius * 2, radius * 2]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={RAYS_VERT}
          fragmentShader={RAYS_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  );
};

export default SunRays;
