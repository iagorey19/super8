"use client"

import { useEffect } from "react"
import { initLogger, logInfo, logError } from "@/lib/logger"

function describeElement(el: EventTarget | null): string {
  if (!el || !(el instanceof HTMLElement)) return "?"
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent || "").trim().slice(0, 60)
  const parts = [tag]
  if (text) parts.push(`"${text}"`)
  if (el instanceof HTMLAnchorElement && el.href) parts.push(el.href)
  if (el instanceof HTMLInputElement) parts.push(`type=${el.type}`)
  return parts.join(" ")
}

export function ErrorLogger() {
  useEffect(() => {
    initLogger()

    const origConsoleError = console.error
    console.error = (...args: unknown[]) => {
      const msg = args.map(String).join(" ")
      logError(msg)
      origConsoleError.apply(console, args)
    }

    const handler = (e: MouseEvent) => {
      logInfo(`click ${describeElement(e.target)}`)
    }
    document.addEventListener("click", handler, true)

    return () => {
      console.error = origConsoleError
      document.removeEventListener("click", handler, true)
    }
  }, [])

  return null
}
