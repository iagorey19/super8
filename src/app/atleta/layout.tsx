"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

const bottomLinks = [
  { href: "/atleta/jogos", label: "Jogos", icon: "🎾" },
  { href: "/atleta/ranking", label: "Ranking", icon: "🏆" },
  { href: "/atleta/estatisticas", label: "Estatísticas", icon: "📊" },
  { href: "/atleta/historico", label: "Histórico", icon: "📋" },
]

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="flex max-w-lg mx-auto">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/atleta" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-amber-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <span className="text-lg mb-0.5">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
