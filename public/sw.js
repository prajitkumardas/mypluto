/* Pluto Finds service worker: explicit, conservative caching for public GET resources only. */
const VERSION = "v1";
const PREFIX = "pluto-pwa-";
const CACHES = {
  core: `${PREFIX}core-${VERSION}`,
  pages: `${PREFIX}pages-${VERSION}`,
  static: `${PREFIX}static-${VERSION}`,
  images: `${PREFIX}images-${VERSION}`,
  data: `${PREFIX}data-${VERSION}`
};
const CORE_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/images/plutofinds-logo.png"
];
const PRIVATE_PATHS = ["/admin", "/login", "/auth", "/submit-tool"];

self.addEventListener("install", (event) => {
  event.waitUntil(precacheCore());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(PREFIX) && !Object.values(CACHES).includes(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    if (url.pathname === "/api/trending") event.respondWith(networkFirst(request, CACHES.data, 8, 24 * 60 * 60 * 1000));
    return;
  }

  if (request.mode === "navigate") {
    if (isPrivatePath(url.pathname)) return;
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || request.destination === "font") {
    event.respondWith(cacheFirst(request, CACHES.static, 90));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, CACHES.images, 80));
  }
});

async function precacheCore() {
  const cache = await caches.open(CACHES.core);
  await Promise.allSettled(CORE_URLS.map(async (url) => {
    const response = await fetch(new Request(url, { cache: "reload" }));
    if (isCacheable(response)) await cache.put(url, response);
  }));
}

async function navigationNetworkFirst(request) {
  const cache = await caches.open(CACHES.pages);
  try {
    const response = await fetch(request);
    if (isCacheable(response) && !isPrivatePath(new URL(request.url).pathname)) {
      await cache.put(request, response.clone());
      await trimCache(CACHES.pages, 24);
    }
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match("/offline")) || Response.error();
  }
}

async function cacheFirst(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    await trimCache(cacheName, limit);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fresh = fetch(request).then(async (response) => {
    if (isCacheable(response)) {
      await cache.put(request, response.clone());
      await trimCache(cacheName, limit);
    }
    return response;
  }).catch(() => cached || Response.error());
  return cached || fresh;
}

async function networkFirst(request, cacheName, limit, maxAgeMs) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const headers = new Headers(response.headers);
      headers.set("sw-cached-at", String(Date.now()));
      const stamped = new Response(await response.clone().blob(), { status: response.status, statusText: response.statusText, headers });
      await cache.put(request, stamped);
      await trimCache(cacheName, limit);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    const cachedAt = Number(cached?.headers.get("sw-cached-at") || "0");
    if (cached && Date.now() - cachedAt <= maxAgeMs) return cached;
    return new Response(JSON.stringify({ error: "Offline and no recent cached data is available." }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

function isCacheable(response) {
  return response.ok && response.type === "basic" && !response.headers.has("set-cookie");
}

function isPrivatePath(pathname) {
  return PRIVATE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > limit) await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}
