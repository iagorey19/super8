import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-5xl">🔍</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Página não encontrada</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          O endereço pode ter mudado ou não existe mais.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
