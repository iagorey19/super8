"use client"

import { useState, useRef } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserName } from "@/lib/store"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const WHIST_SCHEDULE = [
  { round: 1, courtA: { t1: [1, 6], t2: [3, 5] }, courtB: { t1: [2, 4], t2: [7, 8] } },
  { round: 2, courtA: { t1: [1, 7], t2: [6, 8] }, courtB: { t1: [2, 5], t2: [3, 4] } },
  { round: 3, courtA: { t1: [1, 3], t2: [2, 7] }, courtB: { t1: [4, 8], t2: [5, 6] } },
  { round: 4, courtA: { t1: [1, 5], t2: [4, 7] }, courtB: { t1: [2, 8], t2: [3, 6] } },
  { round: 5, courtA: { t1: [1, 8], t2: [2, 5] }, courtB: { t1: [3, 4], t2: [6, 7] } },
  { round: 6, courtA: { t1: [1, 4], t2: [8, 3] }, courtB: { t1: [2, 6], t2: [5, 7] } },
  { round: 7, courtA: { t1: [1, 2], t2: [4, 6] }, courtB: { t1: [3, 7], t2: [8, 5] } },
]

interface GridCell {
  round: number
  court: string
  courtLabel: string
  team1: [string, string]
  team2: [string, string]
}

interface GradePreviewProps {
  registrations?: { athlete_id: string; draw_number: number; name: string }[]
  matches?: any[]
  courtNames: string[]
  category: string
  groupName: string
  categoryLabel?: string
}

export function GradePreview({ registrations, matches, courtNames, category, groupName, categoryLabel }: GradePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const rounds = [1, 2, 3, 4, 5, 6, 7]

  let gridCells: GridCell[] = []

  if (matches && matches.length > 0) {
    const filtered = matches.filter(
      (m) => m.category === category && (m.group_name || "A") === groupName
    )
    gridCells = filtered.map((m) => ({
      round: m.round,
      court: m.court,
      courtLabel: (() => {
        const n = parseInt(m.court.replace(/[A-Za-z]/g, ""), 10)
        return courtNames[isNaN(n) ? 0 : n - 1] || `Quadra ${m.court}`
      })(),
      team1: [getUserName(m.team1_player1_id), getUserName(m.team1_player2_id)] as [string, string],
      team2: [getUserName(m.team2_player1_id), getUserName(m.team2_player2_id)] as [string, string],
    }))
  } else if (registrations) {
    const withNumbers = registrations.filter((r) => r.draw_number != null)
    if (withNumbers.length >= 8) {
      const sorted = [...withNumbers].sort((a, b) => a.draw_number - b.draw_number)
      const athletes = sorted.slice(0, 8)
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
    }
  }

  const uniqueCourts = [...new Set(gridCells.map((c) => c.court))].sort()
  if (uniqueCourts.length === 0) return null

  function cellFor(court: string, round: number) {
    return gridCells.find((c) => c.court === court && c.round === round)
  }

  function generateText() {
    const lines: string[] = []
    const separator = "=".repeat(50)
    lines.push(`Grade ${categoryLabel || category} — Grupo ${groupName}`)
    lines.push(separator)
    uniqueCourts.forEach((court) => {
      const label = cellFor(court, 1)?.courtLabel || `Quadra ${court}`
      lines.push(`\n${label}:`)
      rounds.forEach((r) => {
        const cell = cellFor(court, r)
        if (cell) lines.push(`  ${r}ª: ${cell.team1[0]}/${cell.team1[1]} vs ${cell.team2[0]}/${cell.team2[1]}`)
      })
    })
    return lines.join("\n")
  }

  function generateCSV() {
    const rows: string[][] = []
    rows.push(["Quadra", ...rounds.map((r) => `${r}ª Rodada`)])
    uniqueCourts.forEach((court) => {
      const label = cellFor(court, 1)?.courtLabel || `Quadra ${court}`
      const cols = rounds.map((r) => {
        const cell = cellFor(court, r)
        return cell ? `${cell.team1[0]}/${cell.team1[1]} vs ${cell.team2[0]}/${cell.team2[1]}` : ""
      })
      rows.push([label, ...cols])
    })
    return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
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

  async function exportPNG() {
    if (!gridRef.current) return
    const canvas = await html2canvas(gridRef.current, { backgroundColor: "#ffffff" })
    const link = document.createElement("a")
    link.download = `grade-${category}-grupo-${groupName}.png`
    link.href = canvas.toDataURL()
    link.click()
    setExportOpen(false)
  }

  function exportCSV() {
    const blob = new Blob(["\uFEFF" + generateCSV()], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `grade-${category}-grupo-${groupName}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setExportOpen(false)
  }

  async function exportPDF() {
    if (!gridRef.current) return
    const canvas = await html2canvas(gridRef.current, { backgroundColor: "#ffffff" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("l", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(`grade-${category}-grupo-${groupName}.pdf`)
    setExportOpen(false)
  }

  function exportTXT() {
    const blob = new Blob([generateText()], { type: "text/plain;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `grade-${category}-grupo-${groupName}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
    setExportOpen(false)
  }

  return (
    <Card>
      <CardHeader
        title={`Grade ${categoryLabel || category} — Grupo ${groupName}`}
        action={
          <div className="relative">
            <Button size="sm" variant="secondary" onClick={() => setExportOpen(!exportOpen)}>
              Exportar ▾
            </Button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[160px] overflow-hidden">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleCopy}>📋 Copiar texto</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={exportTXT}>📄 TXT</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={exportCSV}>📊 CSV</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={exportPNG}>🖼️ PNG</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={exportPDF}>📕 PDF</button>
                </div>
              </>
            )}
          </div>
        }
      />
      <div className="overflow-x-auto p-4" ref={gridRef}>
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
                  {cellFor(court, 1)?.courtLabel || `Quadra ${court}`}
                  <span className="text-xs text-gray-400 dark:text-gray-500">({court})</span>
                </div>
                {rounds.map((round) => {
                  const cell = cellFor(court, round)
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
