"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getTournamentById,
  getTournamentMatches,
  updateMatchScore,
  resetAllScores,
  getUserName,
} from "@/lib/store"
import { getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Match, Tournament } from "@/lib/types"

export default function PlacarPage() {
  const params = useParams()
  const id = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRound, setCurrentRound] = useState(1)

  const loadData = useCallback(() => {
    const t = getTournamentById(id)
    setTournament(t || null)
    const allMatches = getTournamentMatches(id)
    setMatches(allMatches)

    const firstUnfinished = [1, 2, 3, 4, 5, 6, 7].find((r) => {
      const roundMatches = allMatches.filter((m) => m.round === r)
      return roundMatches.length > 0 && roundMatches.some((m) => m.status !== "finished")
    })
    if (firstUnfinished) {
      setCurrentRound(firstUnfinished)
    } else if (allMatches.length > 0) {
      setCurrentRound(7)
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const interval = setInterval(loadData, 3000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleScore = (matchId: string, team: 1 | 2) => {
    updateMatchScore(matchId, team)
    loadData()
  }

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja reiniciar todos os placares?")) {
      resetAllScores(id)
      loadData()
    }
  }

  const roundMatches = matches.filter((m) => m.round === currentRound)
  const rounds = [1, 2, 3, 4, 5, 6, 7]

  const getCategoryBadge = (cat?: string) => {
    if (!cat) return null
    return cat === "4e5" ? "4e5" : "6e7"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Torneio não encontrado.</p>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tournament.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Placar ao Vivo</p>
        </div>
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma partida encontrada. Inicie o torneio primeiro.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{tournament.title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Placar ao Vivo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={loadData}>
            Atualizar
          </Button>
          <Button variant="danger" size="sm" onClick={handleReset}>
            Reiniciar Placar
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {rounds.map((r) => {
          const hasMatches = matches.some((m) => m.round === r)
          if (!hasMatches) return null
          return (
            <button
              key={r}
              onClick={() => setCurrentRound(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                currentRound === r
                  ? "bg-amber-600 text-white shadow"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Rodada {r}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roundMatches.map((match) => (
          <div key={match.id}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {match.court}
                  </span>
                  {match.category && (
                    <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs">
                      {getCategoryBadge(match.category)}
                    </Badge>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}
                >
                  {getStatusLabel(match.status)}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 text-center">
                  <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {getUserName(match.team1_player1_id)}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                  <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {getUserName(match.team1_player2_id)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-5xl font-black text-gray-900 dark:text-white tabular-nums leading-none min-w-[3rem] text-right">
                    {match.score_team1}
                  </p>
                  <span className="text-3xl font-bold text-gray-300 dark:text-gray-600">:</span>
                  <p className="text-5xl font-black text-gray-900 dark:text-white tabular-nums leading-none min-w-[3rem] text-left">
                    {match.score_team2}
                  </p>
                </div>

                <div className="flex-1 text-center">
                  <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {getUserName(match.team2_player1_id)}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                  <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {getUserName(match.team2_player2_id)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1 text-lg font-bold py-4"
                  disabled={match.status === "finished" || match.score_team1 >= 5}
                  onClick={() => handleScore(match.id, 1)}
                >
                  +1
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1 text-lg font-bold py-4"
                  disabled={match.status === "finished" || match.score_team2 >= 5}
                  onClick={() => handleScore(match.id, 2)}
                >
                  +1
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
