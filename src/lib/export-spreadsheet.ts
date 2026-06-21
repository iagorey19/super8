import * as XLSX from "xlsx"
import * as store from "./store"

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
  // Col:  A         B       C        D        E (Jog1 TA)  F (Jog2 TA)  G (Jog1 TB)  H (Jog2 TB)  I (Placar A)  J (Placar B)  K (Vit A)  L (Vit B)
  const header = [
    "Categoria", "Grupo", "Rodada", "Quadra",
    "Jogador 1 (Time A)", "Jogador 2 (Time A)",
    "Jogador 1 (Time B)", "Jogador 2 (Time B)",
    "Placar A", "Placar B", "Vit A", "Vit B",
  ]

  const data: any[][] = [header]

  for (const m of sorted) {
    const courtLabel = courtNames[Number(m.court) - 1] || `Quadra ${m.court}`
    data.push([
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
    ])
  }

  const ws1 = XLSX.utils.aoa_to_sheet(data)
  ws1["!cols"] = [
    { wch: 18 }, { wch: 8 }, { wch: 9 }, { wch: 14 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
    { wch: 10 }, { wch: 10 }, { wch: 7 }, { wch: 7 },
  ]

  const lastDataRow = data.length
  for (let r = 2; r <= lastDataRow; r++) {
    ws1[`K${r}`] = { f: `IF(I${r}>J${r},1,0)` }
    ws1[`L${r}`] = { f: `IF(J${r}>I${r},1,0)` }
  }

  XLSX.utils.book_append_sheet(wb, ws1, "Jogos")

  // ── Sheet 2: Classificação ──
  const playerMap = new Map<string, { name: string }>()

  for (const m of sorted) {
    const ids = [m.team1_player1_id, m.team1_player2_id, m.team2_player1_id, m.team2_player2_id]
    for (const id of ids) {
      if (!playerMap.has(id)) {
        playerMap.set(id, { name: getName(id) })
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

  const S = "Jogos"
  const lastPlayerRow = classifData.length

  // Column refs in Jogos sheet:
  // E:F = Team A players, G:H = Team B players
  // I = Placar A (Team A score), J = Placar B (Team B score)
  // K = Vit A (1 if A won), L = Vit B (1 if B won)
  const p1 = `${S}!E:E`   // Team A player 1
  const p2 = `${S}!F:F`   // Team A player 2
  const p3 = `${S}!G:G`   // Team B player 1
  const p4 = `${S}!H:H`   // Team B player 2
  const scA = `${S}!I:I`  // Placar A
  const scB = `${S}!J:J`  // Placar B
  const wA  = `${S}!K:K`  // Win A
  const wB  = `${S}!L:L`  // Win B
  const pRange = `${S}!E$2:H$${lastDataRow}`

  for (let r = 2; r <= lastPlayerRow; r++) {
    const a = `A${r}`

    // Games = COUNTIF on each player column
    ws2[`B${r}`] = {
      f: `IF(${a}="","",COUNTIF(${p1},${a})+COUNTIF(${p2},${a})+COUNTIF(${p3},${a})+COUNTIF(${p4},${a}))`,
    }
    // Wins = SUMIF on TeamA cols (E,F) → WinA(K) + SUMIF on TeamB cols (G,H) → WinB(L)
    ws2[`C${r}`] = {
      f: `IF(${a}="","",SUMIF(${p1},${a},${wA})+SUMIF(${p2},${a},${wA})+SUMIF(${p3},${a},${wB})+SUMIF(${p4},${a},${wB}))`,
    }
    // Points For = SUMIF on TeamA cols → ScoreA(I) + SUMIF on TeamB cols → ScoreB(J)
    ws2[`D${r}`] = {
      f: `IF(${a}="","",SUMIF(${p1},${a},${scA})+SUMIF(${p2},${a},${scA})+SUMIF(${p3},${a},${scB})+SUMIF(${p4},${a},${scB}))`,
    }
    // Points Against = SUMIF on TeamA cols → ScoreB(J) + SUMIF on TeamB cols → ScoreA(I)
    ws2[`E${r}`] = {
      f: `IF(${a}="","",SUMIF(${p1},${a},${scB})+SUMIF(${p2},${a},${scB})+SUMIF(${p3},${a},${scA})+SUMIF(${p4},${a},${scA}))`,
    }
    // Saldo
    ws2[`F${r}`] = { f: `IF(${a}="","",D${r}-E${r})` }
    // Position (rank by Games Pro descending, then Saldo)
    ws2[`G${r}`] = { f: `IF(${a}="","",RANK(F${r},F:F)+SUMPRODUCT((F:F=F${r})*(D:D>D${r}))/SUMPRODUCT((F:F=F${r})*1))` }
  }

  XLSX.utils.book_append_sheet(wb, ws2, "Classificação")

  const safeName = (t.title + " " + t.edition).replace(/[^a-zA-Z0-9 _-]/g, "").trim()
  XLSX.writeFile(wb, `${safeName}.xlsx`)
}
