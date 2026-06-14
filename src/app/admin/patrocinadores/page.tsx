"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Table, Td } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  getSponsors, getTournaments, createSponsor, createSponsorship, updateSponsor, deleteSponsor,
  getSponsorships, deleteSponsorship, updateSponsorship,
  getApoiadores, createApoiador, deleteApoiador, updateApoiador,
  addBrinde, removeBrinde, updateBrinde, getRegisteredAthletes,
} from "@/lib/store"
import { formatCurrency, getTierLabel } from "@/lib/utils"
import type { User, SponsorTier } from "@/lib/types"

const tierOptions = [
  { value: "gold", label: "Ouro" },
  { value: "silver", label: "Prata" },
  { value: "bronze", label: "Bronze" },
]

const tierEmoji: Record<string, string> = { gold: "🥇", silver: "🥈", bronze: "🥉" }

type Tab = "patrocinadores" | "apoiadores"

export default function SponsorsPage() {
  const [tab, setTab] = useState<Tab>("patrocinadores")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab("patrocinadores")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "patrocinadores"
              ? "bg-amber-50 text-amber-700 border border-b-0 border-gray-200 -mb-[3px]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🤝 Patrocinadores
        </button>
        <button
          onClick={() => setTab("apoiadores")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "apoiadores"
              ? "bg-amber-50 text-amber-700 border border-b-0 border-gray-200 -mb-[3px]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🙌 Apoiadores
        </button>
      </div>

      {tab === "patrocinadores" ? <PatrocinadoresTab /> : <ApoiadoresTab />}
    </div>
  )
}

function PatrocinadoresTab() {
  const [sponsors, setSponsors] = useState<User[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [allSponsorships, setAllSponsorships] = useState<any[]>([])

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newUrl, setNewUrl] = useState("")

  const [expandedSponsor, setExpandedSponsor] = useState<string | null>(null)

  const [addSponsorshipOpen, setAddSponsorshipOpen] = useState(false)
  const [addSponsorshipSponsor, setAddSponsorshipSponsor] = useState<User | null>(null)
  const [addSponsorshipForm, setAddSponsorshipForm] = useState({ tournament: "", tier: "gold" as SponsorTier, amount: "", description: "" })

  const [editSponsorshipOpen, setEditSponsorshipOpen] = useState(false)
  const [editSponsorshipData, setEditSponsorshipData] = useState<any>(null)
  const [editSponsorshipForm, setEditSponsorshipForm] = useState({ tournament: "", tier: "gold" as SponsorTier, amount: "", description: "" })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", url: "" })

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  function loadData() {
    setSponsors(getSponsors())
    setAllSponsorships(getSponsorships())
  }

  useEffect(() => { setTournaments(getTournaments()); loadData() }, [])

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  function getSponsorshipsForSponsor(sponsorId: string) {
    return allSponsorships.filter((s) => s.sponsor_id === sponsorId)
  }

  function getTournamentName(id: string) {
    return tournaments.find((t) => t.id === id)?.title || id
  }

  function handleCreateSponsor() {
    if (!newName || !newEmail || !newPassword) {
      showToast("error", "Preencha nome, email e senha")
      return
    }
    try {
      createSponsor(newName, newEmail, newPassword, newPhone, newUrl || undefined)
      showToast("success", "Patrocinador criado com sucesso!")
      setNewModalOpen(false)
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewPhone("")
      setNewUrl("")
      loadData()
    } catch {
      showToast("error", "Erro ao criar patrocinador")
    }
  }

  function openAddSponsorship(sponsor: User) {
    setAddSponsorshipSponsor(sponsor)
    setAddSponsorshipForm({ tournament: "", tier: "gold", amount: "", description: "" })
    setAddSponsorshipOpen(true)
  }

  function handleAddSponsorship() {
    if (!addSponsorshipSponsor || !addSponsorshipForm.tournament || !addSponsorshipForm.amount) {
      showToast("error", "Preencha todos os campos")
      return
    }
    try {
      createSponsorship(addSponsorshipForm.tournament, addSponsorshipSponsor.id, addSponsorshipForm.tier, Number(addSponsorshipForm.amount), addSponsorshipForm.description)
      showToast("success", "Patrocínio adicionado!")
      setAddSponsorshipOpen(false)
      loadData()
    } catch {
      showToast("error", "Erro ao adicionar patrocínio")
    }
  }

  function openEditSponsorship(s: any) {
    setEditSponsorshipData(s)
    setEditSponsorshipForm({ tournament: s.tournament_id, tier: s.tier, amount: String(s.amount), description: s.description || "" })
    setEditSponsorshipOpen(true)
  }

  function handleEditSponsorship() {
    if (!editSponsorshipData || !editSponsorshipForm.tournament || !editSponsorshipForm.amount) return
    try {
      updateSponsorship(editSponsorshipData.id, {
        tournament_id: editSponsorshipForm.tournament,
        tier: editSponsorshipForm.tier,
        amount: Number(editSponsorshipForm.amount),
        description: editSponsorshipForm.description,
      })
      showToast("success", "Patrocínio atualizado!")
      setEditSponsorshipOpen(false)
      loadData()
    } catch {
      showToast("error", "Erro ao atualizar patrocínio")
    }
  }

  function handleDeleteSponsorship(id: string) {
    if (!window.confirm("Remover este patrocínio?")) return
    deleteSponsorship(id)
    showToast("success", "Patrocínio removido!")
    loadData()
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Patrocinadores</h2>
        <Button onClick={() => setNewModalOpen(true)}>Novo Patrocinador</Button>
      </div>

      <Card>
        <CardHeader title="Patrocinadores Cadastrados" />
        <Table headers={["Nome", "Email", "Telefone", "Link", "Patrocínios", "Ações"]}>
          {sponsors.length === 0 ? (
            <tr>
              <Td colSpan={6}>
                <p className="text-center text-gray-400 py-8">Nenhum patrocinador cadastrado</p>
              </Td>
            </tr>
          ) : (
            sponsors.map((s) => {
              const sponsorShips = getSponsorshipsForSponsor(s.id)
              const isExpanded = expandedSponsor === s.id
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <Td className="font-medium text-gray-900">{s.name}</Td>
                  <Td>{s.email}</Td>
                  <Td>{s.phone || "-"}</Td>
                  <Td>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 transition-colors">
                        🔗 Acesse o site
                      </a>
                    ) : "-"}
                  </Td>
                  <Td>
                    {sponsorShips.length === 0 ? (
                      <span className="text-gray-400 text-sm">Nenhum</span>
                    ) : (
                      <button
                        onClick={() => setExpandedSponsor(isExpanded ? null : s.id)}
                        className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        {sponsorShips.length} patrocínio(s) {isExpanded ? "▲" : "▼"}
                      </button>
                    )}
                    {isExpanded && sponsorShips.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {sponsorShips.map((sp: any) => (
                          <div key={sp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="text-sm space-y-0.5">
                                <p className="font-medium text-gray-900">{tierEmoji[sp.tier]} {getTierLabel(sp.tier)}</p>
                                <p className="text-gray-500">{getTournamentName(sp.tournament_id)}</p>
                                {sp.description && <p className="text-gray-400 text-xs">{sp.description}</p>}
                              </div>
                              <div className="text-right text-sm">
                                <p className="font-semibold text-gray-900">{formatCurrency(sp.amount)}</p>
                                <div className="flex gap-2 mt-1 justify-end">
                                  <button onClick={() => openEditSponsorship(sp)} className="text-gray-400 hover:text-amber-500 text-xs" title="Editar">✏️</button>
                                  <button onClick={() => handleDeleteSponsorship(sp.id)} className="text-gray-400 hover:text-red-500 text-xs" title="Remover">✕</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-1">
                          <Button size="sm" variant="secondary" onClick={() => openAddSponsorship(s)}>+ Novo Patrocínio</Button>
                        </div>
                      </div>
                    )}
                    {!isExpanded && sponsorShips.length > 0 && (
                      <div className="mt-1">
                        <Button size="sm" variant="ghost" onClick={() => openAddSponsorship(s)}>+ Novo</Button>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingSponsor(s); setEditForm({ name: s.name, email: s.email, phone: s.phone || "", url: s.url || "" }); setEditModalOpen(true) }}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => { if (window.confirm(`Remover "${s.name}"?`)) { deleteSponsor(s.id); loadData() } }}>Remover</Button>
                    </div>
                  </Td>
                </tr>
              )
            })
          )}
        </Table>
      </Card>

      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)} title="Novo Patrocinador">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Nome do patrocinador" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label="Email" type="email" placeholder="email@patrocinador.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Input label="Senha" type="password" placeholder="Senha de acesso" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Telefone" placeholder="(11) 99999-9999" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <Input label="Link (site/redes)" placeholder="https://instagram.com/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setNewModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleCreateSponsor}>Criar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar Patrocinador - ${editingSponsor?.name || ""}`}>
        <div className="space-y-4">
          <Input label="Nome" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <Input label="Telefone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input label="Link (site/redes)" placeholder="https://instagram.com/..." value={editForm.url} onChange={(e) => setEditForm({ ...editForm, url: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={!editForm.name || !editForm.email} onClick={() => { if (editingSponsor) { updateSponsor(editingSponsor.id, editForm); setEditModalOpen(false); loadData(); } }}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={addSponsorshipOpen} onClose={() => setAddSponsorshipOpen(false)} title={`Novo Patrocínio - ${addSponsorshipSponsor?.name || ""}`}>
        <div className="space-y-4">
          <Select label="Torneio" options={[{ value: "", label: "Selecione..." }, ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` }))]} value={addSponsorshipForm.tournament} onChange={(e) => setAddSponsorshipForm({ ...addSponsorshipForm, tournament: e.target.value })} />
          <Select label="Nível" options={tierOptions} value={addSponsorshipForm.tier} onChange={(e) => setAddSponsorshipForm({ ...addSponsorshipForm, tier: e.target.value as SponsorTier })} />
          <Input label="Valor" type="number" placeholder="0,00" value={addSponsorshipForm.amount} onChange={(e) => setAddSponsorshipForm({ ...addSponsorshipForm, amount: e.target.value })} />
          <Input label="Descrição" placeholder="Descrição do patrocínio" value={addSponsorshipForm.description} onChange={(e) => setAddSponsorshipForm({ ...addSponsorshipForm, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAddSponsorshipOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleAddSponsorship}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={editSponsorshipOpen} onClose={() => setEditSponsorshipOpen(false)} title="Editar Patrocínio">
        <div className="space-y-4">
          <Select label="Torneio" options={[{ value: "", label: "Selecione..." }, ...tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` }))]} value={editSponsorshipForm.tournament} onChange={(e) => setEditSponsorshipForm({ ...editSponsorshipForm, tournament: e.target.value })} />
          <Select label="Nível" options={tierOptions} value={editSponsorshipForm.tier} onChange={(e) => setEditSponsorshipForm({ ...editSponsorshipForm, tier: e.target.value as SponsorTier })} />
          <Input label="Valor" type="number" placeholder="0,00" value={editSponsorshipForm.amount} onChange={(e) => setEditSponsorshipForm({ ...editSponsorshipForm, amount: e.target.value })} />
          <Input label="Descrição" placeholder="Descrição do patrocínio" value={editSponsorshipForm.description} onChange={(e) => setEditSponsorshipForm({ ...editSponsorshipForm, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditSponsorshipOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleEditSponsorship}>Atualizar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function ApoiadoresTab() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournament, setSelectedTournament] = useState("")
  const [apoiadores, setApoiadores] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])

  const [apoioModal, setApoioModal] = useState(false)
  const [apoioForm, setApoioForm] = useState({ name: "", phone: "" })

  const [editApoioModal, setEditApoioModal] = useState(false)
  const [editApoioForm, setEditApoioForm] = useState({ name: "", phone: "" })
  const [editApoioId, setEditApoioId] = useState<string | null>(null)

  const [editBrindeModal, setEditBrindeModal] = useState(false)
  const [editBrindeForm, setEditBrindeForm] = useState({ description: "", quantity: "", type: "kit" as "kit" | "sorteio" })
  const [editBrindeId, setEditBrindeId] = useState<string | null>(null)

  const [brindeForm, setBrindeForm] = useState<Record<string, { description: string; quantity: string; type: "kit" | "sorteio" }>>({})

  useEffect(() => {
    const all = getTournaments()
    setTournaments(all)
    if (all.length > 0 && !selectedTournament) setSelectedTournament(all[0].id)
  }, [])

  function load() {
    if (!selectedTournament) return
    setApoiadores(getApoiadores(selectedTournament))
    setRegistrations(getRegisteredAthletes(selectedTournament))
  }

  useEffect(() => { load() }, [selectedTournament])

  function handleAddApoio() {
    if (!apoioForm.name || !selectedTournament) return
    createApoiador(selectedTournament, apoioForm.name, apoioForm.phone || undefined)
    setApoioForm({ name: "", phone: "" })
    setApoioModal(false)
    load()
  }

  function handleDeleteApoio(apoioId: string) {
    if (window.confirm("Remover este apoiador e todos os brindes dele?")) {
      deleteApoiador(apoioId)
      load()
    }
  }

  function handleAddBrinde(apoiadorId: string) {
    if (!selectedTournament) return
    const form = brindeForm[apoiadorId]
    if (!form || !form.description) return
    const qty = form.type === "kit" ? totalCapacity : parseInt(form.quantity)
    if (form.type !== "kit" && (!form.quantity || qty <= 0)) return
    addBrinde(apoiadorId, selectedTournament, form.description, qty, form.type)
    setBrindeForm((prev) => ({ ...prev, [apoiadorId]: { description: "", quantity: "", type: "kit" } }))
    load()
  }

  function handleRemoveBrinde(brindeId: string) {
    removeBrinde(brindeId)
    load()
  }

  function openEditApoio(apoio: any) {
    setEditApoioId(apoio.id)
    setEditApoioForm({ name: apoio.name, phone: apoio.phone || "" })
    setEditApoioModal(true)
  }

  function handleSaveApoio() {
    if (!editApoioId || !editApoioForm.name) return
    updateApoiador(editApoioId, { name: editApoioForm.name, phone: editApoioForm.phone || undefined })
    setEditApoioModal(false)
    setEditApoioId(null)
    load()
  }

  function openEditBrinde(brinde: any) {
    setEditBrindeId(brinde.id)
    setEditBrindeForm({ description: brinde.description, quantity: String(brinde.quantity), type: brinde.type })
    setEditBrindeModal(true)
  }

  function handleSaveBrinde() {
    if (!editBrindeId || !editBrindeForm.description) return
    const qty = editBrindeForm.type === "kit" ? totalCapacity : parseInt(editBrindeForm.quantity)
    if (editBrindeForm.type !== "kit" && (!editBrindeForm.quantity || qty <= 0)) return
    updateBrinde(editBrindeId, { description: editBrindeForm.description, quantity: qty, type: editBrindeForm.type })
    setEditBrindeModal(false)
    setEditBrindeId(null)
    load()
  }

  const selectedTournamentData = tournaments.find((t) => t.id === selectedTournament)
  const categories = selectedTournamentData?.categories || ["4e5"]
  const totalCapacity = categories.length * 8

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Apoiadores</h2>
        <div className="flex items-center gap-3">
          <Select
            label=""
            options={tournaments.map((t) => ({ value: t.id, label: `${t.title} - ${t.edition}` }))}
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          />
          <Button onClick={() => setApoioModal(true)} disabled={!selectedTournament}>+ Apoiador</Button>
        </div>
      </div>

      {!selectedTournament ? (
        <Card><p className="text-gray-500 text-center py-8">Selecione um torneio.</p></Card>
      ) : apoiadores.length === 0 ? (
        <Card><p className="text-gray-500 text-center py-4">Nenhum apoiador cadastrado para este torneio.</p></Card>
      ) : (
        <div className="space-y-4">
          {apoiadores.map((apoio) => {
            const bf = brindeForm[apoio.id] || { description: "", quantity: "", type: "kit" }
            const kitQty = totalCapacity || 0
            return (
              <div key={apoio.id} className="rounded-lg border border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{apoio.name}</p>
                    {apoio.phone && <p className="text-xs text-gray-400">{apoio.phone}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEditApoio(apoio)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteApoio(apoio.id)}>Remover</Button>
                  </div>
                </div>

                {apoio.brindes.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {apoio.brindes.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-1.5">
                        <span>
                          <span className="text-gray-700">{b.description}</span>
                          <Badge className={`ml-2 text-xs ${b.type === "kit" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                            {b.type === "kit" ? `Kit (${b.quantity}x)` : "Sorteio"}
                          </Badge>
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => openEditBrinde(b)} className="text-gray-400 hover:text-amber-500 text-xs" title="Editar">✏️</button>
                          <button onClick={() => handleRemoveBrinde(b.id)} className="text-gray-400 hover:text-red-500 text-xs ml-1" title="Remover">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Adicionar brinde</label>
                    <input
                      type="text"
                      placeholder="Descrição"
                      value={bf.description}
                      onChange={(e) => setBrindeForm({ ...brindeForm, [apoio.id]: { ...bf, description: e.target.value } })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {bf.type === "sorteio" && (
                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Qtd"
                        value={bf.quantity}
                        onChange={(e) => setBrindeForm({ ...brindeForm, [apoio.id]: { ...bf, quantity: e.target.value } })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                  {bf.type === "kit" && (
                    <div className="w-20">
                      <div className="block text-xs text-gray-400 mb-1">&nbsp;</div>
                      <div className="px-3 py-1.5 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">{kitQty}x</div>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setBrindeForm({ ...brindeForm, [apoio.id]: { ...bf, type: "kit", quantity: "" } })}
                      className={`px-2 py-1.5 text-xs rounded font-medium ${bf.type === "kit" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >Kit</button>
                    <button
                      onClick={() => setBrindeForm({ ...brindeForm, [apoio.id]: { ...bf, type: "sorteio" } })}
                      className={`px-2 py-1.5 text-xs rounded font-medium ${bf.type === "sorteio" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >Sorteio</button>
                  </div>
                  <Button size="sm" onClick={() => handleAddBrinde(apoio.id)} disabled={!bf.description || (bf.type !== "kit" && (!bf.quantity || parseInt(bf.quantity) <= 0))}>+</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={apoioModal} onClose={() => { setApoioModal(false); setApoioForm({ name: "", phone: "" }) }} title="Novo Apoiador">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Nome do apoiador" value={apoioForm.name} onChange={(e) => setApoioForm({ ...apoioForm, name: e.target.value })} />
          <Input label="Telefone (opcional)" placeholder="(11) 99999-9999" value={apoioForm.phone} onChange={(e) => setApoioForm({ ...apoioForm, phone: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setApoioModal(false); setApoioForm({ name: "", phone: "" }) }}>Cancelar</Button>
            <Button onClick={handleAddApoio} disabled={!apoioForm.name}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={editApoioModal} onClose={() => { setEditApoioModal(false); setEditApoioId(null) }} title="Editar Apoiador">
        <div className="space-y-4">
          <Input label="Nome" value={editApoioForm.name} onChange={(e) => setEditApoioForm({ ...editApoioForm, name: e.target.value })} />
          <Input label="Telefone (opcional)" value={editApoioForm.phone} onChange={(e) => setEditApoioForm({ ...editApoioForm, phone: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setEditApoioModal(false); setEditApoioId(null) }}>Cancelar</Button>
            <Button onClick={handleSaveApoio} disabled={!editApoioForm.name}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={editBrindeModal} onClose={() => { setEditBrindeModal(false); setEditBrindeId(null) }} title="Editar Brinde">
        <div className="space-y-4">
          <Input label="Descrição" value={editBrindeForm.description} onChange={(e) => setEditBrindeForm({ ...editBrindeForm, description: e.target.value })} />
          <Select label="Tipo" options={[{ value: "kit", label: "Kit" }, { value: "sorteio", label: "Sorteio" }]} value={editBrindeForm.type} onChange={(e) => setEditBrindeForm({ ...editBrindeForm, type: e.target.value as "kit" | "sorteio" })} />
          {editBrindeForm.type === "sorteio" && (
            <Input label="Quantidade" type="number" value={editBrindeForm.quantity} onChange={(e) => setEditBrindeForm({ ...editBrindeForm, quantity: e.target.value })} />
          )}
          {editBrindeForm.type === "kit" && (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
              Quantidade: <strong>{totalCapacity}x</strong> (total de atletas do evento)
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setEditBrindeModal(false); setEditBrindeId(null) }}>Cancelar</Button>
            <Button onClick={handleSaveBrinde} disabled={!editBrindeForm.description || (editBrindeForm.type !== "kit" && (!editBrindeForm.quantity || parseInt(editBrindeForm.quantity) <= 0))}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
