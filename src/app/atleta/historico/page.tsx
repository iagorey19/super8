"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as store from "@/lib/store"
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Tournament } from "@/lib/types"

export default function AthleteHistory() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [results, setResults] = useState<Record<string, { position: number; points: number; category?: string }>>({})

  useEffect(() => {
    if (!user) return
    const t = store.getAthleteTournaments(user.id)
    setTournaments(t)
    const resultsMap: Record<string, { position: number; points: number; category?: string }> = {}
    t.forEach((tour) => {
      const ranking = store.getRankings(tour.id)
      const myResult = ranking.find((r) => r.athlete_id === user.id)
      if (myResult) {
        resultsMap[tour.id] = {
          position: myResult.position,
          points: myResult.points,
          category: myResult.category,
        }
      } else {
        const reg = store.getAthleteRegistration(tour.id, user.id)
        if (reg?.category) {
          resultsMap[tour.id] = { position: 0, points: 0, category: reg.category }
        }
      }
    })
    setResults(resultsMap)
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Histórico</h1>

      {tournaments.length === 0 ? (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum torneio disputado ainda</p>
        </Card>
      ) : (
        tournaments.map((tour) => {
          const myResult = results[tour.id]
          return (
            <Card key={tour.id}>
              <CardHeader title={tour.title} subtitle={tour.edition} />
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className={getStatusColor(tour.status)}>
                  {getStatusLabel(tour.status)}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tour.date)}</span>
                {myResult?.category && (
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                    {myResult.category === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
                  </Badge>
                )}
              </div>
              {myResult && myResult.position > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{myResult.position}º</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Posição</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950 text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{myResult.points}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pontos</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">Resultados ainda não disponíveis.</p>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}
