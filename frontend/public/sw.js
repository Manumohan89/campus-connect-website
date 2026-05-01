const CACHE_NAME = 'campus-connect-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// Install — pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Helper: safely clone and cache a response without consuming the original
function cacheResponse(request, response) {
  if (!response || !response.ok) return;
  const responseToCache = response.clone(); // clone BEFORE any async op
  caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache)).catch(() => {});
}

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from same origin (skip cross-origin API calls to Render)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Never intercept auth or upload endpoints
  const skipPaths = ['/api/users/login', '/api/users/register', '/api/users/verify-otp',
    '/api/users/upload-marks', '/api/users/sgpa-public', '/api/users/profile-photo'];
  if (skipPaths.some(p => url.pathname.includes(p))) return;

  // Static assets (JS, CSS, images, fonts): cache first
  if (url.pathname.startsWith('/static/') || url.pathname.match(/\.(js|css|png|jpg|jpeg|ico|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          cacheResponse(request, response);
          return response;
        });
      })
    );
    return;
  }

  // HTML navigation: network first, fall back to cached index or offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          cacheResponse(request, response);
          return response;
        })
        .catch(() =>
          caches.match('/').then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Everything else: network only (don't cache dynamic API responses)
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Campus Connect';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: data.url || '/' },
    actions: [{ action: 'open', title: 'Open' }],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
