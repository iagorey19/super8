import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import type { AppData } from "../src/lib/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE env vars — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const svc = createClient(supabaseUrl, serviceKey)

const DB_TABLES = [
  "raffle_records", "brindes", "apoiadores",
  "annual_rankings", "tournament_results", "matches", "pairings",
  "athlete_registrations", "sponsorships", "expenses", "revenues",
  "photos", "notifications", "notes", "tournaments", "users",
] as const

async function migrate() {
  const dbPath = join(process.cwd(), "data", "super8-db.json")
  if (!existsSync(dbPath)) {
    console.log("No data file found at", dbPath)
    return
  }

  const raw = readFileSync(dbPath, "utf-8")
  const data: AppData = JSON.parse(raw)
  data.seed_version = 1

  // Delete all existing data
  const deleteOrder = [...DB_TABLES].reverse()
  for (const table of deleteOrder) {
    const { error } = await svc.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")
    if (error) console.warn(`Delete ${table}:`, error.message)
    else console.log(`  Cleared ${table}`)
  }

  // Insert all data
  const insertOrder = [
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

  for (const { table, records } of insertOrder) {
    if (records.length === 0) continue
    const { error } = await svc.from(table).insert(records as any)
    if (error) {
      console.error(`  ${table}: ERROR - ${error.message}`)
    } else {
      console.log(`  Inserted ${records.length} into ${table}`)
    }
  }

  console.log("Migration complete!")
}

migrate().catch(console.error)
