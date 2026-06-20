"use client"

import { useState, useRef } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserName } from "@/lib/store"
import jsPDF from "jspdf"

const WHIST_SCHEDULE = [
  { round: 1, courtA: { t1: [1, 8], t2: [2, 7] }, courtB: { t1: [3, 6], t2: [4, 5] } },
  { round: 2, courtA: { t1: [1, 7], t2: [8, 6] }, courtB: { t1: [2, 5], t2: [3, 4] } },
  { round: 3, courtA: { t1: [1, 6], t2: [7, 5] }, courtB: { t1: [8, 4], t2: [2, 3] } },
  { round: 4, courtA: { t1: [1, 5], t2: [6, 4] }, courtB: { t1: [7, 3], t2: [8, 2] } },
  { round: 5, courtA: { t1: [1, 4], t2: [5, 3] }, courtB: { t1: [6, 2], t2: [7, 8] } },
  { round: 6, courtA: { t1: [1, 3], t2: [4, 2] }, courtB: { t1: [5, 8], t2: [6, 7] } },
  { round: 7, courtA: { t1: [1, 2], t2: [3, 8] }, courtB: { t1: [4, 7], t2: [5, 6] } },
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
  courtOffset?: number
}

const COL_W = 220
const COL0_W = 140
const ROW_H = 36
const ROW_DATA_H = 82
const SCALE = 3

export function GradePreview({ registrations, matches, courtNames, category, groupName, categoryLabel, courtOffset = 0 }: GradePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

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
          const courtLabelName = courtNames[courtIdx + courtOffset]
          gridCells.push({
            round,
            court: String(courtIdx),
            courtLabel: courtLabelName || `Quadra ${courtIdx + 1 + courtOffset}`,
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

  function renderCanvas(): HTMLCanvasElement {
    const cw = COL0_W + rounds.length * COL_W
    const ch = ROW_H + uniqueCourts.length * ROW_DATA_H

    const canvas = document.createElement("canvas")
    canvas.width = cw * SCALE
    canvas.height = ch * SCALE
    const ctx = canvas.getContext("2d")!
    ctx.scale(SCALE, SCALE)

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, cw, ch)

    function drawCell(x: number, y: number, w: number, h: number, fill: string) {
      ctx.fillStyle = fill
      ctx.fillRect(x, y, w, h)
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, w, h)
    }

    function drawText(x: number, y: number, w: number, h: number, text: string, opts?: { bold?: boolean; color?: string; size?: number }) {
      const color = opts?.color || "#111827"
      const size = opts?.size || 13
      ctx.fillStyle = color
      ctx.font = `${opts?.bold ? "bold " : ""}${size}px 'Segoe UI', Arial, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, x + w / 2, y + h / 2)
    }

    function textWidth(text: string, size: number, bold: boolean) {
      ctx.font = `${bold ? "bold " : ""}${size}px 'Segoe UI', Arial, sans-serif`
      return ctx.measureText(text).width
    }

    function drawDataCell(x: number, y: number, w: number, h: number, cell: GridCell) {
      const padX = 8
      const maxW = w - padX * 2
      const fontSize = 12
      const vsSize = 11
      const colorText = "#111827"
      const colorVs = "#9ca3af"

      const l1 = `${cell.team1[0]} / ${cell.team1[1]}`
      const l3 = `${cell.team2[0]} / ${cell.team2[1]}`

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(x, y, w, h)

      const w1 = textWidth(l1, fontSize, false)
      const w3 = textWidth(l3, fontSize, false)

      if (w1 <= maxW && w3 <= maxW) {
        const total = 3
        const lineH = h / total
        ctx.fillStyle = colorText
        ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(l1, x + w / 2, y + lineH * 0 + lineH / 2)
        ctx.fillStyle = colorVs
        ctx.font = `${vsSize}px 'Segoe UI', Arial, sans-serif`
        ctx.fillText("vs", x + w / 2, y + lineH * 1 + lineH / 2)
        ctx.fillStyle = colorText
        ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
        ctx.fillText(l3, x + w / 2, y + lineH * 2 + lineH / 2)
      } else {
        const total = 5
        const lineH = h / total
        ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = colorText
        ctx.fillText(cell.team1[0], x + w / 2, y + lineH * 0 + lineH / 2)
        ctx.fillText(cell.team1[1], x + w / 2, y + lineH * 1 + lineH / 2)
        ctx.fillStyle = colorVs
        ctx.font = `${vsSize}px 'Segoe UI', Arial, sans-serif`
        ctx.fillText("vs", x + w / 2, y + lineH * 2 + lineH / 2)
        ctx.fillStyle = colorText
        ctx.font = `${fontSize}px 'Segoe UI', Arial, sans-serif`
        ctx.fillText(cell.team2[0], x + w / 2, y + lineH * 3 + lineH / 2)
        ctx.fillText(cell.team2[1], x + w / 2, y + lineH * 4 + lineH / 2)
      }
    }

    const numCols = rounds.length + 1
    const numRows = uniqueCourts.length + 1

    const colW = (i: number) => (i === 0 ? COL0_W : COL_W)

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const cx = c === 0 ? 0 : COL0_W + (c - 1) * COL_W
        const cy = r === 0 ? 0 : ROW_H + (r - 1) * ROW_DATA_H
        const cw = colW(c)
        const ch = r === 0 ? ROW_H : ROW_DATA_H
        const fill = r === 0 ? "#f3f4f6" : "#ffffff"
        drawCell(cx, cy, cw, ch, fill)

        if (r === 0) {
          const text = c === 0 ? "Quadra" : `${rounds[c - 1]}ª Rodada`
          drawText(cx, cy, cw, ch, text, { bold: true, color: "#374151", size: 13 })
        } else if (c === 0) {
          drawText(cx, cy, cw, ch, cellFor(uniqueCourts[r - 1], 1)?.courtLabel || `Quadra ${uniqueCourts[r - 1]}`, { bold: true, color: "#374151", size: 12 })
        } else {
          const cell = cellFor(uniqueCourts[r - 1], rounds[c - 1])
          if (cell) {
            drawDataCell(cx, cy, cw, ch, cell)
          }
        }
      }
    }

    return canvas
  }

  function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")
    })
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

  async function exportPNG(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const canvas = renderCanvas()
      const blob = await canvasToBlob(canvas)
      const link = document.createElement("a")
      link.download = `grade-${category}-grupo-${groupName}.png`
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      alert("Erro ao gerar PNG: " + (err instanceof Error ? err.message : "desconhecido"))
    }
    setExportOpen(false)
  }

  function exportCSV(e: React.MouseEvent) {
    e.stopPropagation()
    const blob = new Blob(["\uFEFF" + generateCSV()], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `grade-${category}-grupo-${groupName}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setExportOpen(false)
  }

  async function exportPDF(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const canvas = renderCanvas()
      const dataUrl = canvas.toDataURL("image/png")
      const pdf = new jsPDF("l", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height / SCALE * pdfWidth) / (canvas.width / SCALE)
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`grade-${category}-grupo-${groupName}.pdf`)
    } catch (err) {
      alert("Erro ao gerar PDF: " + (err instanceof Error ? err.message : "desconhecido"))
    }
    setExportOpen(false)
  }

  function exportTXT(e: React.MouseEvent) {
    e.stopPropagation()
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
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>📋 Copiar texto</button>
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
