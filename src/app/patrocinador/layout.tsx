"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

const bottomLinks = [
  { href: "/patrocinador/investimento", label: "Investimento", icon: "💰" },
  { href: "/patrocinador/resultados", label: "Resultados", icon: "📊" },
]

export default function SponsorLayout({
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex max-w-lg mx-auto">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-amber-600"
                    : "text-gray-500 hover:text-gray-700"
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
