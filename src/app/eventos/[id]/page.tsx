"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradePreview } from "@/components/ui/grade-preview"
import * as store from "@/lib/store"
import { getStatusColor, getStatusLabel, getCategoryLabel } from "@/lib/utils"
import type { Tournament, RaffleRecord } from "@/lib/types"

export default function EventoDetalhePage() {
  const params = useParams()
  const id = params.id as string
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [raffleRecords, setRaffleRecords] = useState<RaffleRecord[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [apoiadores, setApoiadores] = useState<any[]>([])

  useEffect(() => {
    const t = store.getTournamentById(id)
    setTournament(t ?? null)
    if (t) {
      setRaffleRecords(store.getRaffleRecords(id))
      setRegistrations(store.getRegisteredAthletes(id))
      setSponsors(store.getSponsorships(id))
      setApoiadores(store.getApoiadores(id))
    }
  }, [id])

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
        <Link href="/eventos" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          &larr; Todos os eventos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tournament.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tournament.edition}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge className={getStatusColor(tournament.status)}>
          {getStatusLabel(tournament.status)}
        </Badge>
        {tournament.categories?.map((cat) => (
          <Badge key={cat} className="bg-purple-100 text-purple-800">
            {getCategoryLabel(cat)}
          </Badge>
        ))}
      </div>

      {tournament.date && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Data: {tournament.date}
        </p>
      )}

      {raffleRecords.length > 0 && (
        <Card>
          <CardHeader title="🎁 Vencedores dos Sorteios" />
          <div className="space-y-2">
            {raffleRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.winner_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.brinde_description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(registrations.some((r) => r.draw_number != null)) && (
        <div className="space-y-4">
          {(tournament.categories || ["4e5"]).map((cat) => {
            const catRegs = registrations.filter((r) => r.category === cat)
            const groups = [...new Set(catRegs.map((r) => r.group_name || "A"))].sort()
            return groups.map((grp) => {
              const grpRegs = catRegs.filter((r) => (r.group_name || "A") === grp && r.status === "approved")
              if (grpRegs.length < 8) return null
              return (
                <GradePreview
                  key={`${cat}-${grp}`}
                  registrations={grpRegs}
                  courtNames={store.getCourtNames(id)}
                  category={cat}
                  groupName={grp}
                  categoryLabel={cat === "4e5" ? "Cat. 4e5" : "Cat. 6e7"}
                />
              )
            })
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href={`/eventos/${id}/jogos`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-8">
            <p className="text-3xl mb-2">🎾</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Jogos</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe o placar ao vivo</p>
          </Card>
        </Link>
        <Link href={`/eventos/${id}/ranking`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-8">
            <p className="text-3xl mb-2">🏆</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ranking</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Veja a classificação do evento</p>
          </Card>
        </Link>
        <Link href="/eventos/ranking-anual">
          <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-8">
            <p className="text-3xl mb-2">📊</p>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ranking Anual</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Classificação geral do ano</p>
          </Card>
        </Link>
      </div>

      {(sponsors.length > 0 || apoiadores.length > 0) && (
        <Card>
          <CardHeader title="🤝 Agradecimentos" />
          <div className="space-y-3">
            {sponsors.length > 0 && (
              <div>
                <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-lg">🏆</span> Patrocinadores
                </p>
                <div className="flex flex-wrap gap-3">
                  {sponsors.map((s: any) => (
                    <div key={s.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl px-5 py-4 shadow-sm flex items-center gap-3 min-w-[200px]">
                      <span className="text-2xl">{s.tier === "gold" ? "🥇" : s.tier === "silver" ? "🥈" : "🥉"}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{s.sponsor_name}</p>
                        {s.sponsor_url && (
                          <a href={s.sponsor_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 mt-0.5">
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
                    <div key={a.id} className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                      {a.brindes?.length > 0 && (
                        <span className="text-gray-600 dark:text-gray-300 ml-1">
                          - {a.brindes.map((b: any) => `${b.description} (${b.type === "kit" ? "Kit" : "Sorteio"})`).join(", ")}
                        </span>
                      )}
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
