"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { getNotes, createNote, updateNote, deleteNote } from "@/lib/store"
import type { Note } from "@/lib/types"

export default function AnotacoesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  function load() {
    setNotes(getNotes())
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setTitle("")
    setContent("")
    setShowModal(true)
  }

  function openEdit(n: Note) {
    setEditing(n)
    setTitle(n.title)
    setContent(n.content)
    setShowModal(true)
  }

  function save() {
    if (!title.trim()) return
    if (editing) {
      updateNote(editing.id, { title: title.trim(), content: content.trim() })
    } else {
      createNote(title.trim(), content.trim())
    }
    setShowModal(false)
    load()
  }

  function togglePin(n: Note) {
    updateNote(n.id, { pinned: !n.pinned })
    load()
  }

  function remove(id: string) {
    if (confirm("Excluir esta anotação?")) {
      deleteNote(id)
      load()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Anotações</h1>
        <Button variant="primary" size="sm" onClick={openNew}>Nova Anotação</Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-3">📝</p>
            <p>Nenhuma anotação ainda</p>
            <p className="text-sm mt-1">Clique em "Nova Anotação" para começar</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notes.map((n) => (
            <Card key={n.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {n.pinned && <span className="text-amber-500 text-sm">📌</span>}
                      <h3 className="font-semibold text-gray-900 truncate">{n.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(n.updated_at).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => togglePin(n)} className="p-2 text-gray-400 hover:text-amber-500 transition-colors text-sm" title={n.pinned ? "Desfixar" : "Fixar"}>
                      📌
                    </button>
                    <button onClick={() => openEdit(n)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors text-sm" title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => remove(n.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors text-sm" title="Excluir">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Editar Anotação" : "Nova Anotação"}>
        <div className="space-y-4">
            <Input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full min-h-[200px] p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
              placeholder="Escreva sua anotação aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={save}>Salvar</Button>
            </div>
          </div>
        </Modal>
    </div>
  )
}
