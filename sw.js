/**
 * Service Worker for Ambulance Inventory Finder
 * Enables 100% offline operation - CRITICAL for no-cell-service areas
 */

// Import version from single source of truth
importScripts('/version.js');
const CACHE_NAME = 'hnfd-rescue-v' + APP_VERSION;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/onboard.html',
  '/app.js',
  '/version.js',
  '/manifest.json',
  '/version.json',
  // Tenant configuration (default tenant)
  '/tenants/hnfd/config.json',
  '/tenants/hnfd/equipment.json',
  // All PWA icons (required for offline install)
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  // Logo, splash, and equipment images
  '/images/splash-ambulance.jpg',
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
  '/images/cabinet_d_aed.jpg',
  // Location guide images (v2.6.0)
  '/images/locations/ambulance_exterior_side.jpg',
  '/images/locations/ambulance_interior_overview.jpg',
  '/images/locations/cabinet_k_overview.jpg',
  '/images/locations/drawer_n_open.jpg',
  '/images/locations/drawer_n_contents.jpg',
  '/images/locations/oxygen_compartment.jpg',
  '/images/locations/drug_box_cabinet.jpg',
  '/images/locations/adult_trauma_bag_closeup.jpg',
  '/images/locations/aed_closeup.jpg',
  '/images/locations/drug_box_closeup.jpg',
  '/images/locations/lifepak_closeup.jpg',
  '/images/locations/narcan_syringe_closeup.jpg',
  '/images/locations/oxygen_tanks_closeup.jpg'
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
