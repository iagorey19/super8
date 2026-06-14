"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] hidden lg:block">
      <nav className="p-3 space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
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
  )
}
