"use client"

import { useEffect, useState } from "react"

export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing
          if (newSW) {
            newSW.addEventListener("statechange", () => {
              if (newSW.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[SW] Nova versão disponível")
                setUpdateAvailable(true)
              }
            })
          }
        })
      }).catch(() => {})
    })
  }, [])

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
      <span className="text-sm font-medium">Nova versão disponível</span>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-amber-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors"
      >
        Atualizar agora
      </button>
    </div>
  )
}
