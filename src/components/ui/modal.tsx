"use client"

import { useEffect, useRef } from "react"

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`).current
  const initialFocusDone = useRef(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      const previousFocus = document.activeElement as HTMLElement | null

      if (!initialFocusDone.current) {
        initialFocusDone.current = true
        requestAnimationFrame(() => {
          const firstInput = dialogRef.current?.querySelector<HTMLElement>("input, textarea, select, button")
          firstInput?.focus()
        })
      }

      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape") {
          onCloseRef.current()
          return
        }
        if (e.key === "Tab" && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusable.length === 0) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault()
              last.focus()
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
          }
        }
      }

      window.addEventListener("keydown", handleKey)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKey)
        previousFocus?.focus()
      }
    }
    document.body.style.overflow = ""
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div ref={dialogRef} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
