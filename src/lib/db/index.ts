import type { AppData } from "../types"

let _data: AppData | null = null
let _ready = false
let _initPromise: Promise<void> | null = null

export function isReady() {
  return _ready
}

export function getData(): AppData {
  if (!_data) throw new Error("Database not initialized. Call init() first.")
  return _data
}

export function setData(data: AppData) {
  _data = data
}

export async function init(): Promise<void> {
  if (_ready) return
  if (_initPromise) return _initPromise
  _initPromise = (async () => {
    try {
      const res = await fetch("/api/data")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      _data = await res.json()
      _ready = true
    } catch (e) {
      _initPromise = null
      throw e
    }
  })()
  return _initPromise
}

export async function persist(): Promise<void> {
  if (!_data) return
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_data),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Persist HTTP ${res.status}: ${body}`)
  }
}
