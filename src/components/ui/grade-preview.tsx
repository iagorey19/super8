"use client"

import { useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buildGridFromMatches, buildGridFromRegistrations, cellFor } from "@/lib/grade-builder"
import { copyGradeText, exportGradePNG, exportGradeCSV, exportGradePDF, exportGradeTXT } from "@/lib/grade-exports"
import type { GradeData } from "@/lib/grade-types"
import type { Match } from "@/lib/types"

interface GradePreviewProps {
  registrations?: { athlete_id: string; draw_number: number; name: string }[]
  matches?: Match[]
  courtNames: string[]
  category: string
  groupName: string
  categoryLabel?: string
  courtOffset?: number
}

export function GradePreview({ registrations, matches, courtNames, category, groupName, categoryLabel, courtOffset = 0 }: GradePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const data: GradeData | null = matches && matches.length > 0
    ? buildGridFromMatches(matches, category, groupName, courtNames)
    : registrations
      ? buildGridFromRegistrations(registrations, courtNames, courtOffset)
      : null

  if (!data || data.uniqueCourts.length === 0) return null

  const { rounds, gridCells, uniqueCourts } = data
  const cellForFn = (court: string, round: number) => cellFor(gridCells, court, round)
  const label = categoryLabel || category

  return (
    <Card>
      <CardHeader
        title={`Grade ${label} — Grupo ${groupName}`}
        action={
          <div className="relative">
            <Button size="sm" variant="secondary" onClick={() => setExportOpen(!exportOpen)}>
              Exportar ▾
            </Button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[160px] overflow-hidden">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={async (e) => { e.stopPropagation(); await copyGradeText(gridCells, uniqueCourts, rounds, label, groupName); setCopied(true); setTimeout(() => setCopied(false), 2000); setExportOpen(false) }}>
                    {copied ? "✅ Copiado!" : "📋 Copiar texto"}
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); exportGradeTXT(gridCells, uniqueCourts, rounds, label, groupName, category); setExportOpen(false) }}>
                    📄 TXT
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); exportGradeCSV(gridCells, uniqueCourts, rounds, category, groupName); setExportOpen(false) }}>
                    📊 CSV
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={async (e) => { e.stopPropagation(); await exportGradePNG(gridCells, uniqueCourts, rounds, category, groupName, cellForFn); setExportOpen(false) }}>
                    🖼️ PNG
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={async (e) => { e.stopPropagation(); await exportGradePDF(gridCells, uniqueCourts, rounds, category, groupName, cellForFn); setExportOpen(false) }}>
                    📕 PDF
                  </button>
                </div>
              </>
            )}
          </div>
        }
      />
      <div className="overflow-x-auto p-4">
        <div className="min-w-[850px]">
          <div
            className="grid gap-px bg-gray-200 dark:bg-gray-700 rounded-xl"
            style={{ gridTemplateColumns: `160px repeat(${rounds.length}, minmax(100px, 1fr))` }}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-3 font-medium text-sm text-gray-700 dark:text-gray-300">Quadra</div>
            {rounds.map((r) => (
              <div key={r} className="bg-gray-200 dark:bg-gray-700 p-3 font-medium text-sm text-gray-700 dark:text-gray-300 text-center">
                {r}ª Rodada
              </div>
            ))}
            {uniqueCourts.map((court) => (
              <div key={court} className="contents">
                <div className="bg-white dark:bg-gray-800 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {cellForFn(court, 1)?.courtLabel || `Quadra ${court}`}
                  <span className="text-xs text-gray-400 dark:text-gray-500">({court})</span>
                </div>
                {rounds.map((round) => {
                  const cell = cellForFn(court, round)
                  return (
                    <div key={`${court}-${round}`} className="bg-white dark:bg-gray-800 p-2 min-h-[80px]">
                      {cell ? (
                        <div className="h-full rounded-lg border p-2 text-xs space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {cell.team1[0]} / {cell.team1[1]}
                          </div>
                          <div className="text-gray-400 dark:text-gray-500">vs</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {cell.team2[0]} / {cell.team2[1]}
                          </div>
                          <div className="text-center font-bold text-sm mt-1 text-gray-300 dark:text-gray-600">--</div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
