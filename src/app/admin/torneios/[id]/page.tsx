"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Tournament, User } from "@/lib/types"

const ALL_CATEGORIES = ["4e5", "6e7"]

export default function TournamentDetail() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [tournament, setTournament] = useState<Tournament | undefined>()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [startingCat, setStartingCat] = useState<string | null>(null)

  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", edition: "", date: "", location: "", categories: ["4e5"] as string[], registrationFee: "", maxScore: "" })

  const [registerModal, setRegisterModal] = useState(false)
  const [registerAthleteIds, setRegisterAthleteIds] = useState<string[]>([])
  const [registerCategory, setRegisterCategory] = useState("")
  const [registerGroup, setRegisterGroup] = useState("A")
  const [saving, setSaving] = useState(false)
  const [allAthletes, setAllAthletes] = useState<any[]>([])
  useEffect(() => {
    try { setAllAthletes(store.getAthletes().filter((a) => !registrations.some((r) => r.athlete_id === a.id))) } catch { setAllAthletes([]) }
  }, [registrations])

  function load() {
    const t = store.getTournamentById(id)
    setTournament(t ? { ...t } : undefined)
    if (t) {
      setRegistrations(store.getRegisteredAthletes(t.id))
      setMatches(store.getTournamentMatches(t.id))
    }
  }

  function handleCourtNameChange(idx: number, val: string) {
    store.updateCourtName(id, idx, val)
    setTournament((prev) => {
      if (!prev) return prev
      const names = store.getCourtNames(id)
      return { ...prev, court_names: [...names] }
    })
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
    if (user) load()
  }, [user, loading, router, id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  if (!tournament) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Torneio não encontrado.</p>
      </Card>
    )
  }

  const categories = tournament.categories || ["4e5"]

  async function handleStartAll() {
    const groups = [...new Set(registrations.map((r) => `${r.category}-${r.group_name || "A"}`))].sort()
    const missing: string[] = []
    for (const key of groups) {
      const [cat, grp] = key.split("-")
      const grpRegs = registrations.filter((r) => r.category === cat && (r.group_name || "A") === grp && r.status === "approved")
      if (grpRegs.length !== 8) missing.push(`${cat} Grupo ${grp} (${grpRegs.length}/8)`)
    }
    if (groups.length === 0) {
      alert("Nenhum atleta registrado.")
      return
    }
    if (missing.length > 0) {
      alert(`É necessário 8 atletas aprovados por grupo:\n${missing.join("\n")}`)
      return
    }
    setStartingCat("all")
    for (const key of groups) {
      const [cat, grp] = key.split("-")
      try {
        store.startTournament(id, cat, grp)
      } catch (e: any) {
        alert(`Erro ao iniciar ${cat} Grupo ${grp}: ${e.message}`)
      }
    }
    load()
    setStartingCat(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={tournament.title}
          subtitle={`Edição ${tournament.edition}`}
          action={
            <div className="flex gap-2">
              {tournament.status === "upcoming" && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(`Excluir "${tournament.title}" e todos os dados relacionados?`)) {
                      store.deleteTournament(tournament.id)
                      router.push("/admin/torneios")
                    }
                  }}
                >
                  Excluir
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditForm({
                    title: tournament.title,
                    edition: tournament.edition,
                    date: tournament.date,
                    location: tournament.location || "",
                    categories: [...tournament.categories],
                    registrationFee: tournament.registration_fee ? String(tournament.registration_fee) : "",
                    maxScore: tournament.max_score ? String(tournament.max_score) : "",
                  })
                  setEditModal(true)
                }}
              >
                Editar
              </Button>
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className={getStatusColor(tournament.status)}>
            {getStatusLabel(tournament.status)}
          </Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tournament.date)}</span>
          {tournament.location && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{tournament.location}</span>
          )}
          {categories.map((cat) => (
            <Badge key={cat} className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
              {cat === "4e5" ? "Cat. 4e5" : "Cat. 6e7"}
            </Badge>
          ))}
          {tournament.status === "upcoming" && (
            <Button onClick={handleStartAll} disabled={startingCat === "all"}>
              {startingCat === "all" ? "Iniciando..." : "Iniciar Torneio"}
            </Button>
          )}
        </div>
      </Card>

      {tournament.status !== "upcoming" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={`/admin/torneios/${tournament.id}/jogos`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center py-2">
                <span className="text-3xl">🎾</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-2">Jogos</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciar partidas</p>
              </div>
            </Card>
          </Link>
          <Link href={`/admin/torneios/${tournament.id}/placar`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center py-2">
                <span className="text-3xl">📺</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-2">Placar ao Vivo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhar jogos</p>
              </div>
            </Card>
          </Link>
          <Link href={`/admin/torneios/${tournament.id}/ranking`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center py-2">
                <span className="text-3xl">🏆</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-2">Ranking</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Classificação atual</p>
              </div>
            </Card>
          </Link>
          <Link href={`/admin/atletas`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center py-2">
                <span className="text-3xl">👥</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-2">Gerenciar Atletas</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aprovar inscrições</p>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {categories.map((cat) => {
        const catRegs = registrations.filter((r) => r.category === cat)
        const catMatches = matches.filter((m) => m.category === cat)
        const groups = [...new Set(catRegs.map((r) => r.group_name || "A"))].sort()

        return (
          <Card key={cat}>
            <CardHeader
              title={cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
              subtitle={`${catRegs.length} inscritos`}
              action={
                tournament.status === "upcoming" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setRegisterAthleteIds([])
                      setRegisterCategory(cat)
                      setRegisterGroup("A")
                      setRegisterModal(true)
                    }}
                  >
                    + Atleta
                  </Button>
                )
              }
            />
            {groups.map((grp) => {
              const grpRegs = catRegs.filter((r => (r.group_name || "A") === grp))
              const grpApproved = grpRegs.filter((r) => r.status === "approved").length
              const grpMatches = catMatches.filter((m) => (m.group_name || "A") === grp)
              const grpFinished = grpMatches.filter((m) => m.status === "finished").length
              const grpLive = grpMatches.filter((m) => m.status === "live").length
              return (
                <div key={grp} className="border-t border-gray-200 dark:border-gray-700 first:border-t-0">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grupo {grp}</span>
                    <div className="flex items-center gap-3">
                      {tournament.status === "upcoming" && (
                        <>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{grpApproved}/8</span>
                          {grpApproved === 8 && (
                            <Button
                              size="sm"
                              disabled={startingCat === `${cat}-${grp}`}
                              onClick={async () => {
                                setStartingCat(`${cat}-${grp}`)
                                try {
                                  store.startTournament(id, cat, grp)
                                  load()
                                } catch (e: any) {
                                  alert(e.message)
                                } finally {
                                  setStartingCat(null)
                                }
                              }}
                            >
                              {startingCat === `${cat}-${grp}` ? "Iniciando..." : "Iniciar"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {grpRegs.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            {["Nome", "Status", "Check-in", "Nº Sorteio", "Ações"].map((h) => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {grpRegs.map((r) => (
                            <tr key={r.id}>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{r.name}</td>
                              <td className="px-4 py-3">
                                <Badge className={getStatusColor(r.status)}>
                                  {getStatusLabel(r.status)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                {r.status === "approved" ? (
                                  r.confirmed ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium text-sm">✅</span>
                                  ) : (
                                    <span className="text-yellow-600 font-medium text-sm">⏳</span>
                                  )
                                ) : (
                                  <span className="text-gray-300 dark:text-gray-600">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.draw_number ?? "-"}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  {r.status === "pending" && (
                                    <>
                                      <Button size="sm" variant="success" className="px-1.5 sm:px-3 text-xs sm:text-sm" onClick={() => { store.approveAthlete(r.id); load() }}>
                                        <span className="sm:hidden">✓</span>
                                        <span className="hidden sm:inline">Aprovar</span>
                                      </Button>
                                      <Button size="sm" variant="secondary" className="px-1.5 sm:px-3 text-xs sm:text-sm" onClick={() => { store.rejectAthlete(r.id); load() }}>
                                        <span className="sm:hidden">✗</span>
                                        <span className="hidden sm:inline">Rejeitar</span>
                                      </Button>
                                    </>
                                  )}
                                  {r.status === "approved" && (
                                    r.confirmed ? (
                                      <span className="text-green-600 dark:text-green-400 font-medium text-sm px-2">✅</span>
                                    ) : (
                                      <Button size="sm" variant="secondary" className="px-1.5 sm:px-3 text-xs sm:text-sm" onClick={() => { store.confirmAttendance(tournament.id, r.athlete_id); load() }}>
                                        Check-in
                                      </Button>
                                    )
                                  )}
                                  {tournament.status === "upcoming" && r.status === "approved" && !r.confirmed && (
                                    <Button size="sm" variant="ghost" className="px-1.5 sm:px-3 text-xs sm:text-sm" onClick={() => { store.createNotification(r.athlete_id, "geral", "Confirme sua presença!", `O torneio ${tournament.title} está chegando! Confirme sua presença no sistema.`); alert(`Lembrete enviado para ${r.name}!`) }}>
                                      Lembrar
                                    </Button>
                                  )}
                                  {tournament.status === "upcoming" && (
                                    <Button size="sm" variant="danger" className="px-1.5 sm:px-3 text-xs sm:text-sm" disabled={saving} onClick={async () => {
                                      if (!window.confirm(`Remover ${r.name} do torneio?`)) return
                                      setSaving(true)
                                      try { await store.unregisterAthlete(r.id) } catch (e) { alert("Erro ao remover atleta. Tente novamente.") } finally { load(); setSaving(false) }
                                    }}>
                                      {saving ? "Removendo..." : "Remover"}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {grpMatches.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-3">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Total de Jogos</p>
                        <p className="text-2xl font-bold text-blue-700">{grpMatches.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Finalizados</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{grpFinished}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Ao Vivo</p>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{grpLive}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </Card>
        )
      })}

      {tournament.status !== "upcoming" && (
        <Card>
          <CardHeader title="Quadras" />
          <div className="space-y-3">
            {store.getCourtNames(id).map((name, idx) => {
              const cats = tournament.categories || ["4e5"]
              const courtsPerCat = 2
              const catIdx = Math.floor(idx / courtsPerCat)
              const catName = cats[catIdx] || "4e5"
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">
                    {catName === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
                  </span>
                  <Input
                    defaultValue={name}
                    onBlur={(e) => handleCourtNameChange(idx, e.target.value)}
                    className="flex-1"
                  />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar Torneio">
        <div className="space-y-4">
          <Input
            label="Título"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <Input
            label="Edição"
            value={editForm.edition}
            onChange={(e) => setEditForm({ ...editForm, edition: e.target.value })}
          />
          <Input
            label="Data"
            type="date"
            value={editForm.date}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
          />
          <Input
            label="Local"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
          />
          <Input
            label="Valor da Inscrição (R$)"
            type="number"
            placeholder="0,00"
            value={editForm.registrationFee}
            onChange={(e) => setEditForm({ ...editForm, registrationFee: e.target.value })}
          />
          <Input
            label="Games até (max)"
            type="number"
            placeholder="5"
            min={1}
            max={10}
            value={editForm.maxScore}
            onChange={(e) => setEditForm({ ...editForm, maxScore: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categorias</label>
            <div className="flex gap-4">
              {ALL_CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditForm({ ...editForm, categories: [...editForm.categories, cat] })
                      } else {
                        setEditForm({
                          ...editForm,
                          categories: editForm.categories.filter((c) => c !== cat),
                        })
                      }
                    }}
                    className="w-4 h-4 text-amber-600 dark:text-amber-400 border-gray-300 dark:border-gray-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                store.updateTournament(tournament.id, {
                  title: editForm.title,
                  edition: editForm.edition,
                  date: editForm.date,
                  location: editForm.location,
                  categories: editForm.categories,
                  registration_fee: editForm.registrationFee ? Number(editForm.registrationFee) : undefined,
                  max_score: editForm.maxScore ? Number(editForm.maxScore) : undefined,
                })
                setEditModal(false)
                load()
              }}
              disabled={!editForm.title || !editForm.edition || !editForm.date || editForm.categories.length === 0}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={registerModal}
        onClose={() => { setRegisterModal(false); setRegisterAthleteIds([]); setRegisterCategory(""); setRegisterGroup("A") }}
        title="Registrar Atletas no Torneio"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            {(tournament.categories.length > 1) && (
              <div className="flex-1">
                <Select
                  label="Categoria"
                  options={[
                    ...tournament.categories.map((cat) => ({
                      value: cat,
                      label: cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7",
                    })),
                  ]}
                  value={registerCategory}
                  onChange={(e) => setRegisterCategory(e.target.value)}
                />
              </div>
            )}
            <div className="flex-1">
              <Select
                label="Grupo"
                options={[
                  { value: "A", label: "Grupo A" },
                  { value: "B", label: "Grupo B" },
                ]}
                value={registerGroup}
                onChange={(e) => setRegisterGroup(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Atletas disponíveis ({allAthletes.length})
            </p>
            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {allAthletes.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Nenhum atleta disponível
                </p>
              )}
              {allAthletes.map((a) => {
                const checked = registerAthleteIds.includes(a.id)
                return (
                  <label
                    key={a.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-amber-50 transition-colors ${
                      checked ? "bg-amber-50 dark:bg-amber-900/20" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setRegisterAthleteIds((prev) =>
                          checked
                            ? prev.filter((id) => id !== a.id)
                            : [...prev, a.id]
                        )
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-amber-600 dark:text-amber-400 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{a.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {registerAthleteIds.length} selecionado(s)
            </span>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setRegisterModal(false); setRegisterAthleteIds([]); setRegisterCategory(""); setRegisterGroup("A") }}>
                Cancelar
              </Button>
              <Button
                disabled={registerAthleteIds.length === 0 || saving}
                onClick={async () => {
                  setSaving(true)
                  try {
                    const cat = registerCategory || tournament.categories[0]
                    await store.registerMultipleAthletes(id, registerAthleteIds, cat, registerGroup)
                    setRegisterModal(false)
                    setRegisterAthleteIds([])
                    setRegisterCategory("")
                    setRegisterGroup("A")
                  } catch (e) {
                    alert("Erro ao registrar atleta(s). Tente novamente.")
                  } finally {
                    load()
                    setSaving(false)
                  }
                }}
              >
                {saving ? "Registrando..." : `Registrar (${registerAthleteIds.length})`}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
