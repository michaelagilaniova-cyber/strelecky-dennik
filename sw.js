const CACHE_NAME = 'score-offline-v30';
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com/3.4.3',
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.24.4/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    ))
  );
});

// ZACHRANNÁ STRATÉGIA: Najprv sieť (aby si vždy videla novú verziu), potom cache (do lesa)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).then(response => {
      const resClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
      return response;
    }).catch(() => {
      // Sme offline - vraciame z pamäte
      return caches.match(event.request).then(cached => {
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
