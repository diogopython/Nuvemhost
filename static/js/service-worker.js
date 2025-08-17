const CACHE_NAME = 'nuvemhost-cache-v1';
const urlsToCache = [
  '/',
  '/static/css/styles.css',
  '/static/js/base.js',
  '/static/images/favicon.png'
  // Adicione outras URLs estáticas do seu site que você quer cachear
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
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

