import * as store from "./store"
import { calculateTournamentResults } from "./chaveamento"
import { tiebreakSeal } from "./utils"

export async function exportTournamentSpreadsheet(tournamentId: string) {
  const XLSX = await import("xlsx")
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

  // ── Sheet 1: Jogos (global; inclui IDs ocultos p/ fórmulas por ID) ──
  // Col:  A         B       C        D        E (Jog1 TA)  F (Jog2 TA)  G (Jog1 TB)  H (Jog2 TB)  I (Placar A)  J (Placar B)  K (Vit A)  L (Vit B)  M-P (IDs ocultos)
  const header = [
    "Categoria", "Grupo", "Rodada", "Quadra",
    "Jogador 1 (Time A)", "Jogador 2 (Time A)",
    "Jogador 1 (Time B)", "Jogador 2 (Time B)",
    "Placar A", "Placar B", "Vit A", "Vit B",
    "ID1A", "ID2A", "ID1B", "ID2B",
  ]

  const data: (string | number)[][] = [header]

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
      "", "",
      m.team1_player1_id, m.team1_player2_id, m.team2_player1_id, m.team2_player2_id,
    ])
  }

  const ws1 = XLSX.utils.aoa_to_sheet(data)
  ws1["!cols"] = [
    { wch: 18 }, { wch: 8 }, { wch: 9 }, { wch: 14 },
    { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 },
    { wch: 10 }, { wch: 10 }, { wch: 7 }, { wch: 7 },
    { hidden: true }, { hidden: true }, { hidden: true }, { hidden: true },
  ]

  const lastDataRow = data.length
  for (let r = 2; r <= lastDataRow; r++) {
    ws1[`K${r}`] = { f: `IF(I${r}>J${r},1,0)` }
    ws1[`L${r}`] = { f: `IF(J${r}>I${r},1,0)` }
  }

  XLSX.utils.book_append_sheet(wb, ws1, "Jogos")

  // ── Classificação: uma aba por (categoria, grupo) existente; aba única se só houver 1 ──
  const combos: { category: string; group: string }[] = []
  for (const m of sorted) {
    const category = m.category || "4e5"
    const group = m.group_name || "A"
    if (!combos.some((c) => c.category === category && c.group === group)) {
      combos.push({ category, group })
    }
  }

  const catLabel = (cat: string) => cat === "4e5" ? "Categoria 4e5" : "Categoria 6e7"

  for (const combo of combos) {
    const groupMatches = sorted.filter(
      (m) => (m.category || "4e5") === combo.category && (m.group_name || "A") === combo.group
    )
    if (groupMatches.length === 0) continue

    const ids = [...new Set(groupMatches.flatMap((m) =>
      [m.team1_player1_id, m.team1_player2_id, m.team2_player1_id, m.team2_player2_id]))]
    const names: Record<string, string> = {}
    ids.forEach((id) => { names[id] = getName(id) })

    // Ordem oficial (games → saldo → confronto), igual à tela
    const ordered = calculateTournamentResults(ids, groupMatches, names, combo.category, combo.group)

    const sheetName = combos.length === 1
      ? "Classificação"
      : `Classif ${combo.category} ${combo.group}`.slice(0, 31)

    const classifHeader = ["ID", "Nome", "Jogos", "Vitórias", "Games Pró", "Games Contra", "Saldo", "Posição", "Critério"]
    const classifData: (string | number)[][] = [classifHeader]
    for (const r of ordered) classifData.push([r.athlete_id, names[r.athlete_id] || r.athlete_id])

    const ws = XLSX.utils.aoa_to_sheet(classifData)
    ws["!cols"] = [
      { hidden: true }, { wch: 24 }, { wch: 8 }, { wch: 10 }, { wch: 11 },
      { wch: 14 }, { wch: 8 }, { wch: 9 }, { wch: 10 },
    ]

    const S = "Jogos"
    // Cols na aba Jogos: A=categoria, B=grupo, I/J=placares, K/L=vits, M-P=IDs
    const catCol = `${S}!A:A`
    const grpCol = `${S}!B:B`
    const scA = `${S}!I:I`
    const scB = `${S}!J:J`
    const wA = `${S}!K:K`
    const wB = `${S}!L:L`
    const idCols = [`${S}!M:M`, `${S}!N:N`, `${S}!O:O`, `${S}!P:P`]
    const catVal = `"${catLabel(combo.category)}"`
    const grpVal = `"${combo.group}"`

    const countIfs = (col: string, id: string) =>
      `COUNTIFS(${col},${id},${catCol},${catVal},${grpCol},${grpVal})`
    const sumIfs = (valCol: string, col: string, id: string) =>
      `SUMIFS(${valCol},${col},${id},${catCol},${catVal},${grpCol},${grpVal})`

    ordered.forEach((r, i) => {
      const row = i + 2
      const id = `A${row}`
      const nm = `B${row}`
      // Jogos e vitórias por ID (sem colisão de homônimos), só da categoria+grupo da aba
      ws[`C${row}`] = { f: `IF(${nm}="","",${idCols.map((c) => countIfs(c, id)).join("+")})` }
      ws[`D${row}`] = {
        f: `IF(${nm}="","",${sumIfs(wA, idCols[0], id)}+${sumIfs(wA, idCols[1], id)}+${sumIfs(wB, idCols[2], id)}+${sumIfs(wB, idCols[3], id)})`,
      }
      ws[`E${row}`] = {
        f: `IF(${nm}="","",${sumIfs(scA, idCols[0], id)}+${sumIfs(scA, idCols[1], id)}+${sumIfs(scB, idCols[2], id)}+${sumIfs(scB, idCols[3], id)})`,
      }
      ws[`F${row}`] = {
        f: `IF(${nm}="","",${sumIfs(scB, idCols[0], id)}+${sumIfs(scB, idCols[1], id)}+${sumIfs(scA, idCols[2], id)}+${sumIfs(scA, idCols[3], id)})`,
      }
      ws[`G${row}`] = { f: `IF(${nm}="","",E${row}-F${row})` }
      // Posição e critério vêm do cálculo oficial (inclui confronto direto)
      ws[`H${row}`] = r.position
      const prev = i > 0 ? ordered[i - 1] : undefined
      const seal = tiebreakSeal(
        prev ? { total_games: prev.total_games, saldo: prev.saldo } : undefined,
        { total_games: r.total_games, saldo: r.saldo }
      )
      ws[`I${row}`] = seal === "saldo" ? "saldo" : seal === "h2h" ? "confronto" : ""
    })

    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  const safeName = (t.title + " " + t.edition).replace(/[^a-zA-Z0-9 _-]/g, "").trim()
  XLSX.writeFile(wb, `${safeName}.xlsx`)
}
