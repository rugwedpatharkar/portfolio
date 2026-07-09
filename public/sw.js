/* Portfolio service worker.
 *
 * Strategy:
 *   - Precache the app shell (HTML + logo + manifest) so the page renders
 *     instantly on repeat visits, even offline.
 *   - Hashed Vite build assets (/assets/*) use cache-first — they're
 *     content-addressed so they never go stale.
 *   - Same-origin static images (.png/.jpg/.webp/.svg) use stale-while-revalidate
 *     — repeat visits paint immediately, fresh copy is fetched in the background.
 *   - HTML navigations use network-first with a cached fallback, so a deploy
 *     ships its new HTML to anyone online but offline visitors still see the app.
 *   - Cross-origin (fonts.googleapis.com, EmailJS) is left alone.
 */

// Bump this on every deploy. With no auto-versioning we keep a manual counter;
// users who arrive after a deploy will re-fetch index.html on first nav and
// the new SW will swap in via skipWaiting.
const CACHE_VERSION = 'v5';
const SHELL_CACHE = `portfolio-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `portfolio-assets-${CACHE_VERSION}`;
const IMAGE_CACHE = `portfolio-images-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  '/og-image.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !validCaches.has(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

const isHashedAsset = (url) => url.pathname.startsWith('/assets/');
const isImage = (url) => /\.(png|jpe?g|webp|avif|svg|ico)$/i.test(url.pathname);
const isNavigation = (request) => request.mode === 'navigate';

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) cache.put(request, fresh.clone());
  return fresh;
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || network || fetch(request);
};

const networkFirstNavigation = async (request) => {
  const cache = await caches.open(SHELL_CACHE);
  try {
    /* Race the network against a 5s timeout so a hanging connection falls back
       to the cached shell instead of leaving the visitor on a blank page. */
    const fresh = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);
    if (fresh.ok) cache.put('/index.html', fresh.clone());
    return fresh;
  } catch {
    return (await cache.match(request)) || (await cache.match('/index.html'));
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;
  if (url.origin !== self.location.origin) return;

  if (isNavigation(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }
  if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
