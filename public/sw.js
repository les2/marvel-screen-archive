const CACHE = 'marvel-archive-v0.2.0';
const CORE = [
  '/', '/index.html', '/main.js', '/styles.css', '/manifest.webmanifest', '/favicon.svg', '/og.png',
  '/data/metadata.json', '/data/titles.json', '/data/characters.json', '/data/universes.json', '/data/sagas.json', '/data/phases.json', '/data/story-arcs.json',
  '/data/collections.json', '/data/appearances.json', '/data/credit-scenes.json', '/data/sources.json',
  '/data/schema/metadata.schema.json', '/data/schema/title.schema.json', '/data/schema/character.schema.json', '/data/schema/universe.schema.json'
];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put(request, copy)); return response; }).catch(() => request.mode === 'navigate' ? caches.match('/index.html') : undefined)));
});
