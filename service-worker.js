// service-worker.js
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("app-cache-v1").then((cache) => {
      return cache.addAll([
          "/H4xAssist/",
          "/H4xAssist/index.html",
          "/H4xAssist/styles/style.css",
          "/H4xAssist/scripts/app.js",
          "/H4xAssist/images/H4x-192.png",
          "/H4xAssist/images/H4x-512.png"
        ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});