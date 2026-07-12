/*
 * §6.4 / Phase 4 — shared GLSL chunks.
 *
 * NaN-safe fresnel: clamps the dot product to [0, 1) BEFORE pow(). Any new
 * additive shader that fresnels the rim (edge glow, ring halo, back-lit hair
 * on a nebula) should paste this in — a raw `pow(1.0 - dot(n,v), p)` will
 * produce NaN pixels wherever dot(n,v) > 1 due to non-unit vectors from
 * instance interpolation, and NaN pixels compound through additive blending
 * to a bright white bloom smear.
 *
 * Usage inside a shader:
 *
 *   #include <your shared chunk block or just paste as a string>
 *   float rim = safeFresnel(normal, viewDir, 3.0);
 *
 * If you're on ShaderMaterial (not one of the shader-lib includes) just
 * template the SAFE_FRESNEL string into your fragmentShader source.
 */

export const SAFE_FRESNEL = /* glsl */ `
float safeFresnel(vec3 n, vec3 v, float p) {
  return pow(max(0.0, 1.0 - dot(n, v)), p);
}
`;
