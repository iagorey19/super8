import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import { seed } from "@/lib/seed"
import type { AppData, User, Tournament, AthleteRegistration, Pairing, Match, TournamentResult, AnnualRanking, Sponsorship, Expense, Revenue, Photo, Notification, Apoiador, Brinde, RaffleRecord, Note } from "@/lib/types"

const DB_TABLES = [
  "raffle_records", "brindes", "apoiadores",
  "annual_rankings", "tournament_results", "matches", "pairings",
  "athlete_registrations", "sponsorships", "expenses", "revenues",
  "photos", "notifications", "notes", "tournaments", "users",
] as const

async function queryAll<T>(table: string): Promise<T[]> {
  const { data } = await getServiceClient().from(table).select("*")
  return (data || []) as T[]
}

async function getFullData(): Promise<AppData> {
  const [
    users, tournaments, athlete_registrations, pairings, matches,
    tournament_results, annual_rankings, sponsorships, expenses,
    revenues, photos, notifications, apoiadores, brindes, raffle_records, notes,
  ] = await Promise.all([
    queryAll<User>("users"),
    queryAll<Tournament>("tournaments"),
    queryAll<AthleteRegistration>("athlete_registrations"),
    queryAll<Pairing>("pairings"),
    queryAll<Match>("matches"),
    queryAll<TournamentResult>("tournament_results"),
    queryAll<AnnualRanking>("annual_rankings"),
    queryAll<Sponsorship>("sponsorships"),
    queryAll<Expense>("expenses"),
    queryAll<Revenue>("revenues"),
    queryAll<Photo>("photos"),
    queryAll<Notification>("notifications"),
    queryAll<Apoiador>("apoiadores"),
    queryAll<Brinde>("brindes"),
    queryAll<RaffleRecord>("raffle_records"),
    queryAll<Note>("notes"),
  ])

  return {
    seed_version: 1,
    users,
    tournaments,
    athlete_registrations,
    pairings,
    matches,
    tournament_results,
    annual_rankings,
    sponsorships,
    expenses,
    revenues,
    photos,
    notifications,
    apoiadores,
    brindes,
    raffle_records,
    notes,
  }
}

export async function GET() {
  try {
    const svc = getServiceClient()
    const { count, error } = await svc.from("users").select("*", { count: "exact", head: true })
    if (count === 0) {
      const data = seed()
      await syncToSupabase(data)
      return NextResponse.json(data)
    }
    if (error) {
      console.error("GET /api/data count error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }
    const data = await getFullData()
    return NextResponse.json(data)
  } catch (e) {
    console.error("GET /api/data error:", e)
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data: AppData = await req.json()
    if (!data.seed_version) {
      return NextResponse.json({ error: "Invalid data structure" }, { status: 400 })
    }
    const errors = await syncToSupabase(data)
    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("POST /api/data error:", e)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}

async function syncToSupabase(data: AppData): Promise<string[]> {
  const svc = getServiceClient()
  const errors: string[] = []

  const upsertOrder = [
    { table: "users", records: data.users },
    { table: "tournaments", records: data.tournaments },
    { table: "athlete_registrations", records: data.athlete_registrations },
    { table: "pairings", records: data.pairings },
    { table: "matches", records: data.matches },
    { table: "tournament_results", records: data.tournament_results },
    { table: "annual_rankings", records: data.annual_rankings },
    { table: "sponsorships", records: data.sponsorships },
    { table: "expenses", records: data.expenses },
    { table: "revenues", records: data.revenues },
    { table: "photos", records: data.photos },
    { table: "notifications", records: data.notifications },
    { table: "apoiadores", records: data.apoiadores },
    { table: "brindes", records: data.brindes },
    { table: "raffle_records", records: data.raffle_records },
    { table: "notes", records: data.notes },
  ]

  for (const { table, records } of upsertOrder) {
    if (records.length > 0) {
      const { error } = await svc.from(table).upsert(records as any, { onConflict: "id", ignoreDuplicates: false })
      if (error) {
        errors.push(`${table} upsert: ${error.message}`)
        continue
      }
    }
    const currentIds = new Set(records.map((r: any) => r.id))
    const { data: existing, error: selErr } = await svc.from(table).select("id")
    if (selErr) {
      errors.push(`${table} select: ${selErr.message}`)
      continue
    }
    const toDelete = (existing || []).map((r: any) => r.id).filter((id: string) => !currentIds.has(id))
    if (toDelete.length > 0) {
      const { error: delErr } = await svc.from(table).delete().in("id", toDelete)
      if (delErr) errors.push(`${table} delete: ${delErr.message}`)
    }
  }

  return errors
}
