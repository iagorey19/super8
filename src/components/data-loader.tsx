"use client"

import { useEffect, useState } from "react"
import { initData, getData, setData } from "@/lib/store"

const SNAPSHOT_KEY = "super8-data-snapshot"

export function DataLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    let cancelled = false

    initData()
      .then(() => {
        if (cancelled) return
        try {
          localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ at: Date.now(), data: getData() }))
        } catch {
          // snapshot é melhor-esforço (quota)
        }
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        // Offline: usa último snapshot válido em vez de tela morta
        try {
          const raw = localStorage.getItem(SNAPSHOT_KEY)
          if (raw) {
            setData(JSON.parse(raw).data)
            setStale(true)
            setReady(true)
            return
          }
        } catch {
          // sem snapshot — cai no retry abaixo
        }
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

  return (
    <>
      {stale && (
        <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs text-center py-1.5 px-4">
          Offline — mostrando últimos dados salvos. Conecte-se para atualizar.
        </div>
      )}
      {children}
    </>
  )
}
