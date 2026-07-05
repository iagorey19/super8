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
  await reloadFromServer()
}

export async function reloadFromServer(): Promise<void> {
  try {
    const res = await fetch("/api/data")
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    _data = await res.json()
    _ready = true
  } catch (e) {
    console.error("reloadFromServer failed:", e)
    throw e
  }
}

function getSessionToken(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const stored = sessionStorage.getItem("super8-session")
    if (!stored) return undefined
    const parsed = JSON.parse(stored)
    return parsed.token
  } catch {
    return undefined
  }
}

export async function persist(): Promise<void> {
  if (!_data) return
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = getSessionToken()
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch("/api/data", {
    method: "POST",
    headers,
    body: JSON.stringify(_data),
  })
  if (!res.ok) {
    if (res.status === 401) {
      console.warn("Sessão expirada — alterações não salvas no servidor. Faça login novamente.")
      if (typeof window !== "undefined") {
        alert("Sessão expirada. Faça login novamente para salvar as alterações.")
      }
      return
    }
    const body = await res.text()
    throw new Error(`Persist HTTP ${res.status}: ${body}`)
  }
}
