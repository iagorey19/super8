"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"
import { RankingInfo } from "@/components/ui/ranking-info"

const CATEGORIES = ["4e5", "6e7"]

export default function AthleteRanking() {
  const { user } = useAuth()
  const [liveRanking, setLiveRanking] = useState<(any)[]>([])
  const [annualRanking, setAnnualRanking] = useState<(any)[]>([])
  const [tournamentTitle, setTournamentTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("4e5")

  const refresh = useCallback(async () => {
    try { await store.refreshFromServer() } catch {}
    const t = store.getCurrentTournament()
    if (t) {
      setTournamentTitle(`${t.title} ${t.edition || ""}`)
      const reg = store.getAthleteRegistration(t.id, user?.id || "")
      const cat = reg?.category || selectedCategory
      setLiveRanking(store.getLiveRankings(t.id, cat))
      if (!selectedCategory) setSelectedCategory(cat)
    }
    setAnnualRanking(store.getAnnualRanking(selectedCategory))
  }, [selectedCategory, user])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ranking</h1>
        <Button size="sm" variant="secondary" onClick={refresh}>
          Atualizar
        </Button>
      </div>

      <RankingInfo />

      <Card>
        <CardHeader title="Ranking do Torneio" subtitle={tournamentTitle} />
        {liveRanking.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Ranking indisponível.</p>
        ) : (
          <Table headers={["Posição", "Atleta", "Total Games", "Pontos"]}>
            {liveRanking.map((r, idx) => {
              const isMe = r.athlete_id === user.id
              return (
                <tr
                  key={r.athlete_id}
                  className={isMe ? "bg-amber-50 dark:bg-amber-900/20" : ""}
                >
                  <Td className="font-semibold">{r.position}º</Td>
                  <Td className={isMe ? "font-semibold text-amber-700 dark:text-amber-400" : ""}>
                    {r.name}
                    {isMe && <span className="text-xs ml-1">(você)</span>}
                  </Td>
                  <Td>{r.total_games}</Td>
                  <Td className="font-semibold">{r.points}</Td>
                </tr>
              )
            })}
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Ranking Anual"
          action={
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                  }`}
                >
                  {cat === "4e5" ? "4e5" : "6e7"}
                </button>
              ))}
            </div>
          }
        />
        <div className="px-5 pb-2">
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            {selectedCategory === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
          </Badge>
        </div>
        {annualRanking.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum dado disponível para {selectedCategory}.</p>
        ) : (
          <Table headers={["Posição", "Atleta", "Pontos", "Vitórias"]}>
            {annualRanking.map((r) => {
              const isMe = r.athlete_id === user.id
              return (
                <tr
                  key={r.athlete_id}
                  className={isMe ? "bg-amber-50 dark:bg-amber-900/20" : ""}
                >
                  <Td className="font-semibold">{r.position}º</Td>
                  <Td className={isMe ? "font-semibold text-amber-700 dark:text-amber-400" : ""}>
                    {r.name}
                    {isMe && <span className="text-xs ml-1">(você)</span>}
                  </Td>
                  <Td>{r.total_points}</Td>
                  <Td>{r.wins_count}</Td>
                </tr>
              )
            })}
          </Table>
        )}
      </Card>
    </div>
  )
}
