/*
 * §7 / §9.3 — KTX2 URL rewriter (behind ?ktx2=1).
 *
 * Extending the texture pipeline to KTX2 needs two parts:
 *
 *  1. Build:    scripts/convert-textures.mjs regenerates .ktx2 siblings
 *               for every .webp/.jpg/.png in public/textures (using
 *               `basis_universal` or `@gltf-transform/functions`).
 *               NOT wired here — needs `npm install` of the transcoder
 *               deps + user sign-off on the ~20MB CLI download.
 *
 *  2. Runtime:  KTX2Loader registered with the useLoader callsites
 *               (Planet.jsx, Nebulae.jsx, Skybox.jsx) so `.ktx2` URLs
 *               transcode on the GPU. `three/examples/jsm/loaders/
 *               KTX2Loader` + `renderer.detectSupport()` handle the
 *               GPU format probe.
 *
 * This module is step 3 — the URL rewriter that swaps `.webp` → `.ktx2`
 * when the runtime flag is on. Every useLoader call runs its URL through
 * `ktx2Url()` before handing to TextureLoader. Off by default → paths
 * are unchanged → current WebP behavior preserved.
 *
 * Flip on:  ?ktx2=1  (a URL query param — no build-time env needed)
 *
 * When the loader isn't wired yet, turning the flag on will 404 every
 * texture. Keep it OFF until the pipeline (1) + loader registration (2)
 * both land.
 */

let _enabled = null;

export function isKtx2Enabled() {
  if (_enabled !== null) return _enabled;
  if (typeof window === "undefined") return (_enabled = false);
  _enabled = new URLSearchParams(window.location.search).get("ktx2") === "1";
  return _enabled;
}

export function ktx2Url(url) {
  if (!url) return url;
  if (!isKtx2Enabled()) return url;
  return url.replace(/\.(webp|jpe?g|png)(?=$|\?)/i, ".ktx2");
}

export function ktx2Urls(urls) {
  if (!isKtx2Enabled()) return urls;
  return urls.map(ktx2Url);
}
