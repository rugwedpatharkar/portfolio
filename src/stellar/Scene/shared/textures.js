import * as THREE from "three";

/*
 * Shared canvas-texture factories used by the point clouds and additive sprites.
 * Every soft-dot in the scene used to be a hand-rolled `document.createElement`
 * → `createRadialGradient` → `new THREE.CanvasTexture(c)` chain, ~15 lines
 * duplicated across 7 files. This module centralises that.
 *
 * SSR-safe: returns `null` when `document` is undefined; callers use `useMemo`
 * (or a module-level singleton) and gate on truthy.
 *
 * Disposal: callers hold the texture ref for the mount lifetime. Module-level
 * singletons leak on route change; the disposal audit in Phase 7 will move
 * them behind a `useMemo` so R3F's auto-dispose owns the lifecycle.
 */

const DEFAULT_STOPS = [
  [0, "rgba(255,255,255,1)"],
  [0.4, "rgba(255,255,255,0.35)"],
  [1, "rgba(255,255,255,0)"],
];

/**
 * @param {Object}  [opts]
 * @param {number}  [opts.size=64]      canvas edge in pixels (square)
 * @param {Array<[number,string]>} [opts.stops]   gradient stops [[t, rgba], …];
 *                                                 t in [0,1], rgba any CSS colour.
 *                                                 Default = solid-white centre
 *                                                 feathering to transparent.
 * @param {boolean} [opts.mipmaps=false] enables LinearMipmapLinearFilter — set
 *                                       true for point clouds sampled at many
 *                                       distances (Stars, MilkyWay).
 * @param {number}  [opts.anisotropy=0]  up to 16; set for point clouds with
 *                                       very-close texel density (Stars).
 * @returns {THREE.CanvasTexture|null}
 */
export function makeSoftDot({ size = 64, stops = DEFAULT_STOPS, mipmaps = false, anisotropy = 0 } = {}) {
  if (typeof document === "undefined") return null;
  const s = size;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  for (const [t, colour] of stops) g.addColorStop(t, colour);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  if (mipmaps) {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
  }
  if (anisotropy) tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}
