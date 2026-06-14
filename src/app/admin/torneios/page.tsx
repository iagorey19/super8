"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"
import { formatDate, getStatusColor, getStatusLabel, exportToCSV } from "@/lib/utils"
import type { Tournament } from "@/lib/types"

const ALL_CATEGORIES = ["4e5", "6e7"]

export default function AdminTorneios() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", edition: "", date: "", location: "", categories: ["4e5"] as string[], registrationFee: "" })
  const [saving, setSaving] = useState(false)

  function load() {
    setTournaments(store.getTournaments())
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
    if (user) load()
  }, [user, loading, router])

  function handleCreate() {
    if (!form.title || !form.edition || !form.date || !form.location) return
    const cats = form.categories.length > 0 ? form.categories : ["4e5"]
    const fee = form.registrationFee ? Number(form.registrationFee) : undefined
    setSaving(true)
    if (editingId) {
      store.updateTournament(editingId, {
        title: form.title,
        edition: form.edition,
        date: form.date,
        location: form.location,
        categories: cats,
        registration_fee: fee,
      })
    } else {
      store.createTournament(form.title, form.edition, form.date, form.location, user!.id, cats, fee)
    }
    setSaving(false)
    setModalOpen(false)
    setEditingId(null)
    setForm({ title: "", edition: "", date: "", location: "", categories: ["4e5"], registrationFee: "" })
    load()
  }

  function handleStart(id: string) {
    const t = store.getTournamentById(id)
    if (!t) return
    const cats = t.categories || ["4e5"]
    const missing: string[] = []
    for (const cat of cats) {
      const regs = store.getRegisteredAthletes(id, cat).filter((r) => r.status === "approved")
      if (regs.length !== 8) missing.push(`${cat} (${regs.length}/8)`)
    }
    if (missing.length > 0) {
      alert(`É necessário 8 atletas aprovados por categoria:\n${missing.join("\n")}`)
      return
    }
    for (const cat of cats) {
      try {
        store.startTournament(id, cat)
      } catch (e: any) {
        alert(`Erro ao iniciar ${cat}: ${e.message}`)
      }
    }
    load()
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
      <Card>
        <CardHeader
          title="Torneios"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => exportToCSV(
                ["Título","Edição","Data","Local","Status","Categorias","Taxa Inscrição"],
                tournaments.map((t) => [t.title, t.edition, t.date, t.location || "", getStatusLabel(t.status), (t.categories || []).join(", "), t.registration_fee ? `R$ ${t.registration_fee}` : ""]),
                `torneios_${new Date().toISOString().slice(0, 10)}`
              )}>
                Exportar CSV
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                Novo Torneio
              </Button>
            </div>
          }
        />
        {tournaments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum torneio cadastrado.</p>
        ) : (
          <Table headers={["Título", "Edição", "Data", "Status", "Ações"]}>
            {tournaments.map((t) => (
              <tr key={t.id}>
                <Td className="font-medium">{t.title}</Td>
                <Td>{t.edition}</Td>
                <Td>{formatDate(t.date)}</Td>
                <Td>
                  <Badge className={getStatusColor(t.status)}>
                    {getStatusLabel(t.status)}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/torneios/${t.id}`}>
                      <Button size="sm" variant="ghost">Ver</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setForm({ title: t.title, edition: t.edition, date: t.date, location: t.location || "", categories: t.categories || ["4e5"], registrationFee: t.registration_fee ? String(t.registration_fee) : "" })
                        setEditingId(t.id)
                        setModalOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    {t.status === "upcoming" && (
                      <Button size="sm" variant="success" onClick={() => handleStart(t.id)}>
                        Iniciar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Excluir "${t.title}" e todos os dados relacionados?`)) {
                          store.deleteTournament(t.id)
                          load()
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); setForm({ title: "", edition: "", date: "", location: "", categories: ["4e5"], registrationFee: "" }) }} title={editingId ? "Editar Torneio" : "Novo Torneio"}>
        <div className="space-y-4">
          <Input
            label="Título"
            placeholder="Ex: THE SUPER 8"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Edição"
            placeholder="Ex: 2025"
            value={form.edition}
            onChange={(e) => setForm({ ...form, edition: e.target.value })}
          />
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label="Local"
            placeholder="Ex: Arena Padel"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Input
            label="Valor da Inscrição (R$)"
            type="number"
            placeholder="0,00"
            value={form.registrationFee}
            onChange={(e) => setForm({ ...form, registrationFee: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categorias</label>
            <div className="flex gap-4">
              {ALL_CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, categories: [...form.categories, cat] })
                      } else {
                        setForm({
                          ...form,
                          categories: form.categories.filter((c) => c !== cat),
                        })
                      }
                    }}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">{cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setModalOpen(false); setEditingId(null); setForm({ title: "", edition: "", date: "", location: "", categories: ["4e5"], registrationFee: "" }) }}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving || !form.title || !form.edition || !form.date || !form.location || form.categories.length === 0}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
