"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const routes: Record<string, string> = {
        admin: "/admin",
        athlete: "/atleta",
        sponsor: "/patrocinador",
      }
      router.push(routes[user.role] || "/")
    }
  }, [user, loading, router])

  if (loading || user) return null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center space-y-8">
          <div>
            <div className="mx-auto">
              <img src="/logo.jpg" alt="THE SUPER 8" className="h-28 w-auto mx-auto" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              THE SUPER 8
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Gestão de Torneios de Padel
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/eventos"
              className="block w-full py-3 px-6 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all active:scale-[0.98] shadow-sm"
            >
              Acompanhar Eventos
            </Link>
            <Link
              href="/auth/login"
              className="block w-full py-3 px-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] shadow-sm"
            >
              Entrar
            </Link>
            <Link
              href="/auth/cadastro"
              className="block w-full py-3 px-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] shadow-sm"
            >
              Cadastrar como Atleta
            </Link>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            THE SUPER 8 &copy; {new Date().getFullYear()} &mdash; Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
