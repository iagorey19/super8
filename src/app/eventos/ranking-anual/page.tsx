"use client"

import Link from "next/link"
import { AnnualRanking } from "@/components/annual-ranking"
import { RankingInfo } from "@/components/ui/ranking-info"

export default function PublicAnnualRankingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/eventos" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
        &larr; Todos os eventos
      </Link>
      <div className="mt-4 space-y-4">
        <RankingInfo />
        <AnnualRanking />
      </div>
    </div>
  )
}
