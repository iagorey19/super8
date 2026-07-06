import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase"
import { seed } from "@/lib/seed"
import { getClientIp, isRateLimited } from "@/lib/rate-limit"
import { getAuthSecret, validateToken } from "@/lib/auth-secret"
import { appDataSchema, validateTableData } from "@/lib/validation"
import type { AppData, User, Tournament, AthleteRegistration, Pairing, Match, TournamentResult, AnnualRanking, Sponsorship, Expense, Revenue, Photo, Notification, Apoiador, Brinde, RaffleRecord, Note } from "@/lib/types"
import bcrypt from "bcryptjs"

type Role = "admin" | "athlete" | "sponsor"

const TABLE_PERMISSIONS: Record<string, { roles: Role[]; ownerField?: string }> = {
  users: { roles: ["admin", "athlete", "sponsor"], ownerField: "id" },
  athlete_registrations: { roles: ["admin", "athlete"], ownerField: "athlete_id" },
  notifications: { roles: ["admin", "athlete"], ownerField: "user_id" },
  sponsorships: { roles: ["admin", "sponsor"], ownerField: "sponsor_id" },
}

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

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req)
    if (isRateLimited(ip, 30)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
    }
    const svc = getServiceClient()
    const { count, error } = await svc.from("users").select("*", { count: "exact", head: true })
    if (count === 0) {
      const data = seed()
      await syncToSupabase(data, "admin", "seed")
      data.users = data.users.map(({ password, ...rest }) => rest as User)
      return NextResponse.json(data)
    }
    if (error) {
      console.error("GET /api/data count error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }
    const data = await getFullData()
    data.users = data.users.map(({ password, ...rest }) => rest as User)

    const auth = req.headers.get("authorization")
    let currentUser: User | null = null
    if (auth?.startsWith("Bearer ")) {
      const authUser = validateToken(auth.slice(7))
      if (authUser) {
        currentUser = data.users.find((u) => u.id === authUser.userId) || null
      }
    }
    const isAdmin = currentUser?.role === "admin"
    if (!isAdmin) {
      data.users = data.users.map((u) => {
        if (currentUser && u.id === currentUser.id) return u
        const sanitized: Record<string, unknown> = { ...u }
        sanitized.phone = undefined
        sanitized.email = "oculto@super8.app"
        sanitized.avatar = undefined
        return sanitized as unknown as User
      })
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error("GET /api/data error:", e)
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (isRateLimited(ip, 30)) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 })
    }

    const contentLength = req.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 50_000_000) {
      return NextResponse.json({ error: "Payload muito grande" }, { status: 413 })
    }

    const auth = req.headers.get("authorization")
    let authUser: { userId: string } | null = null
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7)
      authUser = validateToken(token)
    }
    if (!authUser) {
      return NextResponse.json({ error: "auth_required", message: "Token de autenticação necessário. Faça login novamente." }, { status: 401 })
    }

    const svc = getServiceClient()
    const { data: callerUser } = await svc.from("users").select("role").eq("id", authUser.userId).single()
    const callerRole: Role = callerUser?.role || "athlete"

    const raw = await req.json()

    const tables = raw.tables as string[] | undefined
    const bodyData = tables ? raw.data : raw
    let data: AppData

    if (tables && Array.isArray(tables)) {
      if (!bodyData.seed_version || !bodyData.config) {
        return NextResponse.json({ error: "Dados inválidos: seed_version e config são obrigatórios" }, { status: 400 })
      }
      data = {
        seed_version: bodyData.seed_version,
        config: bodyData.config,
        users: [], tournaments: [], athlete_registrations: [],
        pairings: [], matches: [], tournament_results: [],
        annual_rankings: [], sponsorships: [], expenses: [],
        revenues: [], photos: [], notifications: [],
        apoiadores: [], brindes: [], raffle_records: [], notes: [],
      }
      for (const table of tables) {
        if (bodyData[table] !== undefined) {
          const result = validateTableData(table, bodyData[table])
          if (!result.success) {
            return NextResponse.json({ error: `Dados inválidos em ${table}`, details: result.error }, { status: 400 })
          }
          (data as any)[table] = result.data
        }
      }
    } else {
      const parsed = appDataSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn("POST /api/data validation error:", parsed.error.flatten())
        return NextResponse.json({
          error: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        }, { status: 400 })
      }
      data = parsed.data as unknown as AppData
    }

    const errors = await syncToSupabase(data, callerRole, authUser.userId, tables)
    if (errors.length > 0) {
      console.error("syncToSupabase errors:", errors)
      return NextResponse.json({ ok: false, errors: ["Falha ao salvar alguns dados"] }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("POST /api/data error:", e)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}

async function syncToSupabase(data: AppData, callerRole: Role, callerUserId: string, tables?: string[]): Promise<string[]> {
  const svc = getServiceClient()
  const errors: string[] = []

  const allTables = [
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

  const upsertOrder = tables
    ? allTables.filter(t => tables.includes(t.table))
    : allTables

  const { error: configErr } = await svc.from("config").upsert({ id: "global", ...data.config }, { onConflict: "id" })
  if (configErr) errors.push(`config upsert: ${configErr.message}`)

  for (const { table, records } of upsertOrder) {
    const perm = TABLE_PERMISSIONS[table]
    if (callerRole !== "admin" && (!perm || !perm.roles.includes(callerRole))) {
      continue
    }

    let filteredRecords: any[] = records as any[]
    if (callerRole !== "admin" && perm?.ownerField) {
      filteredRecords = (records as any[]).filter((r: any) => r[perm.ownerField!] === callerUserId)
    }

    if (filteredRecords.length > 0) {
      if (table === "users") {
        for (const user of filteredRecords as User[]) {
          const { password, ...rest } = user
          if (password) {
            const upsertData = { ...rest, password: bcrypt.hashSync(password, 10) }
            const { error } = await svc.from(table).upsert(upsertData as any, { onConflict: "id", ignoreDuplicates: false })
            if (error) errors.push(`${table} upsert: ${error.message}`)
          } else {
            const { error } = await svc.from(table).update(rest as any).eq("id", user.id)
            if (error) errors.push(`${table} update: ${error.message}`)
          }
        }
      } else {
        const { error } = await svc.from(table).upsert(filteredRecords as any, { onConflict: "id", ignoreDuplicates: false })
        if (error) {
          errors.push(`${table} upsert: ${error.message}`)
          continue
        }
      }
    }

    if (callerRole !== "admin") continue

    const currentIds = new Set(filteredRecords.map((r) => r.id))
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
