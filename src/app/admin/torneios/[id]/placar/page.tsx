"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getTournamentById,
  getTournamentMatches,
  updateMatchScore,
  decrementMatchScore,
  resetAllScores,
  regenerateWhistFromRound,
  updateMatchPlayers,
  updateMatchCourt,
  getRegisteredAthletes,
  getUserName,
  getCourtNames,
  finalizeTournament,
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
  const initialRoundSet = useRef(false)
  const [locked, setLocked] = useState(false)
  const [editingCourts, setEditingCourts] = useState(false)

  const loadData = useCallback(() => {
    const t = getTournamentById(id)
    setTournament(t || null)
    if (t?.status === "completed") setLocked(true)
    const allMatches = getTournamentMatches(id)
    setMatches(allMatches)

    if (!initialRoundSet.current) {
      const firstUnfinished = [1, 2, 3, 4, 5, 6, 7].find((r) => {
        const roundMatches = allMatches.filter((m) => m.round === r)
        return roundMatches.length > 0 && roundMatches.some((m) => m.status !== "finished")
      })
      if (firstUnfinished) {
        setCurrentRound(firstUnfinished)
      } else if (allMatches.length > 0) {
        setCurrentRound(7)
      }
      initialRoundSet.current = true
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

  const handleDecrement = (matchId: string, team: 1 | 2) => {
    decrementMatchScore(matchId, team)
    loadData()
  }

  const [fixing, setFixing] = useState(false)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  const [editPlayers, setEditPlayers] = useState<{ t1p1: string; t1p2: string; t2p1: string; t2p2: string } | null>(null)

  const handleEditMatch = (match: Match) => {
    setEditingMatchId(match.id)
    setEditPlayers({
      t1p1: match.team1_player1_id,
      t1p2: match.team1_player2_id,
      t2p1: match.team2_player1_id,
      t2p2: match.team2_player2_id,
    })
  }

  const handleSaveEdit = (matchId: string) => {
    if (!editPlayers) return
    updateMatchPlayers(matchId, editPlayers.t1p1, editPlayers.t1p2, editPlayers.t2p1, editPlayers.t2p2)
    setEditingMatchId(null)
    setEditPlayers(null)
    loadData()
  }

  const handleCancelEdit = () => {
    setEditingMatchId(null)
    setEditPlayers(null)
  }

  const handleFixRound = async () => {
    const msg = `Recriar partidas da Rodada ${currentRound} até a 7 usando a schedule Whist corrigida?\n\nOs jogadores serão atualizados, mas os placares das partidas já em andamento serão mantidos.`
    if (!window.confirm(msg)) return
    setFixing(true)
    try {
      const n = await regenerateWhistFromRound(id, currentRound)
      loadData()
      alert(`${n} partidas atualizadas com a schedule correta!`)
    } catch (e) {
      alert("Erro ao corrigir: " + (e instanceof Error ? e.message : "desconhecido"))
    } finally {
      setFixing(false)
    }
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
          {tournament.status !== "completed" && (
            <>
              <div className="relative group">
                <Button variant="secondary" size="sm" onClick={handleFixRound} disabled={fixing}>
                  {fixing ? "Corrigindo..." : "↻ Corrigir Escalação"}
                </Button>
                <div className="absolute right-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  Recria as partidas da Rodada {currentRound} até a 7 usando a escala Whist corrigida. Os placares em andamento são mantidos.
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={handleReset}>
                Reiniciar Placar
              </Button>
              <Button variant="success" size="sm" onClick={() => {
                if (window.confirm("Finalizar evento? As partidas pendentes serão encerradas e os resultados calculados.")) {
                  finalizeTournament(id)
                  loadData()
                }
              }}>
                Finalizar Evento
              </Button>
            </>
          )}
          {tournament.status === "completed" && (
            <Button variant="secondary" size="sm" onClick={() => setLocked(!locked)}>
              {locked ? "🔒 Bloqueado" : "🔓 Desbloqueado"}
            </Button>
          )}
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

      <div className="flex items-center justify-between">
        <div />
        <Button size="sm" variant="ghost" onClick={() => setEditingCourts(!editingCourts)}>
          {editingCourts ? "✔ Concluído" : "✎ Editar Quadras"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roundMatches.map((match) => (
          <div key={match.id}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {editingCourts ? (
                    <select
                      value={match.court}
                      onChange={(e) => {
                        if (window.confirm(`Alterar quadra de "${match.court}" para "${e.target.value}"?`)) {
                          updateMatchCourt(match.id, e.target.value)
                          loadData()
                        }
                      }}
                      className="text-xs font-semibold border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {getCourtNames(id).map((name, idx) => (
                        <option key={idx} value={String(idx + 1)}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {match.court}
                    </span>
                  )}
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
                <button
                  onClick={() => handleEditMatch(match)}
                  className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 underline ml-2"
                  title="Editar jogadores"
                >
                  ✎ Editar
                </button>
              </div>

              {editingMatchId === match.id && editPlayers ? (
                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-gray-400 font-medium text-center">Time 1</p>
                      <select
                        value={editPlayers.t1p1}
                        onChange={(e) => setEditPlayers({ ...editPlayers, t1p1: e.target.value })}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {getRegisteredAthletes(id, match.category, match.group_name).map((a) => (
                          <option key={a.athlete_id} value={a.athlete_id}>{a.name}</option>
                        ))}
                      </select>
                      <select
                        value={editPlayers.t1p2}
                        onChange={(e) => setEditPlayers({ ...editPlayers, t1p2: e.target.value })}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {getRegisteredAthletes(id, match.category, match.group_name).map((a) => (
                          <option key={a.athlete_id} value={a.athlete_id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center px-3 text-gray-300 dark:text-gray-600 font-bold text-lg">vs</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-gray-400 font-medium text-center">Time 2</p>
                      <select
                        value={editPlayers.t2p1}
                        onChange={(e) => setEditPlayers({ ...editPlayers, t2p1: e.target.value })}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {getRegisteredAthletes(id, match.category, match.group_name).map((a) => (
                          <option key={a.athlete_id} value={a.athlete_id}>{a.name}</option>
                        ))}
                      </select>
                      <select
                        value={editPlayers.t2p2}
                        onChange={(e) => setEditPlayers({ ...editPlayers, t2p2: e.target.value })}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {getRegisteredAthletes(id, match.category, match.group_name).map((a) => (
                          <option key={a.athlete_id} value={a.athlete_id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => handleSaveEdit(match.id)}>
                      Salvar
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
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

                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-lg sm:text-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-30"
                      disabled={match.score_team1 <= 0 || locked}
                      onClick={() => handleDecrement(match.id, 1)}
                    >
                      −
                    </button>
                    <p className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tabular-nums leading-none min-w-[2rem] sm:min-w-[3rem] text-center">
                      {match.score_team1}
                    </p>
                    <span className="text-2xl sm:text-3xl font-bold text-gray-300 dark:text-gray-600">:</span>
                    <p className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tabular-nums leading-none min-w-[2rem] sm:min-w-[3rem] text-center">
                      {match.score_team2}
                    </p>
                    <button
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-lg sm:text-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-30"
                      disabled={match.score_team2 <= 0 || locked}
                      onClick={() => handleDecrement(match.id, 2)}
                    >
                      −
                    </button>
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
              )}

              {editingMatchId !== match.id && (
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-1 text-base sm:text-lg font-bold py-3 sm:py-4"
                    disabled={match.score_team1 >= (tournament?.max_score || 5) || locked}
                    onClick={() => handleScore(match.id, 1)}
                  >
                    +1
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-1 text-base sm:text-lg font-bold py-3 sm:py-4"
                    disabled={match.score_team2 >= (tournament?.max_score || 5) || locked}
                    onClick={() => handleScore(match.id, 2)}
                  >
                    +1
                  </Button>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
