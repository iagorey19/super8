"use client"

import { useEffect, useState } from "react"
import { initData } from "@/lib/store"

export function DataLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    localStorage.removeItem("super8-data")

    initData()
      .then(() => { if (!cancelled) setReady(true) })
      .catch(() => {
        if (cancelled) return
        setTimeout(() => {
          if (cancelled) return
          initData().then(() => { if (!cancelled) setReady(true) }).catch(() => { if (!cancelled) setError(true) })
        }, 1000)
      })
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-bold">Erro ao carregar dados</p>
          <button
            className="px-4 py-2 bg-amber-600 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return <>{children}</>
}
