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
uniform float uArrival;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;

  /* --- BrightnessContrast (postprocessing BrightnessContrastEffect) --- */
  /* On stop arrival, uArrival (0→1, decaying) momentarily crisps the contrast so
     the world snaps sharp as the camera settles, then relaxes for reading. */
  float c = contrast + uArrival * 0.06;
  color += vec3(brightness - 0.5);
  if (c > 0.0) {
    color /= vec3(1.0 - c);
  } else {
    color *= vec3(1.0 + c);
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

  outputColor = vec4(color, inputColor.a);
}
`;

class CinematicGradeEffect extends Effect {
  constructor({ brightness, contrast, saturation, vigOffset, vigDarkness, vigBreathe, arrivalRef }) {
    super("CinematicGrade", fragmentShader, {
      uniforms: new Map([
        ["brightness", new Uniform(brightness)],
        ["contrast", new Uniform(contrast)],
        ["saturation", new Uniform(saturation)],
        ["vigOffset", new Uniform(vigOffset)],
        ["vigDarkness", new Uniform(vigDarkness)],
        ["uTime", new Uniform(0)],
        ["vigBreathe", new Uniform(vigBreathe)],
        ["uArrival", new Uniform(0)],
      ]),
    });
    this._arrivalRef = arrivalRef || null; // decaying 0→1 arrival pulse (from ArrivalPulse)
  }

  /* Advance the breathing clock + read the arrival pulse each frame (postprocessing
     calls this per render). */
  update(renderer, inputBuffer, deltaTime) {
    if (this.uniforms.get("vigBreathe").value > 0) {
      this.uniforms.get("uTime").value += deltaTime;
    }
    this.uniforms.get("uArrival").value = this._arrivalRef && this._arrivalRef.current ? this._arrivalRef.current : 0;
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
      arrivalRef = null,
    },
    ref
  ) => {
    const effect = useMemo(
      () => new CinematicGradeEffect({ brightness, contrast, saturation, vigOffset, vigDarkness, vigBreathe, arrivalRef }),
      [brightness, contrast, saturation, vigOffset, vigDarkness, vigBreathe, arrivalRef]
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

CinematicGrade.displayName = "CinematicGrade";

export default CinematicGrade;
