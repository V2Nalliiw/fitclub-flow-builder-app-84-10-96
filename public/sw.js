
const CACHE_NAME = 'fitclub-emagrecimento-v9';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/lovable-uploads/8ec88394-8fc7-4b3b-91ad-5b7896234393.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Install event v9');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell v9');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Error caching files:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch((error) => {
        console.error('[SW] Fetch error:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event v9');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return Promise.resolve();
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push notification received:', data);
    
    const options = {
      body: data.body || 'Nova notificação do FitClub',
      icon: '/lovable-uploads/8ec88394-8fc7-4b3b-91ad-5b7896234393.png',
      badge: '/lovable-uploads/8ec88394-8fc7-4b3b-91ad-5b7896234393.png',
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

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
