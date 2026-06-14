"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export function PublicNavbar() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link href="/eventos" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="THE SUPER 8" className="h-14 w-auto" />
          <span className="font-bold text-gray-900 dark:text-white block">THE SUPER 8</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-95 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Entrar
          </Link>
          <Link
            href="/auth/cadastro"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-95 px-3 py-1.5 text-sm bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
          >
            Cadastrar
          </Link>
        </div>
      </div>
    </nav>
  )
}
