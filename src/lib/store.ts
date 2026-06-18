"use client"

import * as db from "./db"
import {
  Apoiador,
  AppData,
  AthleteRegistration,
  Brinde,
  Expense,
  ExpenseCategory,
  Match,
  Note,
  Notification,
  Pairing,
  Photo,
  RaffleRecord,
  Revenue,
  RevenueSource,
  Sponsorship,
  SponsorTier,
  Tournament,
  TournamentResult,
  User,
} from "./types"
import { generatePairings, calculateTournamentResults } from "./chaveamento"

export async function initData() {
  await db.init()
}

function getData(): AppData {
  return db.getData()
}

async function saveData(data: AppData) {
  db.setData(data)
  await db.persist()
}

export function getSession(): { user: User } | null {
  if (typeof window === "undefined") return null
  try {
    const stored = sessionStorage.getItem("super8-session")
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    sessionStorage.removeItem("super8-session")
    return null
  }
}

export function login(email: string, password: string): User | null {
  if (!email || !password) return null
  const data = getData()
  const user = data.users.find((u) => u.email === email && u.password === password)
  if (user) {
    try {
      sessionStorage.setItem("super8-session", JSON.stringify({ user }))
    } catch {
      // storage full or unavailable — session won't persist across reloads
    }
    return user
  }
  return null
}

export function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("super8-session")
  }
}

export function registerAthlete(
  name: string,
  email: string,
  password: string,
  phone?: string
): User | null {
  const data = getData()
  if (data.users.some((u) => u.email === email)) return null
  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password,
    name,
    role: "athlete",
    phone,
    created_at: new Date().toISOString(),
  }
  data.users.push(newUser)
  saveData(data)
  return newUser
}

export async function approveAthlete(registrationId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find(
    (r) => r.id === registrationId && r.status === "pending"
  )
  if (reg) {
    reg.status = "approved"
    const tournament = data.tournaments.find((t) => t.id === reg.tournament_id)
    if (tournament?.registration_fee) {
      const athlete = data.users.find((u) => u.id === reg.athlete_id)
      const revenue: Revenue = {
        id: crypto.randomUUID(),
        tournament_id: reg.tournament_id,
        source: "inscricao",
        amount: tournament.registration_fee,
        description: `Inscrição ${athlete?.name || "Atleta"} - ${tournament.title}`,
        date: new Date().toISOString().split("T")[0],
        created_by: reg.athlete_id,
        created_at: new Date().toISOString(),
      }
      data.revenues.push(revenue)
    }
    await saveData(data)
  }
  return reg
}

export async function rejectAthlete(registrationId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find(
    (r) => r.id === registrationId && r.status === "pending"
  )
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

export function deleteTournament(tournamentId: string) {
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
  saveData(data)
}

export function resetTournament(tournamentId: string) {
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
  saveData(data)
}

export function updateAthlete(athleteId: string, updates: { name?: string; email?: string; phone?: string; password?: string }) {
  const data = getData()
  const user = data.users.find((u) => u.id === athleteId && u.role === "athlete")
  if (user) {
    if (updates.name !== undefined) user.name = updates.name
    if (updates.email !== undefined) user.email = updates.email
    if (updates.phone !== undefined) user.phone = updates.phone || undefined
    if (updates.password !== undefined) user.password = updates.password
    saveData(data)
  }
}

export function deleteAthlete(athleteId: string) {
  const data = getData()
  data.users = data.users.filter((u) => u.id !== athleteId)
  data.athlete_registrations = data.athlete_registrations.filter((r) => r.athlete_id !== athleteId)
  data.pairings = data.pairings.filter((p) => ![p.player1_id, p.player2_id, p.player3_id, p.player4_id].includes(athleteId))
  data.matches = data.matches.filter((m) => ![m.team1_player1_id, m.team1_player2_id, m.team2_player1_id, m.team2_player2_id].includes(athleteId))
  data.tournament_results = data.tournament_results.filter((r) => r.athlete_id !== athleteId)
  data.annual_rankings = data.annual_rankings.filter((r) => r.athlete_id !== athleteId)
  data.notifications = data.notifications.filter((n) => n.user_id !== athleteId)
  saveData(data)
}

export function createTournament(
  title: string,
  edition: string,
  date: string,
  location: string,
  createdBy: string,
  categories: string[] = ["4e5"],
  registration_fee?: number,
  max_score?: number
): Tournament {
  const data = getData()
  const tournament: Tournament = {
    id: crypto.randomUUID(),
    title,
    edition,
    date,
    location,
    status: "upcoming",
    categories,
    registration_fee: registration_fee && registration_fee > 0 ? registration_fee : undefined,
    max_score: max_score && max_score > 0 ? max_score : undefined,
    created_at: new Date().toISOString(),
    created_by: createdBy,
  }
  data.tournaments.push(tournament)
  saveData(data)
  return tournament
}

export function updateTournament(
  id: string,
  updates: Partial<Tournament>
) {
  const data = getData()
  const idx = data.tournaments.findIndex((t) => t.id === id)
  if (idx >= 0) {
    const { id: _id, created_at: _ca, created_by: _cb, ...safe } = updates
    Object.assign(data.tournaments[idx], safe)
    saveData(data)
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

export function updateCourtName(tournamentId: string, index: number, name: string) {
  const data = getData()
  const t = data.tournaments.find((tour) => tour.id === tournamentId)
  if (!t) return
  const count = expectedCourtCount(t.categories)
  if (!t.court_names || t.court_names.length !== count) {
    t.court_names = Array.from({ length: count }, (_, i) => `Quadra ${i + 1}`)
  }
  if (index >= 0 && index < t.court_names.length) {
    t.court_names[index] = name || `Quadra ${index + 1}`
    saveData(data)
  }
}

export async function registerAthleteInTournament(
  tournamentId: string,
  athleteId: string,
  category?: string,
  groupName?: string
): Promise<AthleteRegistration | null> {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  const cat = category || tournament?.categories[0] || "4e5"
  if (!tournament?.categories.includes(cat)) return null
  if (data.athlete_registrations.some((r) => r.tournament_id === tournamentId && r.athlete_id === athleteId)) return null
  const reg: AthleteRegistration = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    athlete_id: athleteId,
    status: "pending",
    category: cat,
    group_name: groupName || "A",
    created_at: new Date().toISOString(),
  }
  data.athlete_registrations.push(reg)
  await saveData(data)
  return reg
}

export async function registerMultipleAthletes(
  tournamentId: string,
  athleteIds: string[],
  category?: string,
  groupName?: string
): Promise<AthleteRegistration[]> {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  const cat = category || tournament?.categories[0] || "4e5"
  if (!tournament?.categories.includes(cat)) return []
  const created: AthleteRegistration[] = []
  for (const athleteId of athleteIds) {
    if (data.athlete_registrations.some((r) => r.tournament_id === tournamentId && r.athlete_id === athleteId)) continue
    const reg: AthleteRegistration = {
      id: crypto.randomUUID(),
      tournament_id: tournamentId,
      athlete_id: athleteId,
      status: "pending",
      category: cat,
      group_name: groupName || "A",
      created_at: new Date().toISOString(),
    }
    data.athlete_registrations.push(reg)
    created.push(reg)
  }
  if (created.length > 0) await saveData(data)
  return created
}

export function startTournament(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  if (!tournament) throw new Error("Torneio não encontrado")

  const cat = category || tournament.categories[0] || "4e5"
  const grp = groupName || "A"

  if (data.matches.some((m) => m.tournament_id === tournamentId && m.category === cat && m.group_name === grp)) {
    throw new Error(`Categoria ${cat} já foi iniciada`)
  }

  const registrations = data.athlete_registrations.filter(
    (r) =>
      r.tournament_id === tournamentId &&
      r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) &&
      r.status === "approved"
  )

  if (registrations.length !== 8) {
    throw new Error(
      `É necessário 8 atletas aprovados e com números sorteados. Atuais: ${registrations.length}`
    )
  }

  const sorted = [...registrations].sort(
    (a, b) => (a.draw_number || 999) - (b.draw_number || 999)
  )
  const athleteIds = sorted.map((r) => r.athlete_id)

  const catIndex = tournament.categories.indexOf(cat)
  const courtOffset = catIndex * 2

  const { pairings, matches } = generatePairings(tournamentId, athleteIds, cat, grp, courtOffset)
  data.pairings.push(...pairings)
  data.matches.push(...matches)

  if (tournament) tournament.status = "ongoing"

  saveData(data)
  return { pairings, matches }
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

export function updateMatchScore(
  matchId: string,
  team: 1 | 2
): Match | null {
  const data = getData()
  const match = data.matches.find((m) => m.id === matchId)
  if (!match || match.status === "finished") return null

  const tournament = data.tournaments.find((t) => t.id === match.tournament_id)
  const maxScore = tournament?.max_score || 5

  match.status = "live"

  if (team === 1) {
    match.score_team1 = Math.min(match.score_team1 + 1, maxScore)
  } else {
    match.score_team2 = Math.min(match.score_team2 + 1, maxScore)
  }

  if (match.score_team1 === maxScore || match.score_team2 === maxScore) {
    match.status = "finished"
    checkTournamentCompletion(data, match.tournament_id, match.category || "4e5", match.group_name || "A")
  }

  saveData(data)
  return { ...match }
}

function checkTournamentCompletion(data: AppData, tournamentId: string, category: string, groupName: string) {
  const matches = data.matches.filter(
    (m) => m.tournament_id === tournamentId && m.category === category && m.group_name === groupName
  )
  const allFinished = matches.every((m) => m.status === "finished")

  if (allFinished) {
    const tournament = data.tournaments.find((t) => t.id === tournamentId)

    const sortedRegs = data.athlete_registrations
      .filter(
        (r) =>
          r.tournament_id === tournamentId &&
          r.category === category &&
          (r.group_name || "A") === groupName &&
          r.status === "approved"
      )
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
        id: crypto.randomUUID(),
        tournament_id: tournamentId,
        category: r.category,
        group_name: r.group_name,
        athlete_id: r.athlete_id,
        round_scores: r.round_scores,
        total_games: r.total_games,
        position: r.position,
        points: r.points,
      }
      data.tournament_results.push(result)
    })

    updateAnnualRankings(data, category)

    const allMatches = data.matches.filter((m) => m.tournament_id === tournamentId)
    const allDone = allMatches.every((m) => m.status === "finished")
    if (allDone && tournament) {
      tournament.status = "completed"
    }

    saveData(data)
  }
}

export function resetAllScores(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  data.matches
    .filter((m) => m.tournament_id === tournamentId && (!category || m.category === category) && (!groupName || m.group_name === groupName))
    .forEach((m) => {
      m.score_team1 = 0
      m.score_team2 = 0
      m.status = "pending"
    })
  saveData(data)
}

function updateAnnualRankings(data: AppData, category: string) {
  const year = new Date().getFullYear()

  data.annual_rankings = data.annual_rankings.filter(
    (r) => !(r.year === year && r.category === category)
  )

  const tournamentsThisYear = data.tournaments.filter(
    (t) => new Date(t.date).getFullYear() === year
  )
  const tournamentIds = new Set(tournamentsThisYear.map((t) => t.id))

  const athletePoints: Record<
    string,
    { total_points: number; total_games: number; tournaments_count: number; wins_count: number }
  > = {}

  data.tournament_results
    .filter((r) => r.category === category && tournamentIds.has(r.tournament_id))
    .forEach((r) => {
      const athleteId = r.athlete_id
      if (!athletePoints[athleteId]) {
        athletePoints[athleteId] = {
          total_points: 0,
          total_games: 0,
          tournaments_count: 0,
          wins_count: 0,
        }
      }
      athletePoints[athleteId].total_points += r.points
      athletePoints[athleteId].total_games += r.total_games
      athletePoints[athleteId].tournaments_count += 1
      if (r.position === 1) athletePoints[athleteId].wins_count += 1
    })

  const newRankings = Object.entries(athletePoints).map(
    ([athlete_id, stats]) => ({
      id: crypto.randomUUID(),
      athlete_id,
      category,
      year,
      total_points: stats.total_points,
      total_games: stats.total_games,
      tournaments_count: stats.tournaments_count,
      wins_count: stats.wins_count,
    })
  )

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

export function getLiveRankings(
  tournamentId: string,
  category?: string,
  groupName?: string
): (TournamentResult & { name: string })[] {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"

  const matches = data.matches.filter(
    (m) => m.tournament_id === tournamentId && m.category === cat && m.group_name === grp
  )

  const sortedRegs = data.athlete_registrations
    .filter(
      (r) =>
        r.tournament_id === tournamentId &&
        r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) &&
        r.status === "approved"
    )
    .sort((a, b) => (a.draw_number || 999) - (b.draw_number || 999))
  const athleteIds = sortedRegs.map((r) => r.athlete_id)

  const athleteNames: Record<string, string> = {}
  athleteIds.forEach((id) => {
    const user = data.users.find((u) => u.id === id)
    if (user) athleteNames[id] = user.name
  })

  const results = calculateTournamentResults(athleteIds, matches, athleteNames, cat, grp)

  return results.map((r) => ({
    ...r,
    id: `live-${r.athlete_id}`,
    tournament_id: tournamentId,
    name: athleteNames[r.athlete_id] || "Desconhecido",
  }))
}

export function computeAnnualRanking(category?: string, year?: number) {
  const data = getData()
  const y = year || new Date().getFullYear()
  const cat = category || "4e5"

  const athleteTotals: Record<string, {
    points: number
    games: number
    tournaments: Set<string>
    wins: number
    details: { tournament_id: string; title: string; date: string; edition: string; position: number; points: number; total_games: number }[]
  }> = {}

  data.tournament_results
    .filter((r) => r.category === cat)
    .forEach((r) => {
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
        tournament_id: r.tournament_id,
        title: t.title,
        date: t.date,
        edition: t.edition,
        position: r.position,
        points: r.points,
        total_games: r.total_games,
      })
    })

  const rankings = Object.entries(athleteTotals)
    .map(([athlete_id, t]) => ({
      id: `rank-${y}-${athlete_id}`,
      athlete_id,
      category: cat,
      year: y,
      total_points: t.points,
      total_games: t.games,
      tournaments_count: t.tournaments.size,
      wins_count: t.wins,
      tournaments: t.details,
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

export function getUserName(id: string): string {
  const data = getData()
  return data.users.find((u) => u.id === id)?.name || "Desconhecido"
}

export function getAthletes(): User[] {
  const data = getData()
  return data.users.filter((u) => u.role === "athlete")
}

export function getPendingAthletes(): (User & { registration_id: string; category?: string; group_name?: string; tournament_id?: string; tournament_title?: string })[] {
  const data = getData()
  const pendings = data.athlete_registrations.filter((r) => r.status === "pending")
  return pendings.map((r) => {
    const user = data.users.find((u) => u.id === r.athlete_id)
    if (!user) return null
    const tournament = data.tournaments.find((t) => t.id === r.tournament_id)
    return {
      ...user,
      registration_id: r.id,
      category: r.category,
      group_name: r.group_name,
      tournament_id: r.tournament_id,
      tournament_title: tournament ? `${tournament.title} ${tournament.edition}` : "Desconhecido",
    }
  }).filter(Boolean) as (User & { registration_id: string; category?: string; group_name?: string; tournament_id?: string; tournament_title?: string })[]
}

export function getSponsors(): User[] {
  const data = getData()
  return data.users.filter((u) => u.role === "sponsor")
}

export function getAllUsers(): User[] {
  const data = getData()
  return data.users
}

export function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "athlete" | "sponsor",
  phone?: string,
  url?: string
): User | null {
  const data = getData()
  if (data.users.some((u) => u.email === email)) return null
  const user: User = {
    id: crypto.randomUUID(),
    email,
    password,
    name,
    role,
    phone,
    url,
    created_at: new Date().toISOString(),
  }
  data.users.push(user)
  saveData(data)
  return user
}

export function updateUser(id: string, updates: { name?: string; email?: string; password?: string; phone?: string; url?: string }) {
  const data = getData()
  const user = data.users.find((u) => u.id === id)
  if (!user) return
  if (updates.name !== undefined) user.name = updates.name
  if (updates.email !== undefined) user.email = updates.email
  if (updates.password !== undefined) user.password = updates.password
  if (updates.phone !== undefined) user.phone = updates.phone || undefined
  if (updates.url !== undefined) user.url = updates.url || undefined
  saveData(data)
}

export function deleteUser(id: string) {
  const data = getData()
  data.users = data.users.filter((u) => u.id !== id)
  data.notifications = data.notifications.filter((n) => n.user_id !== id)
  saveData(data)
}

export function getUserById(id: string): User | undefined {
  const data = getData()
  return data.users.find((u) => u.id === id)
}

export function updateSponsor(sponsorId: string, updates: { name?: string; email?: string; phone?: string; url?: string }) {
  const data = getData()
  const user = data.users.find((u) => u.id === sponsorId && u.role === "sponsor")
  if (user) {
    if (updates.name !== undefined) user.name = updates.name
    if (updates.email !== undefined) user.email = updates.email
    if (updates.phone !== undefined) user.phone = updates.phone || undefined
    if (updates.url !== undefined) user.url = updates.url || undefined
    saveData(data)
  }
}

export function deleteSponsor(sponsorId: string) {
  const data = getData()
  data.sponsorships = data.sponsorships.filter((s) => s.sponsor_id !== sponsorId)
  data.users = data.users.filter((u) => u.id !== sponsorId)
  saveData(data)
}

export function deleteSponsorship(sponsorshipId: string) {
  const data = getData()
  const sponsorship = data.sponsorships.find((s) => s.id === sponsorshipId)
  data.sponsorships = data.sponsorships.filter((s) => s.id !== sponsorshipId)
  if (sponsorship) {
    const sponsor = data.users.find((u) => u.id === sponsorship.sponsor_id)
    const descMatch = `Patrocínio ${sponsor?.name || "Desconhecido"}`
    data.revenues = data.revenues.filter(
      (r) => !(r.tournament_id === sponsorship.tournament_id && r.description === descMatch && r.amount === sponsorship.amount)
    )
  }
  saveData(data)
}

export function updateSponsorship(
  id: string,
  updates: { tier?: SponsorTier; amount?: number; description?: string; tournament_id?: string }
) {
  const data = getData()
  const sponsorship = data.sponsorships.find((s) => s.id === id)
  if (!sponsorship) return
  if (updates.tier !== undefined) sponsorship.tier = updates.tier
  if (updates.amount !== undefined) sponsorship.amount = updates.amount
  if (updates.description !== undefined) sponsorship.description = updates.description
  if (updates.tournament_id !== undefined) sponsorship.tournament_id = updates.tournament_id
  saveData(data)
}

export function createSponsor(
  name: string,
  email: string,
  password: string,
  phone: string,
  url?: string
): User {
  const data = getData()
  const sponsor: User = {
    id: crypto.randomUUID(),
    email,
    password,
    name,
    role: "sponsor",
    phone,
    url,
    created_at: new Date().toISOString(),
  }
  data.users.push(sponsor)
  saveData(data)
  return sponsor
}

export function createSponsorship(
  tournamentId: string,
  sponsorId: string,
  tier: SponsorTier,
  amount: number,
  description: string,
  createdBy?: string,
  date?: string
): Sponsorship {
  const data = getData()
  const sponsorship: Sponsorship = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    sponsor_id: sponsorId,
    tier,
    amount,
    description,
    created_at: new Date().toISOString(),
  }
  data.sponsorships.push(sponsorship)

  const sponsor = data.users.find((u) => u.id === sponsorId)
  const revenueDesc = description || `Patrocínio ${sponsor?.name || "Desconhecido"}`
  const revenue: Revenue = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    source: "patrocinio",
    amount,
    description: revenueDesc,
    date: date || new Date().toISOString().split("T")[0],
    created_by: createdBy || sponsorId,
    created_at: new Date().toISOString(),
  }
  data.revenues.push(revenue)

  saveData(data)
  return sponsorship
}

export function getSponsorships(tournamentId?: string): (Sponsorship & { sponsor_name: string })[] {
  const data = getData()
  let result = data.sponsorships
  if (tournamentId) result = result.filter((s) => s.tournament_id === tournamentId)
  return result.map((s) => ({
    ...s,
    sponsor_name: data.users.find((u) => u.id === s.sponsor_id)?.name || "Desconhecido",
    sponsor_url: data.users.find((u) => u.id === s.sponsor_id)?.url,
  }))
}

export function getSponsorTournaments(sponsorId: string): Tournament[] {
  const data = getData()
  const tournamentIds = data.sponsorships
    .filter((s) => s.sponsor_id === sponsorId)
    .map((s) => s.tournament_id)
  return data.tournaments.filter((t) => tournamentIds.includes(t.id))
}

export function deleteExpense(expenseId: string) {
  const data = getData()
  data.expenses = data.expenses.filter((e) => e.id !== expenseId)
  saveData(data)
}

export function createExpense(
  tournamentId: string,
  category: ExpenseCategory,
  description: string,
  amount: number,
  date: string,
  createdBy: string
): Expense {
  const data = getData()
  const expense: Expense = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    category,
    description,
    amount,
    date,
    created_by: createdBy,
    created_at: new Date().toISOString(),
  }
  data.expenses.push(expense)
  saveData(data)
  return expense
}

export function getExpenses(tournamentId?: string): Expense[] {
  const data = getData()
  let result = data.expenses
  if (tournamentId) result = result.filter((e) => e.tournament_id === tournamentId)
  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getExpensesByCategory(tournamentId?: string) {
  const expenses = getExpenses(tournamentId)
  const grouped: Record<string, { total: number; items: Expense[] }> = {}

  expenses.forEach((e) => {
    if (!grouped[e.category]) grouped[e.category] = { total: 0, items: [] }
    grouped[e.category].total += e.amount
    grouped[e.category].items.push(e)
  })

  return grouped
}

export function updateExpense(
  id: string,
  updates: { category?: ExpenseCategory; description?: string; amount?: number; date?: string }
) {
  const data = getData()
  const expense = data.expenses.find((e) => e.id === id)
  if (!expense) return
  Object.assign(expense, updates)
  saveData(data)
}

export function deleteRevenue(revenueId: string) {
  const data = getData()
  data.revenues = data.revenues.filter((r) => r.id !== revenueId)
  saveData(data)
}

export function updateRevenue(
  id: string,
  updates: { source?: RevenueSource; description?: string; amount?: number; date?: string }
) {
  const data = getData()
  const revenue = data.revenues.find((r) => r.id === id)
  if (!revenue) return
  Object.assign(revenue, updates)
  saveData(data)
}

export function createRevenue(
  tournamentId: string,
  source: RevenueSource,
  amount: number,
  description: string,
  date: string,
  createdBy: string
): Revenue {
  const data = getData()
  const revenue: Revenue = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    source,
    amount,
    description,
    date,
    created_by: createdBy,
    created_at: new Date().toISOString(),
  }
  data.revenues.push(revenue)
  saveData(data)
  return revenue
}

export function getRevenuesBySource(tournamentId?: string) {
  const revenues = getRevenues(tournamentId)
  const grouped: Record<string, { total: number; items: Revenue[] }> = {}
  revenues.forEach((r) => {
    if (!grouped[r.source]) grouped[r.source] = { total: 0, items: [] }
    grouped[r.source].total += r.amount
    grouped[r.source].items.push(r)
  })
  return grouped
}

export function getRevenues(tournamentId?: string): Revenue[] {
  const data = getData()
  let result = data.revenues
  if (tournamentId) result = result.filter((r) => r.tournament_id === tournamentId)
  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getFinancialSummary(tournamentId?: string) {
  const expenses = getExpenses(tournamentId)
  const revenues = getRevenues(tournamentId)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = revenues.reduce((s, r) => s + r.amount, 0)

  return {
    totalExpenses,
    totalRevenues,
    balance: totalRevenues - totalExpenses,
    expensesByCategory: getExpensesByCategory(tournamentId),
  }
}

export function createPhoto(
  tournamentId: string,
  url: string,
  caption: string | undefined,
  uploadedBy: string
): Photo {
  const data = getData()
  const photo: Photo = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    url,
    caption,
    uploaded_by: uploadedBy,
    created_at: new Date().toISOString(),
  }
  data.photos.push(photo)
  saveData(data)
  return photo
}

export function deletePhoto(photoId: string) {
  const data = getData()
  data.photos = data.photos.filter((p) => p.id !== photoId)
  saveData(data)
}

export function getPhotos(tournamentId?: string): Photo[] {
  const data = getData()
  let result = data.photos
  if (tournamentId) result = result.filter((p) => p.tournament_id === tournamentId)
  return result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string
): Notification {
  const data = getData()
  const notification: Notification = {
    id: crypto.randomUUID(),
    user_id: userId,
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  }
  data.notifications.push(notification)
  saveData(data)
  return notification
}

export function getNotifications(userId: string): Notification[] {
  const data = getData()
  return data.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function markNotificationRead(notificationId: string) {
  const data = getData()
  const notif = data.notifications.find((n) => n.id === notificationId)
  if (notif) {
    notif.read = true
    saveData(data)
  }
}

export function getUnreadCount(userId: string): number {
  const data = getData()
  return data.notifications.filter((n) => n.user_id === userId && !n.read).length
}

export function markAllNotificationsRead(userId: string) {
  const data = getData()
  let changed = false
  for (const n of data.notifications) {
    if (n.user_id === userId && !n.read) {
      n.read = true
      changed = true
    }
  }
  if (changed) saveData(data)
}

export function getAthleteMatches(athleteId: string, tournamentId?: string): Match[] {
  const data = getData()
  let matches = data.matches.filter(
    (m) =>
      m.team1_player1_id === athleteId ||
      m.team1_player2_id === athleteId ||
      m.team2_player1_id === athleteId ||
      m.team2_player2_id === athleteId
  )
  if (tournamentId) matches = matches.filter((m) => m.tournament_id === tournamentId)
  return matches.sort((a, b) => a.round - b.round)
}

export function getAthleteTournaments(athleteId: string): Tournament[] {
  const data = getData()
  const tournamentIds = data.athlete_registrations
    .filter((r) => r.athlete_id === athleteId && r.status === "approved")
    .map((r) => r.tournament_id)
  return data.tournaments.filter((t) => tournamentIds.includes(t.id))
}

export function getAthleteStats(athleteId: string) {
  const data = getData()
  const allMatches = data.matches.filter(
    (m) =>
      m.team1_player1_id === athleteId ||
      m.team1_player2_id === athleteId ||
      m.team2_player1_id === athleteId ||
      m.team2_player2_id === athleteId
  ).filter((m) => m.status === "finished")

  let wins = 0
  let losses = 0
  let totalScore = 0
  let totalNormalizedMax = 0
  for (const m of allMatches) {
    const tournament = data.tournaments.find((t) => t.id === m.tournament_id)
    const maxScore = tournament?.max_score || 5
    const onTeam1 = m.team1_player1_id === athleteId || m.team1_player2_id === athleteId
    const team1Won = m.score_team1 > m.score_team2
    const myScore = onTeam1 ? m.score_team1 : m.score_team2
    totalScore += myScore
    totalNormalizedMax += maxScore
    if ((onTeam1 && team1Won) || (!onTeam1 && !team1Won)) {
      wins++
    } else {
      losses++
    }
  }

  const total = allMatches.length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  const registrations = data.athlete_registrations
    .filter((r) => r.athlete_id === athleteId && r.status === "approved")

  const tournamentIdSet = new Set(registrations.map((r) => r.tournament_id))
  const tournamentsPlayed = tournamentIdSet.size

  const results = data.tournament_results.filter((r) => r.athlete_id === athleteId)
  const bestPosition = results.length > 0 ? Math.min(...results.map((r) => r.position)) : null

  const scoresByTournament = results.map((r) => {
    const t = data.tournaments.find((tour) => tour.id === r.tournament_id)
    return {
      tournamentTitle: t ? `${t.title} ${t.edition}` : "Desconhecido",
      points: r.points,
      position: r.position,
    }
  })

  const tournamentsWithResults = new Set(results.map((r) => r.tournament_id))
  for (const tid of tournamentIdSet) {
    if (!tournamentsWithResults.has(tid)) {
      const t = data.tournaments.find((tour) => tour.id === tid)
      if (t) {
        scoresByTournament.push({ tournamentTitle: `${t.title} ${t.edition}`, points: 0, position: 0 })
      }
    }
  }

  return {
    totalMatches: total,
    wins,
    losses,
    winRate,
    avgScore: total > 0 ? Math.round((totalScore / totalNormalizedMax) * 50) / 10 : 0,
    bestPosition,
    tournamentsPlayed,
    scoresByTournament,
  }
}

export function drawNumbers(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"

  const registrations = data.athlete_registrations.filter(
    (r) =>
      r.tournament_id === tournamentId &&
      r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) &&
      r.status === "approved"
  )

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
  }

  registrations.forEach((r, idx) => {
    r.draw_number = numbers[idx]
  })

  data.tournament_results = data.tournament_results.filter(
    (r) => !(r.tournament_id === tournamentId && r.category === cat && r.group_name === grp)
  )

  saveData(data)
  return registrations.map((r) => ({
    athlete_id: r.athlete_id,
    name: data.users.find((u) => u.id === r.athlete_id)?.name || "",
    number: r.draw_number ?? 999,
  }))
}

export function drawSingleNumber(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"

  const registrations = data.athlete_registrations.filter(
    (r) =>
      r.tournament_id === tournamentId &&
      r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A")) &&
      r.status === "approved"
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

  saveData(data)
  return {
    athlete_id: chosen.athlete_id,
    name: data.users.find((u) => u.id === chosen.athlete_id)?.name || "",
    number: num,
  }
}

export function resetNumberDraw(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const cat = category || "4e5"
  const grp = groupName || "A"
  data.athlete_registrations.forEach((r) => {
    if (
      r.tournament_id === tournamentId &&
      r.category === cat &&
      (r.group_name === grp || (!r.group_name && grp === "A"))
    ) {
      r.draw_number = undefined
    }
  })
  data.tournament_results = data.tournament_results.filter(
    (r) => !(r.tournament_id === tournamentId && r.category === cat && r.group_name === grp)
  )
  saveData(data)
}

export function rafflePrize(
  participants: string[],
  excludeIds: string[] = []
): { winner: string; winnerName: string } | null {
  const available = participants.filter((p) => !excludeIds.includes(p))
  if (available.length === 0) return null

  const data = getData()
  const idx = Math.floor(Math.random() * available.length)
  const winner = available[idx]
  const user = data.users.find((u) => u.id === winner)
  return { winner, winnerName: user?.name || winner }
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

export function getRegisteredAthletes(tournamentId: string, category?: string, groupName?: string) {
  const data = getData()
  const regs = data.athlete_registrations.filter(
    (r) =>
      r.tournament_id === tournamentId &&
      (!category || r.category === category) &&
      (!groupName || r.group_name === groupName)
  )
  return regs.map((r) => {
    const user = data.users.find((u) => u.id === r.athlete_id)
    return { ...r, name: user?.name || "", email: user?.email || "" }
  })
}

export function confirmAttendance(tournamentId: string, athleteId: string) {
  const data = getData()
  const reg = data.athlete_registrations.find(
    (r) => r.tournament_id === tournamentId && r.athlete_id === athleteId
  )
  if (reg) {
    reg.confirmed = true
    reg.confirmed_at = new Date().toISOString()
    saveData(data)
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

export function sendConfirmationReminder(tournamentId: string) {
  const data = getData()
  const unconfirmed = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.status === "approved" && !r.confirmed
  )
  const tournament = data.tournaments.find((t) => t.id === tournamentId)
  for (const r of unconfirmed) {
    data.notifications.push({
      id: crypto.randomUUID(),
      user_id: r.athlete_id,
      type: "geral",
      title: "Confirme sua presença!",
      message: `O torneio ${tournament?.title || ""} está chegando! Confirme sua presença no sistema.`,
      read: false,
      created_at: new Date().toISOString(),
    })
  }
  saveData(data)
}

export function getCurrentTournament(): Tournament | undefined {
  const data = getData()
  const ongoing = data.tournaments.find((t) => t.status === "ongoing")
  if (ongoing) return ongoing
  const upcoming = data.tournaments
    .filter((t) => t.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (upcoming.length > 0) return upcoming[0]
  const completed = data.tournaments
    .filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return completed[0]
}

export function getAthleteRegistration(
  tournamentId: string,
  athleteId: string,
  category?: string
): AthleteRegistration | undefined {
  const data = getData()
  return data.athlete_registrations.find(
    (r) =>
      r.tournament_id === tournamentId &&
      r.athlete_id === athleteId &&
      (!category || r.category === category)
  )
}

// ---- Apoiadores e Brindes ----

export function createApoiador(tournamentId: string, name: string, phone?: string): Apoiador {
  const data = getData()
  const apoiador: Apoiador = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    name,
    phone,
    created_at: new Date().toISOString(),
  }
  data.apoiadores.push(apoiador)
  saveData(data)
  return apoiador
}

export function getApoiadores(tournamentId: string): (Apoiador & { brindes: Brinde[] })[] {
  const data = getData()
  return data.apoiadores
    .filter((a) => a.tournament_id === tournamentId)
    .map((a) => ({
      ...a,
      brindes: data.brindes.filter((b) => b.apoiador_id === a.id),
    }))
}

export function deleteApoiador(apoiadorId: string) {
  const data = getData()
  data.brindes = data.brindes.filter((b) => b.apoiador_id !== apoiadorId)
  data.apoiadores = data.apoiadores.filter((a) => a.id !== apoiadorId)
  saveData(data)
}

export function updateApoiador(apoiadorId: string, updates: { name?: string; phone?: string }) {
  const data = getData()
  const apoiador = data.apoiadores.find((a) => a.id === apoiadorId)
  if (!apoiador) return
  if (updates.name !== undefined) apoiador.name = updates.name
  if (updates.phone !== undefined) apoiador.phone = updates.phone || undefined
  saveData(data)
}

export function addBrinde(
  apoiadorId: string,
  tournamentId: string,
  description: string,
  quantity: number,
  type: "kit" | "sorteio"
): Brinde {
  const data = getData()
  const brinde: Brinde = {
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    apoiador_id: apoiadorId,
    description,
    quantity,
    type,
    created_at: new Date().toISOString(),
  }
  data.brindes.push(brinde)
  saveData(data)
  return brinde
}

export function removeBrinde(brindeId: string) {
  const data = getData()
  data.brindes = data.brindes.filter((b) => b.id !== brindeId)
  saveData(data)
}

export function updateBrinde(
  brindeId: string,
  updates: { description?: string; quantity?: number; type?: "kit" | "sorteio" }
) {
  const data = getData()
  const brinde = data.brindes.find((b) => b.id === brindeId)
  if (!brinde) return
  if (updates.description !== undefined) brinde.description = updates.description
  if (updates.quantity !== undefined) brinde.quantity = updates.quantity
  if (updates.type !== undefined) brinde.type = updates.type
  saveData(data)
}

export function getBrindes(tournamentId: string, type?: "kit" | "sorteio"): Brinde[] {
  const data = getData()
  let result = data.brindes.filter((b) => b.tournament_id === tournamentId)
  if (type) result = result.filter((b) => b.type === type)
  return result
}

export function raffleBrinde(tournamentId: string): {
  brinde: Brinde
  winner: { id: string; name: string }
} | null {
  const data = getData()
  const sorteioBrindes = data.brindes.filter(
    (b) => b.tournament_id === tournamentId && b.type === "sorteio"
  )
  if (sorteioBrindes.length === 0) return null

  const brinde = sorteioBrindes[Math.floor(Math.random() * sorteioBrindes.length)]

  const approvedAthletes = data.athlete_registrations.filter(
    (r) => r.tournament_id === tournamentId && r.status === "approved"
  )
  if (approvedAthletes.length === 0) return null

  const winner = approvedAthletes[Math.floor(Math.random() * approvedAthletes.length)]
  const user = data.users.find((u) => u.id === winner.athlete_id)
  const winnerName = user?.name || "Desconhecido"

  if (brinde.quantity > 1) {
    brinde.quantity -= 1
  } else {
    data.brindes = data.brindes.filter((b) => b.id !== brinde.id)
  }

  if (!data.raffle_records) data.raffle_records = []
  data.raffle_records.push({
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    brinde_description: brinde.description,
    winner_id: winner.athlete_id,
    winner_name: winnerName,
    created_at: new Date().toISOString(),
  })

  saveData(data)

  return {
    brinde,
    winner: { id: winner.athlete_id, name: winnerName },
  }
}

export function getRaffleRecords(tournamentId: string): RaffleRecord[] {
  const data = getData()
  const records = data.raffle_records || []
  return records
    .filter((r) => r.tournament_id === tournamentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function recordRaffle(tournamentId: string, description: string, winnerName: string) {
  const data = getData()
  if (!data.raffle_records) data.raffle_records = []
  data.raffle_records.push({
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    brinde_description: description,
    winner_id: "",
    winner_name: winnerName,
    created_at: new Date().toISOString(),
  })
  saveData(data)
}

export function resetRaffleRecords(tournamentId: string) {
  const data = getData()
  if (data.raffle_records) {
    data.raffle_records = data.raffle_records.filter((r) => r.tournament_id !== tournamentId)
  }
  saveData(data)
}

export function getNotes(): Note[] {
  const data = getData()
  return [...data.notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}

export function createNote(title: string, content: string, tournament_id?: string): Note {
  const data = getData()
  const note: Note = {
    id: crypto.randomUUID(),
    tournament_id,
    title,
    content,
    pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  data.notes.push(note)
  saveData(data)
  return note
}

export function updateNote(id: string, updates: Partial<Pick<Note, "title" | "content" | "pinned">>): Note | null {
  const data = getData()
  const idx = data.notes.findIndex((n) => n.id === id)
  if (idx === -1) return null
  data.notes[idx] = { ...data.notes[idx], ...updates, updated_at: new Date().toISOString() }
  saveData(data)
  return data.notes[idx]
}

export function deleteNote(id: string) {
  const data = getData()
  data.notes = data.notes.filter((n) => n.id !== id)
  saveData(data)
}
