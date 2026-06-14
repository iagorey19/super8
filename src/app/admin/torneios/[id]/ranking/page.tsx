"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, Td } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getRankings, getLiveRankings, getTournamentById, getUserName, getApoiadores, getSponsorships, getRaffleRecords } from "@/lib/store"
import { formatCurrency, getStatusLabel } from "@/lib/utils"
import type { Tournament, TournamentResult, RaffleRecord } from "@/lib/types"

const positionStyle = (pos: number) => {
  if (pos === 1) return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 font-bold"
  if (pos === 2) return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 font-semibold"
  if (pos === 3) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-300 font-semibold"
  return ""
}

export default function TournamentRankingPage() {
  const params = useParams()
  const router = useRouter()
  const tournamentId = params.id as string
  const [results, setResults] = useState<(TournamentResult & { name?: string })[]>([])
  const [tournament, setTournament] = useState<Tournament | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const [apoiadores, setApoiadores] = useState<any[]>([])
  const [sponsorships, setSponsorships] = useState<any[]>([])
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])
  const categories = tournament?.categories || ["4e5"]

  useEffect(() => { setTournament(getTournamentById(tournamentId)) }, [tournamentId])

  useEffect(() => { setTournament(getTournamentById(tournamentId)) }, [tournamentId])

  function loadAgradecimentos() {
    if (!tournamentId) return
    setApoiadores(getApoiadores(tournamentId))
    setSponsorships(getSponsorships(tournamentId))
    setRaffleRecords(getRaffleRecords(tournamentId))
  }

  function loadRankings() {
    if (!tournament) return
    const cat = selectedCategory || undefined
    if (tournament.status === "ongoing") {
      const live = getLiveRankings(tournamentId, cat)
      setResults(live)
    } else {
      const data = getRankings(tournamentId, cat)
      setResults(data)
    }
  }

  useEffect(() => {
    setTournament(getTournamentById(tournamentId))
  }, [tournamentId])

  useEffect(() => {
    loadRankings()
    loadAgradecimentos()
    if (tournament?.status === "ongoing") {
      const interval = setInterval(loadRankings, 5000)
      return () => clearInterval(interval)
    }
  }, [tournamentId, tournament?.status, selectedCategory])

  const maxRounds = Math.max(...results.map((r) => r.round_scores?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tournament?.title || "Carregando..."}
        </h1>
        {tournament && (
          <Badge className={tournament.status === "ongoing" ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 animate-pulse" : ""}>
            {getStatusLabel(tournament.status)}
          </Badge>
        )}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => router.push(`/admin/torneios/${tournamentId}/ranking/print`)}>
            🖨️ Imprimir
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

      <Card>
        <CardHeader
          title="Classificação"
          subtitle={selectedCategory ? `Categoria ${selectedCategory}` : "Todas as categorias"}
        />
        <Table
          headers={[
            "Posição",
            "Atleta",
            "Categoria",
            ...Array.from({ length: maxRounds }, (_, i) => `R${i + 1}`),
            "Total Games",
            "Pontos",
          ]}
        >
          {results.length === 0 ? (
            <tr>
              <Td colSpan={maxRounds + 5}>
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">
                  Nenhum resultado disponível
                </p>
              </Td>
            </tr>
          ) : (
            results.map((r, idx) => (
              <tr
                key={r.id || idx}
                className={`transition-colors ${idx === 0 ? "bg-yellow-50/50 dark:bg-yellow-900/20" : idx === 1 ? "bg-gray-50/50 dark:bg-gray-800/50" : idx === 2 ? "bg-orange-50/30 dark:bg-orange-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                <Td>
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border ${positionStyle(r.position)}`}
                  >
                    {r.position}
                  </span>
                </Td>
                <Td className="font-medium text-gray-900 dark:text-white">
                  {r.name || getUserName(r.athlete_id)}
                </Td>
                <Td>
                  {r.category && (
                    <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs">
                      {r.category === "4e5" ? "4e5" : "6e7"}
                    </Badge>
                  )}
                </Td>
                {Array.from({ length: maxRounds }, (_, i) => (
                  <Td key={i} className="text-center">
                    {r.round_scores?.[i] !== undefined ? r.round_scores[i] : "-"}
                  </Td>
                ))}
                <Td className="text-center font-medium">{r.total_games}</Td>
                <Td className="text-center font-semibold text-amber-700 dark:text-amber-400">{r.points}</Td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Card>
        <CardHeader title="🎉 Agradecimentos" subtitle="Quem contribuiu para o evento" />
        <div className="space-y-4">
          {sponsorships.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                <span>🏆</span> Patrocinador(es)
              </h3>
              <div className="space-y-2">
                {sponsorships.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200">
                    <span className="font-medium text-gray-900 dark:text-white">{s.sponsor_name}</span>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {apoiadores.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
                <span>🙌</span> Apoiadores
              </h3>
              <div className="space-y-2">
                {apoiadores.map((a: any) => (
                  <div key={a.id} className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200">
                    <p className="font-medium text-gray-900 dark:text-white">{a.name}</p>
                    {a.brindes.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {a.brindes.map((b: any) => (
                          <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            {b.description}
                            {b.type === "kit" && ` (${b.quantity}x kit)`}
                            {b.type === "sorteio" && " (sorteio)"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sponsorships.length === 0 && apoiadores.length === 0 && raffleRecords.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-2">Nenhum patrocinador ou apoiador registrado.</p>
          )}

          {raffleRecords.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <span>🎁</span> Vencedores dos Sorteios
              </h3>
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
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
