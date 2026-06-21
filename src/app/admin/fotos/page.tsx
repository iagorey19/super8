"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  const [selectedFilter, setSelectedFilter] = useState("")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [form, setForm] = useState({ url: "", caption: "", tournamentId: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  function loadTournaments() {
    setTournaments(store.getTournaments())
  }

  function loadPhotos() {
    const all = store.getPhotos()
    if (selectedFilter === "" || selectedFilter === "geral") {
      setPhotos(selectedFilter === "geral" ? all.filter((p) => !p.tournament_id) : all)
    } else {
      setPhotos(all.filter((p) => p.tournament_id === selectedFilter))
    }
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
    loadPhotos()
  }, [selectedFilter])

  useEffect(() => {
    const all = store.getPhotos()
    let changed = false
    for (const p of all) {
      const match = p.url.match(/\/file\/d\/([^/]+)/)
      if (match) {
        const fixed = `https://drive.google.com/uc?export=view&id=${match[1]}`
        store.deletePhoto(p.id)
        store.createPhoto(fixed, p.caption, p.uploaded_by, p.tournament_id)
        changed = true
      }
    }
    if (changed) loadPhotos()
  }, [])

  async function handleUploadFile() {
    if (!selectedFile) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", selectedFile)
      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      store.createPhoto(
        data.url,
        form.caption.trim() || undefined,
        user!.id,
        form.tournamentId || undefined
      )
      setModalOpen(false)
      resetForm()
      loadPhotos()
    } catch (e) {
      alert("Erro ao fazer upload: " + (e instanceof Error ? e.message : "desconhecido"))
    } finally {
      setUploading(false)
    }
  }

  function convertDriveLink(url: string): string {
    const match = url.match(/\/file\/d\/([^/]+)/)
    if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`
    return url
  }

  function handleAddUrl() {
    if (!form.url.trim()) return
    store.createPhoto(
      convertDriveLink(form.url.trim()),
      form.caption.trim() || undefined,
      user!.id,
      form.tournamentId || undefined
    )
    setModalOpen(false)
    resetForm()
    loadPhotos()
  }

  function resetForm() {
    setForm({ url: "", caption: "", tournamentId: "" })
    setSelectedFile(null)
    setUploadMode("file")
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fotos</h1>
        <div className="w-72">
          <Select
            label=""
            options={[
              { value: "", label: "Todas as Fotos" },
              { value: "geral", label: "📁 Geral" },
              ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` })),
            ]}
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Adicionar Foto</Button>
      </div>

      {photos.length === 0 && (
        <Card>
          <div className="text-center py-12 space-y-3">
            <div className="text-6xl">📸</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Nenhuma foto ainda</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Adicione a primeira foto!</p>
          </div>
        </Card>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {brokenImages.has(photo.id) ? (
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <div className="text-3xl mb-1">🖼️</div>
                    <p className="text-xs">Imagem indisponível</p>
                  </div>
                </div>
              ) : (
                <img
                  src={photo.url}
                  alt={photo.caption || "Foto"}
                  className="aspect-[4/3] w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(photo.id)}
                />
              )}
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                </div>
              )}
              <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>{formatDate(photo.created_at)}</span>
                <button
                  onClick={() => {
                    if (window.confirm("Remover esta foto?")) {
                      store.deletePhoto(photo.id)
                      loadPhotos()
                    }
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
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
        onClose={() => { setModalOpen(false); resetForm() }}
        title="Adicionar Foto"
      >
        <div className="space-y-4">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setUploadMode("file")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${uploadMode === "file" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Do Computador
            </button>
            <button
              onClick={() => setUploadMode("url")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${uploadMode === "url" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              URL Externa
            </button>
          </div>

          {uploadMode === "file" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selecionar Arquivo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-20 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="font-medium text-gray-700 dark:text-gray-300">{selectedFile.name}</p>
                    <p>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Input
                label="URL da Imagem"
                placeholder="https://drive.google.com/file/d/.../view"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">Links do Google Drive são convertidos automaticamente</p>
            </>
          )}

          <Input
            label="Legenda (opcional)"
            placeholder="Ex: Final da partida"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
          />

          <Select
            label="Vincular a torneio (opcional)"
            options={[
              { value: "", label: "Sem vínculo (Geral)" },
              ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` })),
            ]}
            value={form.tournamentId}
            onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setModalOpen(false); resetForm() }}
            >
              Cancelar
            </Button>
            {uploadMode === "file" ? (
              <Button onClick={handleUploadFile} disabled={!selectedFile || uploading}>
                {uploading ? "Enviando..." : "Salvar"}
              </Button>
            ) : (
              <Button onClick={handleAddUrl} disabled={!form.url.trim()}>
                Salvar
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
