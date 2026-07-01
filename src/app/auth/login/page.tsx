"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Preencha todos os campos")
      return
    }

    setSubmitting(true)
    const loggedUser = login(email, password)
    if (loggedUser) {
      if (redirect) {
        router.push(redirect)
      } else {
        const routes: Record<string, string> = {
          admin: "/admin",
          athlete: "/atleta",
          sponsor: "/patrocinador",
        }
        router.push(routes[loggedUser.role] || "/")
      }
    } else {
      setError("Email ou senha inválidos")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo.jpg" alt="THE SUPER 8" className="h-20 w-auto" />
          </Link>
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Entrar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 space-y-4 shadow-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Não tem conta?{" "}
          <Link href={redirect ? `/auth/cadastro?redirect=${encodeURIComponent(redirect)}` : "/auth/cadastro"} className="text-amber-600 font-medium hover:text-amber-700">
            Cadastre-se como atleta
          </Link>
        </p>
      </div>
    </div>
  )
}
