"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import * as store from "@/lib/store"
import { formatCurrency, formatDate, getCategoryLabel, getCategoryIcon, exportToCSV } from "@/lib/utils"
import type { Tournament, Expense, Revenue, ExpenseCategory, RevenueSource } from "@/lib/types"

const expenseCategories: ExpenseCategory[] = ["premiacao", "estrutura", "marketing", "arbitragem", "alimentacao", "fotografia", "brindes", "outros"]
const revenueSources: RevenueSource[] = ["patrocinio", "inscricao", "outros"]

const categoryEmojis: { key: ExpenseCategory; emoji: string; label: string }[] = [
  { key: "premiacao", emoji: "🏆", label: "Premiação" },
  { key: "estrutura", emoji: "🏟️", label: "Estrutura" },
  { key: "marketing", emoji: "📢", label: "Marketing" },
  { key: "arbitragem", emoji: "⚖️", label: "Arbitragem" },
  { key: "alimentacao", emoji: "🍽️", label: "Alimentação" },
  { key: "fotografia", emoji: "📸", label: "Fotografia" },
  { key: "brindes", emoji: "🎁", label: "Brindes" },
  { key: "outros", emoji: "📦", label: "Outros" },
]

type Tab = "despesas" | "receitas"

const emptyExpenseForm = { category: "premiacao" as ExpenseCategory, description: "", amount: "", date: "" }
const emptyRevenueForm = { source: "patrocinio" as RevenueSource, amount: "", description: "", date: "" }

export default function AdminFinanceiro() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState("")
  const [summary, setSummary] = useState<{ totalExpenses: number; totalRevenues: number; balance: number; expensesByCategory: Record<string, { total: number; items: Expense[] }> } | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [tab, setTab] = useState<Tab>("despesas")
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [expenseEditingId, setExpenseEditingId] = useState<string | null>(null)
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
  const [revenueModalOpen, setRevenueModalOpen] = useState(false)
  const [revenueEditingId, setRevenueEditingId] = useState<string | null>(null)
  const [revenueForm, setRevenueForm] = useState(emptyRevenueForm)
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null)

  function loadData() {
    if (!selectedTournament) {
      setSummary(null)
      setExpenses([])
      setRevenues([])
      return
    }
    setSummary(store.getFinancialSummary(selectedTournament))
    setExpenses(store.getExpenses(selectedTournament))
    setRevenues(store.getRevenues(selectedTournament))
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
    if (user) setTournaments(store.getTournaments())
  }, [user, loading, router])

  useEffect(() => {
    setCurrentTournament(selectedTournament ? store.getTournamentById(selectedTournament) ?? null : null)
  }, [selectedTournament])

  useEffect(() => {
    loadData()
  }, [selectedTournament])

  function handleAddExpense() {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) return
    if (expenseEditingId) {
      store.updateExpense(expenseEditingId, {
        category: expenseForm.category,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
      })
    } else {
      store.createExpense(
        selectedTournament,
        expenseForm.category,
        expenseForm.description,
        Number(expenseForm.amount),
        expenseForm.date,
        user!.id
      )
    }
    setExpenseModalOpen(false)
    setExpenseEditingId(null)
    setExpenseForm(emptyExpenseForm)
    loadData()
  }

  function handleAddRevenue() {
    if (!revenueForm.amount || !revenueForm.description || !revenueForm.date) return
    if (revenueEditingId) {
      store.updateRevenue(revenueEditingId, {
        source: revenueForm.source,
        description: revenueForm.description,
        amount: Number(revenueForm.amount),
        date: revenueForm.date,
      })
    } else {
      store.createRevenue(
        selectedTournament,
        revenueForm.source,
        Number(revenueForm.amount),
        revenueForm.description,
        revenueForm.date,
        user!.id
      )
    }
    setRevenueModalOpen(false)
    setRevenueEditingId(null)
    setRevenueForm(emptyRevenueForm)
    loadData()
  }

  function openEditExpense(exp: Expense) {
    setExpenseForm({
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount),
      date: exp.date,
    })
    setExpenseEditingId(exp.id)
    setExpenseModalOpen(true)
  }

  function openEditRevenue(rev: Revenue) {
    setRevenueForm({
      source: rev.source,
      description: rev.description,
      amount: String(rev.amount),
      date: rev.date,
    })
    setRevenueEditingId(rev.id)
    setRevenueModalOpen(true)
  }

  function openNewExpense() {
    setExpenseForm(emptyExpenseForm)
    setExpenseEditingId(null)
    setExpenseModalOpen(true)
  }

  function openNewRevenue() {
    setRevenueForm(emptyRevenueForm)
    setRevenueEditingId(null)
    setRevenueModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  const totalExpenses = summary?.totalExpenses ?? 0
  const totalRevenues = summary?.totalRevenues ?? 0
  const balance = summary?.balance ?? 0
  const maxCategory = summary
    ? Math.max(...Object.values(summary.expensesByCategory).map((c) => c.total), 1)
    : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
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

      {selectedTournament && summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-500 font-medium">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenues)}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-500 font-medium">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-500 font-medium">Saldo</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </Card>
          </div>

          {totalExpenses > 0 && (
            <Card>
              <CardHeader title="Despesas por Categoria" />
              <div className="space-y-4">
                {Object.entries(summary.expensesByCategory).map(([cat, data]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(cat)}</span>
                        <span className="font-medium text-gray-700">{getCategoryLabel(cat)}</span>
                      </div>
                      <span className="text-gray-600 font-medium">{formatCurrency(data.total)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                        style={{ width: `${(data.total / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Lançamentos"
              action={
                <div className="flex gap-2">
                  <Button
                    variant={tab === "despesas" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setTab("despesas")}
                  >
                    Despesas
                  </Button>
                  <Button
                    variant={tab === "receitas" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setTab("receitas")}
                  >
                    Receitas
                  </Button>
                </div>
              }
            />

            {tab === "despesas" && (
              <div className="space-y-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => exportToCSV(
                    ["Categoria","Descrição","Valor","Data"],
                    expenses.map((e) => [getCategoryLabel(e.category), e.description, formatCurrency(e.amount), formatDate(e.date)]),
                    `despesas_${selectedTournament || "geral"}_${new Date().toISOString().slice(0, 10)}`
                  )}>
                    Exportar CSV
                  </Button>
                  <Button size="sm" onClick={openNewExpense}>
                    Adicionar Despesa
                  </Button>
                </div>
                {expenses.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">Nenhuma despesa registrada.</p>
                ) : (
                  expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className="bg-amber-100 text-amber-800 shrink-0">
                          {getCategoryIcon(exp.category)} {getCategoryLabel(exp.category)}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(exp.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-sm font-semibold text-red-600">- {formatCurrency(exp.amount)}</span>
                        <button
                          onClick={() => openEditExpense(exp)}
                          className="text-gray-400 hover:text-amber-500 transition-colors text-xs"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Remover esta despesa?")) {
                              store.deleteExpense(exp.id)
                              loadData()
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "receitas" && (
              <div className="space-y-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => exportToCSV(
                    ["Fonte","Descrição","Valor","Data"],
                    revenues.map((r) => [
                      r.source === "patrocinio" ? "Patrocínio" : r.source === "inscricao" ? "Inscrição" : "Outros",
                      r.description,
                      formatCurrency(r.amount),
                      formatDate(r.date),
                    ]),
                    `receitas_${selectedTournament || "geral"}_${new Date().toISOString().slice(0, 10)}`
                  )}>
                    Exportar CSV
                  </Button>
                  <Button size="sm" onClick={openNewRevenue}>
                    Adicionar Receita
                  </Button>
                </div>
                {revenues.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">Nenhuma receita registrada.</p>
                ) : (
                  revenues.map((rev) => (
                    <div
                      key={rev.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className="bg-green-100 text-green-800 shrink-0">
                          {rev.source === "patrocinio" ? "🤝" : rev.source === "inscricao" ? "📝" : "📦"}{" "}
                          {rev.source === "patrocinio" ? "Patrocínio" : rev.source === "inscricao" ? "Inscrição" : "Outros"}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{rev.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(rev.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-sm font-semibold text-green-600">+ {formatCurrency(rev.amount)}</span>
                        <button
                          onClick={() => openEditRevenue(rev)}
                          className="text-gray-400 hover:text-amber-500 transition-colors text-xs"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Remover esta receita?")) {
                              store.deleteRevenue(rev.id)
                              loadData()
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {!selectedTournament && (
        <Card>
          <p className="text-gray-500 text-center py-8">Selecione um torneio para ver o financeiro.</p>
        </Card>
      )}

      <Modal
        open={expenseModalOpen}
        onClose={() => { setExpenseModalOpen(false); setExpenseEditingId(null) }}
        title={expenseEditingId ? "Editar Despesa" : "Adicionar Despesa"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {categoryEmojis.map(({ key, emoji, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setExpenseForm({ ...expenseForm, category: key })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    expenseForm.category === key
                      ? "bg-amber-100 ring-2 ring-amber-400"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-gray-600">{label}</span>
                </button>
              ))}
            </div>
            <Select
              label=""
              options={expenseCategories.map((c) => ({ value: c, label: `${getCategoryIcon(c)} ${getCategoryLabel(c)}` }))}
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
            />
          </div>
          <Input
            label="Descrição"
            placeholder="Ex: Aluguel de quadras"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <Input
            label="Data"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setExpenseModalOpen(false); setExpenseEditingId(null) }}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={!expenseForm.description || !expenseForm.amount || !expenseForm.date}
            >
              {expenseEditingId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={revenueModalOpen}
        onClose={() => { setRevenueModalOpen(false); setRevenueEditingId(null) }}
        title={revenueEditingId ? "Editar Receita" : "Adicionar Receita"}
      >
        <div className="space-y-4">
          <Select
            label="Fonte"
            options={revenueSources.map((s) => ({
              value: s,
              label: s === "patrocinio" ? "🤝 Patrocínio" : s === "inscricao" ? "📝 Inscrição" : "📦 Outros",
            }))}
            value={revenueForm.source}
            onChange={(e) => setRevenueForm({ ...revenueForm, source: e.target.value as RevenueSource })}
          />
          <Input
            label="Descrição"
            placeholder="Ex: Patrocínio Gold"
            value={revenueForm.description}
            onChange={(e) => setRevenueForm({ ...revenueForm, description: e.target.value })}
          />
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={revenueForm.amount}
            onChange={(e) => setRevenueForm({ ...revenueForm, amount: e.target.value })}
          />
          <Input
            label="Data"
            type="date"
            value={revenueForm.date}
            onChange={(e) => setRevenueForm({ ...revenueForm, date: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setRevenueModalOpen(false); setRevenueEditingId(null) }}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddRevenue}
              disabled={!revenueForm.amount || !revenueForm.description || !revenueForm.date}
            >
              {revenueEditingId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
