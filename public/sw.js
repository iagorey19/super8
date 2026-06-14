const CACHE = "super8-v1"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API calls - network only
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request).catch(() => Response.json({ error: "offline" }, { status: 503 })))
    return
  }

  // Navigation & assets - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, clone))
        return response
      })
      .catch(() => caches.match(request))
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
})
