const CACHE_NAME = 'fit-seven-pwa-v4';
const ASSETS_TO_CACHE = [
  '/fit-seven/',
  '/fit-seven/index.html',
  '/fit-seven/manifest.json',
  '/fit-seven/icons/icon-192.png',
  '/fit-seven/icons/icon-512.png',
  '/fit-seven/assets/logo.jpg'
];

// Instalacao do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Aviso ao pré-carregar cache inicial:', err);
      });
    })
  );
});

// Ativacao e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// Listener de Fetch (Pass-through com fallback de rede/cache)
self.addEventListener('fetch', (event) => {
  // Ignora chamadas que nao sejam GET ou de esquemas nao suportados (ex: chrome-extension, supabase auth websockets)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta for valida, pode opcionalmente clonar para cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback para cache quando offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se for uma navegacao de pagina, retorna o index.html em cache
          if (event.request.mode === 'navigate') {
            return caches.match('/fit-seven/index.html');
          }
        });
      })
  );
});
