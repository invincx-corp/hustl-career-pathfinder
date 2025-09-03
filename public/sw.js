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
        return response || fetch(event.request);
      }
    )
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