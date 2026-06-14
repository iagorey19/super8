"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import * as store from "@/lib/store"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Tournament, Sponsorship } from "@/lib/types"

export default function SponsorDashboard() {
  const { user, loading } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([])
  const [profileModal, setProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" })
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (!user) return
    const t = store.getSponsorTournaments(user.id)
    setTournaments(t)
    const s = store.getSponsorships().filter((sp) => sp.sponsor_id === user.id)
    setSponsorships(s)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  const getSponsorshipAmount = (tournamentId: string) => {
    return sponsorships.find((s) => s.tournament_id === tournamentId)?.amount || 0
  }

  function handleSaveProfile() {
    if (profileForm.name && profileForm.email && user) {
      store.updateSponsor(user.id, profileForm)
      setProfileModal(false)
      setToast({ type: "success", message: "Perfil atualizado!" })
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name}!</h1>
          <p className="text-gray-500 mt-1">Seus Torneios Patrocinados</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => {
          setProfileForm({ name: user.name, email: user.email, phone: user.phone || "" })
          setProfileModal(true)
        }}>
          Editar Perfil
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">Nenhum torneio patrocinado ainda.</p>
        </Card>
      ) : (
        tournaments.map((tour) => (
          <Card key={tour.id}>
            <CardHeader title={tour.title} subtitle={tour.edition} />
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge className={getStatusColor(tour.status)}>
                {getStatusLabel(tour.status)}
              </Badge>
              <span className="text-sm text-gray-500">{formatDate(tour.date)}</span>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Valor Patrocinado</p>
              <p className="text-xl font-bold text-purple-700">
                {formatCurrency(getSponsorshipAmount(tour.id))}
              </p>
            </div>
          </Card>
        ))
      )}

      <div className="space-y-3">
        <Link href="/patrocinador/investimento">
          <Button variant="primary" className="w-full">Ver Investimento</Button>
        </Link>
        <Link href="/patrocinador/resultados">
          <Button variant="secondary" className="w-full">Ver Resultados</Button>
        </Link>
      </div>

      <Modal open={profileModal} onClose={() => setProfileModal(false)} title="Editar Perfil">
        <div className="space-y-4">
          <Input
            label="Nome"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setProfileModal(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" disabled={!profileForm.name || !profileForm.email} onClick={handleSaveProfile}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
