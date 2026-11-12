// Auto-destrucción y purga inmediata de caché antigua para Alianza Estratégica
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => {
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => client.navigate(client.url));
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Evitar cualquier caché local, siempre buscar en la red fresca
  event.respondWith(fetch(event.request));
});
