"use client"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="text-6xl">😵</div>
        <p className="text-gray-600 dark:text-gray-400">Algo deu errado</p>
        <button
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          onClick={() => reset()}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
