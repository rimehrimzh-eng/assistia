// Service Worker — AssistIA PWA
const CACHE_NAME = 'assistia-v1';
const URLS_TO_CACHE = [
  '/assistia/',
  '/assistia/index.html'
];

// Installation — mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('AssistIA PWA — Cache ouvert');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation — nettoyage anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — servir depuis le cache si disponible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit — retourner la réponse en cache
      if (response) return response;
      
      // Sinon chercher sur le réseau
      return fetch(event.request).then(response => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Mettre en cache la nouvelle ressource
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Hors ligne — retourner la page en cache
        return caches.match('/assistia/');
      });
    })
  );
});

// Notifications Push (pour plus tard)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nouveau message AssistIA',
    icon: '/assistia/icon-192.png',
    badge: '/assistia/icon-192.png',
    vibrate: [100, 50, 100],
  };
  event.waitUntil(
    self.registration.showNotification('AssistIA', options)
  );
});
