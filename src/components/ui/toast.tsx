"use client"

import { createContext, useContext, useState, useCallback, useRef } from "react"

interface Toast {
  id: number
  message: string
  type: "success" | "error"
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error") => void
}

const ToastContext = createContext<ToastContextType>(null!)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const idRef = useRef(0)
  const MAX_TOASTS = 3

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++idRef.current
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, message, type }])
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timersRef.current.delete(id)
    }, 3000)
    timersRef.current.set(id, timer)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white animate-[slideUp_0.3s_ease-out] ${
              t.type === "success"
                ? "bg-emerald-600"
                : "bg-red-600"
            }`}
          >
            {t.type === "success" ? "✓ " : "✕ "}
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(1rem)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastContext.Provider>
  )
}
