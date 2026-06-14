"use client"

import Link from "next/link"
import { PublicNavbar } from "@/components/public-navbar"
import { AnnualRanking } from "@/components/annual-ranking"

export default function PublicAnnualRankingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PublicNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/eventos" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          &larr; Todos os eventos
        </Link>
        <div className="mt-4">
          <AnnualRanking />
        </div>
      </main>
    </div>
  )
}
