"use client"

import { useState } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const WHIST_SCHEDULE = [
  { round: 1, courtA: { t1: [1, 6], t2: [3, 5] }, courtB: { t1: [2, 4], t2: [7, 8] } },
  { round: 2, courtA: { t1: [1, 7], t2: [6, 8] }, courtB: { t1: [2, 5], t2: [3, 4] } },
  { round: 3, courtA: { t1: [1, 3], t2: [2, 7] }, courtB: { t1: [4, 8], t2: [5, 6] } },
  { round: 4, courtA: { t1: [1, 5], t2: [4, 7] }, courtB: { t1: [2, 8], t2: [3, 6] } },
  { round: 5, courtA: { t1: [1, 8], t2: [2, 5] }, courtB: { t1: [3, 4], t2: [6, 7] } },
  { round: 6, courtA: { t1: [1, 4], t2: [8, 3] }, courtB: { t1: [2, 6], t2: [5, 7] } },
  { round: 7, courtA: { t1: [1, 2], t2: [4, 6] }, courtB: { t1: [3, 7], t2: [8, 5] } },
]

interface GradePreviewProps {
  registrations: { athlete_id: string; draw_number: number; name: string }[]
  courtNames: string[]
  category: string
  groupName: string
  categoryLabel?: string
}

export function GradePreview({ registrations, courtNames, category, groupName, categoryLabel }: GradePreviewProps) {
  const [copied, setCopied] = useState(false)
  const withNumbers = registrations.filter((r) => r.draw_number != null)

  if (withNumbers.length < 8) return null

  const sorted = [...withNumbers].sort((a, b) => a.draw_number - b.draw_number)
  const athletes = sorted.slice(0, 8)

  const gridCells: {
    round: number
    court: string
    courtLabel: string
    team1: [string, string]
    team2: [string, string]
  }[] = []

  WHIST_SCHEDULE.forEach(({ round, courtA, courtB }) => {
    const courts = [
      { courtIdx: 0, t1: courtA.t1, t2: courtA.t2 },
      { courtIdx: 1, t1: courtB.t1, t2: courtB.t2 },
    ]
    courts.forEach(({ courtIdx, t1, t2 }) => {
      const p1 = athletes[t1[0] - 1]
      const p2 = athletes[t1[1] - 1]
      const p3 = athletes[t2[0] - 1]
      const p4 = athletes[t2[1] - 1]
      if (!p1 || !p2 || !p3 || !p4) return
      gridCells.push({
        round,
        court: String(courtIdx),
        courtLabel: courtNames[courtIdx] || `Quadra ${courtIdx + 1}`,
        team1: [p1.name, p2.name],
        team2: [p3.name, p4.name],
      })
    })
  })

  const rounds = [1, 2, 3, 4, 5, 6, 7]
  const uniqueCourts = [...new Set(gridCells.map((c) => c.court))].sort()

  if (uniqueCourts.length === 0) return null

  function generateText() {
    const lines: string[] = []
    const separator = "=".repeat(50)
    lines.push(`Grade ${categoryLabel || category} — Grupo ${groupName}`)
    lines.push(separator)
    uniqueCourts.forEach((court) => {
      const label = gridCells.find((c) => c.court === court)?.courtLabel || `Quadra ${court}`
      const roundTexts = rounds.map((r) => {
        const cell = gridCells.find((c) => c.court === court && c.round === r)
        if (!cell) return ""
        return `${cell.team1[0]}/${cell.team1[1]} vs ${cell.team2[0]}/${cell.team2[1]}`
      })
      lines.push(`\n${label}:`)
      roundTexts.forEach((t, i) => {
        if (t) lines.push(`  ${i + 1}ª: ${t}`)
      })
    })
    return lines.join("\n")
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generateText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt("Copie o texto abaixo:", generateText())
    }
  }

  return (
    <Card>
      <CardHeader
        title={`Grade ${categoryLabel || category} — Grupo ${groupName}`}
        subtitle="Prévia baseada nos números sorteados"
        action={
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copied ? "Copiado!" : "Copiar Grade"}
          </Button>
        }
      />
      <div className="overflow-x-auto p-4">
        <div className="min-w-[850px]">
          <div
            className="grid gap-px bg-gray-200 dark:bg-gray-700 rounded-xl"
            style={{ gridTemplateColumns: `160px repeat(${rounds.length}, minmax(100px, 1fr))` }}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-3 font-medium text-sm text-gray-700 dark:text-gray-300">
              Quadra
            </div>
            {rounds.map((r) => (
              <div
                key={r}
                className="bg-gray-200 dark:bg-gray-700 p-3 font-medium text-sm text-gray-700 dark:text-gray-300 text-center"
              >
                {r}ª Rodada
              </div>
            ))}
            {uniqueCourts.map((court) => (
              <div key={court} className="contents">
                <div className="bg-white dark:bg-gray-800 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {gridCells.find((c) => c.court === court)?.courtLabel || `Quadra ${court}`}
                  <span className="text-xs text-gray-400 dark:text-gray-500">({court})</span>
                </div>
                {rounds.map((round) => {
                  const cell = gridCells.find((c) => c.court === court && c.round === round)
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
                          <div className="text-center font-bold text-sm mt-1 text-gray-300 dark:text-gray-600">
                            --
                          </div>
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
