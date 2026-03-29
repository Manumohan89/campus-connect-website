const CACHE_NAME = 'campus-connect-v2';
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/manifest.json',
  '/offline.html',
];

const CACHE_STRATEGIES = {
  static: ['/static/'],
  network_first: ['/api/users/notifications', '/api/users/profile', '/api/features/placements'],
  cache_first: ['/api/resources', '/api/training/courses'],
};

// Install — pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    ).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) return;

  // API: network first with cache fallback (except auth endpoints)
  if (url.pathname.startsWith('/api/')) {
    const isAuth = ['/login', '/register', '/verify-otp', '/refresh-token'].some(p => url.pathname.includes(p));
    if (isAuth) return; // Never cache auth endpoints

    const isCacheFirst = CACHE_STRATEGIES.cache_first.some(p => url.pathname.startsWith(p));

    if (isCacheFirst) {
      event.respondWith(
        caches.match(request).then(cached => {
          if (cached) {
            // Refresh in background
            fetch(request).then(response => {
              if (response.ok) caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
            }).catch(() => {});
            return cached;
          }
          return fetch(request).then(response => {
            if (response.ok) caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
            return response;
          });
        })
      );
    } else {
      event.respondWith(
        fetch(request).then(response => {
          if (response.ok) caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
          return response;
        }).catch(() => caches.match(request).then(cached => cached || new Response(
          JSON.stringify({ error: 'Offline — cached data unavailable' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )))
      );
    }
    return;
  }

  // Static assets: cache first
  if (url.pathname.startsWith('/static/') || url.pathname.match(/\.(js|css|png|jpg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(c => c.put(request, response.clone()));
        return response;
      }))
    );
    return;
  }

  // HTML navigation: network first, fall back to cached index.html
  event.respondWith(
    fetch(request).catch(() =>
      caches.match('/').then(cached => cached || caches.match('/offline.html'))
    )
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Campus Connect', {
      body: data.body || 'You have a new notification',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url: data.link || '/' },
      vibrate: [100, 50, 100],
      tag: data.tag || 'campus-connect',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
