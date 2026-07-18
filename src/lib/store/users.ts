import type { User } from "../types"
import { getData, saveData } from "./core"

export function getUserName(id: string): string {
  const data = getData()
  return data.users.find((u) => u.id === id)?.name || "Desconhecido"
}

export function getUserById(id: string): User | undefined {
  const data = getData()
  return data.users.find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getData().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getAthletes(): User[] {
  const data = getData()
  return data.users.filter((u) => u.role === "athlete")
}

export function getSponsors(): User[] {
  const data = getData()
  return data.users.filter((u) => u.role === "sponsor")
}

export function getAllUsers(): User[] {
  const data = getData()
  return data.users
}

export function getPendingAthletes(): (User & { registration_id: string; category?: string; group_name?: string; tournament_id?: string; tournament_title?: string })[] {
  const data = getData()
  const pendings = data.athlete_registrations.filter((r) => r.status === "pending")
  return pendings.map((r) => {
    const user = data.users.find((u) => u.id === r.athlete_id)
    if (!user) return null
    const tournament = data.tournaments.find((t) => t.id === r.tournament_id)
    return {
      ...user, registration_id: r.id, category: r.category, group_name: r.group_name,
      tournament_id: r.tournament_id,
      tournament_title: tournament ? `${tournament.title} ${tournament.edition}` : "Desconhecido",
    }
  }).filter(Boolean) as (User & { registration_id: string; category?: string; group_name?: string; tournament_id?: string; tournament_title?: string })[]
}

export async function createUser(name: string, email: string, password: string, role: "admin" | "athlete" | "sponsor", phone?: string, url?: string): Promise<User | null> {
  const data = getData()
  if (data.users.some((u) => u.email === email)) return null
  const user: User = {
    id: crypto.randomUUID(), email, password, name, role, phone, url,
    created_at: new Date().toISOString(),
  }
  data.users.push(user)
  await saveData(data)
  return user
}

export async function updateUser(id: string, updates: { name?: string; email?: string; password?: string; phone?: string; url?: string }) {
  const data = getData()
  const user = data.users.find((u) => u.id === id)
  if (!user) return
  if (updates.name !== undefined) user.name = updates.name
  if (updates.email !== undefined) user.email = updates.email
  if (updates.password !== undefined) user.password = updates.password
  if (updates.phone !== undefined) user.phone = updates.phone || undefined
  if (updates.url !== undefined) user.url = updates.url || undefined
  await saveData(data)
}

export async function deleteUser(id: string) {
  const data = getData()
  data.users = data.users.filter((u) => u.id !== id)
  data.notifications = data.notifications.filter((n) => n.user_id !== id)
  await saveData(data)
}

export async function updateAthlete(athleteId: string, updates: { name?: string; email?: string; phone?: string; password?: string }): Promise<boolean> {
  const data = getData()
  const user = data.users.find((u) => u.id === athleteId && u.role === "athlete")
  if (!user) return false
  if (updates.email !== undefined && updates.email !== user.email) {
    if (data.users.some((u) => u.email === updates.email && u.id !== athleteId)) return false
  }
  if (updates.name !== undefined) user.name = updates.name
  if (updates.email !== undefined) user.email = updates.email
  if (updates.phone !== undefined) user.phone = updates.phone || undefined
  if (updates.password !== undefined) user.password = updates.password
  await saveData(data)
  return true
}

export async function deleteAthlete(athleteId: string) {
  const data = getData()
  data.users = data.users.filter((u) => u.id !== athleteId)
  data.athlete_registrations = data.athlete_registrations.filter((r) => r.athlete_id !== athleteId)
  data.pairings = data.pairings.filter((p) => ![p.player1_id, p.player2_id, p.player3_id, p.player4_id].includes(athleteId))
  data.matches = data.matches.filter((m) => ![m.team1_player1_id, m.team1_player2_id, m.team2_player1_id, m.team2_player2_id].includes(athleteId))
  data.tournament_results = data.tournament_results.filter((r) => r.athlete_id !== athleteId)
  data.annual_rankings = data.annual_rankings.filter((r) => r.athlete_id !== athleteId)
  data.notifications = data.notifications.filter((n) => n.user_id !== athleteId)
  await saveData(data)
}

export function getAthleteMatches(athleteId: string, tournamentId?: string): import("../types").Match[] {
  const data = getData()
  let matches = data.matches.filter(
    (m) => m.team1_player1_id === athleteId || m.team1_player2_id === athleteId ||
      m.team2_player1_id === athleteId || m.team2_player2_id === athleteId
  )
  if (tournamentId) matches = matches.filter((m) => m.tournament_id === tournamentId)
  return matches.sort((a, b) => a.round - b.round)
}

export function getAthleteTournaments(athleteId: string): import("../types").Tournament[] {
  const data = getData()
  const tournamentIds = data.athlete_registrations
    .filter((r) => r.athlete_id === athleteId && r.status === "approved")
    .map((r) => r.tournament_id)
  return data.tournaments.filter((t) => tournamentIds.includes(t.id))
}

export function getAthleteStats(athleteId: string) {
  const data = getData()
  const allMatches = data.matches.filter(
    (m) => (m.team1_player1_id === athleteId || m.team1_player2_id === athleteId ||
      m.team2_player1_id === athleteId || m.team2_player2_id === athleteId) && m.status === "finished"
  )

  let wins = 0, losses = 0, totalScore = 0, totalNormalizedMax = 0
  for (const m of allMatches) {
    const tournament = data.tournaments.find((t) => t.id === m.tournament_id)
    const maxScore = tournament?.max_score || 5
    const onTeam1 = m.team1_player1_id === athleteId || m.team1_player2_id === athleteId
    const team1Won = m.score_team1 > m.score_team2
    const myScore = onTeam1 ? m.score_team1 : m.score_team2
    totalScore += myScore
    totalNormalizedMax += maxScore
    if ((onTeam1 && team1Won) || (!onTeam1 && !team1Won)) wins++
    else losses++
  }

  const total = allMatches.length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  const registrations = data.athlete_registrations.filter((r) => r.athlete_id === athleteId && r.status === "approved")
  const tournamentIdSet = new Set(registrations.map((r) => r.tournament_id))
  const tournamentsPlayed = tournamentIdSet.size

  const results = data.tournament_results.filter((r) => r.athlete_id === athleteId)
  const bestPosition = results.length > 0 ? Math.min(...results.map((r) => r.position)) : null

  const scoresByTournament = results.map((r) => {
    const t = data.tournaments.find((tour) => tour.id === r.tournament_id)
    return { tournamentTitle: t ? `${t.title} ${t.edition}` : "Desconhecido", points: r.points, position: r.position }
  })

  for (const tid of tournamentIdSet) {
    if (!new Set(results.map((r) => r.tournament_id)).has(tid)) {
      const t = data.tournaments.find((tour) => tour.id === tid)
      if (t) scoresByTournament.push({ tournamentTitle: `${t.title} ${t.edition}`, points: 0, position: 0 })
    }
  }

  return {
    totalMatches: total, wins, losses, winRate,
    avgScore: total > 0 ? Math.round((totalScore / totalNormalizedMax) * 50) / 10 : 0,
    bestPosition, tournamentsPlayed, scoresByTournament,
  }
}
