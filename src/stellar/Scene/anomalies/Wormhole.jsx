/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { contactLinks } from "../../../content";
import { placeInFrontOfSun } from "../../config/destinations";
import { useSceneClock } from "../SceneClock";
import { nearCamera } from "../shared/hooks";

/* The portal opens the same booking link as the Contact "Book a Call" CTA. */
const BOOK_CALL = contactLinks.find((l) => l.label === "Book a Call")?.href;

/*
 * The "Beam aboard" wormhole — a swirling portal near the Contact beacon at
 * the edge of the system. A billboarded disk running a vortex shader (spiral
 * arms winding into a bright core), wrapped in a soft glow ring. It's the
 * invitation to make contact: hovering swells it, clicking fires
 * `stellar:beam-aboard`, which the Contact CTA listens for to open the
 * booking link. Object-space shader — no postprocessing.
 */

const VORTEX_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const VORTEX_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;            // 0 centre → 1 rim
    if (r > 1.0) discard;
    float ang = atan(p.y, p.x);
    /* spiral arms winding inward, rotating over time */
    float swirl = sin(ang * 3.0 + uTime * 1.8 - 9.0 * r);
    float arms = 0.45 + 0.55 * swirl;
    float annulus = smoothstep(1.0, 0.62, r) * smoothstep(0.04, 0.34, r);
    float bright = annulus * (0.35 + 0.65 * arms);
    bright += smoothstep(0.34, 0.0, r) * 0.9;       // hot core
    vec3 col = mix(vec3(0.30, 0.78, 1.0), vec3(0.66, 0.32, 1.0), r); // cyan → violet
    float a = clamp(bright, 0.0, 1.0);
    gl_FragColor = vec4(col * a * 1.6, a);
  }
`;

const Wormhole = ({ position = placeInFrontOfSun([48.55, 0.58, 1.62]), radius = 45 }) => {
  const groupRef = useRef();
  const mat = useRef();
  const hover = useRef(1);
  const target = useRef(1);
  const sceneClock = useSceneClock();

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  /* §6.4: drei's <Billboard follow> handles the lookAt(camera.position) rotation
     of the outer transform. Our inner group still owns the hover-scale + breathe
     pulse (drei doesn't touch scale) and the pointer/click handlers. */
  useFrame(({ camera }) => {
    /* Uniform sync stays UNGATED — shader clock must stay locked to SceneClock
       so opening the gate on approach doesn't jump the vortex animation. */
    if (mat.current) mat.current.uniforms.uTime.value = sceneClock.t;
    if (!nearCamera(camera, position, 500)) return;
    if (groupRef.current) {
      hover.current += (target.current - hover.current) * 0.15;
      const breathe = 1 + Math.sin(sceneClock.t * 1.4) * 0.04;
      groupRef.current.scale.setScalar(hover.current * breathe);
    }
  });

  return (
    <Billboard position={position} follow>
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent("stellar:beam-aboard"));
        if (BOOK_CALL) window.open(BOOK_CALL, "_blank", "noopener");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        target.current = 1.16;
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        target.current = 1;
        if (typeof document !== "undefined") document.body.style.cursor = "";
      }}
    >
      {/* Vortex disk */}
      <mesh>
        <circleGeometry args={[radius, 64]} />
        <shaderMaterial
          ref={mat}
          vertexShader={VORTEX_VERT}
          fragmentShader={VORTEX_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {/* Soft outer glow — thin, faint rim (kept subtle so bloom/DOF don't
          spread it into a hard-edged disc). */}
      <mesh>
        <ringGeometry args={[radius * 1.0, radius * 1.12, 64]} />
        <meshBasicMaterial color="#6fb0ff" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
    </Billboard>
  );
};

export default Wormhole;
