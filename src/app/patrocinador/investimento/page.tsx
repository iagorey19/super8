"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import * as store from "@/lib/store"
import { formatCurrency, getCategoryLabel, getCategoryIcon } from "@/lib/utils"
import type { Tournament } from "@/lib/types"

export default function SponsorInvestment() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState("")
  const [summary, setSummary] = useState({ totalExpenses: 0, totalRevenues: 0, balance: 0 })
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, { total: number; items: any[] }>>({})
  const [mySponsorshipAmount, setMySponsorshipAmount] = useState(0)
  const [athleteCount, setAthleteCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [roundCount, setRoundCount] = useState(0)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    const t = store.getSponsorTournaments(user.id)
    setTournaments(t)
    if (t.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(t[0].id)
    }
  }, [user])

  useEffect(() => {
    if (!selectedTournamentId || !user) return

    setSummary(store.getFinancialSummary(selectedTournamentId))
    setExpensesByCategory(store.getExpensesByCategory(selectedTournamentId))

    const sponsorships = store.getSponsorships(selectedTournamentId)
    const mySponsorship = sponsorships.find((s) => s.sponsor_id === user.id)
    setMySponsorshipAmount(mySponsorship?.amount || 0)

    const matches = store.getTournamentMatches(selectedTournamentId)
    setMatchCount(matches.length)
    const uniqueRounds = new Set(matches.map((m) => m.round))
    setRoundCount(uniqueRounds.size)

    const regs = store.getRegisteredAthletes(selectedTournamentId)
    setAthleteCount(regs.filter((r) => r.status === "approved").length)
  }, [selectedTournamentId, user])

  if (!user) return null

  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Investimento</h1>

      {tournaments.length > 0 && (
        <Select
          label="Selecione o Torneio"
          options={tournaments.map((t) => ({
            value: t.id,
            label: `${t.title} - ${t.edition || t.date}`,
          }))}
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
        />
      )}

      {selectedTournament && (
        <>
          <Card>
            <CardHeader title="Seu Patrocínio" />
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Valor Patrocinado</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(mySponsorshipAmount)}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Resumo Financeiro" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-xs text-green-600 font-medium">Receitas</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(summary.totalRevenues)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-600 font-medium">Despesas</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Saldo</p>
                <p className={`text-lg font-bold ${summary.balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Despesas por Categoria" />
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma despesa registrada.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expensesByCategory).map(([category, data]) => (
                  <div key={category}>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(expandedCategories)
                        if (next.has(category)) next.delete(category)
                        else next.add(category)
                        setExpandedCategories(next)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getCategoryIcon(category)}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{getCategoryLabel(category)}</p>
                          <p className="text-xs text-gray-400">{data.items.length} despesa(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{formatCurrency(data.total)}</span>
                        <span className={`text-gray-400 transition-transform ${expandedCategories.has(category) ? "rotate-180" : ""}`}>▼</span>
                      </div>
                    </button>
                    {expandedCategories.has(category) && data.items.length > 0 && (
                      <div className="ml-12 mt-1 space-y-1">
                        {data.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm px-3 py-1.5">
                            <span className="text-gray-600">{item.description}</span>
                            <span className="font-medium text-gray-800">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Informações do Torneio" />
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">{athleteCount}</p>
                <p className="text-xs text-gray-500 mt-1">Atletas</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">{roundCount}</p>
                <p className="text-xs text-gray-500 mt-1">Rodadas</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">{matchCount}</p>
                <p className="text-xs text-gray-500 mt-1">Jogos</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
