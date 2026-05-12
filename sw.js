const CACHE = 'xiaozhangben-v1';
const URLS = [
  '.',
  'index.html',
  'css/style.css',
  'js/storage.js',
  'js/classifier.js',
  'js/voice.js',
  'js/charts.js',
  'js/app.js',
  'manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
