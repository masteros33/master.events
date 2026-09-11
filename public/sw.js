const CACHE = "me-v3";
// index.html is deliberately NOT pre-cached. It names the content-hashed
// bundles for one particular build, so serving a stale copy pins the visitor
// to that build forever — new deploys never reach them.
const STATIC = [
  "/manifest.json",
];

// ── Own origins only — skip everything external ───────────────
const OWN_ORIGINS = [
  self.location.origin,
];

const SKIP_DOMAINS = [
  "paystack.com",
  "paystack.co",
  "js.paystack.co",
  "api.paystack.co",
  "polygonscan.com",
  "alchemy.com",
  "cloudinary.com",
  "unsplash.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "posthog.com",
];

function shouldSkip(url) {
  try {
    const u = new URL(url);
    // Skip non-http
    if (!u.protocol.startsWith("http")) return true;
    // Skip all external domains
    if (!OWN_ORIGINS.includes(u.origin)) return true;
    return false;
  } catch {
    return true;
  }
}

// Install
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — only handle same-origin requests
self.addEventListener("fetch", e => {
  // Skip non-GET
  if (e.request.method !== "GET") return;

  // Skip ALL external domains — let browser handle them natively
  if (shouldSkip(e.request.url)) return;

  // Same-origin only from here
  const url = new URL(e.request.url);

  // API calls — network first, no cache
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // The document itself — network first.
  //
  // This is the whole reason a deploy reaches anyone. index.html points at
  // build-specific hashed filenames; caching it first meant a returning
  // visitor kept being handed the old document, which asked for the old
  // bundles, which were also cached. Every user stayed on whatever build they
  // happened to see first. Cache is the offline fallback only.
  if (e.request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html")) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put("/index.html", clone));
          }
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Hashed build assets — cache first is correct here, because the filename
  // changes whenever the contents change, so a cached copy can never be stale.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.status < 400) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match("/index.html"));
    })
  );
});