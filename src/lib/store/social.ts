import type { Apoiador, Brinde, RaffleRecord } from "../types"
import { getData, saveData } from "./core"

// --- Apoiadores ---

export async function createApoiador(tournamentId: string, name: string, phone?: string): Promise<Apoiador> {
  const data = getData()
  const apoiador: Apoiador = {
    id: crypto.randomUUID(), tournament_id: tournamentId, name, phone,
    created_at: new Date().toISOString(),
  }
  data.apoiadores.push(apoiador)
  await saveData(data)
  return apoiador
}

export function getApoiadores(tournamentId: string): (Apoiador & { brindes: Brinde[] })[] {
  const data = getData()
  return data.apoiadores
    .filter((a) => a.tournament_id === tournamentId)
    .map((a) => ({ ...a, brindes: data.brindes.filter((b) => b.apoiador_id === a.id) }))
}

export async function deleteApoiador(apoiadorId: string) {
  const data = getData()
  data.brindes = data.brindes.filter((b) => b.apoiador_id !== apoiadorId)
  data.apoiadores = data.apoiadores.filter((a) => a.id !== apoiadorId)
  await saveData(data)
}

export async function updateApoiador(apoiadorId: string, updates: { name?: string; phone?: string }) {
  const data = getData()
  const apoiador = data.apoiadores.find((a) => a.id === apoiadorId)
  if (!apoiador) return
  if (updates.name !== undefined) apoiador.name = updates.name
  if (updates.phone !== undefined) apoiador.phone = updates.phone || undefined
  await saveData(data)
}

// --- Brindes ---

export async function addBrinde(apoiadorId: string, tournamentId: string, description: string, quantity: number, type: "kit" | "sorteio"): Promise<Brinde> {
  const data = getData()
  const brinde: Brinde = {
    id: crypto.randomUUID(), tournament_id: tournamentId, apoiador_id: apoiadorId,
    description, quantity, type, created_at: new Date().toISOString(),
  }
  data.brindes.push(brinde)
  await saveData(data)
  return brinde
}

export async function removeBrinde(brindeId: string) {
  const data = getData()
  data.brindes = data.brindes.filter((b) => b.id !== brindeId)
  await saveData(data)
}

export async function updateBrinde(brindeId: string, updates: { description?: string; quantity?: number; type?: "kit" | "sorteio" }) {
  const data = getData()
  const brinde = data.brindes.find((b) => b.id === brindeId)
  if (!brinde) return
  if (updates.description !== undefined) brinde.description = updates.description
  if (updates.quantity !== undefined) brinde.quantity = updates.quantity
  if (updates.type !== undefined) brinde.type = updates.type
  await saveData(data)
}

export function getBrindes(tournamentId: string, type?: "kit" | "sorteio"): Brinde[] {
  const data = getData()
  let result = data.brindes.filter((b) => b.tournament_id === tournamentId)
  if (type) result = result.filter((b) => b.type === type)
  return result
}

// --- Raffle ---

export function rafflePrize(participants: string[], excludeIds: string[] = []): { winner: string; winnerName: string } | null {
  const available = participants.filter((p) => !excludeIds.includes(p))
  if (available.length === 0) return null
  const data = getData()
  const idx = Math.floor(Math.random() * available.length)
  const winner = available[idx]
  const user = data.users.find((u) => u.id === winner)
  return { winner, winnerName: user?.name || winner }
}

export async function raffleBrinde(tournamentId: string): Promise<{ brinde: Brinde; winner: { id: string; name: string } } | null> {
  const data = getData()
  const sorteioBrindes = data.brindes.filter((b) => b.tournament_id === tournamentId && b.type === "sorteio")
  if (sorteioBrindes.length === 0) return null

  const brinde = sorteioBrindes[Math.floor(Math.random() * sorteioBrindes.length)]

  const approvedAthletes = data.athlete_registrations.filter((r) => r.tournament_id === tournamentId && r.status === "approved")
  if (approvedAthletes.length === 0) return null

  const winner = approvedAthletes[Math.floor(Math.random() * approvedAthletes.length)]
  const user = data.users.find((u) => u.id === winner.athlete_id)
  const winnerName = user?.name || "Desconhecido"

  if (brinde.quantity > 1) brinde.quantity -= 1
  else data.brindes = data.brindes.filter((b) => b.id !== brinde.id)

  if (!data.raffle_records) data.raffle_records = []
  data.raffle_records.push({
    id: crypto.randomUUID(), tournament_id: tournamentId,
    brinde_description: brinde.description, winner_id: winner.athlete_id,
    winner_name: winnerName, created_at: new Date().toISOString(),
  })

  await saveData(data)

  return { brinde, winner: { id: winner.athlete_id, name: winnerName } }
}

export function getRaffleRecords(tournamentId: string): RaffleRecord[] {
  const data = getData()
  const records = data.raffle_records || []
  return records
    .filter((r) => r.tournament_id === tournamentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function recordRaffle(tournamentId: string, description: string, winnerName: string) {
  const data = getData()
  if (!data.raffle_records) data.raffle_records = []
  data.raffle_records.push({
    id: crypto.randomUUID(), tournament_id: tournamentId,
    brinde_description: description, winner_id: "", winner_name: winnerName,
    created_at: new Date().toISOString(),
  })
  await saveData(data)
}

export async function updateRaffleRecord(recordId: string, updates: { winner_name?: string; brinde_description?: string }) {
  const data = getData()
  const record = data.raffle_records?.find((r) => r.id === recordId)
  if (record) {
    if (updates.winner_name !== undefined) record.winner_name = updates.winner_name
    if (updates.brinde_description !== undefined) record.brinde_description = updates.brinde_description
    await saveData(data)
  }
}

export async function removeRaffleRecord(recordId: string) {
  const data = getData()
  if (data.raffle_records) {
    data.raffle_records = data.raffle_records.filter((r) => r.id !== recordId)
  }
  await saveData(data)
}

export async function resetRaffleRecords(tournamentId: string) {
  const data = getData()
  if (data.raffle_records) {
    data.raffle_records = data.raffle_records.filter((r) => r.tournament_id !== tournamentId)
  }
  await saveData(data)
}
