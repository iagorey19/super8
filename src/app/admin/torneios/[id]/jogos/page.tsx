"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTournamentById, getTournamentMatches, getUserName, getCourtNames, updateCourtName } from "@/lib/store"
import { getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Match, Tournament } from "@/lib/types"

export default function JogosPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [view, setView] = useState<"lista" | "grade">("lista")

  useEffect(() => {
    const t = getTournamentById(id)
    setTournament(t || null)
    const allMatches = getTournamentMatches(id)
    setMatches(allMatches)
    setLoading(false)
  }, [id])

  const categories = tournament?.categories || ["4e5"]

  const filteredMatches = selectedCategory
    ? matches.filter((m) => m.category === selectedCategory)
    : matches

  const courtNames = tournament ? getCourtNames(id) : []
  const rounds = [1, 2, 3, 4, 5, 6, 7]
  const uniqueCourts = [...new Set(filteredMatches.map((m) => m.court))].sort()

  function handleDrop(e: React.DragEvent, court: string, round: number) {
    e.preventDefault()
    const matchId = e.dataTransfer.getData("matchId")
    if (!matchId) return
    const m = matches.find((x) => x.id === matchId)
    if (!m || (m.court === court && m.round === round)) return
    const data = getTournamentById(id)
    if (!data) return
    const allMatches = getTournamentMatches(id)
    const existing = allMatches.find((x) => x.court === court && x.round === round && x.category === m.category && x.group_name === m.group_name && x.id !== matchId)
    if (existing) return
    const matchData = allMatches.find((x) => x.id === matchId)
    if (matchData) {
      matchData.court = court
      matchData.round = round
    }
    setMatches([...allMatches])
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/torneios/${id}`)}>
            &larr; Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tournament.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tournament.edition}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={view === "lista" ? "primary" : "secondary"} onClick={() => setView("lista")}>
            Lista
          </Button>
          <Button size="sm" variant={view === "grade" ? "primary" : "secondary"} onClick={() => setView("grade")}>
            Grade
          </Button>
          <Button onClick={() => router.push(`/admin/torneios/${id}/placar`)}>
            Atualizar Placar
          </Button>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="flex gap-2">
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
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {selectedCategory
              ? `Nenhuma partida na categoria ${selectedCategory}`
              : "Inicie o torneio primeiro"}
          </p>
        </Card>
      ) : view === "grade" ? (
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
                    {courtNames[parseInt(court) - 1] || `Quadra ${court}`}
                    <span className="text-xs text-gray-400 dark:text-gray-500">({court})</span>
                  </div>
                  {rounds.map((round) => {
                    const match = filteredMatches.find(
                      (m) => m.court === court && m.round === round
                    )
                    return (
                      <div
                        key={`${court}-${round}`}
                        className="bg-white dark:bg-gray-800 p-2 min-h-[80px]"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, court, round)}
                      >
                        {match ? (
                          <div
                            className="h-full rounded-lg border p-2 text-xs space-y-1 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("matchId", match.id)}
                          >
                            <div className="font-medium">
                              {getUserName(match.team1_player1_id)} / {getUserName(match.team1_player2_id)}
                            </div>
                            <div className="text-gray-400 dark:text-gray-500">vs</div>
                            <div className="font-medium">
                              {getUserName(match.team2_player1_id)} / {getUserName(match.team2_player2_id)}
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
        rounds.map((round) => {
          const roundMatches = filteredMatches.filter((m) => m.round === round)
          if (roundMatches.length === 0) return null
          return (
            <div key={round}>
              <CardHeader title={`Rodada ${round}`} />
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
                          {courtNames[parseInt(match.court) - 1] || `Quadra ${match.court}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                            {getUserName(match.team1_player1_id)}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                            {getUserName(match.team1_player2_id)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {match.score_team1} : {match.score_team2}
                          </p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                            {getUserName(match.team2_player1_id)}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">/</span>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-relaxed">
                            {getUserName(match.team2_player2_id)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}