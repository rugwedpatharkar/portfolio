/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

/*
 * Dense dust band for a belt — tens of thousands of tiny additive points filling
 * the torus volume, so the belt reads as a continuous dusty band whose brightness
 * comes from density (discrete rocks alone read as sparse specks). One draw call.
 *
 * DISTANCE BEHAVIOUR (the important part): a custom shader gives each point
 *   (a) size attenuation, CLAMPED — full size up close (so flying through the
 *       belt at the Ceres stop shows fine grain, not giant splats) but shrinking
 *       with distance, and
 *   (b) a distance FADE.
 * Without this, the old constant-screen-size additive points blew out: from the
 * outer planets the whole belt compresses to a thin line on screen, thousands of
 * full-size additive points pile onto the same pixels, the sum rockets past the
 * Bloom threshold, and the belt glows like a solid bar of light — wrong (they're
 * dark asteroids, not stars). Shrinking + fading distant dust keeps it a faint
 * haze far away while staying dense up close.
 */

/* Soft circular sprite (radial gradient) — shared module-level singleton so every
   belt reuses one texture (both main-belt AND Kuiper mount at once). */
let _dot;
const dotSprite = () => {
  if (!_dot) {
    _dot = makeSoftDot({
      size: 64,
      stops: [
        [0, "rgba(255,255,255,1)"],
        [0.45, "rgba(255,255,255,0.55)"],
        [1, "rgba(255,255,255,0)"],
      ],
    });
  }
  return _dot;
};

const DUST_VERT = /* glsl */ `
  uniform float uSize;    // max screen size (px) — used up close
  uniform float uAtten;   // attenuation reference distance
  uniform float uNear;    // full brightness within this distance
  uniform float uFar;     // faded to uMin by this distance
  uniform float uMin;     // minimum fade (never fully gone)
  varying float vFade;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    /* Clamp keeps it full-size up close (no giant splats inside the belt) and
       shrinks it with distance (kills the bright-bar pile-up from far). */
    gl_PointSize = clamp(uSize * uAtten / max(dist, 1.0), 0.5, uSize);
    vFade = clamp(1.0 - (dist - uNear) / (uFar - uNear), uMin, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const DUST_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * uOpacity * vFade;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const BeltDust = ({
  count = 24000,
  innerRadius,
  outerRadius,
  thickness,
  color = "#c9b48a",
  size = 2.4, // max screen pixels (shrinks with distance)
  opacity = 0.5,
  drift = 0.012,
  gaps = null, // fractional Kirkwood-gap centres (dust mirrors the rocks)
  cliff = false, // Kuiper-cliff density falloff
  animate = true,
}) => {
  const ref = useRef();
  const sprite = useMemo(dotSprite, []);

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const mid = (innerRadius + outerRadius) / 2;
    const span = (outerRadius - innerRadius) / 2;
    const span01 = outerRadius - innerRadius;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      let rr = mid;
      for (let t = 0; t < 6; t++) {
        rr = mid + (Math.random() + Math.random() - 1) * span; // triangular → denser mid-band
        const frac = (rr - innerRadius) / span01;
        if (gaps && gaps.some((g) => Math.abs(frac - g) < 0.03) && Math.random() > 0.12) continue;
        if (cliff) {
          const keep = frac < 0.82 ? 1 : Math.max(0.04, 1 - (frac - 0.82) / 0.12);
          if (Math.random() > keep) continue;
        }
        break;
      }
      const y = (Math.random() + Math.random() + Math.random() - 1.5) * (thickness / 3);
      pos[i * 3] = Math.cos(a) * rr;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * rr;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, innerRadius, outerRadius, thickness, gaps, cliff]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: sprite },
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: opacity },
          uSize: { value: size },
          uAtten: { value: 90 },
          uNear: { value: 170 },
          uFar: { value: 1000 },
          uMin: { value: 0.05 },
        },
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [sprite, color, opacity, size]
  );

  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y += delta * drift;
  });

  /* §9.6 disposal — BeltDust unmounts when the finale engages (Scene/index.jsx
     gates `showDust && <BeltDust />`, and showDust = false in finale). The
     BufferGeometry + ShaderMaterial are useMemo-allocated, so they need
     explicit cleanup to release GPU memory on unmount. */
  useEffect(() => () => {
    geo.dispose();
    material.dispose();
  }, [geo, material]);

  return (
    <group ref={ref}>
      <points geometry={geo} material={material} frustumCulled={false} />
    </group>
  );
};

export default BeltDust;
