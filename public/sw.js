const CACHE = "super8-v2"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  )
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

  // Só GET navegacional/estático; nunca guarda erro
  if (request.method !== "GET") return

  event.respondWith(
    fetch(request.clone())
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === "navigate") {
          const shell = await caches.match("/")
          if (shell) return shell
        }
        return Response.error()
      })
  )
})
