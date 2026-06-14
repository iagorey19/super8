"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/torneios", label: "Eventos", icon: "🏟️" },
  { href: "/admin/anotacoes", label: "Anotações", icon: "📝" },
  { href: "/admin/atletas", label: "Atletas", icon: "👥" },
  { href: "/admin/patrocinadores", label: "Patrocinadores", icon: "🤝" },
  { href: "/admin/sorteador/numeros", label: "Sortear Números", icon: "🎲" },
  { href: "/admin/sorteador/brindes", label: "Sortear Brindes", icon: "🎁" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin/ranking-anual", label: "Ranking Anual", icon: "🏆" },
  { href: "/admin/fotos", label: "Fotos", icon: "📸" },
  { href: "/admin/notificacoes", label: "Notificações", icon: "🔔" },
  { href: "/admin/usuarios", label: "Usuários", icon: "🔐" },
]

export function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function handleNav(href: string) {
    setOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-14 h-14 bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-amber-700 transition-colors"
        aria-label="Abrir menu"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          min-h-[calc(100vh-3.5rem)]
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:block
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-3.5rem)] lg:max-h-[calc(100vh-3.5rem)]">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNav(link.href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
