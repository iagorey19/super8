"use client"

const FLUSH_INTERVAL = 5000
const MAX_BUFFER = 10

type LogLevel = "ERROR" | "WARN" | "INFO"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  stack?: string
  url?: string
}

let buffer: LogEntry[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function flush() {
  if (buffer.length === 0) return
  const batch = buffer.splice(0, buffer.length)
  timer = null
  fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries: batch }),
  }).catch(() => {})
}

function scheduleFlush() {
  if (timer) return
  timer = setTimeout(flush, FLUSH_INTERVAL)
}

function push(level: LogLevel, message: string, stack?: string) {
  buffer.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    stack,
    url: typeof window !== "undefined" ? window.location.href : "",
  })
  if (buffer.length >= MAX_BUFFER) {
    if (timer) clearTimeout(timer)
    flush()
  } else {
    scheduleFlush()
  }
}

export function logError(message: string, error?: unknown) {
  const stack = error instanceof Error ? error.stack : undefined
  push("ERROR", message, stack)
}

export function logWarn(message: string) {
  push("WARN", message)
}

export function logInfo(message: string) {
  push("INFO", message)
}

export function initLogger() {
  if (typeof window === "undefined") return

  const origError = window.onerror
  window.onerror = (msg, source, line, col, error) => {
    const message = typeof msg === "string" ? msg : "Unknown error"
    push("ERROR", `${message} (${source}:${line}:${col})`, error?.stack)
    origError?.call(window, msg, source, line, col, error)
  }

  const origRejection = window.onunhandledrejection
  window.onunhandledrejection = (event) => {
    const message = event.reason instanceof Error ? event.reason.message : String(event.reason)
    const stack = event.reason instanceof Error ? event.reason.stack : undefined
    push("ERROR", `Unhandled Rejection: ${message}`, stack)
    origRejection?.call(window, event)
  }
}
