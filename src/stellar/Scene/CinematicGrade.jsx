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
 * The fix: do all grades (brightness/contrast, saturation, vignette, and
 * the warp tunnel) inside ONE Effect → only ever one mainImage in the
 * merged pass → no merge bug. Bloom stays a separate convolution pass (it
 * never merges with mainImage effects), so it's unaffected.
 *
 * The math below faithfully reproduces postprocessing's own
 * BrightnessContrastEffect, HueSaturationEffect (saturation term, hue=0)
 * and VignetteEffect (default technique) so the look is preserved, in
 * the same order the chain applied them — plus a warp term (see uWarp).
 */

const fragmentShader = /* glsl */ `
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float vigOffset;
uniform float vigDarkness;
uniform float uWarp;

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
  float d = distance(uv, vec2(0.5));
  color *= smoothstep(0.8, vigOffset * 0.799, d * (vigDarkness + vigOffset));

  /* --- Warp tunnel --- as a lane-jump fires, smudge the periphery to black so the
     streaks read inside a dark circular tube. uWarp is driven from warpVelRef each
     frame (see update()); clamped, smoothstep-only → Metal-NaN safe. */
  float wt = clamp(uWarp, 0.0, 1.0);
  if (wt > 0.0) {
    float dw = distance(uv, vec2(0.5));
    float tunnel = smoothstep(0.16, 0.60, dw); // 0 at centre → 1 at the edges
    color *= 1.0 - tunnel * wt * 0.92;
  }

  outputColor = vec4(color, inputColor.a);
}
`;

class CinematicGradeEffect extends Effect {
  constructor({ brightness, contrast, saturation, vigOffset, vigDarkness, warpVelRef }) {
    super("CinematicGrade", fragmentShader, {
      uniforms: new Map([
        ["brightness", new Uniform(brightness)],
        ["contrast", new Uniform(contrast)],
        ["saturation", new Uniform(saturation)],
        ["vigOffset", new Uniform(vigOffset)],
        ["vigDarkness", new Uniform(vigDarkness)],
        ["uWarp", new Uniform(0)],
      ]),
    });
    this.warpVelRef = warpVelRef || null;
  }

  /* Pull the live warp intensity each frame (EffectPass calls update()). */
  update() {
    const w = this.warpVelRef ? Math.min(1, Math.abs(this.warpVelRef.current || 0)) : 0;
    this.uniforms.get("uWarp").value = w;
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
      warpVelRef,
    },
    ref
  ) => {
    const effect = useMemo(
      () => new CinematicGradeEffect({ brightness, contrast, saturation, vigOffset, vigDarkness, warpVelRef }),
      [brightness, contrast, saturation, vigOffset, vigDarkness, warpVelRef]
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

CinematicGrade.displayName = "CinematicGrade";

export default CinematicGrade;
