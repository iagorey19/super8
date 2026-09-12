"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-5xl">🏟️</p>
          <h1 className="text-xl font-bold text-gray-900">Algo deu errado</h1>
          <p className="text-sm text-gray-500">Tente novamente. Se persistir, volte ao início.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium"
            >
              Tentar novamente
            </button>
            {/* global-error não tem router context p/ Link */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              Voltar ao início
            </a>
          </div>
          {error.digest && (
            <p className="text-xs text-gray-400">Código: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  )
}
