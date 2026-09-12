"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error.message, error.stack)
  }, [error])
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="text-6xl">😵</div>
        <p className="text-gray-600 dark:text-gray-400">Algo deu errado</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 max-w-md mx-auto truncate">{error.message}</p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            onClick={() => reset()}
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
