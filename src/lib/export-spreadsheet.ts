import * as XLSX from "xlsx"
import * as store from "./store"
import type { Match } from "./types"

interface PlayerRow {
  name: string
  games: number
  wins: number
  pointsFor: number
  pointsAgainst: number
  saldo: number
}

export function exportTournamentSpreadsheet(tournamentId: string) {
  const t = store.getTournamentById(tournamentId)
  if (!t) return
  const matches = store.getTournamentMatches(tournamentId)

  if (matches.length === 0) return

  const athletes = store.getAthletes()
  const getName = (id: string) => athletes.find((a) => a.id === id)?.name || id.slice(0, 8)

  const courtNames = store.getCourtNames(tournamentId)

  const sorted = [...matches].sort((a, b) => {
    const catOrder = (t.categories || []).indexOf(a.category) - (t.categories || []).indexOf(b.category)
    if (catOrder !== 0) return catOrder
    const groupOrder = (a.group_name || "").localeCompare(b.group_name || "")
    if (groupOrder !== 0) return groupOrder
    if (a.round !== b.round) return a.round - b.round
    return Number(a.court) - Number(b.court)
  })

  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Jogos ──
  const header = [
    "Categoria",
    "Grupo",
    "Rodada",
    "Quadra",
    "Jogador 1 (Time A)",
    "Jogador 2 (Time A)",
    "Jogador 1 (Time B)",
    "Jogador 2 (Time B)",
    "Placar A",
    "Placar B",
    "Vit A",
    "Vit B",
  ]

  const data: any[][] = [header]
  const scoreAcol = 8
  const scoreBcol = 9

  for (const m of sorted) {
    const courtLabel = courtNames[Number(m.court) - 1] || `Quadra ${m.court}`
    const row: any[] = [
      m.category === "4e5" ? "Categoria 4e5" : "Categoria 6e7",
      m.group_name || "",
      `Rodada ${m.round}`,
      courtLabel,
      getName(m.team1_player1_id),
      getName(m.team1_player2_id),
      getName(m.team2_player1_id),
      getName(m.team2_player2_id),
      m.status !== "pending" ? m.score_team1 : "",
      m.status !== "pending" ? m.score_team2 : "",
    ]
    data.push(row)
  }

  const ws1 = XLSX.utils.aoa_to_sheet(data)
  ws1["!cols"] = [
    { wch: 18 }, { wch: 8 }, { wch: 9 }, { wch: 14 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
    { wch: 10 }, { wch: 10 }, { wch: 7 }, { wch: 7 },
  ]

  const lastDataRow = data.length
  for (let r = 2; r <= lastDataRow; r++) {
    XLSX.utils.sheet_set_array_formula(ws1, `K${r}:K${r}`, `IF(G${r}>H${r},1,0)`)
    XLSX.utils.sheet_set_array_formula(ws1, `L${r}:L${r}`, `IF(H${r}>G${r},1,0)`)
  }

  XLSX.utils.book_append_sheet(wb, ws1, "Jogos")

  // ── Sheet 2: Classificação ──
  const playerMap = new Map<string, PlayerRow>()
  const processed = new Set<string>()

  for (const m of sorted) {
    const ids = [m.team1_player1_id, m.team1_player2_id, m.team2_player1_id, m.team2_player2_id]
    for (const id of ids) {
      if (!playerMap.has(id)) {
        playerMap.set(id, { name: getName(id), games: 0, wins: 0, pointsFor: 0, pointsAgainst: 0, saldo: 0 })
      }
    }
  }

  const players = Array.from(playerMap.values())

  const classifHeader = ["Nome", "Jogos", "Vitórias", "Games Pró", "Games Contra", "Saldo", "Posição"]
  const classifData: any[][] = [classifHeader]
  for (const p of players) classifData.push([p.name])

  const ws2 = XLSX.utils.aoa_to_sheet(classifData)
  ws2["!cols"] = [
    { wch: 24 }, { wch: 8 }, { wch: 10 }, { wch: 11 }, { wch: 14 }, { wch: 8 }, { wch: 9 },
  ]

  const sheet1Name = "Jogos"
  const lastPlayerRow = classifData.length

  for (let r = 2; r <= lastPlayerRow; r++) {
    const cellA = `${sheet1Name}!C$2:C$${lastDataRow}`
    const cellD = `${sheet1Name}!D$2:D$${lastDataRow}`
    const cellE = `${sheet1Name}!E$2:E$${lastDataRow}`
    const cellF = `${sheet1Name}!F$2:F$${lastDataRow}`
    const cellG = `${sheet1Name}!G:G`
    const cellH = `${sheet1Name}!H:H`
    const cellI = `${sheet1Name}!I:I`
    const cellJ = `${sheet1Name}!J:J`

    const aRef = `A${r}`

    ws2[`B${r}`] = {
      f: `IF(${aRef}="","",COUNTIF(${cellA},${aRef})+COUNTIF(${cellD},${aRef})+COUNTIF(${cellE},${aRef})+COUNTIF(${cellF},${aRef}))`,
    }
    ws2[`C${r}`] = {
      f: `IF(${aRef}="","",SUMIF(${cellA},${aRef},${cellI})+SUMIF(${cellD},${aRef},${cellI})+SUMIF(${cellE},${aRef},${cellJ})+SUMIF(${cellF},${aRef},${cellJ}))`,
    }
    ws2[`D${r}`] = {
      f: `IF(${aRef}="","",SUMIF(${cellA},${aRef},${cellG})+SUMIF(${cellD},${aRef},${cellG})+SUMIF(${cellE},${aRef},${cellH})+SUMIF(${cellF},${aRef},${cellH}))`,
    }
    ws2[`E${r}`] = {
      f: `IF(${aRef}="","",SUMIF(${cellA},${aRef},${cellH})+SUMIF(${cellD},${aRef},${cellH})+SUMIF(${cellE},${aRef},${cellG})+SUMIF(${cellF},${aRef},${cellG}))`,
    }
    ws2[`F${r}`] = { f: `IF(${aRef}="","",D${r}-E${r})` }
  }

  XLSX.utils.book_append_sheet(wb, ws2, "Classificação")

  // ── Download ──
  const safeName = (t.title + " " + t.edition).replace(/[^a-zA-Z0-9 _-]/g, "").trim()
  XLSX.writeFile(wb, `${safeName}.xlsx`)
}
