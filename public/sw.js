const CACHE = "super8-v1"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") {
      return
    }
    event.respondWith(
      fetch(request.clone()).catch(() =>
        Response.json({ error: "offline" }, { status: 503 })
      )
    )
    return
  }

  event.respondWith(
    fetch(request.clone())
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, clone))
        return response
      })
      .catch(() => caches.match(request))
  )
})
