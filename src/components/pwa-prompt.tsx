"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

function isIOS(): boolean {
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const nav = window.navigator as any
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const ios = isIOS()
  const standalone = isStandalone()

  useEffect(() => {
    if (standalone) return

    if (ios) {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [pathname, standalone, ios])

  function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null)
      setShow(false)
    })
  }

  function handleDismiss() {
    setShow(false)
  }

  if (!show || standalone) return null

  if (ios) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-2xl flex-shrink-0">
              🏟️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Instalar THE SUPER 8</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adicione à tela inicial do seu iPhone:</p>
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-3 ml-1">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Toque no botão <strong className="text-gray-900 dark:text-white">Compartilhar</strong> <span className="text-lg">⎙</span> na barra inferior do Safari</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Role para baixo e toque em <strong className="text-gray-900 dark:text-white">Adicionar à Tela de Início</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Toque em <strong className="text-gray-900 dark:text-white">Adicionar</strong> no canto superior direito</span>
            </li>
          </ol>

          <button onClick={handleDismiss} className="w-full py-2.5 text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium transition-colors">
            Entendi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-2xl flex-shrink-0">
          🏟️
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Instalar THE SUPER 8</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Adicione à tela inicial para acesso rápido</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleDismiss} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">
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
