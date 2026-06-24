/* eslint-disable react/no-unknown-property */
import { forwardRef, useMemo } from "react";
import { Effect } from "postprocessing";
import { Uniform, Color } from "three";

/*
 * Single-pass cinematic colour grade — the whole filmic look in ONE mainImage.
 *
 * WHY ONE EFFECT — the white-sky bug:
 * @react-three/postprocessing (postprocessing 6.36.6 on three 0.163) renders
 * the ENTIRE frame white when TWO OR MORE "mainImage" effects get merged into
 * one EffectPass. So every grade lives here, in a single Effect. Bloom is a
 * separate convolution pass (never merges with mainImage) so it's unaffected.
 *
 * The chain, in order: chromatic aberration → brightness/contrast (faithful to
 * postprocessing's BrightnessContrastEffect) → lift/gamma/gain tone curve →
 * luma-weighted saturation (desaturate shadows, keep highlights rich) → tinted
 * vignette → animated film grain. CA re-samples `inputBuffer` (the pass's input
 * sampler, GLSL1 `texture2D`); safe because this is the ONLY mainImage effect.
 * `uTime` is advanced in update() so the grain shimmers (frozen if uGrain = 0).
 */

const fragmentShader = /* glsl */ `
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float vigOffset;
uniform float vigDarkness;
uniform float uTime;
uniform float uGrain;
uniform float uAberration;
uniform float uLift;
uniform float uGamma;
uniform float uGain;
uniform vec3  uVigTint;

/* cheap hash noise for film grain */
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  /* --- Chromatic aberration: radial RGB split that grows toward the edges
         (a real lens artefact). Re-samples the pass input; safe as the sole
         mainImage effect. --- */
  vec2 fromC = uv - 0.5;
  vec2 caOff = fromC * (uAberration * dot(fromC, fromC));
  vec3 color;
  color.r = texture2D(inputBuffer, uv + caOff).r;
  color.g = inputColor.g;
  color.b = texture2D(inputBuffer, uv - caOff).b;

  /* --- BrightnessContrast (postprocessing BrightnessContrastEffect) --- */
  color += vec3(brightness - 0.5);
  if (contrast > 0.0) {
    color /= vec3(1.0 - contrast);
  } else {
    color *= vec3(1.0 + contrast);
  }
  color += vec3(0.5);
  color = max(color, 0.0);

  /* --- Lift / Gamma / Gain tone curve: gain the highlights, lift the blacks
         (so space has a filmic toe instead of crushed digital black), then a
         gentle mid gamma. --- */
  color = color * uGain;
  color += uLift * (1.0 - color);
  color = pow(max(color, 0.0), vec3(1.0 / uGamma));

  /* --- Saturation, luma-weighted: pull shadows toward grey (real space is
         desaturated) while keeping highlights rich. --- */
  float luma = dot(color, vec3(0.2125, 0.7154, 0.0721));
  float satAmt = (saturation + 1.0) * (0.7 + 0.45 * smoothstep(0.0, 0.6, luma));
  color = mix(vec3(luma), color, satAmt);

  /* --- Tinted vignette (VignetteEffect technique, colourised cool at the rim
         rather than pure black). --- */
  float d = distance(uv, vec2(0.5));
  float vig = smoothstep(0.8, vigOffset * 0.799, d * (vigDarkness + vigOffset));
  color *= mix(uVigTint, vec3(1.0), vig);

  /* --- Film grain: animated, luminance-aware (heavier in shadows/mids, light
         in highlights) so the frame reads as exposed stock, not flat video. --- */
  float g = hash21(uv * vec2(1280.0, 720.0) + fract(uTime) * 91.7) - 0.5;
  color += g * uGrain * (0.5 + 0.5 * (1.0 - luma));

  outputColor = vec4(max(color, 0.0), inputColor.a);
}
`;

class CinematicGradeEffect extends Effect {
  constructor({ brightness, contrast, saturation, vigOffset, vigDarkness, grain, aberration, lift, gamma, gain, vigTint }) {
    super("CinematicGrade", fragmentShader, {
      uniforms: new Map([
        ["brightness", new Uniform(brightness)],
        ["contrast", new Uniform(contrast)],
        ["saturation", new Uniform(saturation)],
        ["vigOffset", new Uniform(vigOffset)],
        ["vigDarkness", new Uniform(vigDarkness)],
        ["uTime", new Uniform(0)],
        ["uGrain", new Uniform(grain)],
        ["uAberration", new Uniform(aberration)],
        ["uLift", new Uniform(lift)],
        ["uGamma", new Uniform(gamma)],
        ["uGain", new Uniform(gain)],
        ["uVigTint", new Uniform(new Color(vigTint[0], vigTint[1], vigTint[2]))],
      ]),
    });
  }

  /* Advance the grain clock each frame (frozen contribution when uGrain = 0). */
  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get("uTime").value += deltaTime;
  }
}

const CinematicGrade = forwardRef(
  (
    {
      brightness = 0.025,
      contrast = 0.04,
      saturation = -0.02,
      vigOffset = 0.36,
      vigDarkness = 0.38,
      grain = 0.05,
      aberration = 0.012,
      lift = 0.02,
      gamma = 1.06,
      gain = 1.02,
      vigTint = [0.55, 0.66, 1.0],
    },
    ref
  ) => {
    const effect = useMemo(
      () =>
        new CinematicGradeEffect({ brightness, contrast, saturation, vigOffset, vigDarkness, grain, aberration, lift, gamma, gain, vigTint }),
      [brightness, contrast, saturation, vigOffset, vigDarkness, grain, aberration, lift, gamma, gain, vigTint[0], vigTint[1], vigTint[2]]
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

CinematicGrade.displayName = "CinematicGrade";

export default CinematicGrade;
