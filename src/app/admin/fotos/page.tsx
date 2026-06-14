"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import * as store from "@/lib/store"
import { formatDate } from "@/lib/utils"
import type { Tournament, Photo } from "@/lib/types"

export default function AdminFotos() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState("")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ url: "", caption: "" })
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null)

  function loadTournaments() {
    setTournaments(store.getTournaments())
  }

  function loadPhotos() {
    if (!selectedTournament) {
      setPhotos([])
      return
    }
    setPhotos(store.getPhotos(selectedTournament))
    setBrokenImages(new Set())
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
    if (user) loadTournaments()
  }, [user, loading, router])

  useEffect(() => {
    setCurrentTournament(selectedTournament ? store.getTournamentById(selectedTournament) ?? null : null)
  }, [selectedTournament])

  useEffect(() => {
    loadPhotos()
  }, [selectedTournament])

  function handleAddPhoto() {
    if (!form.url.trim()) return
    store.createPhoto(selectedTournament, form.url.trim(), form.caption.trim() || undefined, user!.id)
    setModalOpen(false)
    setForm({ url: "", caption: "" })
    loadPhotos()
  }

  function handleImageError(photoId: string) {
    setBrokenImages((prev) => new Set(prev).add(photoId))
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fotos</h1>
        <div className="w-72">
          <Select
            label=""
            options={[
              { value: "", label: "Selecione um torneio..." },
              ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` })),
            ]}
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          />
        </div>
      </div>

      {currentTournament && currentTournament.categories.length > 1 && (
        <div className="flex gap-2">
          {currentTournament.categories.map((cat) => (
            <Badge key={cat} className="bg-purple-100 text-purple-800">
              {cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
            </Badge>
          ))}
        </div>
      )}

      {selectedTournament && (
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>Adicionar Foto</Button>
        </div>
      )}

      {!selectedTournament && (
        <Card>
          <p className="text-gray-500 text-center py-8">Selecione um torneio para ver as fotos.</p>
        </Card>
      )}

      {selectedTournament && photos.length === 0 && (
        <Card>
          <div className="text-center py-12 space-y-3">
            <div className="text-6xl">📸</div>
            <p className="text-gray-500 text-lg font-medium">Nenhuma foto ainda</p>
            <p className="text-gray-400 text-sm">Adicione a primeira foto do torneio!</p>
          </div>
        </Card>
      )}

      {selectedTournament && photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {brokenImages.has(photo.id) ? (
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-3xl mb-1">🖼️</div>
                    <p className="text-xs">Imagem indisponível</p>
                  </div>
                </div>
              ) : (
                <img
                  src={photo.url}
                  alt={photo.caption || "Foto do torneio"}
                  className="aspect-[4/3] w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(photo.id)}
                />
              )}
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                </div>
              )}
              <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-400">
                <span>{formatDate(photo.created_at)}</span>
                <button
                  onClick={() => {
                    if (window.confirm("Remover esta foto?")) {
                      store.deletePhoto(photo.id)
                      loadPhotos()
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setForm({ url: "", caption: "" }) }}
        title="Adicionar Foto"
      >
        <div className="space-y-4">
          <Input
            label="URL da Imagem"
            placeholder="https://exemplo.com/foto.jpg"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <Input
            label="Legenda (opcional)"
            placeholder="Ex: Final da partida"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setModalOpen(false); setForm({ url: "", caption: "" }) }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPhoto} disabled={!form.url.trim()}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
