"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"

export default function AthleteStatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ReturnType<typeof store.getAthleteStats> | null>(null)

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return }
    if (user) setStats(store.getAthleteStats(user.id))
  }, [user, loading, router])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!user) return null

  const maxPoints = Math.max(...stats.scoresByTournament.map((s) => s.points), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Estatísticas</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMatches}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total de Jogos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.winRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aproveitamento</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.wins}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vitórias</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">{stats.losses}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Derrotas</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.avgScore}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Média de Pontos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.bestPosition ? `${stats.bestPosition}º` : "--"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Melhor Posição</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Desempenho por Torneio" />
        {stats.scoresByTournament.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-6">Nenhum torneio participado.</p>
        ) : (
          <div className="space-y-3">
            {stats.scoresByTournament.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{s.tournamentTitle}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {s.position > 0 ? `${s.position}º lugar` : "Em andamento"} · {s.points} pts
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                    style={{ width: `${(s.points / maxPoints) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="text-center">
        <Button variant="secondary" onClick={() => router.push("/atleta")}>
          Voltar
        </Button>
      </div>
    </div>
  )
}