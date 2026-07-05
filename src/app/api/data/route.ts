import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import { seed } from "@/lib/seed"
import type { AppData, User, Tournament, AthleteRegistration, Pairing, Match, TournamentResult, AnnualRanking, Sponsorship, Expense, Revenue, Photo, Notification, Apoiador, Brinde, RaffleRecord, Note } from "@/lib/types"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const DB_TABLES = [
  "raffle_records", "brindes", "apoiadores",
  "annual_rankings", "tournament_results", "matches", "pairings",
  "athlete_registrations", "sponsorships", "expenses", "revenues",
  "photos", "notifications", "notes", "tournaments", "users",
] as const

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 30
const requestLog = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = requestLog.get(ip)
  if (!entry || now > entry.resetAt) {
    requestLog.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

function validateToken(token: string): { userId: string } | null {
  try {
    const [payloadB64, signatureB64] = token.split(".")
    if (!payloadB64 || !signatureB64) return null
    const secret = process.env.AUTH_TOKEN_SECRET || "super8-fallback-secret-do-not-use-in-prod"
    const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url")
    if (signatureB64 !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    if (payload.exp && payload.exp < Date.now()) return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}

async function queryAll<T>(table: string): Promise<T[]> {
  const { data } = await getServiceClient().from(table).select("*")
  return (data || []) as T[]
}

async function getFullData(): Promise<AppData> {
  const svc = getServiceClient()
  const { data: configRow } = await svc.from("config").select("*").eq("id", "global").single()
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
    config: configRow
      ? { pix_key: configRow.pix_key, pix_name: configRow.pix_name, pix_city: configRow.pix_city, admin_whatsapp: configRow.admin_whatsapp }
      : { pix_key: "", pix_name: "", pix_city: "", admin_whatsapp: "" },
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
      data.users = data.users.map(({ password, ...rest }) => rest as User)
      return NextResponse.json(data)
    }
    if (error) {
      console.error("GET /api/data count error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }
    const data = await getFullData()
    data.users = data.users.map(({ password, ...rest }) => rest as User)
    return NextResponse.json(data)
  } catch (e) {
    console.error("GET /api/data error:", e)
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown"
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
    }

    const auth = req.headers.get("authorization")
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7)
      const session = validateToken(token)
      if (!session) {
        console.warn("[SECURITY] POST /api/data token inválido ou expirado — permitido por compatibilidade. Admin deve refazer login.")
      }
    } else {
      console.warn("[SECURITY] POST /api/data sem token de autenticação — permitido por compatibilidade")
    }

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

  const { error: configErr } = await svc.from("config").upsert({ id: "global", ...data.config }, { onConflict: "id" })
  if (configErr) errors.push(`config upsert: ${configErr.message}`)

  for (const { table, records } of upsertOrder) {
    if (records.length > 0) {
      if (table === "users") {
        for (const user of records as User[]) {
          const { password, ...rest } = user
          const upsertData = password ? { ...rest, password: bcrypt.hashSync(password, 10) } : rest
          const { error } = await svc.from(table).upsert(upsertData as any, { onConflict: "id", ignoreDuplicates: false })
          if (error) errors.push(`${table} upsert: ${error.message}`)
        }
      } else {
        const { error } = await svc.from(table).upsert(records as any, { onConflict: "id", ignoreDuplicates: false })
        if (error) {
          errors.push(`${table} upsert: ${error.message}`)
          continue
        }
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
