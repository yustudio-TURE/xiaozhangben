// 版本号 — 每次更新代码后改这里，手机就会自动更新
var CACHE = 'xiaozhangben-v9';
var URLS = [
  '.',
  'index.html',
  'css/style.css',
  'js/storage.js',
  'js/classifier.js',
  'js/voice.js',
  'js/charts.js',
  'js/auth.js',
  'js/app.js',
  'manifest.json'
];

// 安装：缓存所有文件
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(URLS); }));
});

// 激活：删除旧版本缓存
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE) return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 请求：优先用网络（获取最新），网络失败才用缓存
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
