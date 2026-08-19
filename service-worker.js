const CACHE_NAME = "dayscape-shell-v1.2.7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./config.js",
  "./demo-key.html",
  "./privacy.html",
  "./terms.html",
  "./app.js",
  "./app-01.js",
  "./app-02.js",
  "./app-03.js",
  "./app-04.js",
  "./app-05.js",
  "./app-06.js",
  "./app-07.js",
  "./app-08.js",
  "./app-09.js",
  "./styles.css",
  "./styles-01.css",
  "./styles-02.css",
  "./styles-03.css",
  "./styles-04.css",
  "./styles-05.css",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Weather / Google Places は常にネットワークを利用し、失敗時はアプリ側のフォールバックに任せる。
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match("./index.html")) || Response.error())
    );
    return;
  }

  // オンライン時は常に最新版を取得し、失敗時だけキャッシュへフォールバックする。
  // これによりPWAを再インストールせず、CSS/JavaScript更新を受け取れる。
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error())
  );
});
