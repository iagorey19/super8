"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import * as store from "@/lib/store"
import type { Notification } from "@/lib/types"

const typeLabels: Record<string, string> = {
  jogo: "Jogo",
  resultado: "Resultado",
  ranking: "Ranking",
  sorteio: "Sorteio",
  geral: "Geral",
}

const typeColors: Record<string, string> = {
  jogo: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  resultado: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  ranking: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  sorteio: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  geral: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
}

export function NotificationList({ userId, canSend }: { userId: string; canSend?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sendModal, setSendModal] = useState(false)
  const [sendForm, setSendForm] = useState({ type: "geral" as string, title: "", message: "" })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  function load() {
    setNotifications(store.getNotifications(userId))
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  function handleMarkRead(id: string) {
    store.markNotificationRead(id)
    load()
  }

  function handleMarkAllRead() {
    store.markAllNotificationsRead(userId)
    load()
  }

  function handleDelete(id: string) {
    store.deleteNotification(id)
    load()
  }

  function handleDeleteAll() {
    store.deleteAllNotifications(userId)
    load()
  }

  function handleSend() {
    if (!sendForm.title || !sendForm.message) return
    setSending(true)
    const athletes = store.getAthletes()
    for (const a of athletes) {
      store.createNotification(a.id, sendForm.type as any, sendForm.title, sendForm.message)
    }
    setSending(false)
    setSendModal(false)
    setSendForm({ type: "geral", title: "", message: "" })
    setToast({ type: "success", message: `Notificação enviada para ${athletes.length} atletas!` })
    setTimeout(() => setToast(null), 3000)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{unreadCount} não lida{unreadCount !== 1 ? "s" : ""}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canSend && (
            <Button size="sm" onClick={() => setSendModal(true)}>
              Nova Notificação
            </Button>
          )}
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={handleMarkAllRead}>
              Marcar lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleDeleteAll} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
              Excluir todas
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <p className="text-gray-400 dark:text-gray-500 text-center py-12">Nenhuma notificação.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                n.read ? "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700" : "bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700"
              }`}
              onClick={() => { if (!n.read) handleMarkRead(n.id) }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    <p className={`text-sm font-medium truncate ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                      {n.title}
                    </p>
                  </div>
                  <p className={`text-sm ${n.read ? "text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={typeColors[n.type] || typeColors.geral}>
                    {typeLabels[n.type] || n.type}
                  </Badge>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={sendModal} onClose={() => setSendModal(false)} title="Nova Notificação">
        <div className="space-y-4">
          <Select
            label="Tipo"
            value={sendForm.type}
            onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
            options={[
              { value: "geral", label: "Geral" },
              { value: "jogo", label: "Jogo" },
              { value: "resultado", label: "Resultado" },
              { value: "ranking", label: "Ranking" },
              { value: "sorteio", label: "Sorteio" },
            ]}
          />
          <Input
            label="Título"
            placeholder="Ex: Inscrições abertas"
            value={sendForm.title}
            onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
          />
          <Input
            label="Mensagem"
            placeholder="Ex: As inscrições para o próximo torneio estão abertas!"
            value={sendForm.message}
            onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSendModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={sending || !sendForm.title || !sendForm.message}>
              {sending ? "Enviando..." : `Enviar para todos os atletas`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}