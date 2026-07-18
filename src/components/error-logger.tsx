"use client"

import { useEffect } from "react"
import { initLogger, logError } from "@/lib/logger"

export function ErrorLogger() {
  useEffect(() => {
    initLogger()

    const origConsoleError = console.error
    console.error = (...args: unknown[]) => {
      const msg = args.map(String).join(" ")
      logError(msg)
      origConsoleError.apply(console, args)
    }

    return () => {
      console.error = origConsoleError
    }
  }, [])

  return null
}
