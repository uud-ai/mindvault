const CACHE = 'mindvault-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.add('./index.html')).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('api.z.ai') || url.hostname.includes('bigmodel.cn')) return;
  if (!url.protocol.startsWith('http')) return;

  e.respondWith(
    fetch(e.request).then(response => {
      // clone() ОБЯЗАТЕЛЬНО до return, иначе тело уже прочитано → ошибка
      const clone = response.clone();
      if (response.ok) {
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return response;
    }).catch(() =>
      caches.match(e.request).then(cached => cached || caches.match('./index.html'))
    )
  );
});
