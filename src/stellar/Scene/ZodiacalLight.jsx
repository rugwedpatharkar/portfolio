/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";

/*
 * Zodiacal light — the real, faint cone of sunlight scattered by interplanetary
 * dust concentrated in the ecliptic plane. We render it as a thin, flattened
 * lens of very faint warm points filling the inner system (≈ inside Mercury out
 * to the asteroid belt), densest and brightest near the Sun and fading outward,
 * hugging the ecliptic (the scene's xz-plane). Edge-on — exactly the backlit
 * default view, looking sunward — it reads as the soft triangular glow you'd see
 * before dawn. Additive, write-once, no per-frame cost.
 */

let _dot;
const dotSprite = () => {
  if (_dot) return _dot;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.5, "rgba(255,255,255,0.4)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _dot = new THREE.CanvasTexture(c);
  return _dot;
};

const ZodiacalLight = ({ count = 7000, inner = 24, outer = 330, color = "#f3ecd8" }) => {
  const sprite = useMemo(dotSprite, []);
  const { geometry } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const alpha = new Float32Array(count); // per-point brightness, falls off with radius
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      // radius biased strongly toward the Sun (r = inner + span * u^2)
      const u = Math.random();
      const r = inner + (outer - inner) * u * u;
      // lens gets thinner with distance from the Sun; Gaussian-ish in y
      const halfThick = 6 + 9 * (1 - u);
      const y = (Math.random() + Math.random() - 1) * halfThick;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * r;
      // brightness falls steeply outward (zodiacal light is faint past ~2 AU)
      alpha[i] = Math.pow(1 - u, 1.6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    return { geometry: g };
  }, [count, inner, outer]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uMap: { value: sprite }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0.3 } },
        vertexShader: /* glsl */ `
          attribute float aAlpha;
          varying float vA;
          void main() {
            vA = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            /* Bigger, brightness-weighted, perspective-attenuated sprites so the
               dense inner motes OVERLAP into a continuous triangular glow instead
               of reading as discrete dots — the defining look of zodiacal light. */
            gl_PointSize = (7.0 + 22.0 * aAlpha) * (300.0 / max(-mv.z, 1.0));
            gl_PointSize = clamp(gl_PointSize, 2.0, 46.0);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap; uniform vec3 uColor; uniform float uOpacity;
          varying float vA;
          void main() {
            float t = texture2D(uMap, gl_PointCoord).a * vA * uOpacity;
            if (t < 0.004) discard;
            gl_FragColor = vec4(uColor * t, t);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [sprite, color],
  );

  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

export default ZodiacalLight;

