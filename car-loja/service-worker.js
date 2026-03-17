const CACHE_NAME = "autovitrine-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./css/style.css",
  "./js/catalog.js",
  "./js/store.js",
  "./js/app.js",
  "./js/dashboard.js",
  "./js/sw-register.js",
  "./manifest.webmanifest",
  "./images/car.jpeg",
  "./images/car.avif",
  "./images/icon-192.png",
  "./images/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
