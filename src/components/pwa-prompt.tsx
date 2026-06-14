"use client"

import { useEffect, useState } from "react"

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null)
      setShow(false)
    })
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
          🏟️
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Instalar THE SUPER 8</p>
          <p className="text-xs text-gray-500">Adicione à tela inicial para acesso rápido</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShow(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium">
            Agora não
          </button>
          <button onClick={handleInstall} className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">
            Instalar
          </button>
        </div>
      </div>
    </div>
  )
}