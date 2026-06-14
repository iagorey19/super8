"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as store from "@/lib/store"
import { getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Match, RaffleRecord } from "@/lib/types"

export default function AthleteMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [tournamentTitle, setTournamentTitle] = useState("")
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])

  const refresh = () => {
    if (!user) return
    const t = store.getCurrentTournament()
    if (t) {
      setTournamentTitle(`${t.title} ${t.edition || ""}`)
      const m = store.getAthleteMatches(user.id, t.id)
      setMatches(m)
      setRaffleRecords(store.getRaffleRecords(t.id))
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  const isTournamentEnded = matches.length > 0 && matches.every((m) => m.status === "finished")
  const roundNames: Record<number, string> = {
    1: "1ª Rodada",
    2: "2ª Rodada",
    3: "3ª Rodada",
    4: "4ª Rodada",
    5: "5ª Rodada",
    6: "6ª Rodada",
    7: "7ª Rodada",
  }

  const getUserName = (id: string) => store.getUserName(id)

  const isUserOnTeam = (match: Match, teamNum: 1 | 2): boolean => {
    if (teamNum === 1) {
      return match.team1_player1_id === user!.id || match.team1_player2_id === user!.id
    }
    return match.team2_player1_id === user!.id || match.team2_player2_id === user!.id
  }

  const categories = [...new Set(matches.map((m) => m.category))]
  const rounds = [1, 2, 3, 4, 5, 6, 7]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Jogos</h1>
        {isTournamentEnded && (
          <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Torneio Encerrado</Badge>
        )}
      </div>

      {tournamentTitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">{tournamentTitle}</p>
      )}

      {matches.length === 0 ? (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum jogo encontrado.</p>
        </Card>
      ) : (
        categories.map((cat) => {
          const catMatches = matches.filter((m) => m.category === cat)
          if (catMatches.length === 0) return null
          return (
            <div key={cat}>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-sm px-3 py-1">
                  {cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
                </Badge>
              </h2>
              {rounds.map((round) => {
                const roundMatches = catMatches.filter((m) => m.round === round)
                if (roundMatches.length === 0) return null

                return (
                  <Card key={`${cat}-${round}`}>
                    <CardHeader title={roundNames[round]} />
                    <div className="space-y-3">
                      {roundMatches.map((m) => {
                        const t1p1 = getUserName(m.team1_player1_id)
                        const t1p2 = getUserName(m.team1_player2_id)
                        const t2p1 = getUserName(m.team2_player1_id)
                        const t2p2 = getUserName(m.team2_player2_id)

                        const isMyTeam1 = isUserOnTeam(m, 1)
                        const isMyTeam2 = isUserOnTeam(m, 2)

                        return (
                          <div
                            key={m.id}
                            className={`rounded-lg border p-3 ${
                              isMyTeam1 || isMyTeam2 ? "border-amber-300 bg-amber-50/50 dark:bg-amber-900/20" : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400 dark:text-gray-500">Quadra {m.court}</span>
                              <Badge className={getStatusColor(m.status)}>
                                {getStatusLabel(m.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className={`flex-1 text-sm font-medium ${isMyTeam1 ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>
                                {t1p1} / {t1p2}
                                {isMyTeam1 && <span className="text-xs ml-1">(você)</span>}
                              </div>
                              <div className="mx-4 text-center">
                                {m.status === "pending" ? (
                                  <span className="text-gray-400 dark:text-gray-500 text-sm">--</span>
                                ) : (
                                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                                    {m.score_team1} x {m.score_team2}
                                  </span>
                                )}
                              </div>
                              <div className={`flex-1 text-sm font-medium text-right ${isMyTeam2 ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>
                                {t2p1} / {t2p2}
                                {isMyTeam2 && <span className="text-xs ml-1">(você)</span>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        })
      )}

      {raffleRecords.length > 0 && (
        <Card>
          <CardHeader title="🎁 Sorteios" subtitle="Vencedores dos sorteios do evento" />
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
    </div>
  )
}
