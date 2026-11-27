// Caché offline. Al cambiar cualquier archivo, subir el número de versión.
const V = "operativo-v52";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./app.js",
  "./data.js",
  "./codigos.js",
  "./anotador.js",
  "./anexos.js",
  "./protocolos.js",
  "./protocolos-data.js",
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
    ).then(() => self.clients.claim())
  );
});

// Estrategia: devuelve caché al instante y actualiza en segundo plano.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return; // APIs externas (geocodificación) van directo a la red
  e.respondWith(
    caches.match(req, { ignoreSearch: req.mode === "navigate" }).then(cached => {
      const red = fetch(req)
        .then(n => {
          if (n && n.status === 200 && n.type === "basic") {
            const cp = n.clone();
            e.waitUntil(caches.open(V).then(c => c.put(req, cp)));
          }
          return n;
        })
        .catch(() => {
          if (cached) return cached;
          // Solo las navegaciones caen al index.html; un script o imagen faltante no debe devolver HTML
          if (req.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        });
      return cached || red;
    })
  );
});
