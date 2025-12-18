/**
 * Service Worker for Ambulance Inventory Finder
 * Enables 100% offline operation - CRITICAL for no-cell-service areas
 */

const CACHE_NAME = 'hnfd-rescue-v2.3.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/version.json',
  // All PWA icons (required for offline install)
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  // Logo and equipment images
  '/images/hnfr-logo.png',
  '/images/trauma_bag_adult.jpg',
  '/images/cabinet_k_overview.jpg',
  '/images/intubation_kit.jpg',
  '/images/pediatric_bags.jpg',
  '/images/drug_box.jpg',
  '/images/lifepak_bag.jpg',
  '/images/lifepak_mounted.jpg',
  '/images/drawer_n.jpg',
  '/images/drawer_n_labeled.jpg',
  '/images/oxygen_tanks.jpg',
  '/images/cabinet_d_aed.jpg'
];

// Install - cache all assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Install complete, activating immediately');
        return self.skipWaiting();
      })
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch - cache-first strategy for offline operation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone and cache the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);

            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }

            throw error;
          });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
