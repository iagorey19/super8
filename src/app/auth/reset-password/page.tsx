"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [verified, setVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (token_hash && type === "recovery") {
        const supabase = createClient()
        supabase.auth.verifyOtp({ token_hash, type: "recovery" })
          .then(({ error: verifyError }) => {
            if (cancelled) return
            if (verifyError) {
              setError("Link inválido ou expirado. Solicite uma nova redefinição.")
            } else {
              setVerified(true)
            }
          })
      } else {
        setError("Link inválido. Solicite uma nova redefinição.")
      }
    })()
    return () => { cancelled = true }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!password || password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não conferem")
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        setSubmitting(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const syncRes = await fetch("/api/auth/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: session.access_token, password }),
        })
        if (!syncRes.ok) {
          setError("Senha redefinida no login, mas falhou a sincronização. Tente entrar e trocar a senha no perfil.")
          setSubmitting(false)
          return
        }
      }

      router.push("/auth/login?reset=ok")
    } catch {
      setError("Erro ao redefinir senha. Tente novamente.")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.jpg" alt="THE SUPER 8" width={419} height={419} className="h-20 w-auto" priority />
          </Link>
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Nova senha</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Defina sua nova senha</p>
        </div>

        {!verified && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
          </div>
        )}

        {error && !verified && (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <p className="text-red-600">{error}</p>
            <Link
              href="/auth/forgot-password"
              className="inline-block text-sm text-amber-600 font-medium hover:text-amber-700"
            >
              Solicitar nova redefinição
            </Link>
          </div>
        )}

        {verified && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 space-y-4 shadow-sm">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Input
              label="Nova senha"
              type="password"
              placeholder="......"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="......"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
