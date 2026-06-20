"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Tournament, Match } from "@/lib/types"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tournament, setTournament] = useState<Tournament | undefined>()
  const [matches, setMatches] = useState<Match[]>([])
  const [athleteCount, setAthleteCount] = useState(0)
  const [summary, setSummary] = useState({ totalRevenues: 0, totalExpenses: 0, balance: 0 })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }
    if (user) {
      const t = store.getCurrentTournament()
      setTournament(t)
      if (t) {
        setMatches(store.getTournamentMatches(t.id))
      }
      setAthleteCount(store.getAthletes().length)
      setSummary(store.getFinancialSummary())
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  const totalMatches = matches.length
  const liveMatches = matches.filter((m) => m.status === "live")
  const finishedMatches = matches.filter((m) => m.status === "finished")

  const recentMatches = [...matches]
    .filter((m) => m.status === "live" || m.status === "finished")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {tournament ? (
        <Card className="cursor-pointer" onClick={() => router.push(`/admin/torneios/${tournament.id}`)}>
          <CardHeader
            title={tournament.title}
            subtitle={tournament.edition && `Edição ${tournament.edition}`}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={getStatusColor(tournament.status)}>
              {getStatusLabel(tournament.status)}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tournament.date)}</span>
            {tournament.location && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{tournament.location}</span>
            )}
          </div>
          {tournament.status === "ongoing" && (
            <div className="mt-4 flex flex-wrap gap-3" onClick={(e) => e.stopPropagation()}>
              <Link href={`/admin/torneios/${tournament.id}/placar`}>
                <Button variant="success">Acessar Placar ao Vivo</Button>
              </Link>
              <Link href={`/admin/torneios/${tournament.id}`}>
                <Button variant="primary">Ver Jogos</Button>
              </Link>
              <Link href={`/admin/torneios/${tournament.id}/ranking`}>
                <Button variant="secondary">Ver Ranking</Button>
              </Link>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum torneio encontrado.</p>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{athleteCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total de Atletas</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalMatches}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total de Jogos</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{liveMatches.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Jogos ao Vivo</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{finishedMatches.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Jogos Finalizados</p>
        </Card>
      </div>

      {tournament && recentMatches.length > 0 && (
        <Card>
          <CardHeader title="Jogos Recentes" />
          <Table headers={["Jogo", "Quadra", "Placar", "Status"]}>
            {recentMatches.map((m) => {
              const t1p1 = store.getUserName(m.team1_player1_id)
              const t1p2 = store.getUserName(m.team1_player2_id)
              const t2p1 = store.getUserName(m.team2_player1_id)
              const t2p2 = store.getUserName(m.team2_player2_id)
              return (
                <tr key={m.id}>
                  <Td className="font-medium">
                    {t1p1}/{t1p2} vs {t2p1}/{t2p2}
                  </Td>
                  <Td>{m.court}</Td>
                  <Td>
                    {m.status === "pending" ? (
                      <span className="text-gray-400 dark:text-gray-500">--</span>
                    ) : (
                      <span className="font-semibold">
                        {m.score_team1} x {m.score_team2}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Badge className={getStatusColor(m.status)}>
                      {getStatusLabel(m.status)}
                    </Badge>
                  </Td>
                </tr>
              )
            })}
          </Table>
        </Card>
      )}

      <Card>
        <CardHeader title="Resumo Financeiro" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Receitas</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.totalRevenues)}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
            <p className="text-sm text-red-600 font-medium">Despesas</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Saldo</p>
            <p className={`text-xl font-bold ${summary.balance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700"}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
