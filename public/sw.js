
const CACHE_NAME = 'fitclub-emagrecimento-v10';
const RUNTIME_CACHE = 'fitclub-runtime-v10';
const OFFLINE_URL = '/offline.html';

// Assets essenciais para cache durante instalação
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/lovable-uploads/79c845c0-bba5-4d91-9afc-1ad0fff984fa.png'
];

// Install event - precache dos recursos essenciais
self.addEventListener('install', (event) => {
  console.log('[SW] Install event v10');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell v10');
        return cache.addAll(PRECACHE_URLS);
      })
      .catch((error) => {
        console.error('[SW] Error during precaching:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event v10');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - estratégias de cache diferenciadas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests de chrome-extension e outros protocolos
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Estratégia para diferentes tipos de recursos
  if (isStaticAsset(request)) {
    // Cache First para assets estáticos (JS, CSS, imagens)
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    // Network First para API calls
    event.respondWith(networkFirst(request));
  } else if (isNavigationRequest(request)) {
    // Stale While Revalidate para navegação
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Network First como fallback
    event.respondWith(networkFirst(request));
  }
});

// Cache First Strategy - para assets estáticos
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First error:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy - para API calls
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network First error:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy - para navegação
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Se network falha e não tem cache, retorna página offline
    if (!cachedResponse) {
      return caches.match(OFFLINE_URL);
    }
  });

  return cachedResponse || fetchPromise;
}

// Helpers para identificar tipos de request
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.hostname.includes('supabase.co') || 
         url.pathname.startsWith('/api/') ||
         url.pathname.startsWith('/functions/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync v10');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push notification received v10:', data);
    
    const options = {
      body: data.body || 'Nova notificação do FitClub',
      icon: '/lovable-uploads/79c845c0-bba5-4d91-9afc-1ad0fff984fa.png',
      badge: '/lovable-uploads/79c845c0-bba5-4d91-9afc-1ad0fff984fa.png',
      tag: 'fitclub-notification',
      renotify: true,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Abrir FitClub'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'FitClub', options)
    );
  }
});

// Notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received v10');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling para comunicação com app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
