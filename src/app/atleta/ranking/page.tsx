"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"

const CATEGORIES = ["4e5", "6e7"]

export default function AthleteRanking() {
  const { user } = useAuth()
  const [liveRanking, setLiveRanking] = useState<(any)[]>([])
  const [annualRanking, setAnnualRanking] = useState<(any)[]>([])
  const [tournamentTitle, setTournamentTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("4e5")

  const refresh = () => {
    const t = store.getCurrentTournament()
    if (t) {
      setTournamentTitle(`${t.title} ${t.edition || ""}`)
      const reg = store.getAthleteRegistration(t.id, user?.id || "")
      const cat = reg?.category || selectedCategory
      setLiveRanking(store.getLiveRankings(t.id, cat))
      if (!selectedCategory) setSelectedCategory(cat)
    }
    setAnnualRanking(store.getAnnualRanking(selectedCategory))
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [selectedCategory])

  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>

      <Card>
        <CardHeader title="Ranking do Torneio" subtitle={tournamentTitle} />
        {liveRanking.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Ranking indisponível.</p>
        ) : (
          <Table headers={["Posição", "Atleta", "Total Games", "Pontos"]}>
            {liveRanking.map((r, idx) => {
              const isMe = r.athlete_id === user.id
              return (
                <tr
                  key={r.athlete_id}
                  className={isMe ? "bg-amber-50" : ""}
                >
                  <Td className="font-semibold">{r.position}º</Td>
                  <Td className={isMe ? "font-semibold text-amber-700" : ""}>
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
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {cat === "4e5" ? "4e5" : "6e7"}
                </button>
              ))}
            </div>
          }
        />
        <div className="px-5 pb-2">
          <Badge className="bg-purple-100 text-purple-800">
            {selectedCategory === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
          </Badge>
        </div>
        {annualRanking.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum dado disponível para {selectedCategory}.</p>
        ) : (
          <Table headers={["Posição", "Atleta", "Pontos", "Vitórias"]}>
            {annualRanking.map((r) => {
              const isMe = r.athlete_id === user.id
              return (
                <tr
                  key={r.athlete_id}
                  className={isMe ? "bg-amber-50" : ""}
                >
                  <Td className="font-semibold">{r.position}º</Td>
                  <Td className={isMe ? "font-semibold text-amber-700" : ""}>
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
