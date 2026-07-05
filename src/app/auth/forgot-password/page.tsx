"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email) {
      setError("Informe seu email")
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        setSubmitting(false)
        return
      }
      setSent(true)
    } catch {
      setError("Erro ao enviar email. Tente novamente.")
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
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Redefinir senha</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sent ? "Verifique seu email" : "Receba um link para redefinir sua senha"}
          </p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <p className="text-green-600 font-medium">Email enviado!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enviamos um link de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-sm text-amber-600 font-medium hover:text-amber-700"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
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

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/login" className="text-amber-600 font-medium hover:text-amber-700">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
