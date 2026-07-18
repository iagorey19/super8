import type {
  AppData, Tournament, AthleteRegistration, Pairing, Match, TournamentResult,
  Revenue, AnnualRanking,
} from "../types"
import { generatePairings, calculateTournamentResults, WHIST_SCHEDULE } from "../chaveamento"
import { getData, saveData } from "./core"
import { createNotification } from "./media"

export async function deleteTournament(tournamentId: string) {
  const data = getData()
  data.tournaments = data.tournaments.filter((t) => t.id !== tournamentId)
  data.athlete_registrations = data.athlete_registrations.filter((r) => r.tournament_id !== tournamentId)
  data.pairings = data.pairings.filter((p) => p.tournament_id !== tournamentId)
  data.matches = data.matches.filter((m) => m.tournament_id !== tournamentId)
  data.tournament_results = data.tournament_results.filter((r) => r.tournament_id !== tournamentId)
  data.sponsorships = data.sponsorships.filter((s) => s.tournament_id !== tournamentId)
  data.expenses = data.expenses.filter((e) => e.tournament_id !== tournamentId)
  data.revenues = data.revenues.filter((r) => r.tournament_id !== tournamentId)
  data.photos = data.photos.filter((p) => p.tournament_id !== tournamentId)
  data.apoiadores = data.apoiadores.filter((a) => a.tournament_id !== tournamentId)
  data.brindes = data.brindes.filter((b) => b.tournament_id !== tournamentId)
  if (data.raffle_records) data.raffle_records = data.raffle_records.filter((r) => r.tournament_id !== tournamentId)
  data.notes = data.notes.filter((n) => n.tournament_id !== tournamentId)
  await saveData(data)
}

export async function resetTournament(tournamentId: string) {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  if (!tournament) return
  data.pairings = data.pairings.filter((p) => p.tournament_id !== tournamentId)
  data.matches = data.matches.filter((m) => m.tournament_id !== tournamentId)
  data.tournament_results = data.tournament_results.filter((r) => r.tournament_id !== tournamentId)
  data.athlete_registrations.forEach((r) => {
    if (r.tournament_id === tournamentId) {
      r.draw_number = undefined
      r.confirmed = undefined
      r.confirmed_at = undefined
    }
  })
  tournament.status = "upcoming"
  await saveData(data)
}

export async function createTournament(
  title: string, edition: string, date: string, location: string,
  createdBy: string, categories: string[] = ["4e5"],
  registration_fee?: number, max_score?: number
): Promise<Tournament> {
  const data = getData()
  const tournament: Tournament = {
    id: crypto.randomUUID(), title, edition, date, location,
    status: "upcoming", categories,
    registration_fee: registration_fee && registration_fee > 0 ? registration_fee : undefined,
    max_score: max_score && max_score > 0 ? max_score : undefined,
    created_at: new Date().toISOString(), created_by: createdBy,
  }
  data.tournaments.push(tournament)
  await saveData(data)
  return tournament
}

export async function updateTournament(id: string, updates: Partial<Tournament>) {
  const data = getData()
  const idx = data.tournaments.findIndex((t) => t.id === id)
  if (idx >= 0) {
    const { id: _id, created_at: _ca, created_by: _cb, ...safe } = updates
    Object.assign(data.tournaments[idx], safe)
    await saveData(data)
  }
}

function expectedCourtCount(categories?: string[]): number {
  return (categories?.length || 1) * 2
}

export function getCourtNames(tournamentId: string): string[] {
  const data = getData()
  const t = data.tournaments.find((tour) => tour.id === tournamentId)
  const count = expectedCourtCount(t?.categories)
  if (t?.court_names && t.court_names.length === count) return t.court_names
  return Array.from({ length: count }, (_, i) => `Quadra ${i + 1}`)
}

export async function updateCourtName(tournamentId: string, index: number, name: string) {
  const data = getData()
  const t = data.tournaments.find((tour) => tour.id === tournamentId)
  if (!t) return
  const count = expectedCourtCount(t.categories)
  if (!t.court_names || t.court_names.length !== count) {
    t.court_names = Array.from({ length: count }, (_, i) => `Quadra ${i + 1}`)
  }
  if (index >= 0 && index < t.court_names.length) {
    t.court_names[index] = name || `Quadra ${index + 1}`
    await saveData(data)
  }
}

export function getTournaments(): Tournament[] {
  const data = getData()
  return data.tournaments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getTournamentById(id: string): Tournament | undefined {
  const data = getData()
  return data.tournaments.find((t) => t.id === id)
}

export function getCurrentTournament(): Tournament | undefined {
  const data = getData()
  const ongoing = data.tournaments.find((t) => t.status === "ongoing")
  if (ongoing) return ongoing
  const registering = data.tournaments
    .filter((t) => t.status === "registering")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (registering.length > 0) return registering[0]
  const upcoming = data.tournaments
    .filter((t) => t.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (upcoming.length > 0) return upcoming[0]
  const completed = data.tournaments
    .filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return completed[0]
}

export async function openRegistrations(tournamentId: string) {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  if (!tournament || tournament.status !== "upcoming") return
  tournament.status = "registering"
  await saveData(data)
}

export async function startTournament(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  if (!tournament) throw new Error("Torneio não encontrado")

  const cat = category || tournament.categories[0] || "4e5"
  const grp = groupName || "A"

  if (data.matches.some((m) => m.tournament_id === tournamentId && m.category === cat && m.group_name === grp)) {
    throw new Error(`Categoria ${cat} já foi iniciada`)
  }

  const registrations = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) && r.status === "approved"
  )

  if (registrations.length !== 8) {
    throw new Error(`É necessário 8 atletas aprovados e com números sorteados. Atuais: ${registrations.length}`)
  }

  const sorted = [...registrations].sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))
  const athleteIds = sorted.map((r) => r.athlete_id)

  const catIndex = tournament.categories.indexOf(cat)
  const courtOffset = catIndex * 2

  const { pairings, matches } = generatePairings(tournamentId, athleteIds, cat, grp, courtOffset)
  data.pairings.push(...pairings)
  data.matches.push(...matches)

  if (tournament) tournament.status = "ongoing"

  await saveData(data)
  return { pairings, matches }
}

export async function finalizeTournament(tournamentId: string) {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  if (!tournament) return

  const cats = tournament.categories || ["4e5"]

  cats.forEach((cat) => {
    const groups = [...new Set(data.athlete_registrations.filter((r) => r.tournament_id === tournamentId && r.category === cat).map((r) => r.group_name || "A"))]
    groups.forEach((grp) => {
      const matches = data.matches.filter((m) => m.tournament_id === tournamentId && m.category === cat && (m.group_name || "A") === grp)
      if (matches.length === 0) return

      const allFinished = matches.every((m) => m.status === "finished")
      if (allFinished) return

      const sortedRegs = data.athlete_registrations
        .filter((r) => r.tournament_id === tournamentId && r.category === cat && (r.group_name || "A") === grp && r.status === "approved")
        .sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))
      const athleteIds = sortedRegs.map((r) => r.athlete_id)

      const athleteNames: Record<string, string> = {}
      athleteIds.forEach((id) => {
        const user = data.users.find((u) => u.id === id)
        if (user) athleteNames[id] = user.name
      })

      const results = calculateTournamentResults(athleteIds, matches, athleteNames, cat, grp)

      data.tournament_results = data.tournament_results.filter(
        (r) => !(r.tournament_id === tournamentId && r.category === cat && (r.group_name || "A") === grp)
      )

      results.forEach((r) => {
        data.tournament_results.push({
          id: crypto.randomUUID(), tournament_id: tournamentId, category: r.category,
          group_name: r.group_name, athlete_id: r.athlete_id, round_scores: r.round_scores,
          total_games: r.total_games, position: r.position, points: r.points,
        })
      })

      updateAnnualRankings(data, cat)
    })
  })

  tournament.status = "completed"
  await saveData(data)
}

export function getTournamentMatches(tournamentId: string, category?: string, groupName?: string): Match[] {
  const data = getData()
  return data.matches
    .filter((m) => {
      if (m.tournament_id !== tournamentId) return false
      if (category && m.category !== category) return false
      if (groupName && m.group_name !== groupName) return false
      return true
    })
    .sort((a, b) => a.round - b.round || a.court.localeCompare(b.court))
}

export function getTournamentPairings(tournamentId: string, category?: string, groupName?: string): Pairing[] {
  const data = getData()
  return data.pairings
    .filter((p) => {
      if (p.tournament_id !== tournamentId) return false
      if (category && p.category !== category) return false
      if (groupName && p.group_name !== groupName) return false
      return true
    })
}

export async function updateMatchScore(matchId: string, team: 1 | 2): Promise<Match | null> {
  const data = getData()
  const match = data.matches.find((m) => m.id === matchId)
  if (!match) return null

  const tournament = data.tournaments.find((t) => t.id === match.tournament_id)
  const maxScore = tournament?.max_score || 5

  match.status = "live"

  if (team === 1) match.score_team1 = Math.min(match.score_team1 + 1, maxScore)
  else match.score_team2 = Math.min(match.score_team2 + 1, maxScore)

  if (match.score_team1 === maxScore || match.score_team2 === maxScore) {
    match.status = "finished"
    await checkTournamentCompletion(data, match.tournament_id, match.category || "4e5", match.group_name || "A")
  }

  await saveData(data)
  return { ...match }
}

export async function decrementMatchScore(matchId: string, team: 1 | 2): Promise<Match | null> {
  const data = getData()
  const match = data.matches.find((m) => m.id === matchId)
  if (!match) return null

  const tournament = data.tournaments.find((t) => t.id === match.tournament_id)
  const maxScore = tournament?.max_score || 5

  if (team === 1) {
    if (match.score_team1 <= 0) return null
    match.score_team1 = Math.max(match.score_team1 - 1, 0)
  } else {
    if (match.score_team2 <= 0) return null
    match.score_team2 = Math.max(match.score_team2 - 1, 0)
  }

  if (match.score_team1 < maxScore && match.score_team2 < maxScore) match.status = "live"

  await saveData(data)
  return { ...match }
}

export async function swapMatchTeams(matchId: string): Promise<Match | null> {
  const data = getData()
  const match = data.matches.find((m) => m.id === matchId)
  if (!match) return null

  const t1p1 = match.team1_player1_id; const t1p2 = match.team1_player2_id
  const t2p1 = match.team2_player1_id; const t2p2 = match.team2_player2_id

  match.team1_player1_id = t2p1; match.team1_player2_id = t2p2
  match.team2_player1_id = t1p1; match.team2_player2_id = t1p2

  const score1 = match.score_team1
  match.score_team1 = match.score_team2
  match.score_team2 = score1

  const pairing = data.pairings.find((p) => p.id === match.pairing_id)
  if (pairing) {
    const pp1 = pairing.player1_id; const pp2 = pairing.player2_id
    const pp3 = pairing.player3_id; const pp4 = pairing.player4_id
    pairing.player1_id = pp3; pairing.player2_id = pp4
    pairing.player3_id = pp1; pairing.player4_id = pp2
  }

  await saveData(data)
  return { ...match }
}

export async function updateMatchPlayers(matchId: string, t1p1: string, t1p2: string, t2p1: string, t2p2: string) {
  const data = getData()
  const match = data.matches.find((m) => m.id === matchId)
  if (!match) return

  match.team1_player1_id = t1p1; match.team1_player2_id = t1p2
  match.team2_player1_id = t2p1; match.team2_player2_id = t2p2

  const pairing = data.pairings.find((p) => p.id === match.pairing_id)
  if (pairing) {
    pairing.player1_id = t1p1; pairing.player2_id = t1p2
    pairing.player3_id = t2p1; pairing.player4_id = t2p2
  }

  await saveData(data)
}

export async function updateMatchCourt(matchId: string, court: string) {
  const data = getData()
  const match = data.matches.find((m) => m.id === matchId)
  if (match) {
    match.court = court
    await saveData(data)
  }
}

export async function regenerateWhistFromRound(tournamentId: string, fromRound: number): Promise<number> {
  const data = getData()
  let updated = 0

  const affectedMatches = data.matches.filter((m) => m.tournament_id === tournamentId && m.round >= fromRound)

  for (const match of affectedMatches) {
    const cat = match.category || "4e5"
    const grp = match.group_name || "A"

    const tournament = data.tournaments.find((t) => t.id === tournamentId)
    if (!tournament) continue

    const sortedRegs = data.athlete_registrations
      .filter((r) => r.tournament_id === tournamentId && r.category === cat &&
        (r.group_name || "A") === grp && r.status === "approved")
      .sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))

    if (sortedRegs.length !== 8) continue
    const athleteIds = sortedRegs.map((r) => r.athlete_id)

    const scheduleEntry = WHIST_SCHEDULE.find((s) => s.round === match.round)
    if (!scheduleEntry) continue

    const roundMatches = data.matches
      .filter((m) => m.tournament_id === tournamentId && (m.category || "4e5") === cat &&
        (m.group_name || "A") === grp && m.round === match.round)
      .sort((a, b) => {
        const numA = parseInt(String(a.court).replace(/\D/g, "")) || 0
        const numB = parseInt(String(b.court).replace(/\D/g, "")) || 0
        return numA - numB
      })

    const matchIdx = roundMatches.indexOf(match)
    if (matchIdx < 0 || matchIdx > 1) continue

    const sc = matchIdx === 0 ? scheduleEntry.courtA : scheduleEntry.courtB

    match.team1_player1_id = athleteIds[sc.t1[0] - 1]
    match.team1_player2_id = athleteIds[sc.t1[1] - 1]
    match.team2_player1_id = athleteIds[sc.t2[0] - 1]
    match.team2_player2_id = athleteIds[sc.t2[1] - 1]

    const pairing = data.pairings.find((p) => p.id === match.pairing_id)
    if (pairing) {
      pairing.player1_id = athleteIds[sc.t1[0] - 1]
      pairing.player2_id = athleteIds[sc.t1[1] - 1]
      pairing.player3_id = athleteIds[sc.t2[0] - 1]
      pairing.player4_id = athleteIds[sc.t2[1] - 1]
    }

    updated++
  }

  await saveData(data)
  return updated
}

async function checkTournamentCompletion(data: AppData, tournamentId: string, category: string, groupName: string) {
  const matches = data.matches.filter(
    (m) => m.tournament_id === tournamentId && m.category === category && m.group_name === groupName
  )
  const allFinished = matches.every((m) => m.status === "finished")

  if (allFinished) {
    const sortedRegs = data.athlete_registrations
      .filter((r) => r.tournament_id === tournamentId && r.category === category &&
        (r.group_name || "A") === groupName && r.status === "approved")
      .sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))
    const athleteIds = sortedRegs.map((r) => r.athlete_id)

    const athleteNames: Record<string, string> = {}
    athleteIds.forEach((id) => {
      const user = data.users.find((u) => u.id === id)
      if (user) athleteNames[id] = user.name
    })

    const results = calculateTournamentResults(athleteIds, matches, athleteNames, category, groupName)

    data.tournament_results = data.tournament_results.filter(
      (r) => !(r.tournament_id === tournamentId && r.category === category && r.group_name === groupName)
    )

    results.forEach((r) => {
      const result: TournamentResult = {
        id: crypto.randomUUID(), tournament_id: tournamentId, category: r.category,
        group_name: r.group_name, athlete_id: r.athlete_id, round_scores: r.round_scores,
        total_games: r.total_games, position: r.position, points: r.points,
      }
      data.tournament_results.push(result)
    })

    updateAnnualRankings(data, category)
    await saveData(data)
  }
}

function updateAnnualRankings(data: AppData, category: string) {
  const year = new Date().getFullYear()

  data.annual_rankings = data.annual_rankings.filter((r) => !(r.year === year && r.category === category))

  const tournamentsThisYear = data.tournaments.filter((t) => new Date(t.date).getFullYear() === year)
  const tournamentIds = new Set(tournamentsThisYear.map((t) => t.id))

  const athletePoints: Record<string, { total_points: number; total_games: number; tournaments_count: number; wins_count: number }> = {}

  data.tournament_results
    .filter((r) => r.category === category && tournamentIds.has(r.tournament_id))
    .forEach((r) => {
      if (!athletePoints[r.athlete_id]) {
        athletePoints[r.athlete_id] = { total_points: 0, total_games: 0, tournaments_count: 0, wins_count: 0 }
      }
      athletePoints[r.athlete_id].total_points += r.points
      athletePoints[r.athlete_id].total_games += r.total_games
      athletePoints[r.athlete_id].tournaments_count += 1
      if (r.position === 1) athletePoints[r.athlete_id].wins_count += 1
    })

  const newRankings = Object.entries(athletePoints).map(([athlete_id, stats]) => ({
    id: crypto.randomUUID(), athlete_id, category, year,
    total_points: stats.total_points, total_games: stats.total_games,
    tournaments_count: stats.tournaments_count, wins_count: stats.wins_count,
  }))

  data.annual_rankings.push(...newRankings)
}

export function getRankings(tournamentId: string, category?: string, groupName?: string): TournamentResult[] {
  const data = getData()
  return data.tournament_results
    .filter((r) => {
      if (r.tournament_id !== tournamentId) return false
      if (category && r.category !== category) return false
      if (groupName && r.group_name !== groupName) return false
      return true
    })
    .sort((a, b) => a.position - b.position)
}

export function getLiveRankings(tournamentId: string, category?: string, groupName?: string): (TournamentResult & { name: string })[] {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"

  const matches = data.matches.filter((m) => m.tournament_id === tournamentId && m.category === cat && m.group_name === grp)

  const sortedRegs = data.athlete_registrations
    .filter((r) => r.tournament_id === tournamentId && r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) && r.status === "approved")
    .sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))
  const athleteIds = sortedRegs.map((r) => r.athlete_id)

  const athleteNames: Record<string, string> = {}
  athleteIds.forEach((id) => {
    const user = data.users.find((u) => u.id === id)
    if (user) athleteNames[id] = user.name
  })

  const results = calculateTournamentResults(athleteIds, matches, athleteNames, cat, grp)

  return results.map((r) => ({
    ...r, id: `live-${r.athlete_id}`, tournament_id: tournamentId,
    name: athleteNames[r.athlete_id] || "Desconhecido",
  }))
}

export function computeAnnualRanking(category?: string, year?: number) {
  const data = getData()
  const y = year || new Date().getFullYear()
  const cat = category || "4e5"

  const athleteTotals: Record<string, {
    points: number; games: number; tournaments: Set<string>; wins: number
    details: { tournament_id: string; title: string; date: string; edition: string; position: number; points: number; total_games: number }[]
  }> = {}

  data.tournament_results.filter((r) => r.category === cat).forEach((r) => {
    const t = data.tournaments.find((t) => t.id === r.tournament_id)
    if (!t || new Date(t.date).getFullYear() !== y) return
    if (!athleteTotals[r.athlete_id]) {
      athleteTotals[r.athlete_id] = { points: 0, games: 0, tournaments: new Set(), wins: 0, details: [] }
    }
    athleteTotals[r.athlete_id].points += r.points
    const baseMax = t.max_score || 5
    const normalizedGames = Math.round(r.total_games * (5 / baseMax))
    athleteTotals[r.athlete_id].games += normalizedGames
    athleteTotals[r.athlete_id].tournaments.add(r.tournament_id)
    if (r.position === 1) athleteTotals[r.athlete_id].wins++
    athleteTotals[r.athlete_id].details.push({
      tournament_id: r.tournament_id, title: t.title, date: t.date,
      edition: t.edition, position: r.position, points: r.points, total_games: r.total_games,
    })
  })

  const rankings = Object.entries(athleteTotals)
    .map(([athlete_id, t]) => ({
      id: `rank-${y}-${athlete_id}`, athlete_id, category: cat, year: y,
      total_points: t.points, total_games: t.games,
      tournaments_count: t.tournaments.size, wins_count: t.wins, tournaments: t.details,
    }))
    .sort((a, b) => b.total_points - a.total_points || b.total_games - a.total_games)

  return rankings.map((r, idx) => {
    const user = data.users.find((u) => u.id === r.athlete_id)
    return { ...r, position: idx + 1, name: user?.name || "Desconhecido" }
  })
}

export function getAnnualRanking(category?: string, year?: number) {
  return computeAnnualRanking(category, year)
}

export async function recalculateTournamentResults(tournamentId: string) {
  const data = getData()
  const keys = new Set<string>()

  data.tournament_results.filter((r) => r.tournament_id === tournamentId).forEach((r) => {
    keys.add(`${r.category}|${r.group_name || "A"}`)
  })

  keys.forEach((key) => {
    const [category, groupName] = key.split("|")

    const regs = data.athlete_registrations
      .filter((r) => r.tournament_id === tournamentId && r.category === category &&
        (r.group_name || "A") === groupName && r.status === "approved")
      .sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))

    if (regs.length !== 8) return
    const athleteIds = regs.map((r) => r.athlete_id)

    const athleteNames: Record<string, string> = {}
    athleteIds.forEach((id) => {
      const user = data.users.find((u) => u.id === id)
      if (user) athleteNames[id] = user.name
    })

    const matches = data.matches.filter(
      (m) => m.tournament_id === tournamentId && m.category === category && m.group_name === groupName
    )

    const results = calculateTournamentResults(athleteIds, matches, athleteNames, category, groupName)

    data.tournament_results = data.tournament_results.filter(
      (r) => !(r.tournament_id === tournamentId && r.category === category && (r.group_name || "A") === groupName)
    )

    results.forEach((r) => {
      data.tournament_results.push({
        id: crypto.randomUUID(), tournament_id: tournamentId, category: r.category,
        group_name: r.group_name, athlete_id: r.athlete_id, round_scores: r.round_scores,
        total_games: r.total_games, position: r.position, points: r.points,
      })
    })
  })

  data.annual_rankings = []
  await saveData(data)
}

export async function resetAllScores(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  data.matches
    .filter((m) => m.tournament_id === tournamentId && (!category || m.category === category) && (!groupName || m.group_name === groupName))
    .forEach((m) => {
      m.score_team1 = 0; m.score_team2 = 0; m.status = "pending"
    })
  await saveData(data)
}

export function getCategoryAvailability(tournamentId: string) {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  if (!tournament) return []
  return tournament.categories.map((cat) => {
    const registered = data.athlete_registrations.filter(
      (r) => r.tournament_id === tournamentId && r.category === cat && !r.is_waiting
    ).length
    const waiting = data.athlete_registrations.filter(
      (r) => r.tournament_id === tournamentId && r.category === cat && r.is_waiting
    ).length
    return { category: cat, max: 8, registered, waiting, available: Math.max(0, 8 - registered) }
  })
}

export function getRegisteredAthletes(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const regs = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && (!category || r.category === category) && (!groupName || r.group_name === groupName)
  )
  return regs.map((r) => {
    const user = data.users.find((u) => u.id === r.athlete_id)
    return { ...r, name: user?.name || "", email: user?.email || "" }
  })
}

export async function registerAthleteInTournament(
  tournamentId: string, athleteId: string, category?: string,
  groupName?: string, paymentStatus?: "paid" | "pending"
): Promise<AthleteRegistration | null> {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  const cat = category || tournament?.categories[0] || "4e5"
  if (!tournament?.categories.includes(cat)) return null
  if (data.athlete_registrations.some((r) => r.tournament_id === tournamentId && r.athlete_id === athleteId)) return null

  const existingCount = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.category === cat && !r.is_waiting
  ).length
  const isWaiting = existingCount >= 8

  const reg: AthleteRegistration = {
    id: crypto.randomUUID(), tournament_id: tournamentId, athlete_id: athleteId,
    status: paymentStatus === "paid" ? "approved" : "pending",
    payment_status: paymentStatus || (tournament.registration_fee ? "pending" : undefined),
    registration_order: existingCount + 1, is_waiting: isWaiting,
    category: cat, group_name: groupName || "A",
    created_at: new Date().toISOString(),
  }
  data.athlete_registrations.push(reg)

  if (paymentStatus === "paid" && tournament?.registration_fee) {
    const athlete = data.users.find((u) => u.id === athleteId)
    const revenue: Revenue = {
      id: crypto.randomUUID(), tournament_id: tournamentId, source: "inscricao",
      amount: tournament.registration_fee,
      description: `Inscrição ${athlete?.name || "Atleta"} - ${tournament.title}`,
      date: new Date().toISOString().split("T")[0],
      created_by: athleteId, created_at: new Date().toISOString(),
    }
    data.revenues.push(revenue)
  }

  await saveData(data)

  const athlete = data.users.find((u) => u.id === athleteId)
  const athleteName = athlete?.name || "Atleta"
  const tournamentName = tournament?.title || "Torneio"

  if (isWaiting) {
    await createNotification(athleteId, "geral", "Lista de Espera",
      `Você está na lista de espera do ${tournamentName} (${cat}). Posição: ${existingCount + 1}ª.`)
  } else {
    await createNotification(athleteId, "geral", paymentStatus === "paid" ? "Inscrição Confirmada" : "Inscrição Realizada",
      paymentStatus === "paid"
        ? `Sua inscrição no ${tournamentName} (${cat}) foi confirmada! Posição: ${existingCount + 1}ª de 8.`
        : `Sua inscrição no ${tournamentName} (${cat}) foi registrada! Posição: ${existingCount + 1}ª de 8.`)
  }

  const admins = data.users.filter((u) => u.role === "admin")
  for (const admin of admins) {
    await createNotification(admin.id, "geral", "Nova Inscrição",
      `${athleteName} se inscreveu no ${tournamentName} (${cat})${paymentStatus === "paid" ? " — PAGO" : ""} — ${isWaiting ? "Lista de Espera" : `Posição ${existingCount + 1}`}`)
  }

  return reg
}

export async function registerMultipleAthletes(
  tournamentId: string, athleteIds: string[], category?: string,
  groupName?: string, paymentStatus?: "paid" | "pending"
): Promise<AthleteRegistration[]> {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  const cat = category || tournament?.categories[0] || "4e5"
  if (!tournament?.categories.includes(cat)) return []
  const created: AthleteRegistration[] = []

  const existingCount = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.category === cat && !r.is_waiting
  ).length

  let order = existingCount

  for (const athleteId of athleteIds) {
    if (data.athlete_registrations.some((r) => r.tournament_id === tournamentId && r.athlete_id === athleteId)) continue
    order++
    const isWaiting = order > 8
    const reg: AthleteRegistration = {
      id: crypto.randomUUID(), tournament_id: tournamentId, athlete_id: athleteId,
      status: paymentStatus === "paid" ? "approved" : "pending",
      payment_status: paymentStatus || (tournament.registration_fee ? "pending" : undefined),
      registration_order: order, is_waiting: isWaiting,
      category: cat, group_name: groupName || "A",
      created_at: new Date().toISOString(),
    }
    data.athlete_registrations.push(reg)
    created.push(reg)

    if (paymentStatus === "paid" && tournament?.registration_fee) {
      const athlete = data.users.find((u) => u.id === athleteId)
      const revenue: Revenue = {
        id: crypto.randomUUID(), tournament_id: tournamentId, source: "inscricao",
        amount: tournament.registration_fee,
        description: `Inscrição ${athlete?.name || "Atleta"} - ${tournament.title}`,
        date: new Date().toISOString().split("T")[0],
        created_by: athleteId, created_at: new Date().toISOString(),
      }
      data.revenues.push(revenue)
    }

    const athlete = data.users.find((u) => u.id === athleteId)
    const athleteName = athlete?.name || "Atleta"
    const tournamentName = tournament?.title || "Torneio"

    if (isWaiting) {
      await createNotification(athleteId, "geral", "Lista de Espera",
        `Você está na lista de espera do ${tournamentName} (${cat}). Posição: ${order}ª.`)
    } else {
      await createNotification(athleteId, "geral", paymentStatus === "paid" ? "Inscrição Confirmada" : "Inscrição Realizada",
        paymentStatus === "paid"
          ? `Sua inscrição no ${tournamentName} (${cat}) foi confirmada! Posição: ${order}ª de 8.`
          : `Sua inscrição no ${tournamentName} (${cat}) foi registrada! Posição: ${order}ª de 8.`)
    }

    const admins = data.users.filter((u) => u.role === "admin")
    for (const admin of admins) {
      await createNotification(admin.id, "geral", "Nova Inscrição",
        `${athleteName} se inscreveu no ${tournamentName} (${cat})${paymentStatus === "paid" ? " — PAGO" : ""} — ${isWaiting ? "Lista de Espera" : `Posição ${order}`}`)
    }
  }

  if (created.length > 0) await saveData(data)
  return created
}

export async function updateRegistrationPayment(registrationId: string, paymentStatus: "paid" | "pending" | "cancelled"): Promise<AthleteRegistration | null> {
  const data = getData()
  const reg = data.athlete_registrations.find((r) => r.id === registrationId)
  if (!reg) return null
  reg.payment_status = paymentStatus
  if (paymentStatus === "paid") {
    reg.status = "approved"
    const tournament = data.tournaments.find((t) => t.id === reg.tournament_id)
    if (tournament?.registration_fee && !data.revenues.some((rv) => rv.tournament_id === reg.tournament_id && rv.description?.includes(reg.athlete_id))) {
      const athlete = data.users.find((u) => u.id === reg.athlete_id)
      const revenue: Revenue = {
        id: crypto.randomUUID(), tournament_id: reg.tournament_id, source: "inscricao",
        amount: tournament.registration_fee,
        description: `Inscrição ${athlete?.name || "Atleta"} - ${tournament.title}`,
        date: new Date().toISOString().split("T")[0],
        created_by: reg.athlete_id, created_at: new Date().toISOString(),
      }
      data.revenues.push(revenue)
    }
  }
  await saveData(data)
  return reg
}

export async function approveAthlete(registrationId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find((r) => r.id === registrationId && r.status === "pending")
  if (reg) {
    reg.status = "approved"
    const tournament = data.tournaments.find((t) => t.id === reg.tournament_id)
    if (tournament?.registration_fee && reg.payment_status === "paid") {
      const athlete = data.users.find((u) => u.id === reg.athlete_id)
      const revenue: Revenue = {
        id: crypto.randomUUID(), tournament_id: reg.tournament_id, source: "inscricao",
        amount: tournament.registration_fee,
        description: `Inscrição ${athlete?.name || "Atleta"} - ${tournament.title}`,
        date: new Date().toISOString().split("T")[0],
        created_by: reg.athlete_id, created_at: new Date().toISOString(),
      }
      data.revenues.push(revenue)
    }
    await saveData(data)
  }
  return reg
}

export async function rejectAthlete(registrationId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find((r) => r.id === registrationId && r.status === "pending")
  if (reg) {
    data.revenues = data.revenues.filter((r) =>
      !(r.tournament_id === reg.tournament_id && r.created_by === reg.athlete_id && r.source === "inscricao")
    )
    reg.status = "rejected"
    await saveData(data)
  }
  return reg
}

export async function unregisterAthlete(registrationId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find((r) => r.id === registrationId)
  if (reg) {
    data.revenues = data.revenues.filter((r) =>
      !(r.tournament_id === reg.tournament_id && r.created_by === reg.athlete_id && r.source === "inscricao")
    )
  }
  data.athlete_registrations = data.athlete_registrations.filter((r) => r.id !== registrationId)
  await saveData(data)
}

export function getAthleteRegistration(tournamentId: string, athleteId: string, category?: string): AthleteRegistration | undefined {
  const data = getData()
  return data.athlete_registrations.find(
    (r) => r.tournament_id === tournamentId && r.athlete_id === athleteId && (!category || r.category === category)
  )
}

export async function drawNumbers(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"

  const registrations = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) && r.status === "approved"
  )

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }

  registrations.forEach((r, idx) => { r.draw_number = numbers[idx] })

  data.tournament_results = data.tournament_results.filter(
    (r) => !(r.tournament_id === tournamentId && r.category === cat && r.group_name === grp)
  )

  await saveData(data)
  return registrations.map((r) => ({
    athlete_id: r.athlete_id,
    name: data.users.find((u) => u.id === r.athlete_id)?.name || "",
    number: r.draw_number ?? 999,
  }))
}

export async function drawSingleNumber(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"

  const registrations = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) && r.status === "approved"
  )
  const withNumber = registrations.filter((r) => r.draw_number != null)
  const withoutNumber = registrations.filter((r) => r.draw_number == null)

  if (withoutNumber.length === 0) return null

  const usedNumbers = new Set(withNumber.map((r) => r.draw_number))
  const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8].filter((n) => !usedNumbers.has(n))

  const idx = 0
  const chosen = withoutNumber[idx]
  const num = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]

  chosen.draw_number = num

  if (withNumber.length === 0) {
    data.tournament_results = data.tournament_results.filter(
      (r) => !(r.tournament_id === tournamentId && r.category === cat && r.group_name === grp)
    )
  }

  await saveData(data)
  return {
    athlete_id: chosen.athlete_id,
    name: data.users.find((u) => u.id === chosen.athlete_id)?.name || "",
    number: num,
  }
}

export async function resetNumberDraw(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"
  data.athlete_registrations.forEach((r) => {
    if (r.tournament_id === tournamentId && r.category === cat && (r.group_name === grp || (!r.group_name && grp === "A"))) {
      r.draw_number = undefined
    }
  })
  data.tournament_results = data.tournament_results.filter(
    (r) => !(r.tournament_id === tournamentId && r.category === cat && r.group_name === grp)
  )
  await saveData(data)
}

export async function toggleAttendance(tournamentId: string, athleteId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find((r) => r.tournament_id === tournamentId && r.athlete_id === athleteId)
  if (reg) {
    if (reg.confirmed) {
      reg.confirmed = undefined; reg.confirmed_at = undefined
    } else {
      reg.confirmed = true; reg.confirmed_at = new Date().toISOString()
    }
    await saveData(data)
  }
}

export function getUnconfirmedAthletes(tournamentId: string) {
  const data = getData()
  return data.athlete_registrations
    .filter((r) => r.tournament_id === tournamentId && r.status === "approved" && !r.confirmed)
    .map((r) => {
      const user = data.users.find((u) => u.id === r.athlete_id)
      return { ...r, name: user?.name || "" }
    })
}

export async function sendConfirmationReminder(tournamentId: string) {
  const data = getData()
  const unconfirmed = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.status === "approved" && !r.confirmed
  )
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  for (const r of unconfirmed) {
    data.notifications.push({
      id: crypto.randomUUID(), user_id: r.athlete_id, type: "geral",
      title: "Confirme sua presença!",
      message: `O torneio ${tournament?.title || ""} está chegando! Confirme sua presença no sistema.`,
      read: false, created_at: new Date().toISOString(),
    })
  }
  await saveData(data)
}
