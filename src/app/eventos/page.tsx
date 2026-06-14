"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as store from "@/lib/store"
import { getStatusColor, getStatusLabel, getCategoryLabel } from "@/lib/utils"
import type { Tournament } from "@/lib/types"

export default function EventosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    setTournaments(store.getTournaments())
  }, [])

  if (tournaments.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum evento cadastrado.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Eventos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.map((t) => (
          <Link key={t.id} href={`/eventos/${t.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.edition}</p>
                </div>
                <Badge className={getStatusColor(t.status)}>
                  {getStatusLabel(t.status)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {t.categories?.map((cat) => (
                  <Badge key={cat} className="bg-purple-100 text-purple-800 text-xs">
                    {getCategoryLabel(cat)}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {t.date || ""}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
