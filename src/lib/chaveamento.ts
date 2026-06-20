import type { Pairing, Match } from "./types"

export const WHIST_SCHEDULE = [
  { round: 1, courtA: { t1: [1, 8], t2: [2, 7] }, courtB: { t1: [3, 6], t2: [4, 5] } },
  { round: 2, courtA: { t1: [1, 7], t2: [8, 6] }, courtB: { t1: [2, 5], t2: [3, 4] } },
  { round: 3, courtA: { t1: [1, 6], t2: [7, 5] }, courtB: { t1: [8, 4], t2: [2, 3] } },
  { round: 4, courtA: { t1: [1, 5], t2: [6, 4] }, courtB: { t1: [7, 3], t2: [8, 2] } },
  { round: 5, courtA: { t1: [1, 4], t2: [5, 3] }, courtB: { t1: [6, 2], t2: [7, 8] } },
  { round: 6, courtA: { t1: [1, 3], t2: [4, 2] }, courtB: { t1: [5, 8], t2: [6, 7] } },
  { round: 7, courtA: { t1: [1, 2], t2: [3, 8] }, courtB: { t1: [4, 7], t2: [5, 6] } },
]

export function generatePairings(
  tournamentId: string,
  athleteIds: string[],
  category: string,
  groupName: string,
  courtOffset: number
) {
  if (athleteIds.length !== 8) {
    throw new Error("São necessários exatamente 8 atletas")
  }

  const pairings: Pairing[] = []
  const matches: Match[] = []

  WHIST_SCHEDULE.forEach(({ round, courtA, courtB }) => {
    ;[
      { court: 1, t1: courtA.t1, t2: courtA.t2 },
      { court: 2, t1: courtB.t1, t2: courtB.t2 },
    ].forEach(({ court, t1, t2 }) => {
      const p1 = athleteIds[t1[0] - 1]
      const p2 = athleteIds[t1[1] - 1]
      const p3 = athleteIds[t2[0] - 1]
      const p4 = athleteIds[t2[1] - 1]
      const courtNumber = courtOffset + court

      const pairingId = crypto.randomUUID()
      pairings.push({
        id: pairingId,
        tournament_id: tournamentId,
        category,
        group_name: groupName,
        round,
        court: String(courtNumber),
        player1_id: p1,
        player2_id: p2,
        player3_id: p3,
        player4_id: p4,
      })

      matches.push({
        id: crypto.randomUUID(),
        pairing_id: pairingId,
        tournament_id: tournamentId,
        category,
        group_name: groupName,
        round,
        court: String(courtNumber),
        team1_player1_id: p1,
        team1_player2_id: p2,
        team2_player1_id: p3,
        team2_player2_id: p4,
        score_team1: 0,
        score_team2: 0,
        status: "pending",
        created_at: new Date().toISOString(),
      })
    })
  })

  return { pairings, matches }
}

export function calculateTournamentResults(
  athleteIds: string[],
  matches: Match[],
  athleteNames: Record<string, string>,
  category: string,
  groupName: string
) {
  const gamesMap: Record<string, number[]> = {}

  athleteIds.forEach((id) => {
    gamesMap[id] = []
  })

  const sortedMatches = [...matches].sort((a, b) => a.round - b.round)

  sortedMatches.forEach((match) => {
    if (match.status !== "finished") return

    const t1p1 = match.team1_player1_id
    const t1p2 = match.team1_player2_id
    const t2p1 = match.team2_player1_id
    const t2p2 = match.team2_player2_id

    if (!gamesMap[t1p1]) gamesMap[t1p1] = []
    if (!gamesMap[t1p2]) gamesMap[t1p2] = []
    if (!gamesMap[t2p1]) gamesMap[t2p1] = []
    if (!gamesMap[t2p2]) gamesMap[t2p2] = []

    gamesMap[t1p1].push(match.score_team1)
    gamesMap[t1p2].push(match.score_team1)
    gamesMap[t2p1].push(match.score_team2)
    gamesMap[t2p2].push(match.score_team2)
  })

  const results = athleteIds.map((id) => {
    const scores = gamesMap[id] || []
    const total = scores.reduce((sum, s) => sum + s, 0)
    return { athlete_id: id, total_games: total, round_scores: scores }
  })

  results.sort((a, b) => {
    if (b.total_games !== a.total_games) return b.total_games - a.total_games
    const aScores = a.round_scores
    const bScores = b.round_scores
    for (let i = 0; i < Math.max(aScores.length, bScores.length); i++) {
      const aScore = aScores[i] ?? 0
      const bScore = bScores[i] ?? 0
      if (bScore !== aScore) return bScore - aScore
    }
    return 0
  })

  const pointsMap: Record<number, number> = {
    1: 8, 2: 7, 3: 6, 4: 5,
    5: 4, 6: 3, 7: 2, 8: 1,
  }

  return results.map((r, idx) => ({
    ...r,
    category,
    group_name: groupName,
    position: idx + 1,
    points: pointsMap[idx + 1] || 0,
  }))
}
