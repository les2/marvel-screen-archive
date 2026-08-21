const CACHE = 'marvel-archive-v0.4.0';
const CORE = [
  '/index.html', '__MAIN_ASSET__', '__STYLE_ASSET__', '/manifest.webmanifest', '/favicon.svg', '/og.png',
  '/data/metadata.json', '/data/titles.json', '/data/characters.json', '/data/universes.json', '/data/sagas.json', '/data/phases.json', '/data/story-arcs.json',
  '/data/collections.json', '/data/appearances.json', '/data/credit-scenes.json', '/data/sources.json',
  '/data/schema/metadata.schema.json', '/data/schema/title.schema.json', '/data/schema/character.schema.json', '/data/schema/universe.schema.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request.mode === 'navigate' ? '/index.html' : request, response.clone());
    return response;
  } catch {
    return (await cache.match(request.mode === 'navigate' ? '/index.html' : request)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;
  const immutableAsset = /\/(?:main|styles)-[a-f0-9]{12}\.(?:js|css)$/.test(url.pathname);
  event.respondWith(immutableAsset ? cacheFirst(request) : networkFirst(request));
});
