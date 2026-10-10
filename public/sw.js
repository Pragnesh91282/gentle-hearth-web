// Thehrav service worker.
// Shows phone notifications (never with message text), and stores only
// public pages that should work offline (the app home and the
// breathing and grounding exercises), the offline page, and the static files
// they need. Conversations, inbox, and account pages are never cached,
// because a phone may be shared with others.
const CACHE = "thehrav-v3";
const OFFLINE_URL = "/offline";
const OFFLINE_PAGES = ["/app", "/pause", "/ground", OFFLINE_URL];
const STATIC_PREFIXES = ["/_next/static/", "/icons/"];

// Finds the scripts, styles, and fonts a page needs, so it works offline.
async function assetsFor(response) {
  const text = await response.text();
  return [...new Set(text.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
}

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set(["/icons/icon-192.png"]);
  for (const page of OFFLINE_PAGES) {
    const response = await fetch(page, { cache: "no-store" });
    if (!response.ok) continue;
    await cache.put(page, response.clone());
    for (const asset of await assetsFor(response)) assets.add(asset);
  }
  // Stylesheets point at font files; fetch those too.
  for (const asset of [...assets].filter((url) => url.endsWith(".css"))) {
    const css = await fetch(asset);
    if (css.ok) for (const font of await assetsFor(css)) assets.add(font);
  }
  await Promise.all([...assets].map((url) => cache.add(url).catch(() => undefined)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: always from the network; offline, fall back to a stored public page.
  if (request.mode === "navigate") {
    const offlinePage = OFFLINE_PAGES.includes(url.pathname) ? url.pathname : null;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (offlinePage && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(offlinePage, copy));
          }
          return response;
        })
        .catch(async () => (offlinePage && (await caches.match(offlinePage))) || caches.match(OFFLINE_URL)),
    );
    return;
  }

  // Build files never change once published, so the stored copy is safe to use.
  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});

// Phone notifications sent by src/lib/push.ts.
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Thehrav", {
      body: data.body || "You have a new message.",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      // A newer notification for the same conversation replaces the last.
      tag: data.tag || "thehrav",
      renotify: false,
      data: { url: data.url || "/inbox" },
    }),
  );
});

// Opening a notification focuses an open Thehrav window, or opens one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/inbox", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) return open.focus().then(() => open.navigate(target));
      return self.clients.openWindow(target);
    }),
  );
});
