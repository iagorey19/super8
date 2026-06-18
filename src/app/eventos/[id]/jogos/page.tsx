"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as store from "@/lib/store"
import { getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Match, Tournament } from "@/lib/types"

export default function PublicJogosPage() {
  const params = useParams()
  const id = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedRound, setSelectedRound] = useState(1)
  const [view, setView] = useState<"lista" | "grade">("lista")
  const [courtNames, setCourtNames] = useState<string[]>([])

  const getCourtName = (court: string) => {
    const n = parseInt(court.replace(/[A-Za-z]/g, ""), 10)
    return courtNames[isNaN(n) ? 0 : n - 1] || `Quadra ${court}`
  }

  const loadData = useCallback(() => {
    const t = store.getTournamentById(id)
    setTournament(t || null)
    setMatches(store.getTournamentMatches(id))
    setCourtNames(store.getCourtNames(id))
  }, [id])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const categories = tournament?.categories || ["4e5"]
  const filteredMatches = selectedCategory
    ? matches.filter((m) => m.category === selectedCategory)
    : matches

  const rounds = [1, 2, 3, 4, 5, 6, 7]
  const roundMatches = filteredMatches.filter((m) => m.round === selectedRound)
  const uniqueCourts = [...new Set(filteredMatches.map((m) => m.court))].sort()

  function courtIndex(court: string): number {
    const n = parseInt(court.replace(/[A-Za-z]/g, ""), 10)
    return isNaN(n) ? 0 : n - 1
  }

  if (!tournament) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Evento não encontrado.</p>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Link href={`/eventos/${id}`} className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium">
            &larr; Voltar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tournament.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Jogos</p>
        </div>
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma partida encontrada.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/eventos/${id}`} className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium">
          &larr; Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tournament.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Jogos</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {categories.length > 1 && (
            <>
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-amber-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                  }`}
                >
                  {cat === "4e5" ? "4e5" : "6e7"}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={view === "lista" ? "primary" : "secondary"} onClick={() => setView("lista")}>
            Lista
          </Button>
          <Button size="sm" variant={view === "grade" ? "primary" : "secondary"} onClick={() => setView("grade")}>
            Grade
          </Button>
        </div>
      </div>

      {view === "grade" ? (
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            <div className="grid gap-px bg-gray-200 dark:bg-gray-700 rounded-xl" style={{ gridTemplateColumns: `160px repeat(${rounds.length}, minmax(100px, 1fr))` }}>
              <div className="bg-gray-200 dark:bg-gray-700 p-3 font-medium text-sm text-gray-700 dark:text-gray-300">Quadra</div>
              {rounds.map((r) => (
                <div key={r} className="bg-gray-200 dark:bg-gray-700 p-3 font-medium text-sm text-gray-700 dark:text-gray-300 text-center">
                  {r}ª Rodada
                </div>
              ))}
              {uniqueCourts.map((court) => (
                <div key={court} className="contents">
                  <div className="bg-white dark:bg-gray-800 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {getCourtName(court)}
                    <span className="text-xs text-gray-400 dark:text-gray-500">({court})</span>
                  </div>
                  {rounds.map((round) => {
                    const match = filteredMatches.find(
                      (m) => m.court === court && m.round === round
                    )
                    return (
                      <div key={`${court}-${round}`} className="bg-white dark:bg-gray-800 p-2 min-h-[80px]">
                        {match ? (
                          <div className="h-full rounded-lg border p-2 text-xs space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {store.getUserName(match.team1_player1_id)} / {store.getUserName(match.team1_player2_id)}
                            </div>
                            <div className="text-gray-400 dark:text-gray-500">vs</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {store.getUserName(match.team2_player1_id)} / {store.getUserName(match.team2_player2_id)}
                            </div>
                            <div className={`text-center font-bold text-sm mt-1 ${
                              match.status === "finished" ? "text-green-600 dark:text-green-400" : match.status === "live" ? "text-amber-600 dark:text-amber-400" : "text-gray-300 dark:text-gray-600"
                            }`}>
                              {match.status === "pending" ? "--" : `${match.score_team1} x ${match.score_team2}`}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {rounds.map((round) => {
              const hasMatches = filteredMatches.some((m) => m.round === round)
              return (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRound === round
                      ? "bg-amber-600 text-white"
                      : hasMatches
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {round}ª Rodada
                </button>
              )
            })}
          </div>

          {roundMatches.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma partida na {selectedRound}ª rodada
                {selectedCategory ? ` (${selectedCategory})` : ""}.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roundMatches.map((match) => (
                <Card key={match.id}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(match.status)}>
                          {getStatusLabel(match.status)}
                        </Badge>
                        {match.category && categories.length > 1 && (
                          <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs">
                            {match.category === "4e5" ? "4e5" : "6e7"}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        {getCourtName(match.court)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                          {store.getUserName(match.team1_player1_id)}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                          {store.getUserName(match.team1_player2_id)}
                        </p>
                      </div>

                      <div className="text-center">
                        {match.status === "pending" ? (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">--</span>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {match.score_team1} : {match.score_team2}
                          </p>
                        )}
                      </div>

                      <div className="flex-1 text-center">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                          {store.getUserName(match.team2_player1_id)}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                          {store.getUserName(match.team2_player2_id)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
