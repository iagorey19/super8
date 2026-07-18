import type { User } from "../types"
import { saveData, getData, refreshFromServer } from "./core"

type Session = { user: User; token?: string }

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const stored = sessionStorage.getItem("super8-session")
    if (stored) {
      const parsed: Session = JSON.parse(stored)
      if (parsed.user) return parsed
    }
    return null
  } catch {
    sessionStorage.removeItem("super8-session")
    return null
  }
}

let _sessionFetchPromise: Promise<Session | null> | null = null

export async function fetchSessionFromCookie(): Promise<Session | null> {
  if (typeof window === "undefined") return null
  if (_sessionFetchPromise) return _sessionFetchPromise
  _sessionFetchPromise = (async () => {
    try {
      const res = await fetch("/api/auth/session")
      if (!res.ok) return null
      const data = await res.json()
      if (data.user) {
        const sess: Session = { user: data.user, token: data.token }
        saveSession(sess)
        return sess
      }
      return null
    } catch {
      return null
    }
  })()
  try {
    return await _sessionFetchPromise
  } finally {
    _sessionFetchPromise = null
  }
}

function saveSession(session: Session) {
  try {
    sessionStorage.setItem("super8-session", JSON.stringify(session))
  } catch {
    // storage full or unavailable
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  if (!email || !password) return null
  try {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) return null
    const data = await res.json()
    saveSession({ user: data.user, token: data.token })
    return data.user
  } catch {
    return null
  }
}

export async function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("super8-session")
    try {
      await fetch("/api/auth/session", { method: "DELETE" })
    } catch { /* ignore */ }
  }
}

export async function registerAthlete(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro ao cadastrar" }))
      console.error("registerAthlete failed:", res.status, err)
      return null
    }
    const data = await res.json()
    saveSession({ user: data.user, token: data.token })
    await refreshFromServer()
    return data.user
  } catch (e) {
    console.error("registerAthlete: network error", e)
    return null
  }
}
