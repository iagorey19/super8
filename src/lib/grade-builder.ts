import { WHIST_SCHEDULE } from "./chaveamento"
import { getUserName } from "./store"
import type { GridCell, GradeData } from "./grade-types"
import type { Match } from "./types"

export function buildGridFromMatches(
  matches: Match[],
  category: string,
  groupName: string,
  courtNames: string[]
): GradeData {
  const rounds = [1, 2, 3, 4, 5, 6, 7]
  const filtered = matches.filter(
    (m) => m.category === category && (m.group_name || "A") === groupName
  )
  const gridCells: GridCell[] = filtered.map((m) => ({
    round: m.round,
    court: m.court,
    courtLabel: (() => {
      const n = parseInt(m.court.replace(/[A-Za-z]/g, ""), 10)
      return courtNames[isNaN(n) ? 0 : n - 1] || `Quadra ${m.court}`
    })(),
    team1: [getUserName(m.team1_player1_id), getUserName(m.team1_player2_id)] as [string, string],
    team2: [getUserName(m.team2_player1_id), getUserName(m.team2_player2_id)] as [string, string],
  }))

  const uniqueCourts = [...new Set(gridCells.map((c) => c.court))].sort()
  return { rounds, gridCells, uniqueCourts }
}

export function buildGridFromRegistrations(
  registrations: { athlete_id: string; draw_number: number; name: string }[],
  courtNames: string[],
  courtOffset: number = 0
): GradeData {
  const rounds = [1, 2, 3, 4, 5, 6, 7]
  const gridCells: GridCell[] = []

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

  const uniqueCourts = [...new Set(gridCells.map((c) => c.court))].sort()
  return { rounds, gridCells, uniqueCourts }
}

export function cellFor(gridCells: GridCell[], court: string, round: number) {
  return gridCells.find((c) => c.court === court && c.round === round)
}

export function generateText(gridCells: GridCell[], uniqueCourts: string[], rounds: number[], categoryLabel: string, groupName: string): string {
  const lines: string[] = []
  const separator = "=".repeat(50)
  lines.push(`Grade ${categoryLabel} — Grupo ${groupName}`)
  lines.push(separator)
  uniqueCourts.forEach((court) => {
    const label = cellFor(gridCells, court, 1)?.courtLabel || `Quadra ${court}`
    lines.push(`\n${label}:`)
    rounds.forEach((r) => {
      const cell = cellFor(gridCells, court, r)
      if (cell) lines.push(`  ${r}ª: ${cell.team1[0]}/${cell.team1[1]} vs ${cell.team2[0]}/${cell.team2[1]}`)
    })
  })
  return lines.join("\n")
}

export function generateCSV(gridCells: GridCell[], uniqueCourts: string[], rounds: number[]): string {
  const rows: string[][] = []
  rows.push(["Quadra", ...rounds.map((r) => `${r}ª Rodada`)])
  uniqueCourts.forEach((court) => {
    const label = cellFor(gridCells, court, 1)?.courtLabel || `Quadra ${court}`
    const cols = rounds.map((r) => {
      const cell = cellFor(gridCells, court, r)
      return cell ? `${cell.team1[0]}/${cell.team1[1]} vs ${cell.team2[0]}/${cell.team2[1]}` : ""
    })
    rows.push([label, ...cols])
  })
  return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
}
