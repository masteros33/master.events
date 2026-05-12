const CACHE = "me-v1";
const STATIC = [
  "/",
  "/index.html",
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

  // Static assets — cache first
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