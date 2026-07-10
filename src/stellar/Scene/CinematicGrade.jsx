/* eslint-disable react/no-unknown-property */
import { forwardRef, useMemo } from "react";
import { Effect } from "postprocessing";
import { Uniform } from "three";

/*
 * Single-pass cinematic colour grade.
 *
 * WHY THIS EXISTS — the white-sky bug:
 * @react-three/postprocessing (2.16.3 / postprocessing 6.36.6 on three
 * 0.163) renders the ENTIRE frame white when TWO OR MORE "mainImage"
 * effects (BrightnessContrast, HueSaturation, Vignette, …) get merged
 * into a single EffectPass. One such effect renders fine; two or more
 * blow the buffer out to white. This was the real cause of the
 * persistent white background — NOT the skybox (proven by bisecting the
 * post chain: ?nofx and any single effect = correct; any 2 merged =
 * white).
 *
 * The fix: do all grades (brightness/contrast, saturation, vignette)
 * inside ONE Effect → only ever one mainImage in the merged pass → no
 * merge bug. Bloom stays a separate convolution pass (it never merges
 * with mainImage effects), so it's unaffected.
 *
 * The math below faithfully reproduces postprocessing's own
 * BrightnessContrastEffect, HueSaturationEffect (saturation term, hue=0)
 * and VignetteEffect (default technique) so the look is preserved, in
 * the same order the chain applied them.
 */

const fragmentShader = /* glsl */ `
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float vigOffset;
uniform float vigDarkness;
uniform float uTime;
uniform float vigBreathe;
uniform float uGrain;
uniform float uFade;   // 1 = normal; dips toward 0 to fade the frame through black

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;

  /* --- BrightnessContrast (postprocessing BrightnessContrastEffect) --- */
  color += vec3(brightness - 0.5);
  if (contrast > 0.0) {
    color /= vec3(1.0 - contrast);
  } else {
    color *= vec3(1.0 + contrast);
  }
  color += vec3(0.5);

  /* --- Saturation (HueSaturationEffect, hue = 0) --- */
  float luma = dot(color, vec3(0.2125, 0.7154, 0.0721));
  color = mix(vec3(luma), color, saturation + 1.0);

  /* --- Vignette (VignetteEffect, default technique) --- */
  /* Darkness gently breathes so the frame feels alive — invisible-but-felt depth.
     Static when vigBreathe = 0 (reduced motion). */
  float vigD = vigDarkness + sin(uTime * 0.22) * vigBreathe;
  float d = distance(uv, vec2(0.5));
  color *= smoothstep(0.8, vigOffset * 0.799, d * (vigD + vigOffset));

  /* --- Film grain (subtle animated luminance noise, folded into this one pass so
     no second mainImage). Zero-mean so it doesn't shift exposure; scaled down in
     shadows where real grain is finer. uGrain = 0 under reduced motion. --- */
  if (uGrain > 0.0) {
    float n = fract(sin(dot(uv + fract(uTime * 0.5), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color += n * uGrain * (0.6 + 0.4 * luma);
  }

  /* Cinematic fade — the finale reveal dips the whole frame through black at its
     mid-point so the solar-system → local-neighbourhood content swap is unseen. */
  color *= uFade;

  outputColor = vec4(color, inputColor.a);
}
`;

class CinematicGradeEffect extends Effect {
  constructor({ brightness, contrast, saturation, vigOffset, vigDarkness, vigBreathe, grain }) {
    super("CinematicGrade", fragmentShader, {
      uniforms: new Map([
        ["brightness", new Uniform(brightness)],
        ["contrast", new Uniform(contrast)],
        ["saturation", new Uniform(saturation)],
        ["vigOffset", new Uniform(vigOffset)],
        ["vigDarkness", new Uniform(vigDarkness)],
        ["uTime", new Uniform(0)],
        ["vigBreathe", new Uniform(vigBreathe)],
        ["uGrain", new Uniform(grain)],
        // Set imperatively per-frame (via the effect ref) by the finale scrub;
        // a prop would recreate the effect each frame. 1 = normal.
        ["uFade", new Uniform(1)],
      ]),
    });
  }

  /* Advance the clock each frame (postprocessing calls this per render) whenever
     the vignette breathes OR film grain is active. */
  update(renderer, inputBuffer, deltaTime) {
    if (this.uniforms.get("vigBreathe").value > 0 || this.uniforms.get("uGrain").value > 0) {
      this.uniforms.get("uTime").value += deltaTime;
    }
  }
}

const CinematicGrade = forwardRef(
  (
    {
      brightness = -0.02,
      contrast = 0.14,
      saturation = 0.12,
      vigOffset = 0.3,
      vigDarkness = 0.82,
      vigBreathe = 0,
      grain = 0,
    },
    ref
  ) => {
    const effect = useMemo(
      () => new CinematicGradeEffect({ brightness, contrast, saturation, vigOffset, vigDarkness, vigBreathe, grain }),
      [brightness, contrast, saturation, vigOffset, vigDarkness, vigBreathe, grain]
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

CinematicGrade.displayName = "CinematicGrade";

export default CinematicGrade;
