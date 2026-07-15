/* eslint-disable react/no-unknown-property */
/*
 * InterstellarDive — the MIDDLE scale regime of the homepage dive.
 *
 * The dive crosses three incompatible scales (see config/scaleRegimes.js): the
 * galactic PLATE (HomepageGalaxy) → the LOCAL neighbourhood (here) → the SOLAR
 * system (the tour). Because 1 ly = 63,241 AU, these can never share one float32
 * space, so the dive CROSS-DISSOLVES between them — which is exactly what keeps
 * each one at TRUE scale. This layer is the local regime: the Sun among its real
 * neighbour stars at genuine depth (distLy × LY_UNIT), the "we're inside the
 * galaxy now, flying toward our star" beat.
 *
 * The existing camera already sweeps hero → about straight toward the origin
 * (the Sun), so it flies THROUGH this star-field on its own — we just fade the
 * field in for the interstellar leg and out again as the solar system resolves.
 * Homepage-only; driven by scrollT (no React re-render), mirroring LocalNeighborhood.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { STARS, STAR_COUNT, STAR_STRIDE } from "../data/brightStars";
import { bvToColor } from "./Stars";
import { LY_UNIT, LOCAL_CAP_LY } from "../config/scaleRegimes";
import { makeSoftDot } from "./shared/textures";

const OBLIQUITY = 23.44 * (Math.PI / 180);

/* Equatorial RA/Dec (radians) → scene-frame unit vector — identical to
   Stars.jsx / LocalNeighborhood so the dive agrees with the fixed sky. */
function sceneVec(ra, dec, out) {
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return out.set(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE);
}

const SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.25, "rgba(255,255,255,0.75)"],
    [0.55, "rgba(255,255,255,0.12)"],
    [1, "rgba(255,255,255,0)"],
  ],
});

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * (950.0 / -mv.z), 1.5, 26.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFade;
  varying vec3 vColor;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * uFade;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const smooth = (a, b, x) => THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(x, 0, 1), a, b);

const InterstellarDive = ({ scrollT, active = false }) => {
  const matRef = useRef();
  const sunRef = useRef();
  const sunGlowRef = useRef();
  const labelRef = useRef();

  const { geometry, material } = useMemo(() => {
    const dir = new THREE.Vector3();
    const col = new THREE.Color();
    const positions = [];
    const colors = [];
    const sizes = [];
    for (let k = 0; k < STAR_COUNT; k++) {
      const b = k * STAR_STRIDE;
      const distLy = STARS[b + 4];
      if (distLy <= 0 || distLy > LOCAL_CAP_LY) continue; // unknown / far → the fixed backdrop
      sceneVec(STARS[b], STARS[b + 1], dir).multiplyScalar(distLy * LY_UNIT);
      positions.push(dir.x, dir.y, dir.z);
      bvToColor(STARS[b + 3], col);
      const mag = STARS[b + 2];
      const bright = THREE.MathUtils.clamp(1.05 + (2.5 - mag) * 0.16, 0.4, 1.6);
      colors.push(col.r * bright, col.g * bright, col.b * bright);
      sizes.push(THREE.MathUtils.clamp(2.6 + (5.0 - mag) * 1.7, 1.6, 13));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(sizes), 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: SPRITE }, uFade: { value: 0 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
  }, []);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(() => {
    if (!active) return;
    /* diveT: 0 at the hero, 1 at the Solar-System overview (scrollT × 12 stops).
       The local regime owns the middle of the dive: fade in after the galactic
       plate is dissolving, hold across the interstellar leg, fade out as the
       solar system resolves — so LY-scale stars and AU-scale planets never
       coexist (they can't; the scales are 63,241× apart). */
    const diveT = THREE.MathUtils.clamp((scrollT?.current ?? 0) * 12, 0, 1);
    const fade = smooth(0.26, 0.5, diveT) * (1 - smooth(0.74, 0.92, diveT));
    if (matRef.current) matRef.current.uniforms.uFade.value = fade;
    /* The Sun (origin) resolves out of the field as we approach — grows + brightens. */
    if (sunRef.current) {
      const s = 40 + smooth(0.4, 0.9, diveT) * 150;
      sunRef.current.scale.setScalar(s);
      sunRef.current.material.opacity = fade;
    }
    if (sunGlowRef.current) {
      sunGlowRef.current.scale.setScalar(120 + smooth(0.4, 0.95, diveT) * 520);
      sunGlowRef.current.material.opacity = fade * 0.4;
    }
    /* "You are here" — resolves on the blooming Sun late in the leg, then fades
       before the solar system takes over. */
    if (labelRef.current) {
      labelRef.current.style.opacity = String(smooth(0.52, 0.82, diveT) * (1 - smooth(0.9, 1, diveT)));
    }
  });

  if (!active) return null;

  return (
    <group>
      <points geometry={geometry} material={material} frustumCulled={false} ref={(el) => { if (el) matRef.current = el.material; }} />
      {/* Our Sun at the origin — the destination of the plunge. */}
      <sprite ref={sunGlowRef} scale={[120, 120, 1]}>
        <spriteMaterial map={SPRITE} color="#ffd9a0" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <sprite ref={sunRef} scale={[40, 40, 1]}>
        <spriteMaterial map={SPRITE} color="#fff1d4" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <Html center position={[0, 0, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={labelRef}
          style={{
            opacity: 0,
            transform: "translateY(-96px)",
            fontFamily: "JetBrains Mono, monospace",
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
            textShadow: "0 0 12px rgba(0,0,0,0.9)",
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: "0.32em", color: "rgba(255,238,200,0.92)" }}>Our Sun</div>
          <div style={{ fontSize: 9, letterSpacing: "0.24em", color: "rgba(205,184,145,0.75)", marginTop: 4 }}>you are here</div>
        </div>
      </Html>
    </group>
  );
};

export default InterstellarDive;
