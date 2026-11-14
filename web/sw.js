const CACHE_NAME = 'auracalc-shell-v9';
const RUNTIME_CACHE = 'auracalc-runtime-v9';
const RUNTIME_LIMIT = 180;
const APP_SHELL = [
  '/feedback-client.mjs',
  '/', '/app.css', '/aura-theme.css', '/lenis.css', '/scroll.mjs', '/vendor/lenis.mjs', '/app.mjs', '/home-app.mjs', '/catalog-topics.mjs', '/unified-search.mjs', '/measurement-search.mjs', '/result-report.mjs', '/report.css', '/conversion-handoff.mjs', '/currency-core.mjs', '/currency/', '/currency/currency.mjs', '/builder-core.mjs', '/builder/', '/builder/builder.mjs', '/field-directory-page.mjs', '/storage.mjs', '/ads.mjs', '/manifest.webmanifest', '/icon.svg', '/unit-converter/', '/converters/', '/fields/', '/measure/', '/measure/photo/', '/measure/ar/', '/measure/speed/', '/measure/measure.css', '/measure/measure.mjs', '/measure/speed-core.mjs', '/measure/ar.mjs', '/measure/ar-core.mjs', '/measurement-core.mjs',
  '/catalog/public/formulas.mjs', '/catalog/public/converters.mjs', '/catalog/field-directory.mjs', '/catalog/field-tool-index.mjs', '/catalog/field-route.mjs',
  '/catalog/public/percentage-change.mjs', '/catalog/public/rectangle-area.mjs',
  '/catalog/public/rectangular-prism-volume.mjs', '/catalog/public/average-speed.mjs',
  '/src/calculation-core/index.mjs', '/src/calculation-core/errors.mjs', '/src/calculation-core/dimensions.mjs',
  '/src/calculation-core/units.mjs', '/src/calculation-core/number-input.mjs', '/src/calculation-core/quantity.mjs',
  '/src/calculation-core/definition.mjs', '/src/calculation-core/registry.mjs', '/src/calculation-core/engine.mjs',
  '/src/calculation-core/workflow.mjs',
  '/experience.css', '/builder/studio.mjs', '/builder/studio.css', '/measure/lab.css', '/measure/demo.svg', '/offline.html',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('nexora-shell-') || key.startsWith('auracalc-shell-') || key.startsWith('auracalc-runtime-')) && ![CACHE_NAME,RUNTIME_CACHE].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

let cacheWrite = Promise.resolve();
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/api/')) return;
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin || requestUrl.search) return;
  const responseTask = fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      cacheWrite = cacheWrite.catch(() => {}).then(async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(event.request, copy);
        const keys = await cache.keys();
        for (const key of keys.slice(0, Math.max(0, keys.length - RUNTIME_LIMIT))) await cache.delete(key);
      }).catch(() => {}); // A full/private browser cache must not break calculations.
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return (await caches.match('/offline.html')) || new Response('Offline. Reconnect to open this tool.', { status: 503 });
    return new Response('Offline and this resource has not been cached.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  });
  event.respondWith(responseTask);
  event.waitUntil(responseTask.then(() => cacheWrite).catch(() => {}));
});
