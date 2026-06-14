"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getRankings, getLiveRankings, getTournamentById, getUserName, getCourtNames } from "@/lib/store"
import type { Tournament } from "@/lib/types"

export default function PrintRankingPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const [results, setResults] = useState<any[]>([])
  const [tournament, setTournament] = useState<Tournament | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [courtNames, setCourtNames] = useState<string[]>([])

  useEffect(() => {
    const t = getTournamentById(tournamentId)
    setTournament(t)
    setCourtNames(getCourtNames(tournamentId))
    if (t) {
      const cat = selectedCategory || undefined
      if (t.status === "ongoing") {
        setResults(getLiveRankings(tournamentId, cat))
      } else {
        setResults(getRankings(tournamentId, cat))
      }
    }
  }, [tournamentId, selectedCategory])

  useEffect(() => {
    const timeout = setTimeout(() => window.print(), 500)
    return () => clearTimeout(timeout)
  }, [])

  const categories = tournament?.categories || ["4e5"]

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        .cat-btn { display: inline-block; margin: 4px; padding: 4px 14px; border-radius: 999px; font-size: 13px; border: 1px solid #d1d5db; background: #f9fafb; cursor: pointer; }
        .cat-btn.active { background: #d97706; color: #fff; border-color: #d97706; }
      `}</style>

      <div className="no-print mb-4 text-sm text-gray-500">
        Use Ctrl+P (Cmd+P) para imprimir ou salvar como PDF.
      </div>

      {tournament && (
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{tournament.title} {tournament.edition}</h1>
          <p className="text-gray-500 mt-1">
            {new Date(tournament.date + "T12:00:00").toLocaleDateString("pt-BR")}
            &nbsp;&middot;&nbsp;
            {tournament.status === "ongoing" ? "Em Andamento" : "Resultado Final"}
          </p>
          {tournament.location && <p className="text-gray-400 text-sm">{tournament.location}</p>}
        </div>
      )}

      {categories.length > 1 && (
        <div className="text-center mb-4 no-print">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
            >
              {cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"}
            </button>
          ))}
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600 w-10">#</th>
            <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Atleta</th>
            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Jogos</th>
            <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Pontos</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r: any, idx: number) => (
            <tr key={r.athlete_id || idx} className="border-b border-gray-200">
              <td className={`py-2 px-3 text-center font-bold ${
                idx === 0 ? "text-yellow-600" : idx === 1 ? "text-gray-500" : idx === 2 ? "text-orange-600" : "text-gray-700"
              }`}>
                {r.position}
              </td>
              <td className="py-2 px-3 font-medium text-gray-900">
                {r.name || getUserName(r.athlete_id)}
              </td>
              <td className="py-2 px-3 text-center text-gray-600">{r.total_games || 0}</td>
              <td className="py-2 px-3 text-center font-bold text-gray-900">{r.points || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {results.length === 0 && (
        <p className="text-center text-gray-400 py-12">Nenhum resultado disponível.</p>
      )}

      <div className="mt-8 text-center text-xs text-gray-400">
        Impresso em {new Date().toLocaleDateString("pt-BR")} &middot; THE SUPER 8
      </div>
    </div>
  )
}