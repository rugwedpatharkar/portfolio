/* eslint-disable react/no-unknown-property */
import { forwardRef, useMemo } from "react";
import { Effect } from "postprocessing";
import { Uniform, Color } from "three";

/*
 * Single-pass cinematic colour grade — VIBRANT, saturated, glossy (the
 * No Man's-Sky / hero-render look), NOT gritty film stock. Deep-black space for
 * contrast, planet/nebula colours pushed rich, a clean soft vignette to frame.
 *
 * WHY ONE EFFECT — the white-sky bug: @react-three/postprocessing (postprocessing
 * 6.36.6 on three 0.163) renders the whole frame white when TWO+ "mainImage"
 * effects merge into one EffectPass, so every grade lives here in a single Effect.
 * Bloom is a separate convolution pass (never merges) so it's unaffected.
 *
 * Chain: subtle chromatic aberration (edges only) → brightness/contrast (faithful
 * to postprocessing's BrightnessContrastEffect) → VIBRANCE (saturation boost that
 * lifts the duller colours more, so things pop without going neon) → gentle
 * highlight gain with deep blacks → soft, lightly-cool vignette. No film grain.
 * CA re-samples `inputBuffer` (GLSL1 `texture2D`), safe as the sole mainImage.
 */

const fragmentShader = /* glsl */ `
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float vigOffset;
uniform float vigDarkness;
uniform float uAberration;
uniform float uGain;
uniform vec3  uVigTint;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  /* --- Subtle chromatic aberration, edges only (a faint lens nicety). --- */
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

  /* --- VIBRANCE: push colour. A plain saturation boost toward/away from luma,
         weighted so already-vivid pixels grow a little less (keeps the Sun and
         bright limbs from going neon while the planets/nebulae really pop). --- */
  float luma = dot(color, vec3(0.2125, 0.7154, 0.0721));
  float sat = length(color - vec3(luma));          // current colourfulness
  float boost = saturation * (1.0 - 0.5 * smoothstep(0.0, 0.5, sat));
  color = mix(vec3(luma), color, 1.0 + boost);

  /* --- Gentle highlight gain; blacks stay deep (space reads inky, not milky),
         so saturated subjects pop against it. --- */
  color *= uGain;

  /* --- Soft, lightly-cool vignette to frame the shot (not a heavy grey wash). */
  float d = distance(uv, vec2(0.5));
  float vig = smoothstep(0.85, vigOffset * 0.799, d * (vigDarkness + vigOffset));
  color *= mix(uVigTint, vec3(1.0), vig);

  outputColor = vec4(max(color, 0.0), inputColor.a);
}
`;

class CinematicGradeEffect extends Effect {
  constructor({ brightness, contrast, saturation, vigOffset, vigDarkness, aberration, gain, vigTint }) {
    super("CinematicGrade", fragmentShader, {
      uniforms: new Map([
        ["brightness", new Uniform(brightness)],
        ["contrast", new Uniform(contrast)],
        ["saturation", new Uniform(saturation)],
        ["vigOffset", new Uniform(vigOffset)],
        ["vigDarkness", new Uniform(vigDarkness)],
        ["uAberration", new Uniform(aberration)],
        ["uGain", new Uniform(gain)],
        ["uVigTint", new Uniform(new Color(vigTint[0], vigTint[1], vigTint[2]))],
      ]),
    });
  }
}

const CinematicGrade = forwardRef(
  (
    {
      brightness = 0.03,
      contrast = 0.08,
      saturation = 0.32,
      vigOffset = 0.4,
      vigDarkness = 0.28,
      aberration = 0.004,
      gain = 1.04,
      vigTint = [0.65, 0.74, 1.0],
    },
    ref
  ) => {
    const effect = useMemo(
      () => new CinematicGradeEffect({ brightness, contrast, saturation, vigOffset, vigDarkness, aberration, gain, vigTint }),
      [brightness, contrast, saturation, vigOffset, vigDarkness, aberration, gain, vigTint[0], vigTint[1], vigTint[2]]
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

CinematicGrade.displayName = "CinematicGrade";

export default CinematicGrade;
