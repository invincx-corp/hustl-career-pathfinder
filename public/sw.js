const CACHE_NAME = 'nexa-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add more static assets as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Only fetch same-origin requests to avoid CORS issues
        if (event.request.url.startsWith(self.location.origin)) {
          return fetch(event.request);
        }
        
        // For external requests, return a basic response to avoid CORS errors
        return new Response('External API not available in service worker', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
      .catch(error => {
        console.warn('Service worker fetch error:', error);
        return new Response('Network error', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Background sync for offline behavior tracking
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncBehaviorData());
  }
});

async function syncBehaviorData() {
  // This would sync stored behavior events when back online
  console.log('Syncing behavior data...');
}