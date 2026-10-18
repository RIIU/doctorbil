/* DoctorBill service worker (PWA offline support)
   - Same-origin GET only; caches shell + static assets.
   - Navigations: network-first, fallback to cache, then /offline.html.
   - Static assets: cache-first, refresh in background (stale-while-revalidate).
   - /api/* is never cached (bill submission & status must hit the server). */
const CACHE = "doctorbill-v1";
const CORE = [
  "/", "/index.html", "/compare.html", "/hospitals.html", "/calculator.html",
  "/tracker.html", "/guide.html", "/submit-bill.html", "/emergency.html",
  "/contact.html", "/privacy.html", "/terms.html", "/offline.html",
  "/assets/css/styles.css", "/assets/js/data.js", "/assets/js/app.js", "/assets/js/format.js",
  "/assets/img/icon.svg", "/assets/img/logo.svg", "/assets/img/logo-footer.svg", "/manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) =>
    Promise.allSettled(CORE.map((u) => c.add(new Request(u, { credentials: "same-origin" }))))
  ).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // fonts/OSM tiles: network only
  if (url.pathname.startsWith("/api/")) return;          // live data: network only

  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((m) => m || caches.match("/offline.html"))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || refresh;
    })
  );
});
