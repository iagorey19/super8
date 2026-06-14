"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Table, Td } from "@/components/ui/table"
import * as store from "@/lib/store"
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"
import type { Tournament, Photo, TournamentResult, Match, Apoiador, Brinde, RaffleRecord } from "@/lib/types"

export default function SponsorResults() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [rankings, setRankings] = useState<(TournamentResult & { name: string })[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [apoiadores, setApoiadores] = useState<(Apoiador & { brindes: Brinde[] })[]>([])
  const [sponsorships, setSponsorships] = useState<any[]>([])
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null)
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])

  useEffect(() => {
    if (!user) return
    const t = store.getSponsorTournaments(user.id)
    setTournaments(t)
    if (t.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(t[0].id)
    }
  }, [user])

  useEffect(() => {
    if (!selectedTournamentId) return
    setPhotos(store.getPhotos(selectedTournamentId))
    setMatches(store.getTournamentMatches(selectedTournamentId, selectedCategory || undefined))
    const results = store.getRankings(selectedTournamentId, selectedCategory || undefined)
    setRankings(
      results.map((r) => ({
        ...r,
        name: store.getUserName(r.athlete_id),
      }))
    )
    setApoiadores(store.getApoiadores(selectedTournamentId))
    setSponsorships(store.getSponsorships(selectedTournamentId))
    setRaffleRecords(store.getRaffleRecords(selectedTournamentId))
    setCurrentTournament(store.getTournamentById(selectedTournamentId) ?? null)
  }, [selectedTournamentId, selectedCategory])

  if (!user) return null

  const tournamentCategories = currentTournament?.categories || []
  const hasMultipleCategories = tournamentCategories.length > 1

  const rounds = [1, 2, 3, 4, 5, 6, 7]

  const roundNames: Record<number, string> = {
    1: "1ª Rodada",
    2: "2ª Rodada",
    3: "3ª Rodada",
    4: "4ª Rodada",
    5: "5ª Rodada",
    6: "6ª Rodada",
    7: "7ª Rodada",
  }

  const matchesByCategory = [...new Set(matches.map((m) => m.category))]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Resultados</h1>

      {tournaments.length > 0 && (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              label="Selecione o Torneio"
              options={tournaments.map((t) => ({
                value: t.id,
                label: `${t.title} - ${t.edition || t.date}`,
              }))}
              value={selectedTournamentId}
              onChange={(e) => {
                setSelectedTournamentId(e.target.value)
                setSelectedCategory("")
              }}
            />
          </div>
          {hasMultipleCategories && selectedTournamentId && (
            <div className="w-48">
              <Select
                label="Categoria"
                options={[
                  { value: "", label: "Todas" },
                  ...tournamentCategories.map((cat) => ({
                    value: cat,
                    label: cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7",
                  })),
                ]}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {selectedTournamentId && (
        <>
          {photos.length > 0 && (
            <Card>
              <CardHeader title="Fotos" subtitle={`${photos.length} foto(s)`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Foto do torneio"}
                      className="w-full h-32 object-cover"
                    />
                    {photo.caption && (
                      <p className="text-xs text-gray-500 p-2">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title={selectedCategory ? `Classificação Final - ${selectedCategory}` : "Classificação Final"}
              subtitle={selectedCategory ? undefined : "Todas as categorias"}
            />
            {rankings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Resultados ainda não disponíveis.</p>
            ) : (
              <Table headers={["Posição", "Atleta", "Categoria", "Total Games", "Pontos"]}>
                {rankings.map((r) => (
                  <tr key={r.athlete_id}>
                    <Td className="font-semibold">{r.position}º</Td>
                    <Td>{r.name}</Td>
                    <Td>
                      {r.category ? (
                        <Badge className="bg-purple-100 text-purple-800">
                          {r.category === "4e5" ? "4e5" : "6e7"}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td>{r.total_games}</Td>
                    <Td className="font-semibold">{r.points}</Td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          <Card>
            <CardHeader title="Jogos por Rodada" />
            {matches.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum jogo registrado.</p>
            ) : (
              <div className="space-y-4">
                {matchesByCategory.map((cat) => {
                  const catMatches = matches.filter((m) => m.category === cat)
                  return (
                    <div key={cat}>
                      <Badge className="bg-purple-100 text-purple-800 mb-2">
                        {cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
                      </Badge>
                      {rounds.map((round) => {
                        const roundMatches = catMatches.filter((m) => m.round === round)
                        if (roundMatches.length === 0) return null

                        return (
                          <div key={`${cat}-${round}`} className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">{roundNames[round]}</h4>
                            <div className="space-y-2">
                              {roundMatches.map((m) => {
                                const t1p1 = store.getUserName(m.team1_player1_id)
                                const t1p2 = store.getUserName(m.team1_player2_id)
                                const t2p1 = store.getUserName(m.team2_player1_id)
                                const t2p2 = store.getUserName(m.team2_player2_id)

                                return (
                                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="text-xs text-gray-400 w-12">{m.court}</span>
                                      <span className="text-sm text-gray-700 truncate">
                                        {t1p1}/{t1p2}
                                      </span>
                                    </div>
                                    <div className="mx-2 text-center flex-shrink-0">
                                      {m.status === "pending" ? (
                                        <span className="text-gray-400 text-sm">--</span>
                                      ) : (
                                        <span className="font-bold text-sm text-gray-900">
                                          {m.score_team1} x {m.score_team2}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                      <span className="text-sm text-gray-700 truncate">
                                        {t2p1}/{t2p2}
                                      </span>
                                      <Badge className={getStatusColor(m.status)}>
                                        {getStatusLabel(m.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
          <Card>
            <CardHeader title="🎉 Agradecimentos" subtitle="Quem contribuiu para o evento" />
            <div className="space-y-4">
              {sponsorships.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                    <span>🏆</span> Patrocinador(es)
                  </h3>
                  <div className="space-y-2">
                    {sponsorships.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="font-medium text-gray-900">{s.sponsor_name}</span>
                        <span className="text-sm font-semibold text-amber-700">{formatCurrency(s.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {apoiadores.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    <span>🙌</span> Apoiadores
                  </h3>
                  <div className="space-y-2">
                    {apoiadores.map((a) => (
                      <div key={a.id} className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="font-medium text-gray-900">{a.name}</p>
                        {a.brindes.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {a.brindes.map((b) => (
                              <span key={b.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-gray-600 border border-gray-200">
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
                <p className="text-gray-400 text-sm text-center py-2">Nenhum patrocinador ou apoiador registrado.</p>
              )}

              {raffleRecords.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <span>🎁</span> Vencedores dos Sorteios
                  </h3>
                  <div className="space-y-2">
                    {raffleRecords.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                        <div>
                          <p className="font-medium text-gray-900">{r.winner_name}</p>
                          <p className="text-xs text-gray-500">{r.brinde_description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
