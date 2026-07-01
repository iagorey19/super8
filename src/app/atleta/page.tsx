"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import * as store from "@/lib/store"
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Tournament, AthleteRegistration, RaffleRecord } from "@/lib/types"

export default function AthleteDashboard() {
  const { user, loading } = useAuth()
  const [tournament, setTournament] = useState<Tournament | undefined>()
  const [matchesCount, setMatchesCount] = useState(0)
  const [athletePosition, setAthletePosition] = useState<number | null>(null)
  const [registration, setRegistration] = useState<AthleteRegistration | undefined>()
  const [myCategory, setMyCategory] = useState<string>("")
  const [annualRankPos, setAnnualRankPos] = useState<number | null>(null)
  const [profileModal, setProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])
  const [apoiadores, setApoiadores] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])

  const loadData = useCallback(async () => {
    if (!user) return
    try { await store.refreshFromServer() } catch {}
    const t = store.getCurrentTournament()
    setTournament(t)
    if (t && user) {
      const reg = store.getAthleteRegistration(t.id, user.id)
      setRegistration(reg)
      const cat = reg?.category || "4e5"
      setMyCategory(cat)

      setMatchesCount(store.getAthleteMatches(user.id, t.id).length)
      const liveRanking = store.getLiveRankings(t.id, cat)
      const pos = liveRanking.findIndex((r) => r.athlete_id === user.id)
      if (pos >= 0) setAthletePosition(pos + 1)

      const annual = store.getAnnualRanking(cat)
      const annualPos = annual.findIndex((r) => r.athlete_id === user.id)
      setAnnualRankPos(annualPos >= 0 ? annualPos + 1 : null)
      setRaffleRecords(store.getRaffleRecords(t.id))
      setApoiadores(store.getApoiadores(t.id))
      setSponsors(store.getSponsorships(t.id))
    }
  }, [user])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  function handleSaveProfile() {
    if (profileForm.name && profileForm.email && user) {
      if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
        setToast({ type: "error", message: "Senhas não conferem" })
        setTimeout(() => setToast(null), 3000)
        return
      }
      store.updateAthlete(user.id, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        ...(profileForm.password ? { password: profileForm.password } : {}),
      })
      const session = store.getSession()
      if (session) {
        try {
          sessionStorage.setItem("super8-session", JSON.stringify({
            user: { ...session.user, name: profileForm.name, email: profileForm.email, phone: profileForm.phone },
          }))
        } catch {
          // storage unavailable
        }
      }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {user.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Bem-vindo ao THE SUPER 8</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={loadData}>
            Atualizar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            setProfileForm({ name: user.name, email: user.email, phone: user.phone || "", password: "", confirmPassword: "" })
            setShowPassword(false)
            setProfileModal(true)
          }}>
            Editar Perfil
          </Button>
        </div>
      </div>

      {tournament ? (
        <Card>
          <CardHeader title={tournament.title} subtitle={tournament.edition} />
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={getStatusColor(tournament.status)}>
              {getStatusLabel(tournament.status)}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tournament.date)}</span>
            {myCategory && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                {myCategory === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
              </Badge>
            )}
          </div>
          {registration ? (
            <div className="mt-4">
              {registration.status === "pending" && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">⏳ Aguardando aprovação</p>
                  {registration.is_waiting && (
                    <p className="text-xs text-amber-600 mt-1">
                      Você está na lista de espera (posição {registration.registration_order})
                    </p>
                  )}
                  {!registration.is_waiting && registration.registration_order && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Sua posição: {registration.registration_order}º
                    </p>
                  )}
                  <p className="text-xs text-yellow-600 mt-1">
                    Sua inscrição neste torneio está pendente.
                  </p>
                </div>
              )}
              {registration.status === "approved" && (
                <div className="mt-2 space-y-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">✅ Inscrição aprovada</Badge>
                  {registration.confirmed ? (
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">✅ Presença confirmada</p>
                    </div>
                  ) : (tournament?.status === "upcoming" || tournament?.status === "registering") && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        store.toggleAttendance(tournament.id, user.id)
                        const reg = store.getAthleteRegistration(tournament.id, user.id)
                        setRegistration(reg)
                      }}
                    >
                      ✅ Confirmar Presença
                    </Button>
                  )}
                </div>
              )}
              {registration.status === "rejected" && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
                  <p className="text-sm text-red-800 font-medium">❌ Inscrição rejeitada</p>
                </div>
              )}
            </div>
          ) : tournament?.status === "registering" ? (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-center space-y-3">
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
                Inscrições abertas! 🎾
              </p>
              {tournament.registration_fee && (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Taxa: R$ {tournament.registration_fee.toFixed(2)}
                </p>
              )}
              <Link href={`/eventos/${tournament.id}`}>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Inscrever-se
                </Button>
              </Link>
            </div>
          ) : tournament?.status === "upcoming" && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Inscrições em breve
              </p>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {(() => {
            const all = store.getTournaments()
            const registering = all.filter((t: any) => t.status === "registering")
            const upcoming = all.filter((t: any) => t.status === "upcoming")
            if (registering.length > 0) return registering.map((t: any) => (
              <Card key={t.id}>
                <CardHeader title={t.title} subtitle={t.edition} />
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={getStatusColor(t.status)}>
                    {getStatusLabel(t.status)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(t.date)}</span>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-center space-y-3">
                  <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
                    Inscrições abertas! 🎾
                  </p>
                  {t.registration_fee && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Taxa: R$ {t.registration_fee.toFixed(2)}
                    </p>
                  )}
                  <Link href={`/eventos/${t.id}`}>
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                      Inscrever-se
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
            if (upcoming.length > 0) return (
              <div className="space-y-4">
                {upcoming.map((t: any) => (
                  <Card key={t.id}>
                    <CardHeader title={t.title} subtitle={t.edition} />
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={getStatusColor(t.status)}>
                        {getStatusLabel(t.status)}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(t.date)}</span>
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-center">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Inscrições em breve
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )
            return (
              <Card>
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum torneio disponível no momento.</p>
              </Card>
            )
          })()}
        </div>
      )}

      {registration?.status !== "pending" && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{matchesCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Seus Jogos</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {athletePosition !== null ? `${athletePosition}º` : "--"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sua Posição no Torneio</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {annualRankPos !== null ? `${annualRankPos}º` : "--"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ranking Anual</p>
          </Card>
        </div>
      )}

      {(sponsors.length > 0 || apoiadores.length > 0) && (
        <Card>
          <CardHeader title="🤝 Agradecimentos" />
          <div className="space-y-4">
            {sponsors.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-lg">🏆</span> Patrocinadores
                </p>
                <div className="flex flex-wrap gap-3">
                  {sponsors.map((s: any) => (
                    <div key={s.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[200px]">
                      <span className="text-2xl">{s.tier === "gold" ? "🥇" : s.tier === "silver" ? "🥈" : "🥉"}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{s.sponsor_name}</p>
                        {s.sponsor_url && (
                          <a href={s.sponsor_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 mt-0.5">
                            🔗 Acesse o site
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {apoiadores.length > 0 && (
              <div className={(sponsors.length > 0 ? "pt-4 border-t border-gray-200 dark:border-gray-700" : "") + ""}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Apoiadores</p>
                <div className="flex flex-wrap gap-2">
                  {apoiadores.map((a: any) => (
                    <div key={a.id} className="bg-green-50 dark:bg-green-900/20 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                      {a.brindes?.length > 0 && (
                        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-300 ml-1">
                          - {a.brindes.map((b: any) => `${b.description} (${b.type === "kit" ? "Kit" : "Sorteio"})`).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {raffleRecords.length > 0 && (
        <Card>
          <CardHeader title="🎁 Sorteios" subtitle="Vencedores dos sorteios deste evento" />
          <div className="space-y-2">
            {raffleRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.winner_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.brinde_description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <Link href="/atleta/jogos">
          <Button variant="primary" className="w-full">Ver Meus Jogos</Button>
        </Link>
        <Link href="/atleta/ranking">
          <Button variant="secondary" className="w-full">Ver Ranking</Button>
        </Link>
        <Link href="/atleta/historico">
          <Button variant="ghost" className="w-full">Meu Histórico</Button>
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
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="relative">
            <Input
              label="Nova Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Deixe em branco para manter"
              value={profileForm.password}
              onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
              tabIndex={-1}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <Input
            label="Confirmar Senha"
            type={showPassword ? "text" : "password"}
            placeholder="Repita a nova senha"
            value={profileForm.confirmPassword}
            onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
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
