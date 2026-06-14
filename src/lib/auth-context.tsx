"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { User } from "./types"
import * as store from "./store"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => User | null
  logout: () => void
  register: (name: string, email: string, password: string, phone?: string) => User | null
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = store.getSession()
    if (session) setUser(session.user)
    setLoading(false)
  }, [])

  const login = useCallback(
    (email: string, password: string) => {
      const u = store.login(email, password)
      if (u) {
        setUser(u)
        return u
      }
      return null
    },
    []
  )

  const logout = useCallback(() => {
    store.logout()
    setUser(null)
    router.push("/")
  }, [router])

  const register = useCallback(
    (name: string, email: string, password: string, phone?: string) => {
      const newUser = store.registerAthlete(name, email, password, phone)
      return newUser
    },
    []
  )

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
