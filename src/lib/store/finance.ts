import type { User, Tournament, Sponsorship, Expense, ExpenseCategory, Revenue, RevenueSource, SponsorTier } from "../types"
import { getData, saveData } from "./core"

// --- Sponsors ---

export async function createSponsor(name: string, email: string, password: string, phone: string, url?: string): Promise<User> {
  const data = getData()
  const sponsor: User = {
    id: crypto.randomUUID(), email, password, name, role: "sponsor", phone, url,
    created_at: new Date().toISOString(),
  }
  data.users.push(sponsor)
  await saveData(data)
  return sponsor
}

export async function updateSponsor(sponsorId: string, updates: { name?: string; email?: string; phone?: string; url?: string }) {
  const data = getData()
  const user = data.users.find((u) => u.id === sponsorId && u.role === "sponsor")
  if (user) {
    if (updates.name !== undefined) user.name = updates.name
    if (updates.email !== undefined) user.email = updates.email
    if (updates.phone !== undefined) user.phone = updates.phone || undefined
    if (updates.url !== undefined) user.url = updates.url || undefined
    await saveData(data)
  }
}

export async function deleteSponsor(sponsorId: string) {
  const data = getData()
  data.sponsorships = data.sponsorships.filter((s) => s.sponsor_id !== sponsorId)
  data.users = data.users.filter((u) => u.id !== sponsorId)
  await saveData(data)
}

// --- Sponsorships ---

export async function createSponsorship(
  tournamentId: string, sponsorId: string, tier: SponsorTier, amount: number,
  description: string, createdBy?: string, date?: string
): Promise<Sponsorship> {
  const data = getData()
  const sponsorship: Sponsorship = {
    id: crypto.randomUUID(), tournament_id: tournamentId, sponsor_id: sponsorId,
    tier, amount, description, created_at: new Date().toISOString(),
  }
  data.sponsorships.push(sponsorship)

  const sponsor = data.users.find((u) => u.id === sponsorId)
  const revenueDesc = description || `Patrocínio ${sponsor?.name || "Desconhecido"}`
  const revenue: Revenue = {
    id: crypto.randomUUID(), tournament_id: tournamentId, source: "patrocinio",
    amount, description: revenueDesc,
    date: date || new Date().toISOString().split("T")[0],
    created_by: createdBy || sponsorId, created_at: new Date().toISOString(),
  }
  data.revenues.push(revenue)

  await saveData(data)
  return sponsorship
}

export async function updateSponsorship(id: string, updates: { tier?: SponsorTier; amount?: number; description?: string; tournament_id?: string }) {
  const data = getData()
  const sponsorship = data.sponsorships.find((s) => s.id === id)
  if (!sponsorship) return
  if (updates.tier !== undefined) sponsorship.tier = updates.tier
  if (updates.amount !== undefined) sponsorship.amount = updates.amount
  if (updates.description !== undefined) sponsorship.description = updates.description
  if (updates.tournament_id !== undefined) sponsorship.tournament_id = updates.tournament_id
  await saveData(data)
}

export async function deleteSponsorship(sponsorshipId: string) {
  const data = getData()
  const sponsorship = data.sponsorships.find((s) => s.id === sponsorshipId)
  data.sponsorships = data.sponsorships.filter((s) => s.id !== sponsorshipId)
  if (sponsorship) {
    data.revenues = data.revenues.filter(
      (r) => !(r.tournament_id === sponsorship.tournament_id && r.source === "patrocinio" && r.amount === sponsorship.amount && r.created_at === sponsorship.created_at)
    )
  }
  await saveData(data)
}

export function getSponsorships(tournamentId?: string): (Sponsorship & { sponsor_name: string; sponsor_url?: string })[] {
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

// --- Expenses ---

export async function createExpense(tournamentId: string, category: ExpenseCategory, description: string, amount: number, date: string, createdBy: string): Promise<Expense> {
  const data = getData()
  const expense: Expense = {
    id: crypto.randomUUID(), tournament_id: tournamentId, category,
    description, amount, date, created_by: createdBy,
    created_at: new Date().toISOString(),
  }
  data.expenses.push(expense)
  await saveData(data)
  return expense
}

export async function updateExpense(id: string, updates: { category?: ExpenseCategory; description?: string; amount?: number; date?: string }) {
  const data = getData()
  const expense = data.expenses.find((e) => e.id === id)
  if (!expense) return
  Object.assign(expense, updates)
  await saveData(data)
}

export async function deleteExpense(expenseId: string) {
  const data = getData()
  data.expenses = data.expenses.filter((e) => e.id !== expenseId)
  await saveData(data)
}

export function getExpenses(tournamentId?: string): Expense[] {
  const data = getData()
  let result = data.expenses
  if (tournamentId) result = result.filter((e) => e.tournament_id === tournamentId)
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

// --- Revenues ---

export async function createRevenue(tournamentId: string, source: RevenueSource, amount: number, description: string, date: string, createdBy: string): Promise<Revenue> {
  const data = getData()
  const revenue: Revenue = {
    id: crypto.randomUUID(), tournament_id: tournamentId, source,
    amount, description, date, created_by: createdBy,
    created_at: new Date().toISOString(),
  }
  data.revenues.push(revenue)
  await saveData(data)
  return revenue
}

export async function updateRevenue(id: string, updates: { source?: RevenueSource; description?: string; amount?: number; date?: string }) {
  const data = getData()
  const revenue = data.revenues.find((r) => r.id === id)
  if (!revenue) return
  Object.assign(revenue, updates)
  await saveData(data)
}

export async function deleteRevenue(revenueId: string) {
  const data = getData()
  data.revenues = data.revenues.filter((r) => r.id !== revenueId)
  await saveData(data)
}

export function getRevenues(tournamentId?: string): Revenue[] {
  const data = getData()
  let result = data.revenues
  if (tournamentId) result = result.filter((r) => r.tournament_id === tournamentId)
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

// --- Financial Summary ---

export function getFinancialSummary(tournamentId?: string) {
  const expenses = getExpenses(tournamentId)
  const revenues = getRevenues(tournamentId)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRevenues = revenues.reduce((s, r) => s + r.amount, 0)

  return {
    totalExpenses, totalRevenues,
    balance: totalRevenues - totalExpenses,
    expensesByCategory: getExpensesByCategory(tournamentId),
  }
}
