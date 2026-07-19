import type { AppData } from "../types"

let _data: AppData | null = null
let _ready = false
let _initPromise: Promise<void> | null = null
let _dirtyTables = new Set<string>()
let _persisting = false
let _persistChain: Promise<void> = Promise.resolve()

export function isReady() {
  return _ready
}

export function isPersisting() {
  return _persisting
}

export function getData(): AppData {
  if (!_data) throw new Error("Database not initialized. Call init() first.")
  return _data
}

export function setData(data: AppData) {
  _data = data
}

export function markDirty(table: string) {
  _dirtyTables.add(table)
}

export function getDirtyTables(): string[] {
  return [..._dirtyTables]
}

export function clearDirty() {
  _dirtyTables.clear()
}

export async function init(): Promise<void> {
  if (_ready) return
  if (_initPromise) return _initPromise
  await reloadFromServer()
}

export async function reloadFromServer(): Promise<void> {
  try {
    const headers: Record<string, string> = {}
    const token = getSessionToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
    const res = await fetch("/api/data", { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    _data = await res.json()
    _ready = true
    _dirtyTables.clear()
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

  const tables = getDirtyTables()
  if (tables.length === 0) return

  if (_persisting) {
    await _persistChain
    return
  }

  _persisting = true
  _persistChain = _persistChain.then(async () => {
    const currentTables = getDirtyTables()
    if (currentTables.length === 0) return

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    const token = getSessionToken()
    if (token) headers["Authorization"] = `Bearer ${token}`

    const payload: Record<string, unknown> = {
      tables: currentTables,
      data: {
        seed_version: _data!.seed_version,
        config: _data!.config,
      },
    }

    for (const table of currentTables) {
      if (table in _data!) {
        (payload.data as any)[table] = (_data as any)[table]
      }
    }

    const res = await fetch("/api/data", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      if (res.status === 401) {
        console.error("Persist 401 — sessão inválida ou expirada. Dados não salvos.")
        throw new Error("Sessão expirada — faça login novamente")
      }
      const body = await res.text()
      throw new Error(`Persist HTTP ${res.status}: ${body}`)
    }

    _dirtyTables.clear()
  })

  try {
    await _persistChain
  } finally {
    _persisting = false
  }
}
