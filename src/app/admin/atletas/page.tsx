"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, Td } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Select } from "@/components/ui/select"
import {
  getAthletes,
  getPendingAthletes,
  getTournaments,
  getTournamentById,
  approveAthlete,
  rejectAthlete,
  registerAthleteInTournament,
  deleteAthlete,
  updateAthlete,
  createUser,
  getAthleteStats,
} from "@/lib/store"
import { getStatusLabel } from "@/lib/utils"
import type { User } from "@/lib/types"

const CATEGORIES = ["4e5", "6e7"]

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<User[]>([])
  const [pending, setPending] = useState<(User & { registration_id: string; category?: string; group_name?: string; tournament_id?: string; tournament_title?: string })[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null)
  const [selectedTournament, setSelectedTournament] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAthlete, setEditingAthlete] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" })
  const [tournaments, setTournaments] = useState<any[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [statsModalOpen, setStatsModalOpen] = useState(false)
  const [statsData, setStatsData] = useState<any>(null)

  function loadData() {
    setAthletes(getAthletes())
    setPending(getPendingAthletes())
  }

  useEffect(() => { setTournaments(getTournaments()); loadData() }, [])

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  function handleApprove(registrationId: string) {
    try {
      approveAthlete(registrationId)
      showToast("success", "Atleta aprovado com sucesso!")
      loadData()
    } catch {
      showToast("error", "Erro ao aprovar atleta")
    }
  }

  function handleReject(registrationId: string) {
    try {
      rejectAthlete(registrationId)
      showToast("success", "Atleta rejeitado")
      loadData()
    } catch {
      showToast("error", "Erro ao rejeitar atleta")
    }
  }

  function openRegisterModal(athlete: User) {
    setSelectedAthlete(athlete)
    setSelectedTournament("")
    setSelectedCategory("")
    setSelectedGroup("")
    setModalOpen(true)
  }

  const selectedTournamentData = useMemo(() => selectedTournament ? getTournamentById(selectedTournament) ?? null : null, [selectedTournament])
  const tournamentCategories = selectedTournamentData?.categories || []
  const hasMultipleCategories = tournamentCategories.length > 1

  function handleRegister() {
    if (!selectedAthlete || !selectedTournament) return
    try {
      const cat = hasMultipleCategories ? selectedCategory || tournamentCategories[0] : tournamentCategories[0]
      registerAthleteInTournament(
        selectedTournament,
        selectedAthlete.id,
        cat,
        undefined
      )
      showToast("success", "Atleta registrado no torneio com sucesso!")
      setModalOpen(false)
      loadData()
    } catch {
      showToast("error", "Erro ao registrar atleta no torneio")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Atletas</h1>
        <Button onClick={() => setAddModalOpen(true)}>Adicionar Atleta</Button>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Card>
        <CardHeader title="Atletas Cadastrados" />
        <Table headers={["Nome", "Email", "Telefone", "Ações"]}>
          {athletes.length === 0 ? (
            <tr>
              <Td colSpan={4}>
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhum atleta cadastrado</p>
              </Td>
            </tr>
          ) : (
            athletes.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <Td className="font-medium text-gray-900 dark:text-white">{a.name}</Td>
                <Td>{a.email}</Td>
                <Td>{a.phone || "-"}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openRegisterModal(a)}>
                      Registrar em Torneio
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setStatsData(getAthleteStats(a.id))
                        setStatsModalOpen(true)
                      }}
                    >
                      Stats
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingAthlete(a)
                        setEditForm({ name: a.name, email: a.email, phone: a.phone || "" })
                        setEditModalOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Remover atleta "${a.name}" permanentemente?`)) {
                          deleteAthlete(a.id)
                          loadData()
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </Table>
      </Card>

        <Card>
          <CardHeader title="Solicitações Pendentes" subtitle="Atletas aguardando aprovação" />
          <Table headers={["Nome", "Email", "Telefone", "Torneio", "Categoria", "Status", "Ações"]}>
            {pending.length === 0 ? (
              <tr>
                <Td colSpan={7}>
                  <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhuma solicitação pendente</p>
                </Td>
              </tr>
            ) : (
              pending.map((p) => (
                <tr key={p.registration_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Td className="font-medium text-gray-900 dark:text-white">{p.name}</Td>
                  <Td>{p.email}</Td>
                  <Td>{p.phone || "-"}</Td>
                  <Td>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{p.tournament_title || "-"}</span>
                  </Td>
                  <Td>
                    {p.category ? (
                      <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">{p.category}</Badge>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </Td>
                  <Td>
                    <Badge className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                      {getStatusLabel("pending")}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(p.registration_id)}>
                        Aprovar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(p.registration_id)}>
                        Rejeitar
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </Table>
        </Card>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar Atleta - ${editingAthlete?.name || ""}`}>
        <div className="space-y-4">
          <Input
            label="Nome"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!editForm.name || !editForm.email}
              onClick={() => {
                if (editingAthlete) {
                  updateAthlete(editingAthlete.id, editForm)
                  setEditModalOpen(false)
                  loadData()
                  showToast("success", "Atleta atualizado!")
                }
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Registrar em Torneio - ${selectedAthlete?.name || ""}`}
      >
        <div className="space-y-4">
          <Select
            label="Selecione o torneio"
            options={[
              { value: "", label: "Selecione..." },
              ...tournaments.map((t) => ({
                value: t.id,
                label: `${t.title} - ${t.edition}`,
              })),
            ]}
            value={selectedTournament}
            onChange={(e) => {
              setSelectedTournament(e.target.value)
              setSelectedCategory("")
              setSelectedGroup("")
            }}
          />
          {hasMultipleCategories && selectedTournament && (
            <Select
              label="Categoria"
              options={[
                { value: "", label: "Selecione a categoria..." },
                ...tournamentCategories.map((cat) => ({
                  value: cat,
                  label: cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7",
                })),
              ]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedTournament || (hasMultipleCategories && !selectedCategory)}
              onClick={handleRegister}
            >
              Registrar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Atleta">
        <div className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@atleta.com"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Senha de acesso"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={addForm.phone}
            onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!addForm.name || !addForm.email || !addForm.password}
              onClick={() => {
                const result = createUser(addForm.name, addForm.email, addForm.password, "athlete", addForm.phone)
                if (!result) {
                  showToast("error", "Email já cadastrado")
                  return
                }
                setAddModalOpen(false)
                setAddForm({ name: "", email: "", password: "", phone: "" })
                loadData()
                showToast("success", "Atleta criado com sucesso!")
              }}
            >
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} title="Estatísticas do Atleta">
        {statsData && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData.totalMatches}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jogos</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statsData.winRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aproveitamento</p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{statsData.avgScore}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Média</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{statsData.wins}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vitórias</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{statsData.losses}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Derrotas</p>
              </div>
            </div>
            {statsData.bestPosition && (
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statsData.bestPosition}º</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Melhor Posição</p>
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {statsData.tournamentsPlayed} torneio{(statsData.tournamentsPlayed || 0) !== 1 ? "s" : ""} participado{(statsData.tournamentsPlayed || 0) !== 1 ? "s" : ""}
            </div>
            <Button variant="secondary" className="w-full" onClick={() => setStatsModalOpen(false)}>
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
