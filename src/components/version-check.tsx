"use client"

import { useEffect, useRef } from "react"

// Recarrega o app quando um deploy novo muda public/version.json (guia 23).
// Poll a cada 60s; pausa quando a aba está oculta (economia de bateria/dados no mobile).
export function VersionCheck() {
  const initial = useRef<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    async function check() {
      if (document.hidden) return
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { version?: string }
        if (!data.version) return
        if (initial.current === null) {
          initial.current = data.version
          return
        }
        if (data.version !== initial.current) {
          window.location.reload()
        }
      } catch {
        // sem rede — ignora, tenta no próximo ciclo
      }
    }

    void check()
    timer = setInterval(check, 60_000)
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [])

  return null
}
