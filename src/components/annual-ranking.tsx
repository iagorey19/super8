"use client"

import { Fragment, useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, Td } from "@/components/ui/table"
import { getAnnualRanking } from "@/lib/store"
import { exportToCSV } from "@/lib/utils"

const CATEGORIES = ["4e5", "6e7"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

function medal(pos: number) {
  if (pos === 1) return { emoji: "🥇", label: "1º" }
  if (pos === 2) return { emoji: "🥈", label: "2º" }
  if (pos === 3) return { emoji: "🥉", label: "3º" }
  return { emoji: null, label: `${pos}º` }
}

export function AnnualRanking() {
  const [selectedCategory, setSelectedCategory] = useState("4e5")
  const [ranking, setRanking] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function loadRanking() {
    setRanking(getAnnualRanking(selectedCategory))
  }

  useEffect(() => {
    loadRanking()
    const interval = setInterval(loadRanking, 10000)
    return () => clearInterval(interval)
  }, [selectedCategory])

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ranking Anual</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full font-medium">
          {new Date().getFullYear()}
        </span>
      </div>

      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
          </Button>
        ))}
      </div>

      {ranking.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div>
              <p className="text-sm text-amber-100 font-medium">Líder do Ranking - {selectedCategory}</p>
              <h2 className="text-2xl font-bold">{ranking[0].name}</h2>
              <p className="text-amber-100 text-sm mt-1">
                {ranking[0].total_points} pontos em {ranking[0].tournaments_count} torneios
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader
          title={`Classificação - ${selectedCategory}`}
          action={
            <Button size="sm" variant="secondary" onClick={() => exportToCSV(
              ["Pos","Atleta","Torneios","Vitórias","Total Games","Pontos"],
              ranking.map((r) => [String(r.position), r.name, String(r.tournaments_count), String(r.wins_count), String(r.total_games), String(r.total_points)]),
              `ranking_anual_${selectedCategory}_${new Date().getFullYear()}`
            )}>
              Exportar CSV
            </Button>
          }
        />
        <Table headers={["Detalhes", "Pos", "Atleta", "Torneios", "Vitórias", "Total Games", "Pontos"]}>
          {ranking.length === 0 ? (
            <tr>
              <Td colSpan={7}>
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">
                  Nenhum dado de ranking disponível para {selectedCategory}
                </p>
              </Td>
            </tr>
          ) : (
            ranking.map((r, idx) => {
              const isExpanded = expandedId === r.athlete_id
              return (
                <Fragment key={r.athlete_id}>
                  <tr className="group">
                    <Td>
                      <button
                        onClick={() => toggleExpand(r.athlete_id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        title="Ver torneios"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Td>
                    <Td>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${
                        idx === 0
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700"
                          : idx === 1
                            ? "bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                            : idx === 2
                              ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700"
                              : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      }`}>
                        {r.position}
                      </span>
                    </Td>
                    <Td className="font-medium text-gray-900 dark:text-white">{r.name}</Td>
                    <Td className="text-center text-gray-700 dark:text-gray-300">{r.tournaments_count}</Td>
                    <Td className="text-center text-gray-700 dark:text-gray-300">{r.wins_count}</Td>
                    <Td className="text-center text-gray-700 dark:text-gray-300">{r.total_games}</Td>
                    <Td className="text-center font-semibold text-amber-700 dark:text-amber-400">
                      {r.total_points}
                    </Td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${r.athlete_id}-details`}>
                      <td colSpan={7} className="px-4 pb-3 pt-0">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Torneios disputados
                          </p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Torneio</th>
                                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Data</th>
                                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Pontos</th>
                                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Games</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...r.tournaments]
                                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((t: any) => {
                                  const m = medal(t.position)
                                  return (
                                    <tr key={t.tournament_id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                      <td className="px-3 py-2">
                                        <span className="inline-flex items-center gap-1">
                                          {m.emoji && <span>{m.emoji}</span>}
                                          <span className={`text-sm font-medium ${
                                            t.position <= 3 ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                          }`}>
                                            {m.label}
                                          </span>
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                                        {t.title}
                                        {t.edition ? <span className="text-gray-500 dark:text-gray-400 font-normal"> - {t.edition}ª Ed.</span> : null}
                                      </td>
                                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{formatDate(t.date)}</td>
                                      <td className="px-3 py-2 text-center font-semibold text-amber-700 dark:text-amber-400">{t.points}</td>
                                      <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{t.total_games}</td>
                                    </tr>
                                  )
                                })}
                              {r.tournaments.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-4">
                                    Nenhum torneio encontrado
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })
          )}
        </Table>
      </Card>
    </div>
  )
}
