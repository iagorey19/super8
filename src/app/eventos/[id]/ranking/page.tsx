"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"
import { getStatusLabel } from "@/lib/utils"
import type { Tournament } from "@/lib/types"

const positionStyle = (pos: number) => {
  if (pos === 1) return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-300 font-bold"
  if (pos === 2) return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 font-semibold"
  if (pos === 3) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-300 font-semibold"
  return ""
}

export default function PublicRankingPage() {
  const params = useParams()
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sponsors, setSponsors] = useState<any[]>([])
  const [apoiadores, setApoiadores] = useState<any[]>([])
  const [raffleRecords, setRaffleRecords] = useState<any[]>([])

  const loadData = useCallback(() => {
    const t = store.getTournamentById(tournamentId)
    setTournament(t || null)
    const cat = selectedCategory || undefined
    if (t?.status === "ongoing") {
      setResults(store.getLiveRankings(tournamentId, cat))
    } else {
      setResults(store.getRankings(tournamentId, cat))
    }
    if (t) {
      setSponsors(store.getSponsorships(tournamentId))
      setApoiadores(store.getApoiadores(tournamentId))
      setRaffleRecords(store.getRaffleRecords(tournamentId))
    }
  }, [tournamentId, selectedCategory])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const categories = tournament?.categories || ["4e5"]
  const maxRounds = Math.max(...results.map((r: any) => r.round_scores?.length || 0), 0)

  if (!tournament) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Evento não encontrado.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/eventos/${tournamentId}`} className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium">
          &larr; Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tournament.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ranking</p>
          </div>
          <Link href={`/eventos/${tournamentId}/ranking/print`}>
            <Button size="sm" variant="secondary">🖨️ Imprimir</Button>
          </Link>
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
            results.map((r: any, idx: number) => (
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
                  {r.name || store.getUserName(r.athlete_id)}
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

      {(sponsors.length > 0 || apoiadores.length > 0 || raffleRecords.length > 0) && (
        <Card>
          <CardHeader title="🤝 Agradecimentos" />
          <div className="space-y-3">
            {sponsors.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-lg">🏆</span> Patrocinadores
                </p>
                <div className="flex flex-wrap gap-3">
                  {sponsors.map((s: any) => (
                    <div key={s.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[200px]">
                      <span className="text-2xl">{s.tier === "gold" ? "🥇" : s.tier === "silver" ? "🥈" : "🥉"}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{s.sponsor_name}</p>
                        {s.sponsor_url && (
                          <a href={s.sponsor_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 mt-0.5">
                            🔗 Acesse o site
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {apoiadores.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Apoiadores</p>
                <div className="flex flex-wrap gap-2">
                  {apoiadores.map((a: any) => (
                    <div key={a.id} className="bg-green-50 dark:bg-green-900/20 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                      {a.brindes?.length > 0 && (
                        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-300 ml-1">
                          - {a.brindes.map((b: any) => `${b.description} (${b.type === "kit" ? "Kit" : "Sorteio"})`).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {raffleRecords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Vencedores dos Sorteios</p>
                <div className="space-y-1">
                  {raffleRecords.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm px-2 py-1">
                      <span className="text-green-600 dark:text-green-400">🎁</span>
                        <span className="font-medium text-gray-900 dark:text-white">{r.winner_name}</span>
                        <span className="text-gray-600 dark:text-gray-400 dark:text-gray-300">- {r.brinde_description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
