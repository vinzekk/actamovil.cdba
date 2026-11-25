// Caché offline. Al cambiar cualquier archivo, subir el número de versión.
const V = "operativo-v37";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./app.js",
  "./data.js",
  "./codigos.js",
  "./manifest.json",
  "./favicon-64.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(V).then(async c => {
      for (const url of ARCHIVOS) {
        try {
          await c.add(url);
        } catch (err) {
          console.warn("No se pudo cachear en instalación:", url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: devuelve caché al instante y actualiza en segundo plano.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return; // APIs externas (geocodificación) van directo a la red
  e.respondWith(
    caches.match(e.request).then(cached => {
      const red = fetch(e.request)
        .then(n => {
          if (n && n.status === 200 && new URL(e.request.url).origin === location.origin) {
            const cp = n.clone();
            caches.open(V).then(c => c.put(e.request, cp));
          }
          return n;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || red;
    })
  );
});
