"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import * as store from "@/lib/store"
import type { Photo } from "@/lib/types"

export default function AthleteFotos() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])

  function loadPhotos() {
    const all = store.getPhotos()
    setPhotos(all)
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    loadPhotos()
    const interval = setInterval(loadPhotos, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fotos</h1>

      {photos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500">Nenhuma foto disponível ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <a
              key={photo.id}
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 group"
            >
              <img
                src={photo.url}
                alt={photo.caption || "Foto"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
