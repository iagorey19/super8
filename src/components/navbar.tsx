"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { getUnreadCount } from "@/lib/store"
import { useEffect, useState } from "react"
import { ThemeToggle } from "./theme-toggle"

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  athlete: "Atleta",
  sponsor: "Patrocinador",
}

const roleColors: Record<string, string> = {
  admin: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  athlete: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  sponsor: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
}

export function Navbar() {
  const { user, logout } = useAuth()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setUnread(getUnreadCount(user.id))
      const interval = setInterval(() => {
        setUnread(getUnreadCount(user!.id))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  if (!user) return null

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link
          href={user.role === "admin" ? "/admin" : user.role === "athlete" ? "/atleta" : "/patrocinador"}
          className="flex items-center gap-2"
        >
          <img src="/logo.jpg" alt="THE SUPER 8" className="h-14 w-auto" />
          <span className="font-bold text-gray-900 dark:text-white block">THE SUPER 8</span>
        </Link>

        <div className="flex items-center gap-1">
          {unread > 0 && (
            <Link
              href={`/${user.role}/notificacoes`}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          <ThemeToggle />

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 sm:hidden">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
